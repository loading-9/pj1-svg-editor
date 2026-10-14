import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Arguments } from '../Arguments.js';
import { EditCommand } from '../EditCommand.js';

export class UngroupCommand extends EditCommand {
  override get syntax(): string { return 'ungroup <gid>'; }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.count(1); const count = document.ungroup(args.at(0));
    return `g#${args.at(0)} ungrouped (${count} children lifted)`;
  }
}
