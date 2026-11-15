import type { Shape } from '../domain/Shape.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
/** Both methods receive detached state. handles must be pure; apply may throw. */
export interface AttributeHandler {
  readonly name: string;
  handles(shape: Shape, attr: string): boolean;
  apply(shape: Shape, attr: string, value: string, document: SvgDocument): void;
}
