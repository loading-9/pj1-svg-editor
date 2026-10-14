import { GeometryShape } from './GeometryShape.js';

export class Rect extends GeometryShape {
  constructor(id: string) { super(id, ['x', 'y', 'width', 'height'], ['x'], ['y'], ['width', 'height'], 'fill'); }
  override get type(): string { return 'rect'; }
  override summary(): string { return this.details(this.geometrySummary({ width: 'w', height: 'h' })); }
  override clone(): Rect { const copy = new Rect(this.id); this.copyBaseTo(copy); return copy; }
}
