# SVG Mark and Outline

在仓库根目录运行 `npm ci`、`npm run build:extension`。用 VSCode 打开仓库根目录，选择调试配置 **SVG Mark and Outline** 并按 F5，启动 Extension Development Host。不需要发布到 Marketplace，也不修改全局扩展目录。

如果使用已经构建的 `svg-mark-outline-0.2.0.vsix`，可以自行打开 VSCode 扩展面板的 `…` 菜单，选择 **Install from VSIX...**，选中该文件安装；然后打开本仓库的示例目录。此方式无需在本机编译源码。VSIX 只是安装包，构建成功不等于完成真实 GUI 验证。

重建安装包：在根目录 `npm run build:extension`，随后进入 vscode-extension 目录，运行 `npm exec --yes --package=@vscode/vsce@3.6.2 -- vsce package --no-dependencies --skip-license --allow-missing-repository --no-rewrite-relative-links`。不传版本参数，不会创建 Git tag。安装包仅包含 bundle、示例及说明，完整 TypeScript 源码在仓库中。

示例目录 `vscode-extension/examples/` 包括 `example.svg`、`notes.txt` 和名字以 `.svg` 结尾的目录 `folder.svg`。只有 SVG 文件应出现 `[]`。

## 人工验证与截图

先在未加载本扩展的窗口打开 TypeScript 类文件，展开原生 Outline，观察层级、点击定位及修改后的更新；再在开发宿主执行以下步骤。最终截图放在 `doc/screenshots/`，不以单元测试截图替代。

1. Explorer 中对比 example.svg、notes.txt、folder.svg；记录文件名及内容未变，截取标记效果。
2. 以文本编辑器打开 example.svg（如果默认预览，选择“Reopen Editor With → Text Editor”）。展开原生 Outline 的 svg → g#flow → rect#start/g#nested → text。点击 rect#start，确认源码定位到第 3 行，再截图。
3. 将 start 改为 renamed，观察大纲更新；临时删去结束标签或输入 `<g`，大纲应清空且宿主继续响应。补回合法 XML 后大纲恢复。记录恢复过程并截图，最后还原文件。

自动化验证覆盖解析位置、嵌套、无 ID、编辑重解析、异常 XML、恢复、注册与装饰筛选。实机跳转使用示例工作区的 SVG 文本编辑器关联。[截图与操作结果](../doc/screenshots/README.md)

## 模式与职责

VSCode 管理 Explorer、原生 Outline、文档变更调度、源码跳转及扩展生命周期。插件注册 FileDecorationProvider 和 DocumentSymbolProvider，VSCode 随需回调。subscriptions 中的 Disposable 由宿主在停用时释放。

文件装饰在视觉效果上类似 Decorator：给既有文件条目附加元数据；但它没有包装同一 Component 接口，也没有把文件系统调用转发给被装饰对象，因此并非经典 GoF Decorator 的完整结构。SvgFileDecorationProvider 通过对象组合访问 workspace.fs.stat，适配文件 URI/类型为 FileDecoration；SvgDocumentSymbolProvider 则把位置树适配为 DocumentSymbol/Range，是 Adapter 的明确实例。CLI TreeDecorator 是有序组合的标签策略链，也不冒充完整的对象包装 Decorator。

Phase 1 的 SvgCodec 面向持久化和可编辑领域树：会补 ID、拒绝非六种元素、不保留源码偏移，不能直接用来提供编辑中的 XML 大纲。Shape/Group 的复合遍历思路可复用，但领域对象会丢失根元素源码范围，也不应为展示而引入文档编辑约束。因此扩展独立用 SAX 解析器生成含 UTF-16 位置的轻量树，不依赖 CLI 模块。两个适配器只读取 URI 和文本文档，不写文件。

API 依据：[VSCode FileDecorationProvider](https://code.visualstudio.com/api/references/vscode-api#FileDecorationProvider)、[DocumentSymbolProvider](https://code.visualstudio.com/api/references/vscode-api#DocumentSymbolProvider)。
