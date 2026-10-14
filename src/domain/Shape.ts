import { AffineTransform } from './AffineTransform.js';
import { Numbers } from './Numbers.js';
import type { Group } from './Group.js';

export abstract class Shape {
  private owner: Group | undefined;
  private readonly extraAttributes = new Map<string, string>();
  private affine = new AffineTransform();

  protected constructor(private readonly identifier: string) {}
  abstract get type(): string;
  get id(): string { return this.identifier; }
  get parent(): Group | undefined { return this.owner; }
  get label(): string { return `${this.type}#${this.id}`; }
  get children(): readonly Shape[] { return []; }
  get transform(): AffineTransform { return this.affine; }
  get content(): string | undefined { return undefined; }
  asGroup(): Group | undefined { return undefined; }

  /** Tree ownership is maintained exclusively by Group.insert/remove. */
  attachTo(parent: Group | undefined): void { this.owner = parent; }
  applyTransform(transform: AffineTransform): void { this.affine = transform; }

  worldTransform(): AffineTransform {
    return (this.parent?.worldTransform() ?? new AffineTransform()).multiply(this.affine);
  }

  isAncestorOf(shape: Shape): boolean {
    for (let parent = shape.parent; parent; parent = parent.parent) {
      if ((parent as Shape) === this) return true;
    }
    return false;
  }

  setAttribute(name: string, value: string): void {
    if (name !== 'fill' && name !== 'stroke' && name !== 'stroke-width') {
      throw new Error(`unknown attribute: ${name}`);
    }
    if (name === 'stroke-width') value = Numbers.format(Numbers.nonNegative(Numbers.parse(value, name), name));
    this.extraAttributes.set(name, value);
  }

  /** Extra imported SVG attributes round-trip but aren't added to the CLI whitelist. */
  importAttributes(attributes: ReadonlyMap<string, string>): void {
    for (const [name, value] of attributes) {
      if (name !== 'id' && name !== 'transform') this.extraAttributes.set(name, value);
    }
    const strokeWidth = this.extraAttributes.get('stroke-width');
    if (strokeWidth !== undefined) this.setAttribute('stroke-width', strokeWidth);
  }

  attributes(): ReadonlyMap<string, string> {
    const result = new Map([['id', this.id], ...this.extraAttributes]);
    if (!this.affine.isIdentity) result.set('transform', this.affine.toSvg());
    return result;
  }

  protected copyBaseTo(target: Shape): void {
    target.importAttributes(this.attributes());
    target.applyTransform(this.affine);
  }

  protected styleSummary(): string {
    return [...this.extraAttributes].map(([name, value]) => `${name}=${JSON.stringify(value).replace(/^"([^\s"]*)"$/, '$1')}`).join(' ');
  }

  protected transformSummary(): string {
    return this.affine.isIdentity ? '' : ` transform="${this.affine.toSvg()}"`;
  }

  abstract initialize(args: readonly string[]): void;
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract summary(): string;
  abstract clone(): Shape;
}
