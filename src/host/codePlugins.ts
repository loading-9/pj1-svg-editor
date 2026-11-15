import type { Plugin } from '../application/Plugin.js';
import type { PluginManifest } from './PluginLoader.js';
import stats from '../../plugins/stats/index.js';
import statsManifest from '../../plugins/stats/package.json';
import dir from '../../plugins/dir/index.js';
import dirManifest from '../../plugins/dir/package.json';
import box from '../../plugins/box/index.js';
import boxManifest from '../../plugins/box/package.json';
export const codePlugins: readonly { plugin: Plugin; manifest: PluginManifest; options?: unknown }[] = [
  {plugin:stats,manifest:statsManifest}, {plugin:dir,manifest:dirManifest},
  {plugin:box,manifest:boxManifest},
];
