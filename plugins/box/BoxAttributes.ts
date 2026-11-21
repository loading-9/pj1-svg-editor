import type { AttributeHandler,Shape } from '../../src/api.js';
import { Box } from './Box.js';
export class BoxAttributes implements AttributeHandler {
  readonly name='box-attributes';
  handles(shape:Shape,attr:string):boolean {return shape instanceof Box&&(attr==='fill'||attr==='label');}
  apply(shape:Shape,attr:string,value:string):void {
    if(!(shape instanceof Box))throw new Error('box attribute target required');
    if(attr==='fill')shape.frame.setAttribute('fill',value);
    else if(attr==='label')shape.title.setAttribute('text',value);
    else throw new Error('unknown attribute: '+attr);
  }
}
