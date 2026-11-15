// The supported plugin surface. Plugins import this module, never host or internal paths.
export { Shape } from './domain/Shape.js';
export { GeometryShape } from './domain/GeometryShape.js';
export { Group } from './domain/Group.js';
export { SvgDocument } from './domain/SvgDocument.js';
export { Numbers } from './domain/Numbers.js';
export { AffineTransform } from './domain/AffineTransform.js';
export { Command } from './application/Command.js';
export { EditCommand } from './application/EditCommand.js';
export { Arguments } from './application/Arguments.js';
export { Editor } from './application/Editor.js';
export { TreeRenderer } from './application/TreeRenderer.js';
export { ShapeFactory } from './application/ShapeFactory.js';
export { Extensions } from './application/Extensions.js';
export type { SvgStore } from './application/SvgStore.js';
export type { ShapeProvider } from './application/ShapeProvider.js';
export type { AttributeHandler } from './application/AttributeHandler.js';
export type { TreeDecorator, TreeView } from './application/TreeDecorator.js';
export type { Plugin, PluginContext, CommandProvider, Contributions, Category } from './application/Plugin.js';
