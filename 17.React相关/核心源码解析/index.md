## 笔记

**React** 是什么？

```
    是一个用于构建用户界面的 JavaScript 库

    基于函数式思想，践行代数效应

    原理是：调度 + VDOM
```

**React** 解决了什么问题？

```
    js任务执行的时候，是会阻塞页面渲染进程的

    如果js任务执行时间过长，就会导致页面卡顿、失帧、白屏

    大量渲染任务需要进行的时候，react 可以合理的分配时机，而不是一股脑的渲染

    降低项目复杂度


```

**Virtual DOM** 快么？

```
    不快！！！

    最快的肯定是原生js直接操作dom元素

    Virtual DOM 要解决的问题并不是更快的去渲染某些元素，而是在大量、频繁的数据更新下，能够对视图进行合理、高效的更新。
```

```
    React 中有两大工作循环

    第一个循环在调度器中，负责任务的调度、分配、暂停、执行

    第二个循环在调和器中，负责 fiberNode、workinpress 的创建
```

```
    requestIdleCallback Google提出来的

    一个在浏览器每个时间切片的空闲时间段执行的回调方法

    但是浏览器的兼容性不是很好，Safari到现在都不支持

    所以 React 按照他的概念，自己实现了一个类似的，叫做 scheduler
```

```
    react 用 MessageChannel 模拟了 requestIdleCallback

    因为 MessageChannel 是一个宏任务，宏任务都是在每次事件循环的最后执行
```