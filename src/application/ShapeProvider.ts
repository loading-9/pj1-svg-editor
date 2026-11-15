import type { Shape } from '../domain/Shape.js';
export interface ShapeProvider {
  readonly name: string;
  readonly syntax: string;
  readonly priority: number;
  create(id: string, args: readonly string[]): Shape;
  accepts(tag: string, attributes: ReadonlyMap<string, string>): boolean;
  read(id: string, attributes: ReadonlyMap<string, string>, content: string): Shape;
}
