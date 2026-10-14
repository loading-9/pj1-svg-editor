import { Numbers } from '../domain/Numbers.js';

export class Arguments {
  constructor(private readonly values: readonly string[], private readonly syntax: string) {}
  count(min: number, max = min): void {
    if (this.values.length < min || this.values.length > max) throw new Error(`usage: ${this.syntax}`);
  }
  at(index: number): string {
    const value = this.values[index];
    if (value === undefined) throw new Error(`usage: ${this.syntax}`);
    return value;
  }
  number(index: number, name: string): number { return Numbers.parse(this.at(index), name); }
  rest(index: number): string[] { return this.values.slice(index); }
  get length(): number { return this.values.length; }
}
