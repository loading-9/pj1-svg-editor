import type * as VSCode from 'vscode';
import { SvgFileDecorationProvider } from './SvgFileDecorationProvider.js';
import { SvgDocumentSymbolProvider } from './SvgDocumentSymbolProvider.js';
export class SvgExtension {
  constructor(private readonly api: typeof VSCode) {}
  activate(context: VSCode.ExtensionContext): void {
    context.subscriptions.push(
      this.api.window.registerFileDecorationProvider(new SvgFileDecorationProvider(this.api)),
      this.api.languages.registerDocumentSymbolProvider({ scheme: 'file', pattern: '**/*.[sS][vV][gG]' }, new SvgDocumentSymbolProvider(this.api)),
    );
  }
}
