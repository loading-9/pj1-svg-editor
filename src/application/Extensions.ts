import type { AttributeHandler } from './AttributeHandler.js';
import type { CommandProvider } from './Plugin.js';
import type { ShapeProvider } from './ShapeProvider.js';
import type { TreeDecorator } from './TreeDecorator.js';
import type { Shape } from '../domain/Shape.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
/** Runtime registry. The host validates a transaction before publishing these maps. */
export class Extensions {
  readonly shapes = new Map<string, ShapeProvider>();
  readonly commands = new Map<string, CommandProvider>();
  readonly decorators = new Map<string, TreeDecorator>();
  readonly attributes = new Map<string, AttributeHandler>();
  set(document: SvgDocument, shape: Shape, attr: string, value: string): void {
    const before = document.fingerprint();
    const matches = [...this.attributes.values()].filter(handler => handler.handles(shape, attr));
    if (document.fingerprint() !== before) throw new Error('attribute handler mutated during handles');
    if (matches.length > 1) throw new Error('ambiguous attribute handlers: ' + matches.map(h => h.name).join(', '));
    if (matches.length) matches[0]!.apply(shape, attr, value, document);
    else shape.setAttribute(attr, value);
  }
}
