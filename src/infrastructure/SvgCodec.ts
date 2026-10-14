import { DOMImplementation, DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { compose, fromDefinition, fromTransformAttribute } from 'transformation-matrix';
import { AffineTransform } from '../domain/AffineTransform.js';
import { Numbers } from '../domain/Numbers.js';
import { Shape } from '../domain/Shape.js';
import { SvgDocument } from '../domain/SvgDocument.js';
import { ShapeFactory } from '../application/ShapeFactory.js';

export class SvgCodec {
  private readonly namespace = 'http://www.w3.org/2000/svg';
  constructor(private readonly factory = new ShapeFactory()) {}

  decode(source: string): { document: SvgDocument; warnings: string[] } {
    if (/<!DOCTYPE/i.test(source)) throw new Error('invalid SVG: DOCTYPE is not supported');
    const failures: string[] = [];
    let xml: Document;
    try {
      xml = new DOMParser({ errorHandler: (_level, message: unknown) => failures.push(String(message)) }).parseFromString(source, 'image/svg+xml');
    } catch { throw new Error('invalid SVG: malformed XML'); }
    if (failures.length) throw new Error('invalid SVG: malformed XML');
    const root = xml.documentElement;
    if (!root || root.localName !== 'svg' || (root.namespaceURI && root.namespaceURI !== this.namespace)) {
      throw new Error('invalid SVG: expected <svg> root');
    }
    if (Array.from(xml.childNodes).some(node => node.nodeType === 1 && node !== root)) {
      throw new Error('invalid SVG: multiple root elements');
    }
    const rootAttrs = this.attributes(root);
    const viewBox = rootAttrs.get('viewBox')?.trim().split(/[\s,]+/).map(value => Numbers.parse(value, 'viewBox'));
    if (viewBox && (viewBox.length !== 4 || viewBox[2]! <= 0 || viewBox[3]! <= 0)) {
      throw new Error('invalid SVG: invalid viewBox');
    }
    const width = this.dimension(rootAttrs.get('width'), viewBox?.[2] ?? 800, 'width');
    const height = this.dimension(rootAttrs.get('height'), viewBox?.[3] ?? 600, 'height');
    const document = new SvgDocument(width, height);
    document.importRootAttributes(rootAttrs);
    document.root.applyTransform(this.transform(rootAttrs.get('transform')));

    // Reserve ALL explicit IDs before allocating any missing ones, including later siblings.
    const reserved = new Set<string>();
    const reserve = (element: Element): void => {
      const id = element.getAttribute('id');
      if (id) {
        if (/\s/.test(id)) throw new Error(`invalid id: ${id}`);
        if (reserved.has(id)) throw new Error(`id already exists: ${id}`);
        reserved.add(id);
      }
      this.elements(element).forEach(reserve);
    };
    reserve(root);
    const counters = new Map<string, number>();
    const warnings: string[] = [];
    const readShape = (element: Element): Shape => {
      if (element.namespaceURI && element.namespaceURI !== this.namespace) throw new Error('invalid SVG: foreign element namespace');
      const type = element.localName;
      const attrs = this.attributes(element);
      let id = attrs.get('id');
      if (!id) {
        let next = counters.get(type) ?? 0;
        do { id = `${type}${++next}`; } while (reserved.has(id));
        counters.set(type, next); reserved.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
      }
      const shape = this.factory.read(type, id, attrs, element.textContent ?? '');
      shape.applyTransform(this.transform(attrs.get('transform')));
      const elements = this.elements(element);
      const container = shape.asGroup();
      if (elements.length && !container) throw new Error(`invalid SVG: nested elements inside <${type}>`);
      if (container) {
        this.assertNoText(element);
        elements.forEach(child => container.insert(readShape(child)));
      } else if (shape.content === undefined) this.assertNoText(element);
      return shape;
    };
    this.assertNoText(root);
    for (const element of this.elements(root)) document.add(readShape(element));
    return { document, warnings };
  }

  encode(document: SvgDocument): string {
    const xml = new DOMImplementation().createDocument(this.namespace, 'svg', null);
    const root = xml.documentElement;
    for (const [name, value] of document.rootAttributes()) root.setAttribute(name, value);
    const appendShape = (shape: Shape, parent: Element, depth: number): void => {
      parent.appendChild(xml.createTextNode(`\n${'  '.repeat(depth)}`));
      const element = xml.createElementNS(this.namespace, shape.type);
      for (const [name, value] of shape.attributes()) element.setAttribute(name, value);
      if (shape.content !== undefined) element.appendChild(xml.createTextNode(shape.content));
      shape.children.forEach(child => appendShape(child, element, depth + 1));
      if (shape.children.length) element.appendChild(xml.createTextNode(`\n${'  '.repeat(depth)}`));
      parent.appendChild(element);
    };
    document.root.children.forEach(child => appendShape(child, root, 1));
    if (document.count) root.appendChild(xml.createTextNode('\n'));
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(xml)}\n`;
  }

  private attributes(element: Element): Map<string, string> {
    return new Map(Array.from(element.attributes).map(attribute => [attribute.name, attribute.value]));
  }
  private elements(element: Element): Element[] {
    return Array.from(element.childNodes).filter((node): node is Element => node.nodeType === 1);
  }
  private assertNoText(element: Element): void {
    if (Array.from(element.childNodes).some(node => (node.nodeType === 3 || node.nodeType === 4) && node.nodeValue?.trim())) {
      throw new Error(`invalid SVG: unexpected text inside <${element.localName}>`);
    }
  }
  private dimension(value: string | undefined, fallback: number, name: string): number {
    return value === undefined ? fallback : Numbers.positive(Numbers.parse(value.trim().replace(/px$/, ''), name), `canvas ${name}`);
  }
  private transform(value: string | undefined): AffineTransform {
    if (!value?.trim()) return new AffineTransform();
    try {
      const matrix = compose(fromDefinition(fromTransformAttribute(value)));
      return new AffineTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    } catch { throw new Error(`invalid SVG transform: ${value}`); }
  }
}
