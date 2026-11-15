import { readFileSync } from 'node:fs';
import { resolve, dirname, join, isAbsolute } from 'node:path';
import { createRequire } from 'node:module';
import type { Plugin, Contributions, Category } from '../application/Plugin.js';
import { Extensions } from '../application/Extensions.js';
import { Registration } from './Registration.js';
export interface PluginManifest { name: string; contributes?: Contributions }
export interface PluginEntry { module: string; enabled?: boolean; options?: unknown }
export class PluginLoader {
  private readonly categories: readonly Category[] = ['shapes', 'commands', 'decorators', 'attributes'];
  constructor(private readonly extensions: Extensions, private readonly report: (message: string) => void) {}
  private reason(error: unknown): string { return (error instanceof Error ? error.message : String(error)).replace(/[\r\n]+/g, ' '); }
  activate(plugin: Plugin, manifest: PluginManifest, options?: unknown): boolean {
    const transaction = new Registration(this.extensions);
    try {
      if (!manifest || typeof manifest.name !== 'string' || !manifest.name || !plugin || typeof plugin.activate !== 'function') throw new Error('invalid plugin contract');
      const result: unknown = plugin.activate(transaction, options);
      if (result !== undefined) throw new Error('activate must be synchronous and return void');
      transaction.close();
      const declared = manifest.contributes ?? {};
      if (!declared || typeof declared !== 'object' || Array.isArray(declared) || Object.keys(declared).some(k => !this.categories.includes(k as Category))) throw new Error('invalid contributes');
      const describe = (actual: boolean): string => this.categories.map(category => {
        const names = actual ? [...transaction.staged[category].keys()] : (declared[category] ?? []);
        if (!Array.isArray(names) || names.some(n => typeof n !== 'string' || !n) || new Set(names).size !== names.length) throw new Error('invalid contributes');
        return category + '=[' + [...names].sort().join(',') + ']';
      }).join('; ');
      const expected = describe(false), registered = describe(true);
      if (expected !== registered) {
        this.report('error: plugin manifest mismatch: ' + manifest.name + ' (declared: ' + expected + ', registered: ' + registered + ')'); return false;
      }
      transaction.publish(); return true;
    } catch (error) {
      const message = this.reason(error);
      this.report(message.startsWith('duplicate registration: ') ? 'error: ' + message : 'error: plugin failed to activate: ' + (manifest?.name ?? 'unknown') + ' (' + message + ')'); return false;
    } finally { transaction.close(); }
  }
  load(entries: readonly PluginEntry[], directory: string): void {
    const requireModule = createRequire(join(resolve(directory), '__plugin_loader__.cjs'));
    for (const entry of entries) {
      if (entry.enabled === false) continue;
      let manifest: PluginManifest | undefined;
      let resolved: string;
      const target = entry.module.startsWith('.') || isAbsolute(entry.module) ? resolve(directory, entry.module) : entry.module;
      try { resolved = requireModule.resolve(target); }
      catch { this.report('error: plugin not found: ' + entry.module); continue; }
      try {
        let metadata: string;
        try { metadata = requireModule.resolve(target + '/package.json'); }
        catch {
          let folder = dirname(resolved);
          for (;;) {
            try { readFileSync(join(folder, 'package.json')); metadata = join(folder,'package.json'); break; }
            catch { const parent = dirname(folder); if (parent === folder) throw new Error('package.json not found'); folder = parent; }
          }
        }
        manifest = JSON.parse(readFileSync(metadata, 'utf8')) as PluginManifest;
        const module: unknown = requireModule(resolved);
        if (!module || typeof module !== 'object' || !('default' in module)) { this.report('error: plugin has no default export: ' + entry.module); continue; }
        this.activate(module.default as Plugin, manifest, entry.options);
      } catch (error) { this.report('error: plugin failed to activate: ' + (manifest?.name ?? entry.module) + ' (' + this.reason(error) + ')'); }
    }
  }
  config(file: string): void {
    let entries: PluginEntry[];
    try {
      const value: unknown = JSON.parse(readFileSync(file, 'utf8'));
      if (!value || typeof value !== 'object' || Array.isArray(value) || !('plugins' in value) || !Array.isArray(value.plugins)) throw new Error('invalid config');
      entries = value.plugins as PluginEntry[];
      if (entries.some(e => !e || typeof e !== 'object' || Array.isArray(e) || typeof e.module !== 'string' || !e.module || (e.enabled !== undefined && typeof e.enabled !== 'boolean'))) throw new Error('invalid config');
    } catch { this.report('error: invalid plugin config'); return; }
    this.load(entries, dirname(resolve(file)));
  }
}
