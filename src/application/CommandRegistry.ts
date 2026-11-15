import type { Editor } from './Editor.js';
import type { Extensions } from './Extensions.js';
export class CommandRegistry {
  constructor(private readonly extensions: Extensions) {}
  run(editor: Editor, tokens: readonly string[]): { lines: readonly string[]; exit: boolean } {
    const name = tokens[0];
    if (name === undefined) return { lines: [], exit: false };
    const provider = this.extensions.commands.get(name);
    if (!provider) throw new Error('unknown command: ' + name);
    const command = provider.create();
    return { lines: command.run(editor, tokens.slice(1)), exit: command.exits };
  }
}
