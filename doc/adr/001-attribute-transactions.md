# ADR 001：属性处理器与编辑事务

状态：采用。

`AttributeHandler.handles(shape, attr)` 接收工作副本中的公开 Shape；处理器可用 instanceof、composite 或公开属性判断领域类型。`apply(shape, attr, value, document)` 通过公开方法访问子部件，不能直接修改字段。插件通过公共 PluginContext.registerAttribute 注册稳定名称。

SetCommand 定位目标后调用 PluginContext.setAttribute，转入 Extensions.set。先收集所有命中者：0 个则走原有 Shape.setAttribute 白名单；1 个则调用；多个则拒绝并列出按注册顺序排列的处理器名，不执行任何 apply。handles 必须无副作用，以前后指纹比较检测文档修改。apply 抛错后绝不转入默认白名单。

EditCommand.execute 在 SvgDocument 深克隆上应用整条 set，并验证树不变量。成功后才将结果及 before/after Memento 交给 History；任何异常丢弃工作副本，不改变当前文档、保存快照、undo/redo。即使处理器修改两个部件，一条 set 仍是一个 undo 单元。

代价是 O(N) 克隆；好处是递归失败、多个部件、浮点溢出均无需编写逆操作。事务保证文档与历史，不承诺回滚插件私有计数器或插件自行进行的外部 IO；插件须遵守纯判断和局部编辑契约。这是同进程受信插件系统，不是安全沙箱。

验证：tests/attributes.test.ts 覆盖双部件单次 undo/redo、命中冲突、部分修改后抛错、impure handles、失败后 redo 保留；tests/box.unit.test.ts 和 tests/box.integration.test.ts 验证 fill/label 各一单元及普通图形 label 拒绝。
