import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Arguments } from '../Arguments.js';
import { EditCommand } from '../EditCommand.js';
import { Numbers } from '../../domain/Numbers.js';

export class ScaleCommand extends EditCommand {
  override get syntax(): string { return 'scale <id> <factor>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(2); const shape = document.find(args.at(0));
    const factor = Numbers.positive(args.number(1, 'factor'), 'scale factor');
    shape.scale(factor);
    return `${shape.label} scaled by ${factor}`;
  }
}
