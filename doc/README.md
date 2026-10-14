# 项目文档

## 架构方案（初始设计）

采用四层结构：`domain` 封装图形树和几何规则；`application` 执行命令、管理历史并定义存储端口；`infrastructure` 实现 XML 和文件系统适配；`cli` 负责分词、REPL 与组装依赖。组件图见 [architecture.puml](architecture.puml)。

必选 Command 模式：每个编辑命令独立类，统一执行/撤销/重做。Composite 模式：Shape 是容器与叶子的共同抽象，Group 递归调用 move/scale。Memento：一次命令前后保存深克隆，确保复杂树编辑完整撤销，失败时回滚。

依赖规则：`domain` 仅依赖同层；`application` 仅依赖自身与 `domain`；`infrastructure` 可依赖 `domain` 和 `application` 的端口；`cli` 为组装入口，可依赖以上各层。领域层不得引用 XML 或文件系统。仅允许两处按名字分派：命令注册表和 ShapeFactory；作为后续插件阶段的待重构点。

变化点：将来可能增加图形类型、图形插件、GUI 输入、存储后端、历史优化。先保留 Shape 多态接口、Command 接口、SvgStore 端口；本阶段不实现插件加载和持久化历史，避免超出范围。

## 过程记录

- 2026-10-14：用户提供 `phase_cli_1.md` 及 Git/文档补充要求，授权实现并创建 GitHub 私有仓库。
- AI 阅读要求后确认 TypeScript/OOP/Command、根级 ungroup 禁止、IO 历史屏障、六种图形边界。先提交架构与工程骨架，再逐步实现。
- 本节将在实际迭代中继续记录发现、修正与验证结果；不虚构用户审核或对话。

## 一致性自查

待实现后对照实际目录与依赖检查更新。

## 质量保证手段

计划使用严格 TypeScript 编译、Node 内置测试、附件会话回放、SVG round-trip、树结构和失败原子性验证，并记录实测结果。
