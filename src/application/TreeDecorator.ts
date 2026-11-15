import type { Shape } from '../domain/Shape.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
export interface TreeView {
  readonly document: SvgDocument;
  readonly saved: SvgDocument | undefined;
}
export interface TreeDecorator {
  readonly name: string;
  decorate(shape: Shape | undefined, view: TreeView): string;
}
