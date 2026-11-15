import type { SvgDocument } from '../../src/api.js';
import type { Arguments } from '../../src/api.js';
import { EditCommand } from '../../src/api.js';

export class DeleteCommand extends EditCommand {
  override get syntax(): string { return 'delete <id>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(1); const shape = document.find(args.at(0));
    shape.parent!.remove(shape);
    return `${shape.label} deleted`;
  }
}
