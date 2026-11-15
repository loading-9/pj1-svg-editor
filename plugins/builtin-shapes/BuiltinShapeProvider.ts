import type { Shape, ShapeProvider } from '../../src/api.js';
export class BuiltinShapeProvider implements ShapeProvider {
  readonly priority = 0;
  constructor(readonly name: string, readonly syntax: string, private readonly construct: new (id: string) => Shape) {}
  create(id: string, args: readonly string[]): Shape { const shape = new this.construct(id); shape.initialize(args); return shape; }
  accepts(tag: string): boolean { return tag === this.name; }
  read(id: string, attrs: ReadonlyMap<string,string>, content: string): Shape {
    const shape = new this.construct(id); shape.importAttributes(attrs);
    if (shape.content !== undefined) shape.setAttribute('text',content);
    return shape;
  }
}
