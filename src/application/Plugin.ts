import type { ShapeProvider } from './ShapeProvider.js';
import type { Command } from './Command.js';
import type { TreeDecorator } from './TreeDecorator.js';
import type { AttributeHandler } from './AttributeHandler.js';
export type Category = 'shapes' | 'commands' | 'decorators' | 'attributes';
export type Contributions = Partial<Record<Category, readonly string[]>>;
export interface CommandProvider {
  readonly name: string;
  readonly syntax: string;
  create(): Command;
}
export interface PluginContext {
  registerShape(provider: ShapeProvider): void;
  registerCommand(provider: CommandProvider): void;
  registerDecorator(decorator: TreeDecorator): void;
  registerAttribute(handler: AttributeHandler): void;
  createShape(type: string, id: string, args: readonly string[]): import('../domain/Shape.js').Shape;
  help(): readonly string[];
  setAttribute(document: import('../domain/SvgDocument.js').SvgDocument, shape: import('../domain/Shape.js').Shape, attr: string, value: string): void;
  treeDecorators(): readonly TreeDecorator[];
}
export interface Plugin {
  activate(context: PluginContext, options?: unknown): void;
}
