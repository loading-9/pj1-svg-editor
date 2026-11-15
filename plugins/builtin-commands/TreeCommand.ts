import { Arguments } from '../../src/api.js';
import { Command } from '../../src/api.js';
import type { EditorContext as Editor } from '../../src/api.js';

import type { PluginContext } from '../../src/api.js';
export class TreeCommand extends Command {
  constructor(private readonly context: Pick<PluginContext, 'renderTree'>) { super(); }
  override get syntax(): string { return 'tree [id]'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    new Arguments(values, this.syntax).count(0, 1);
    return this.context.renderTree(editor.document, values[0], editor.saved);
  }
}
