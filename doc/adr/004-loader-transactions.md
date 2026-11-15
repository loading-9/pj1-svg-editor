# ADR 004：统一加载、清单校验及失败隔离

状态：采用。

插件默认导出实现 Plugin 的类实例，提供同步 `activate(ctx, options): void`；清单位于插件 package.json 的 contributes。异步激活明确拒绝，已返回 Promise 的拒绝被接住，避免未处理拒绝使进程退出。需要异步 IO 的插件应在命令执行阶段自行提供相应适配，当前命令 API 仍同步。

代码装配与配置装配都调用 PluginLoader.activate，创建独立 Registration 暂存区。注册时检查名称、关键方法和已有/暂存名称冲突；activate 完成后关闭注册，再按四类别比较清单与实际注册的名称集合（顺序不影响清单比较，运行顺序仍保留注册顺序）。校验通过才一次发布；异常、清单差异或重复一律丢弃整个暂存区，不影响先前插件，继续加载后续插件。保留 ctx 也不能在激活结束后继续注册。

配置按数组顺序处理；enabled:false 在模块解析前跳过。相对路径相对配置文件目录，包名按 createRequire 的 Node 模块规则解析。顶层解析失败报 plugin not found；成功解析后的模块求值/内部依赖失败归入 failed to activate，不误报顶层缺失。缺省类别为空，四类别名称各自唯一，跨类别同名允许。options 原样传给同一个实例的 activate；box 的 fill 为可选配置对象中的必需字符串字段，未提供 options 使用默认蓝色。

配置语法或结构无效时只报 invalid plugin config，保持宿主已装配的六种图形与内置命令。加载器没有具体插件名映射表或插件 import；具体 import 只存在于代码装配处。当前模块入口采用 Node 可加载的 CommonJS 编译产物，默认导出通过 exports.default 提供。

注册回滚不回滚模块求值的任意外部副作用，也不卸载 require 缓存；不把插件系统当作安全隔离边界。稳定扩展应在 activate 中只注册对象。

验证：tests/loader.test.ts 覆盖四种指定错误、重复、部分注册后重复、部分激活后异常、清单差异、相对路径、包名、options、disabled、非法配置和 async。scripts/verify-compatibility.mjs 验证两种装配行为一致。
