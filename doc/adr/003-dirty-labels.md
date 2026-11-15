# ADR 003：dirty 内容比较、祖先传播与标签顺序

状态：采用。

选择“当前内容与上一次成功保存或读入的快照不同”。init 的空白文档作为初始干净快照；新建节点立即标记。成功 save/read 建立干净快照；保存失败不更新它。canvas 修改大小仍沿用 Phase 1 IO 屏障，但相对于上次保存的画布发生变化时根行标星。

保存基线位于 Editor 的私有 savedSnapshot。ModifiedStar 实例封装当前/基线指纹与 dirtyIds 缓存，没有模块级可变状态。它按子树内容、父 ID、同级槽位比较节点；子图形变化会改变祖先的子树指纹，因此祖先也标记。被删除节点不再有行，但原父级和根行仍反映差异。undo 回到保存点时 * 消失；redo 再次偏离则恢复。基线查询返回副本，标签在脱离编辑器的只读约定视图上计算。

同一行标签按注册顺序拼接，以一个空格分隔，空标签略过。默认顺序 box-type-label 在 modified-star 前，因此为 `(box) *`。两个标签互不导入。TreeRenderer 不知道标签名。

代价：全量指纹比较不适合超大型文档；当前优先语义可验证性。标签异常、返回多行/非字符串或修改传入文档都会中止该次显示，当前编辑器状态不变。

验证：tests/tree-star.unit.test.ts 和 tests/decorators.integration.test.ts 覆盖编辑→保存→再编辑→undo/redo、祖先传播、新节点、实例隔离、无标签缺省；tests/extension-contracts.test.ts 覆盖错误装饰器。未加载标签时 stdout 与 final 逐字节对照。
