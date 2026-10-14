import { Arguments } from '../Arguments.js';
import { Command } from '../Command.js';
import type { Editor } from '../Editor.js';

export class ReadCommand extends Command {
  override get syntax(): string { return 'read <file.svg>'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    const args = new Arguments(values, this.syntax); args.count(1);
    return editor.read(args.at(0));
  }
}
