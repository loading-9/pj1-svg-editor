import { Arguments } from '../../src/api.js';
import { Command } from '../../src/api.js';
import type { EditorContext as Editor } from '../../src/api.js';

export class RedoCommand extends Command {
  override get syntax(): string { return 'redo'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    new Arguments(values, this.syntax).count(0); return [editor.redo()];
  }
}
