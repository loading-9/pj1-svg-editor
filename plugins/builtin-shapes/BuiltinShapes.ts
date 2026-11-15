import type { Plugin, PluginContext } from '../../src/api.js';
import { Group } from '../../src/api.js';
import { Rect } from './Rect.js';
import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Line } from './Line.js';
import { Text } from './Text.js';
import { BuiltinShapeProvider } from './BuiltinShapeProvider.js';
export class BuiltinShapes implements Plugin {
  activate(ctx: PluginContext): void {
    ctx.registerShape(new BuiltinShapeProvider('rect','create rect <id> <x> <y> <w> <h> [fill] [in <containerId>]',Rect));
    ctx.registerShape(new BuiltinShapeProvider('circle','create circle <id> <cx> <cy> <r> [fill] [in <containerId>]',Circle));
    ctx.registerShape(new BuiltinShapeProvider('ellipse','create ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <containerId>]',Ellipse));
    ctx.registerShape(new BuiltinShapeProvider('line','create line <id> <x1> <y1> <x2> <y2> [stroke] [in <containerId>]',Line));
    ctx.registerShape(new BuiltinShapeProvider('text','create text <id> <x> <y> "content" [in <containerId>]',Text));
    ctx.registerShape(new BuiltinShapeProvider('g','create g <id> [in <containerId>]',Group));
  }
}

