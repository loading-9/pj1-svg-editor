import type * as VSCode from 'vscode';
import { OutlineParser } from './OutlineParser.js';
import type { OutlineNode } from './OutlineNode.js';
export class SvgDocumentSymbolProvider implements VSCode.DocumentSymbolProvider {
  constructor(private readonly api: Pick<typeof VSCode, 'DocumentSymbol' | 'Range' | 'SymbolKind'>, private readonly parser = new OutlineParser()) {}
  provideDocumentSymbols(document: VSCode.TextDocument, token: VSCode.CancellationToken): VSCode.DocumentSymbol[] {
    if (token.isCancellationRequested) return [];
    const convert = (node: OutlineNode): VSCode.DocumentSymbol => {
      const range = new this.api.Range(document.positionAt(node.start), document.positionAt(node.end));
      const selection = new this.api.Range(document.positionAt(node.start + 1), document.positionAt(node.selectionEnd));
      const symbol = new this.api.DocumentSymbol(node.name, '', this.api.SymbolKind.Object, range, selection);
      symbol.children = node.children.map(convert); return symbol;
    };
    return this.parser.parse(document.getText()).map(convert);
  }
}
