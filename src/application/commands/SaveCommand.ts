import { Arguments } from '../Arguments.js';
import { Command } from '../Command.js';
import type { Editor } from '../Editor.js';

export class SaveCommand extends Command {
  override get syntax(): string { return 'save [file.svg]'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    const args = new Arguments(values, this.syntax); args.count(0, 1);
    return [editor.save(values[0])];
  }
}
