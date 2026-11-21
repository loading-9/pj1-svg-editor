# Phase 2 要求逐项核对

核对日期：2026-11-21。CLI 自动化验证及 VSCode 实机验证均已完成。

|条目|状态|证据|
|---|---|---|
|同一远程仓库继续开发|完成|origin 为 loading-9/pj1-svg-editor；Phase 1 历史保留|
|已有 tag 不移动|完成|final/final-initial 对象与开发前一致；未使用 tag -f 或强推|
|分阶段普通提交|完成|方案→扩展→框架→命令→box A→box B→标签→测试修正→契约复查→独立测试→文档|
|最终提交 p2|本地完成|最终提交使用本地 p2 标签，远程发布暂缓|
|A.1 SVG 文件 []，目录及非 SVG 不标，文件不变|自动化与实机均通过|tests/vscode.test.ts；只调用 stat，没有写入/重命名 API|
|A.2 原生大纲、层级/根/ID/源码位置|自动化与实机均通过|OutlineParser、SvgDocumentSymbolProvider；UTF-16 范围和嵌套测试|
|观察原生 Outline 行为|完成|在未加载本扩展的 VSCode 窗口观察 Markdown 标题层级|
|编辑更新、不完整 XML、恢复、不崩溃|自动化与实机均通过|新文本重新解析、错误清空、合法后恢复；tests/vscode.test.ts|
|A.3 源码、步骤、示例、职责与模式分析、复用分析|完成|vscode-extension/README.md、examples、F5 配置、doc/README.md|
|A.3 标记和定位截图|完成|[实际截图与操作结果](screenshots/README.md)|
|四扩展点在内核、类/实例实现|完成|application 的 ShapeProvider/Command/TreeDecorator/AttributeHandler；六个插件包|
|内核不依赖插件，插件不导入内部路径|完成|architecture-check.mjs 对生产文件检查；公共 API 和命令用例端口|
|默认装配 Phase 1 六图形/命令|完成|Defaults 注册内置插件；无参数入口禁用可选能力|
|扩展点清单逐项给接口/职责/调用/实现/缺省/报错|完成|doc/README.md 对应具体文件与函数|
|stats DFS 计数、顺序、容器、total、空文档及历史|完成|独立测试、历史保持测试与 transcript/plugins.txt|
|dir 参数/当前目录/隐藏项/顺序/空/失败|完成|DirCommand、目录端口、unit/integration 测试；特殊项处理有说明|
|dir 适配器模式、替身与真实临时目录|完成|DirectoryReader、NodeDirectoryReader；独立测试不依赖其他插件|
|dir 无文档可用，成功失败都不改状态和历史|完成|dir.integration.test.ts 和 dual transcript|
|属性处理优先、默认白名单、不吞处理器错误|完成|Extensions.set + SetCommand；attributes.test.ts|
|多处理器冲突、一次 set 一个历史单元、部分失败回滚|完成|ADR001 与多部件/冲突/抛错/redo 测试|
|box 创建/in/嵌套/移动/缩放/拒绝 ungroup|完成|box unit/integration 和版本 B 回放|
|派生 ID 全子树冲突、错误结构拒绝、无插件降级|完成|ADR002 与 box.integration.test.ts|
|普通命令不能拆坏必要部件|完成|Box.remove/validate；delete/addto/group 等测试|
|modified-star 与 (box) 独立共存|完成|单独实例状态、注册顺序；tree-star.unit/decorators.integration 测试|
|dirty 语义、新节点、祖先传播和拼接顺序|完成|ADR003；保存/再次编辑/undo 回保存点/redo 覆盖|
|新增标签不改内核/渲染器|完成|2fc0d9f 的 Git 差异检查|
|A/B 同插件同注册路径|完成|PluginLoader.activate + Registration；配置只负责模块解析|
|contributes 四类别及集合比较|完成|包清单 + loader.test.ts，缺省为空|
|模块缺失、无 default、清单不符、激活抛错|完成|loader 四条失败路径，精确前缀及继续启动测试|
|重复注册/部分失败回滚/保留先前插件继续加载|完成|loader.test.ts 的暂存与成功后续项断言|
|enabled false、相对路径、包名、options、非法配置|完成|加载器与独立临时包测试；ADR004|
|模块存在但依赖失败不误报 not found|完成|eval-error 临时模块测试|
|A/B 两个提交差异判据|完成|2a02cc0 与 3a22dba；verify-git-boundaries.mjs 检查路径存在后比对|
|三份双装配会话输出逐字节一致|完成|doc/transcript/compatibility.json；输入、输出及 SVG 分开存储|
|Phase 1 基础兼容性禁用可选扩展|完成|从 Git final 独立编译再比较，包含基础会话、help 和未知 box|
|dir 固定临时目录，日志在目录外|完成|verify-compatibility.mjs；固定目录两次运行无创建/删除日志|
|重构前后 PlantUML、ADR 至少3条|完成|两个图的源/PNG/SVG，四条 ADR|
|Git 生成文件清单/职责/分类行数/复杂度，VSCode 单列|完成|docs/metrics 和 scripts/metrics.mjs；未填手工数字|
|每插件能独立运行测试|完成|test:plugins 检查六个 unit 文件无跨插件/宿主导入；7 项独立测试|
|课程平台提交|未执行|本地可交付，远程发布暂缓|
