import type { TreeDecorator,Shape } from '../../src/api.js';
import { Box } from './Box.js';
export class BoxTypeLabel implements TreeDecorator {
  readonly name='box-type-label';
  decorate(shape:Shape|undefined):string {return shape instanceof Box?'(box)':'';}
}
