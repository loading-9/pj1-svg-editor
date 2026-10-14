import type { Shape } from '../domain/Shape.js';
import type { SvgDocument } from '../domain/SvgDocument.js';

export class TreeRenderer {
  tree(document: SvgDocument, id?: string): string[] {
    const lines: string[] = [];
    if (id !== undefined) {
      const shape = document.find(id);
      lines.push(shape.summary());
      this.children(shape.children, '', lines);
    } else {
      lines.push(`svg (${document.width}x${document.height})`);
      this.children(document.root.children, '', lines);
    }
    return lines;
  }
  private children(children: readonly Shape[], prefix: string, lines: string[]): void {
    children.forEach((shape, index) => {
      const last = index === children.length - 1;
      lines.push(`${prefix}${last ? '└── ' : '├── '}${shape.summary()}`);
      this.children(shape.children, `${prefix}${last ? '    ' : '│   '}`, lines);
    });
  }
  show(document: SvgDocument, id: string): string[] {
    const shape = document.find(id);
    const parent = shape.parent === document.root ? 'svg' : shape.parent!.label;
    const lines = [`${shape.label}  parent=${parent}`];
    for (const [name, value] of shape.attributes()) {
      if (name !== 'id') lines.push(`  ${name}=${JSON.stringify(value).replace(/^"([^\s"]*)"$/, '$1')}`);
    }
    if (shape.content !== undefined) lines.push(`  text=${JSON.stringify(shape.content)}`);
    return lines;
  }
}
