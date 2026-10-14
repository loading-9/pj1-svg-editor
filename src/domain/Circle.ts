import { GeometryShape } from './GeometryShape.js';

export class Circle extends GeometryShape {
  constructor(id: string) { super(id, ['cx', 'cy', 'r'], ['cx'], ['cy'], ['r'], 'fill'); }
  override get type(): string { return 'circle'; }
  override summary(): string { return this.details(this.geometrySummary()); }
  override clone(): Circle { const copy = new Circle(this.id); this.copyBaseTo(copy); return copy; }
}
