import type { Shape } from '../domain/Shape.js';
import type { TreeDecorator, TreeView } from './TreeDecorator.js';
import type { SvgDocument } from '../domain/SvgDocument.js';

export class TreeRenderer {
  constructor(private readonly decorators: readonly TreeDecorator[] = []) {}
  private suffix(shape: Shape | undefined, view: TreeView): string {
    const before = view.document.fingerprint();
    const labels = this.decorators.map(d => d.decorate(shape, view)).filter(Boolean);
    if (before !== view.document.fingerprint()) throw new Error('tree decorator mutated document');
    if (labels.some(label => /[\r\n]/.test(label))) throw new Error('tree decorator returned multiline label');
    return labels.length ? ' ' + labels.join(' ') : '';
  }
  tree(document: SvgDocument, id?: string, saved?: SvgDocument): string[] {
    document = document.clone();
    const view: TreeView = { document, saved: saved?.clone() };
    const lines: string[] = [];
    if (id !== undefined) {
      const shape = document.find(id);
      lines.push(shape.summary() + this.suffix(shape, view));
      this.children(shape.children, '', lines, view);
    } else {
      lines.push(`svg (${document.width}x${document.height})` + this.suffix(undefined, view));
      this.children(document.root.children, '', lines, view);
    }
    return lines;
  }
  private children(children: readonly Shape[], prefix: string, lines: string[], view: TreeView): void {
    children.forEach((shape, index) => {
      const last = index === children.length - 1;
      lines.push(`${prefix}${last ? '└── ' : '├── '}${shape.summary()}${this.suffix(shape, view)}`);
      this.children(shape.children, `${prefix}${last ? '    ' : '│   '}`, lines, view);
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
