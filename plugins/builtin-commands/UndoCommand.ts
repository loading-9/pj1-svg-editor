import { Arguments } from '../../src/api.js';
import { Command } from '../../src/api.js';
import type { Editor } from '../../src/api.js';

export class UndoCommand extends Command {
  override get syntax(): string { return 'undo'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    new Arguments(values, this.syntax).count(0); return [editor.undo()];
  }
}
