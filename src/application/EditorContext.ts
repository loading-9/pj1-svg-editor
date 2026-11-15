import type { SvgDocument } from '../domain/SvgDocument.js';
import type { EditCommand } from './EditCommand.js';
import type { Arguments } from './Arguments.js';
/** Public use-case port seen by commands; Editor is one implementation. */
export interface EditorContext {
  readonly document: SvgDocument;
  readonly saved: SvgDocument | undefined;
  init(width:number,height:number): string;
  read(path:string): readonly string[];
  save(path?:string): string;
  canvas(width?:number,height?:number): string;
  edit(command:EditCommand,args:Arguments): string;
  undo():string;
  redo():string;
}
