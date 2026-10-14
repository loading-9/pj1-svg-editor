import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Arguments } from '../Arguments.js';
import { EditCommand } from '../EditCommand.js';

export class DeleteCommand extends EditCommand {
  override get syntax(): string { return 'delete <id>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(1); const shape = document.find(args.at(0));
    shape.parent!.remove(shape);
    return `${shape.label} deleted`;
  }
}
