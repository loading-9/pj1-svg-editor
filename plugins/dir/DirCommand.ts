import { Arguments, Command } from '../../src/api.js';
import type { EditorContext as Editor } from '../../src/api.js';
import type { DirectoryReader } from './DirectoryReader.js';
export class DirCommand extends Command {
  constructor(private readonly reader: DirectoryReader) { super(); }
  override get syntax(): string { return 'dir'; }
  override run(_editor: Editor, args: readonly string[]): readonly string[] {
    new Arguments(args,this.syntax).count(0); const path=this.reader.currentDirectory();
    try {
      const entries=[...this.reader.entries(path)];
      const rank={directory:0,file:1,link:2,other:3},label={directory:'DIR',file:'FILE',link:'LINK',other:'OTHER'};
      entries.sort((a,b)=>rank[a.kind]-rank[b.kind]||(a.name<b.name?-1:a.name>b.name?1:0));
      return entries.length?entries.map(entry=>'['+label[entry.kind]+']  '+entry.name):['(empty directory)'];
    } catch { throw new Error('cannot read directory: '+path); }
  }
}
