import { Arguments } from '../../src/api.js';
import { Command } from '../../src/api.js';
import type { EditorContext as Editor } from '../../src/api.js';
import type { PluginContext } from '../../src/api.js';

export class ShowCommand extends Command {
  constructor(private readonly context: Pick<PluginContext, 'showShape'>) { super(); }
  override get syntax(): string { return 'show <id>'; }
  override run(editor: Editor, values: readonly string[]): readonly string[] {
    const args = new Arguments(values, this.syntax); args.count(1);
    return this.context.showShape(editor.document, args.at(0));
  }
}
