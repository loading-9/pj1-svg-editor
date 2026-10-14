import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Arguments } from '../Arguments.js';
import { EditCommand } from '../EditCommand.js';

export class MoveCommand extends EditCommand {
  override get syntax(): string { return 'move <id> <dx> <dy>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(3); const shape = document.find(args.at(0));
    const dx = args.number(1, 'dx'); const dy = args.number(2, 'dy');
    shape.move(dx, dy);
    return `${shape.label} moved by (${dx},${dy}): ${shape.summary()}`;
  }
}
