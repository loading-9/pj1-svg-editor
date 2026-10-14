import { Arguments } from '../Arguments.js';
import { Command } from '../Command.js';
import type { Editor } from '../Editor.js';

export class UndoCommand extends Command {
  override get syntax(): string { return 'undo'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    new Arguments(values, this.syntax).count(0); return [editor.undo()];
  }
}
