import type { Shape,TreeDecorator,TreeView } from '../../src/api.js';
export class ModifiedStar implements TreeDecorator {
  readonly name='modified-star';
  private current='';
  private baseline='';
  private readonly dirtyIds=new Set<string>();
  private rootDirty=false;
  private nodeState(shape:Shape):string {return JSON.stringify([shape.fingerprint(),shape.parent?.id,shape.parent?.indexOf(shape)]);}
  private refresh(view:TreeView):void {
    const current=view.document.fingerprint(),baseline=view.saved?.fingerprint()??'';
    if(current===this.current&&baseline===this.baseline)return;
    this.current=current;this.baseline=baseline;this.dirtyIds.clear();this.rootDirty=current!==baseline;
    const saved=new Map(view.saved?.allShapes().map(s=>[s.id,this.nodeState(s)])??[]);
    for(const shape of view.document.allShapes())if(saved.get(shape.id)!==this.nodeState(shape))this.dirtyIds.add(shape.id);
  }
  decorate(shape:Shape|undefined,view:TreeView):string {
    this.refresh(view);return (shape?this.dirtyIds.has(shape.id):this.rootDirty)?'*':'';
  }
}
