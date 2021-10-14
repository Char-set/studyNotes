# ESM 

与 `CMJ` 的对比：

1、使用方式不同

  > `CMJ：` require and module.exports

  > `ESM：` import and export | export default

2、对基本类型，`CMJ` 是值拷贝，`ESM` 则是引用

3、动态运行时，静态编译（`import` 语句时静态执行，`export` 则是动态绑定的）

4、`ESM` 提升特性，`import` 必须写在文件最上方，不可用变量拼接路径

5、`ESM` 支持 `Top-level await`，`this-undefined`

6、`ESM` 天然支持 `dynamic import`，`CMJ` 本身则是基于运行时

7、`ESM` 现在被大多数现代浏览器原生支持，通过 `type="module"` 进行标识 （相比较于CMJ，减少了build文件的过程）

8、同步，异步
  
  > `ESM` 将流程拆分为了三个步骤进行，首先是【构建阶段】解析模块，创建底层数据结构 `Module Record`(可以看成是 `AST` 结构节点)，然后【实例化阶段】解析 `import`, `export` 存入内存（这个时候代码并没执行），【执行阶段】最后才是执行
  > 然后将执行得到的结果放进对应的内存中，这样的过程拆分为了三个主要步骤，意味着 `ESM` 拥有了 `CMJ` 不具备的异步的能力！

  > 为啥要拆成这么几个步骤？
  > 前端常常面临的场景是多 `chunk` 渲染，通过入口文件 `<script src='index.js' type='module'/>`进来，可能需要加载很多 `js 模块`，这个时候如果 `ESM` 机制本身是多过程且可分离的，
  > 就可以最大限度的压榨浏览器并行下载能力，快速加载依赖（当然底层支持按需更`yyds`），这是`ES modules`规范将算法分为多个阶段的原因之一

  > 多阶段算法也有弊端，比如不能 `import { foo } from "${fooPath}/a.js"` 这样使用，因为构建依赖图是在第一阶段，这个时候路径信息是没有的
  > 为了解决这个问题提出了 `dynamic import`，底层其实单独给这种情况创建了 `Module Record`，然后通过 `module map` 的方式管理起来（`module map` 就是一种管理 `Module Record` 的数据结构）

  > `JS` 引擎会深度优先后序遍历模块树，完成实例化过程，采用动态绑定的方式来联系 `export` `import` 值，这是和 `CMJ` 非常不同的地方

  > 三阶段设计，天生支持循环引用
  > 没有完成三阶段的时候，会标记为 `Fetching` 状态，循环引用的时候，看到是 `Fetching` 状态就先不管这里了，继续执行，等完成执行阶段，就会把对应的`import`和 `export`链接到一个内存地址
  > 这样就可以访问到了

