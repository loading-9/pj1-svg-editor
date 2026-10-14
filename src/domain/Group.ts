import { Numbers } from './Numbers.js';
import { Shape } from './Shape.js';

export class Group extends Shape {
  private readonly nodes: Shape[] = [];
  constructor(id: string) { super(id); }
  override get type(): string { return 'g'; }
  override get children(): readonly Shape[] { return [...this.nodes]; }
  override asGroup(): Group { return this; }
  override initialize(args: readonly string[]): void {
    if (args.length) throw new Error('invalid parameters for g');
  }
  indexOf(shape: Shape): number { return this.nodes.indexOf(shape); }

  insert(shape: Shape, index = this.nodes.length): void {
    if (shape === this || shape.isAncestorOf(this)) throw new Error(`cannot move a container into its own descendant: ${shape.id}`);
    if (index < 0 || index > this.nodes.length) throw new Error('invalid child index');
    shape.parent?.remove(shape);
    this.nodes.splice(index, 0, shape);
    shape.attachTo(this);
  }

  remove(shape: Shape): number {
    const index = this.indexOf(shape);
    if (index < 0) throw new Error(`no such child: ${shape.id}`);
    this.nodes.splice(index, 1);
    shape.attachTo(undefined);
    return index;
  }

  override move(dx: number, dy: number): void {
    const [localX, localY] = this.transform.inverse().vector(dx, dy);
    this.nodes.forEach(child => child.move(localX, localY));
  }

  override scale(factor: number): void {
    Numbers.positive(factor, 'scale factor');
    this.applyTransform(this.transform.scaleTranslation(factor));
    this.nodes.forEach(child => child.scale(factor));
  }

  override summary(): string {
    const style = this.styleSummary();
    return `${this.label}${style ? ` ${style}` : ''}${this.transformSummary()}`;
  }

  override clone(): Group {
    const copy = new Group(this.id);
    this.copyBaseTo(copy);
    this.nodes.forEach(child => copy.insert(child.clone()));
    return copy;
  }
}
