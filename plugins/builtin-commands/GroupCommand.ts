import type { SvgDocument } from '../../src/api.js';
import type { Arguments } from '../../src/api.js';
import { EditCommand } from '../../src/api.js';

export class GroupCommand extends EditCommand {
  override get syntax(): string { return 'group <newGid> <id1> <id2>…'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(3, Infinity);
    const group = document.group(args.at(0), args.rest(1));
    return `${group.label} created with ${group.children.length} children`;
  }
}
