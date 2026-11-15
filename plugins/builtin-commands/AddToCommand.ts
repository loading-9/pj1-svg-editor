import type { SvgDocument } from '../../src/api.js';
import type { Arguments } from '../../src/api.js';
import { EditCommand } from '../../src/api.js';

export class AddToCommand extends EditCommand {
  override get syntax(): string { return 'addto <gid> <id>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(2); const group = document.container(args.at(0)); const shape = document.find(args.at(1));
    document.reparent(shape, group);
    return `${shape.label} moved into ${group.label}`;
  }
}
