import { Group } from '../../src/api.js';
import type { Shape } from '../../src/api.js';
export class Box extends Group {
  override get composite(): boolean { return true; }
  override get label(): string { return 'box#'+this.id; }
  get frame(): Shape { return this.part(this.id+'-rect','rect'); }
  get title(): Shape { return this.part(this.id+'-label','text'); }
  private part(id:string,type:string):Shape {
    const part=this.children.find(child=>child.id===id);
    if(!part||part.type!==type)throw new Error('invalid box: '+this.id+' (expected '+type+'#'+id+')');
    return part;
  }
  override remove(shape:Shape):number {
    if(shape.id===this.id+'-rect'||shape.id===this.id+'-label')throw new Error('cannot detach required box part: '+shape.id);
    return super.remove(shape);
  }
  override attributes():ReadonlyMap<string,string> { return new Map([...super.attributes(),['data-kind','box']]); }
  override validate():void {void this.frame;void this.title;super.validate();}
  override summary():string {
    const style=this.styleSummary();return 'g#'+this.id+(style?' '+style:'')+this.transformSummary();
  }
  override clone():Box {
    const copy=new Box(this.id);this.copyBaseTo(copy);this.children.forEach(child=>copy.insert(child.clone()));return copy;
  }
}
