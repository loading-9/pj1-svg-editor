import type { SvgDocument } from '../../src/api.js';
import type { Arguments } from '../../src/api.js';
import { EditCommand } from '../../src/api.js';
import { Numbers } from '../../src/api.js';

export class ScaleCommand extends EditCommand {
  override get syntax(): string { return 'scale <id> <factor>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(2); const shape = document.find(args.at(0));
    const factor = Numbers.positive(args.number(1, 'factor'), 'scale factor');
    shape.scale(factor);
    return `${shape.label} scaled by ${factor}`;
  }
}
