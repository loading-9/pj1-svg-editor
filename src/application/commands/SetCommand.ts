import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Arguments } from '../Arguments.js';
import { EditCommand } from '../EditCommand.js';

export class SetCommand extends EditCommand {
  override get syntax(): string { return 'set <id> <attr> <value>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(3); const shape = document.find(args.at(0));
    shape.setAttribute(args.at(1), args.at(2));
    return `${shape.label} updated: ${args.at(1)}=${JSON.stringify(args.at(2))}`;
  }
}
