import { Group } from './Group.js';
import { Numbers } from './Numbers.js';
import { Shape } from './Shape.js';

export class SvgDocument {
  private canvasRoot = new Group('__canvas__');
  private extraRootAttributes = new Map<string, string>();
  constructor(private canvasWidth = 800, private canvasHeight = 600) { this.resize(canvasWidth, canvasHeight); }
  get width(): number { return this.canvasWidth; }
  get height(): number { return this.canvasHeight; }
  get root(): Group { return this.canvasRoot; }
  get count(): number { return this.allShapes().length; }

  resize(width: number, height: number): void {
    Numbers.positive(width, 'canvas width');
    Numbers.positive(height, 'canvas height');
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.extraRootAttributes.set('viewBox', `0 0 ${width} ${height}`);
  }

  importRootAttributes(attributes: ReadonlyMap<string, string>): void {
    this.extraRootAttributes = new Map([...attributes].filter(([name]) => name !== 'width' && name !== 'height' && name !== 'xmlns'));
  }

  rootAttributes(): ReadonlyMap<string, string> {
    return new Map([['xmlns', 'http://www.w3.org/2000/svg'], ['width', String(this.width)], ['height', String(this.height)], ...this.extraRootAttributes]);
  }

  allShapes(): Shape[] {
    const result: Shape[] = [];
    const visit = (shape: Shape): void => { result.push(shape); shape.children.forEach(visit); };
    this.root.children.forEach(visit);
    return result;
  }

  find(id: string): Shape {
    const shape = this.allShapes().find(node => node.id === id);
    if (!shape) throw new Error(`no such shape: ${id}`);
    return shape;
  }

  container(id: string): Group {
    const shape = this.allShapes().find(node => node.id === id);
    if (!shape) throw new Error(`no such container: ${id}`);
    const group = shape.asGroup();
    if (!group) throw new Error(`not a container: ${id}`);
    return group;
  }

  assertAvailable(id: string): void {
    if (!id || /\s/.test(id)) throw new Error(`invalid id: ${id}`);
    if (this.allShapes().some(shape => shape.id === id) || this.extraRootAttributes.get('id') === id) {
      throw new Error(`id already exists: ${id}`);
    }
  }

  add(shape: Shape, parent = this.root): void {
    this.assertAvailable(shape.id);
    parent.insert(shape);
  }

  reparent(shape: Shape, parent: Group, index = parent.children.length): void {
    if (shape === parent || shape.isAncestorOf(parent)) {
      throw new Error(`cannot move a container into its own descendant: ${shape.id}`);
    }
    const transform = parent.worldTransform().inverse().multiply(shape.worldTransform());
    parent.insert(shape, index);
    shape.applyTransform(transform);
  }

  group(id: string, ids: readonly string[]): Group {
    this.assertAvailable(id);
    if (!ids.length) throw new Error('group requires at least one shape');
    if (new Set(ids).size !== ids.length) throw new Error('duplicate group member');
    const selected = ids.map(member => this.find(member));
    for (const shape of selected) {
      if (selected.some(other => shape.isAncestorOf(other))) {
        throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
      }
    }
    const ordered = this.allShapes().filter(shape => selected.includes(shape));
    let parent = ordered[0]!.parent!;
    while (!ordered.every(shape => shape.parent === parent || parent.isAncestorOf(shape))) parent = parent.parent!;
    const branches = ordered.map(shape => {
      let branch = shape;
      while (branch.parent !== parent) branch = branch.parent!;
      return branch;
    });
    const index = Math.min(...branches.map(shape => parent.indexOf(shape)));
    const group = new Group(id);
    parent.insert(group, index);
    ordered.forEach(shape => this.reparent(shape, group));
    return group;
  }

  ungroup(id: string): number {
    const group = this.container(id);
    const parent = group.parent!;
    if (parent === this.root) throw new Error(`cannot ungroup top-level container: ${id}`);
    let index = parent.indexOf(group);
    const children = group.children;
    children.forEach(child => this.reparent(child, parent, index++));
    parent.remove(group);
    return children.length;
  }

  reorder(shape: Shape, front: boolean): void {
    const parent = shape.parent!;
    parent.remove(shape);
    parent.insert(shape, front ? parent.children.length : 0);
  }

  clone(): SvgDocument {
    const copy = new SvgDocument(this.width, this.height);
    copy.canvasRoot = this.root.clone();
    copy.extraRootAttributes = new Map(this.extraRootAttributes);
    return copy;
  }
}
