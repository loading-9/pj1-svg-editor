import { Circle } from '../domain/Circle.js';
import { Ellipse } from '../domain/Ellipse.js';
import { Group } from '../domain/Group.js';
import { Line } from '../domain/Line.js';
import { Rect } from '../domain/Rect.js';
import { Shape } from '../domain/Shape.js';
import { Text } from '../domain/Text.js';

/** Name dispatch location #2; later replace built-ins with registered providers. */
export class ShapeFactory {
  private readonly constructors = new Map<string, new (id: string) => Shape>([
    ['rect', Rect], ['circle', Circle], ['ellipse', Ellipse],
    ['line', Line], ['text', Text], ['g', Group],
  ]);

  private instantiate(type: string, id: string): Shape {
    const Constructor = this.constructors.get(type);
    if (!Constructor) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return new Constructor(id);
  }

  create(type: string, id: string, args: readonly string[]): Shape {
    const shape = this.instantiate(type, id);
    shape.initialize(args);
    return shape;
  }

  read(type: string, id: string, attributes: ReadonlyMap<string, string>, content: string): Shape {
    const shape = this.instantiate(type, id);
    shape.importAttributes(attributes);
    if (shape.content !== undefined) shape.setAttribute('text', content);
    return shape;
  }
}
