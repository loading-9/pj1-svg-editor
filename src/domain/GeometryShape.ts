import { Numbers } from './Numbers.js';
import { Shape } from './Shape.js';

/** Geometry and validation are encapsulated; type-specific behavior is polymorphic. */
export abstract class GeometryShape extends Shape {
  private readonly values = new Map<string, number>();

  protected constructor(
    id: string, private readonly fields: readonly string[],
    private readonly xFields: readonly string[], private readonly yFields: readonly string[],
    private readonly sizes: readonly string[], private readonly optionalStyle?: string,
  ) {
    super(id);
    fields.forEach(name => this.values.set(name, 0));
  }

  protected value(name: string): number { return this.values.get(name)!; }

  override initialize(args: readonly string[]): void {
    const max = this.fields.length + (this.optionalStyle ? 1 : 0);
    if (args.length < this.fields.length || args.length > max) {
      throw new Error(`invalid parameters for ${this.type}`);
    }
    this.fields.forEach((name, index) => this.setAttribute(name, args[index]!));
    if (this.optionalStyle && args.length > this.fields.length) {
      this.setAttribute(this.optionalStyle, args[this.fields.length]!);
    }
  }

  override importAttributes(attributes: ReadonlyMap<string, string>): void {
    super.importAttributes(new Map([...attributes].filter(([name]) => !this.fields.includes(name))));
    for (const name of this.fields) this.setAttribute(name, attributes.get(name) ?? '0');
  }

  override setAttribute(name: string, value: string): void {
    if (!this.fields.includes(name)) return super.setAttribute(name, value);
    const number = Numbers.parse(value, name);
    this.values.set(name, this.sizes.includes(name) ? Numbers.nonNegative(number, name) : number);
  }

  override attributes(): ReadonlyMap<string, string> {
    return new Map([...super.attributes(), ...this.fields.map(name => [name, Numbers.format(this.value(name))] as const)]);
  }

  override move(dx: number, dy: number): void {
    const [localX, localY] = this.transform.inverse().vector(dx, dy);
    const next = new Map(this.values);
    this.xFields.forEach(name => next.set(name, Numbers.finite(this.value(name) + localX, name)));
    this.yFields.forEach(name => next.set(name, Numbers.finite(this.value(name) + localY, name)));
    for (const [name, value] of next) this.values.set(name, value);
  }

  override scale(factor: number): void {
    Numbers.positive(factor, 'scale factor');
    const next = this.fields.map(name => [name, Numbers.finite(this.value(name) * factor, name)] as const);
    const transform = this.transform.scaleTranslation(factor);
    next.forEach(([name, value]) => this.values.set(name, value));
    this.applyTransform(transform);
  }

  protected geometrySummary(aliases: Readonly<Record<string, string>> = {}): string {
    return this.fields.map(name => `${aliases[name] ?? name}=${Numbers.format(this.value(name))}`).join(' ');
  }

  protected position(): string {
    return `(${Numbers.format(this.value(this.xFields[0]!))},${Numbers.format(this.value(this.yFields[0]!))})`;
  }

  protected details(geometry: string): string {
    const style = this.styleSummary();
    return `${this.label} ${geometry}${style ? ` ${style}` : ''}${this.transformSummary()}`;
  }
}
