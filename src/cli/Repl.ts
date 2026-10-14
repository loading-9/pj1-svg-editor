import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';
import { CommandRegistry } from '../application/CommandRegistry.js';
import type { Editor } from '../application/Editor.js';
import { Tokenizer } from './Tokenizer.js';

export class Repl {
  private readonly tokenizer = new Tokenizer();
  private readonly commands = new CommandRegistry();
  constructor(private readonly editor: Editor) {}
  execute(line: string): { lines: readonly string[]; exit: boolean } {
    try {
      const tokens = this.tokenizer.tokenize(line);
      return this.commands.run(this.editor, tokens);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { lines: [`error: ${message.replace(/[\r\n]+/g, ' ')}`], exit: false };
    }
  }
  async start(input: Readable, output: Writable, interactive: boolean): Promise<void> {
    const reader = createInterface({ input, output, terminal: interactive });
    if (interactive) {
      output.write("svg-editor 0.1 — type 'help' for commands\n");
      reader.setPrompt('svg> '); reader.prompt();
    }
    try {
      for await (const line of reader) {
        const result = this.execute(line);
        result.lines.forEach(message => output.write(`${message}\n`));
        if (result.exit) break;
        if (interactive) reader.prompt();
      }
    } finally { reader.close(); }
  }
}
