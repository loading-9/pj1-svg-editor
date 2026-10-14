import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Arguments } from '../Arguments.js';
import { EditCommand } from '../EditCommand.js';

export class ZOrderCommand extends EditCommand {
  constructor(private readonly front: boolean) { super(); }
  override get syntax(): string { return `${this.front ? 'front' : 'back'} <id>`; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(1); const shape = document.find(args.at(0));
    document.reorder(shape, this.front);
    return `${shape.label} moved to ${this.front ? 'front' : 'back'}`;
  }
}
