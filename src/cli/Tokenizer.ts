export class Tokenizer {
  tokenize(line: string): string[] {
    if (line.trimStart().startsWith('#')) return [];
    const result: string[] = [];
    let current = ''; let quoted = false; let active = false;
    for (let index = 0; index < line.length; index++) {
      const character = line[index]!;
      if (character === '"') { quoted = !quoted; active = true; }
      else if (quoted && character === '\\' && (line[index + 1] === '"' || line[index + 1] === '\\')) {
        current += line[++index];
      } else if (!quoted && /\s/.test(character)) {
        if (active) { result.push(current); current = ''; active = false; }
      } else { current += character; active = true; }
    }
    if (quoted) throw new Error('unterminated double quote');
    if (active) result.push(current);
    return result;
  }
}
