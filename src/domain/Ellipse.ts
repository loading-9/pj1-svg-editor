import { GeometryShape } from './GeometryShape.js';

export class Ellipse extends GeometryShape {
  constructor(id: string) { super(id, ['cx', 'cy', 'rx', 'ry'], ['cx'], ['cy'], ['rx', 'ry'], 'fill'); }
  override get type(): string { return 'ellipse'; }
  override summary(): string { return this.details(this.geometrySummary()); }
  override clone(): Ellipse { const copy = new Ellipse(this.id); this.copyBaseTo(copy); return copy; }
}
