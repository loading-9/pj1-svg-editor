import { Extensions } from '../application/Extensions.js';
import { ShapeFactory } from '../application/ShapeFactory.js';
import { HelpText } from '../application/HelpText.js';
import type { PluginContext, CommandProvider, Category } from '../application/Plugin.js';
import type { ShapeProvider } from '../application/ShapeProvider.js';
import type { TreeDecorator } from '../application/TreeDecorator.js';
import type { AttributeHandler } from '../application/AttributeHandler.js';
import type { Shape } from '../domain/Shape.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
export class Registration implements PluginContext {
  readonly staged = new Extensions();
  private sealed = false;
  constructor(private readonly live: Extensions) {}
  private add(category: Category, value: { readonly name: string }): void {
    if (this.sealed) throw new Error('plugin registration is closed');
    if (!value.name || /\s/.test(value.name)) throw new Error('invalid registration name');
    if (this.live[category].has(value.name) || this.staged[category].has(value.name)) throw new Error('duplicate registration: ' + category + '/' + value.name);
  }
  registerShape(value: ShapeProvider): void { this.add('shapes', value); this.staged.shapes.set(value.name,value); }
  registerCommand(value: CommandProvider): void { this.add('commands',value); this.staged.commands.set(value.name,value); }
  registerDecorator(value: TreeDecorator): void { this.add('decorators',value); this.staged.decorators.set(value.name,value); }
  registerAttribute(value: AttributeHandler): void { this.add('attributes',value); this.staged.attributes.set(value.name,value); }
  createShape(type: string, id: string, args: readonly string[]) { return new ShapeFactory(this.live).create(type,id,args); }
  help(): readonly string[] { return new HelpText(this.live).lines(); }
  setAttribute(document: SvgDocument, shape: Shape, attr: string, value: string): void { this.live.set(document, shape, attr, value); }
  treeDecorators(): readonly TreeDecorator[] { return [...this.live.decorators.values()]; }
  close(): void { this.sealed = true; }
  publish(): void {
    for (const [name,p] of this.staged.shapes) this.live.shapes.set(name,p);
    for (const [name,p] of this.staged.commands) this.live.commands.set(name,p);
    for (const [name,p] of this.staged.decorators) this.live.decorators.set(name,p);
    for (const [name,p] of this.staged.attributes) this.live.attributes.set(name,p);
  }
}
