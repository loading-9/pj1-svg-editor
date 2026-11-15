import { Arguments, Command } from '../../src/api.js';
import type { Editor } from '../../src/api.js';
export class StatsCommand extends Command {
  override get syntax(): string { return 'stats'; }
  override run(editor: Editor, args: readonly string[]): readonly string[] {
    new Arguments(args,this.syntax).count(0);
    const counts=new Map<string,number>(); let containers=0,total=0;
    for(const shape of editor.document.allShapes()) {
      if(shape.asGroup()) containers++;
      else {counts.set(shape.type,(counts.get(shape.type)??0)+1);total++;}
    }
    const parts=[...counts].map(([type,count])=>type+': '+count);
    parts.push('(total '+total+', containers '+containers+')'); return [parts.join('  ')];
  }
}
