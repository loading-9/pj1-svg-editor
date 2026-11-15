import type { Extensions } from './Extensions.js';
export class HelpText {
  constructor(private readonly extensions: Extensions) {}
  lines(): string[] {
    return [
      ...[...this.extensions.commands.values()].filter(p => p.name !== 'help' && p.name !== 'quit').map(p => p.syntax),
      'help', 'quit (alias of exit; EOF also exits)',
      ...[...this.extensions.shapes.values()].map(p => p.syntax),
      'set: fill / stroke / stroke-width; geometry attributes; text content via text',
      'Double-quote arguments containing spaces. Lines beginning with # are comments.',
    ];
  }
}
