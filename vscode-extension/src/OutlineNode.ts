export class OutlineNode {
  readonly children: OutlineNode[] = [];
  end: number;
  constructor(readonly name: string, readonly start: number, readonly selectionEnd: number) { this.end = selectionEnd; }
}
