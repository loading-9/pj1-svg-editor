import type { Shape } from '../domain/Shape.js';
import { Extensions } from './Extensions.js';
export class ShapeFactory {
  constructor(private readonly extensions: Extensions) {}
  create(type: string, id: string, args: readonly string[]): Shape {
    const provider = this.extensions.shapes.get(type);
    if (!provider) throw new Error('unknown shape type: ' + type + ' (is the plugin loaded?)');
    const shape = provider.create(id, args);
    if (shape.id !== id) throw new Error('shape provider returned wrong id: ' + type);
    shape.validate();
    return shape;
  }
  read(type: string, id: string, attributes: ReadonlyMap<string, string>, content: string): Shape {
    const candidates = [...this.extensions.shapes.values()].filter(p => p.accepts(type, attributes)).sort((a,b) => b.priority - a.priority);
    if (!candidates.length) throw new Error('unknown shape type: ' + type + ' (is the plugin loaded?)');
    if (candidates[1]?.priority === candidates[0]!.priority) throw new Error('ambiguous shape readers: ' + type);
    const shape = candidates[0]!.read(id, attributes, content);
    if (shape.id !== id) throw new Error('shape provider returned wrong id: ' + type);
    return shape;
  }
}
