import { Extensions } from '../application/Extensions.js';
import { ShapeFactory } from '../application/ShapeFactory.js';
import { CommandRegistry } from '../application/CommandRegistry.js';
import { SvgCodec } from '../infrastructure/SvgCodec.js';
import { FileSvgStore } from '../infrastructure/FileSvgStore.js';
import { PluginLoader } from './PluginLoader.js';
import shapes from '../../plugins/builtin-shapes/index.js';
import { BuiltinCommands } from '../../plugins/builtin-commands/BuiltinCommands.js';
import shapesManifest from '../../plugins/builtin-shapes/package.json';
import commandsManifest from '../../plugins/builtin-commands/package.json';
export class Defaults {
  static extensions(): Extensions {
    const extensions = new Extensions();
    const loader = new PluginLoader(extensions, message => { throw new Error(message); });
    loader.activate(shapes, shapesManifest);
    loader.activate(new BuiltinCommands(), commandsManifest);
    return extensions;
  }
  static commands(): CommandRegistry { return new CommandRegistry(this.extensions()); }
  static codec(extensions = this.extensions()): SvgCodec { return new SvgCodec(new ShapeFactory(extensions)); }
  static store(extensions = this.extensions()): FileSvgStore { return new FileSvgStore(this.codec(extensions)); }
}
