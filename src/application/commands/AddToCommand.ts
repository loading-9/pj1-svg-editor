import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Arguments } from '../Arguments.js';
import { EditCommand } from '../EditCommand.js';

export class AddToCommand extends EditCommand {
  override get syntax(): string { return 'addto <gid> <id>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(2); const group = document.container(args.at(0)); const shape = document.find(args.at(1));
    document.reparent(shape, group);
    return `${shape.label} moved into ${group.label}`;
  }
}
