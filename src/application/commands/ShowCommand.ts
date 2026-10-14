import { Arguments } from '../Arguments.js';
import { Command } from '../Command.js';
import type { Editor } from '../Editor.js';
import { TreeRenderer } from '../TreeRenderer.js';

export class ShowCommand extends Command {
  override get syntax(): string { return 'show <id>'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    const args = new Arguments(values, this.syntax); args.count(1);
    return new TreeRenderer().show(editor.document, args.at(0));
  }
}
