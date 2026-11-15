import type { Plugin } from '../application/Plugin.js';
import type { PluginManifest } from './PluginLoader.js';
export const codePlugins: readonly { plugin: Plugin; manifest: PluginManifest; options?: unknown }[] = [];
