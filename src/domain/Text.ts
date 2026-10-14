import { GeometryShape } from './GeometryShape.js';

export class Text extends GeometryShape {
  private textContent = '';
  constructor(id: string) { super(id, ['x', 'y'], ['x'], ['y'], []); }
  override get type(): string { return 'text'; }
  override get content(): string { return this.textContent; }
  override initialize(args: readonly string[]): void {
    if (args.length !== 3) throw new Error('invalid parameters for text');
    super.initialize(args.slice(0, 2));
    this.setAttribute('text', args[2]!);
  }
  override setAttribute(name: string, value: string): void {
    if (name === 'text') this.textContent = value;
    else super.setAttribute(name, value);
  }
  override summary(): string { return this.details(`${this.position()} ${JSON.stringify(this.content)}`); }
  override clone(): Text {
    const copy = new Text(this.id);
    this.copyBaseTo(copy);
    copy.setAttribute('text', this.content);
    return copy;
  }
}
