import type * as VSCode from 'vscode';
export class SvgFileDecorationProvider implements VSCode.FileDecorationProvider {
  constructor(private readonly api: Pick<typeof VSCode, 'workspace' | 'FileType' | 'FileDecoration'>) {}
  async provideFileDecoration(uri: VSCode.Uri): Promise<VSCode.FileDecoration | undefined> {
    if (!uri.path.toLowerCase().endsWith('.svg')) return undefined;
    try {
      const stat = await this.api.workspace.fs.stat(uri);
      if ((stat.type & this.api.FileType.File) === 0 || (stat.type & this.api.FileType.Directory) !== 0) return undefined;
      return new this.api.FileDecoration('[]', 'SVG file');
    } catch { return undefined; }
  }
}
