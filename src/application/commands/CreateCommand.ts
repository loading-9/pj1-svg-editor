import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Arguments } from '../Arguments.js';
import { EditCommand } from '../EditCommand.js';
import { ShapeFactory } from '../ShapeFactory.js';

export class CreateCommand extends EditCommand {
  constructor(private readonly factory = new ShapeFactory()) { super(); }
  override get syntax(): string { return 'create <type> <id> [params…] [in <containerId>]'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(2, Infinity);
    const params = args.rest(2);
    const container = params.length >= 2 && params.at(-2) === 'in' ? params.splice(-2)[1] : undefined;
    const parent = container === undefined ? document.root : document.container(container);
    document.assertAvailable(args.at(1));
    const shape = this.factory.create(args.at(0), args.at(1), params);
    document.add(shape, parent);
    return `${shape.label} created${container === undefined ? '' : ` in ${parent.label}`}`;
  }
}
