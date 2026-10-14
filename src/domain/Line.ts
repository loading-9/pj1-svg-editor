import { GeometryShape } from './GeometryShape.js';

export class Line extends GeometryShape {
  constructor(id: string) { super(id, ['x1', 'y1', 'x2', 'y2'], ['x1', 'x2'], ['y1', 'y2'], [], 'stroke'); }
  override get type(): string { return 'line'; }
  override summary(): string { return this.details(`(${this.value('x1')},${this.value('y1')}) -> (${this.value('x2')},${this.value('y2')})`); }
  override clone(): Line { const copy = new Line(this.id); this.copyBaseTo(copy); return copy; }
}
