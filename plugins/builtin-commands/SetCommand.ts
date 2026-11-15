import type { SvgDocument } from '../../src/api.js';
import type { Arguments } from '../../src/api.js';
import { EditCommand } from '../../src/api.js';

import type { PluginContext } from '../../src/api.js';
export class SetCommand extends EditCommand {
  constructor(private readonly context: Pick<PluginContext, 'setAttribute'>) { super(); }
  override get syntax(): string { return 'set <id> <attr> <value>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(3); const shape = document.find(args.at(0));
    this.context.setAttribute(document, shape, args.at(1), args.at(2));
    return `${shape.label} updated: ${args.at(1)}=${JSON.stringify(args.at(2))}`;
  }
}
