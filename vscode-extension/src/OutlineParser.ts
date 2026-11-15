import { SaxesParser } from 'saxes';
import { OutlineNode } from './OutlineNode.js';
/** Position-preserving XML traversal; independent of VSCode and CLI domain constraints. */
export class OutlineParser {
  parse(source: string): OutlineNode[] {
    const roots: OutlineNode[] = [], stack: OutlineNode[] = [];
    let failed = false;
    const parser = new SaxesParser({ xmlns: false, position: true });
    parser.on('error', () => { failed = true; });
    parser.on('opentag', tag => {
      const start = source.lastIndexOf('<', parser.position - 1);
      const id = tag.attributes['id'];
      const node = new OutlineNode(tag.name + (id ? '#' + id : ''), start, start + 1 + tag.name.length);
      (stack.at(-1)?.children ?? roots).push(node); stack.push(node);
    });
    parser.on('closetag', () => { const node = stack.pop(); if (node) node.end = parser.position; });
    try { parser.write(source).close(); } catch { failed = true; }
    return failed || stack.length ? [] : roots;
  }
}
