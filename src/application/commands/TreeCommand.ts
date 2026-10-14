import { Arguments } from '../Arguments.js';
import { Command } from '../Command.js';
import type { Editor } from '../Editor.js';
import { TreeRenderer } from '../TreeRenderer.js';

export class TreeCommand extends Command {
  override get syntax(): string { return 'tree [id]'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    new Arguments(values, this.syntax).count(0, 1);
    return new TreeRenderer().tree(editor.document, values[0]);
  }
}
