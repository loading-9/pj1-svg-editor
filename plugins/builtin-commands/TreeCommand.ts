import { Arguments } from '../../src/api.js';
import { Command } from '../../src/api.js';
import type { Editor } from '../../src/api.js';
import { TreeRenderer } from '../../src/api.js';

import type { TreeDecorator } from '../../src/api.js';
export class TreeCommand extends Command {
  constructor(private readonly decorators: readonly TreeDecorator[]) { super(); }
  override get syntax(): string { return 'tree [id]'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    new Arguments(values, this.syntax).count(0, 1);
    return new TreeRenderer(this.decorators).tree(editor.document, values[0], editor.saved);
  }
}
