# module、chunk和bundle的

在webpack中，module、chunk、bundle是比较常见的词汇了，也经常能够听见打包后bundle过大怎么解决的问题。那么它们之间是一种什么样的关系呢？

## 几个概念

`module：`在模块化的系统中，一般modlue都是以文件划分的，一个文件即是一个module

`chunk：`是Webpack打包过程中Modules的集合，是打包过程中的概念。Webpack的打包是从一个入口模块开始，入口模块引用其他模块，模块再引用模块。Webpack通过引用关系逐个打包模块，这些module就形成了一个Chunk

`Bundle：`是我们最终输出的一个或多个打包好的文件，它是已经加载完毕和被编译后的源代码的最终版本

## 他们之间的关系

```

    module -----|                    | -----> bundle
                | -----> chunk ----- |
    module -----|                    | -----> bundle

    module -----| -----> chunk ----- |
                |                    |
    module -----|                    | -----> bundle
                |                    |
    module -----| -----> chunk-----  |
                |                  
    module -----|                   

```

所以可以得出一个这样的结论：

- 多个（或一个）`module` 会形成一个 `chunk`

- 多个（或一个）`chunk` 会形成一个（或多个） `bundle`

- Chunk是过程中的代码块，Bundle是打包结果输出的代码块, Chunk在构建完成就呈现为Bundle。

`提问：`什么情况下，一个chunk会生成多个bundle呢？

常见的一种情况就是，在webpack配置中开启了 `devtool: "source-map"` 后，每一个chunk都会输出两个bundle，多出的一个为.map文件。

## Bundle为什么会过大，怎么优化？

通过上述的概念解析，以及它们之间的关系，很容易知道：

- 如果一个 `Bundle` 是由很多个 `Chunk` 组成，那么这个 `Bundle` 必定是很大的

- 没有压缩代码，或者错误配置了 `devtool`

`优化：`

 - 分离代码，一些引入的第三方库，可以通过配置 `externals`,通过 `script` 的方式引入；

 - 删除无用代码，通过 `treeshaking`、 `按需引入`等方式，剔除没有用上的代码

 - 抽离公共代码，配置 `optimization -> splitChunks`，按照一定规则，将公用的代码，从各个 `Bundle` 中抽离出来，使原有 `Bundle` 体积变小

 - 压缩代码

## 简述webpack打包流程

- 1. 初始化参数：从配置文件和 Shell 语句中读取与合并参数,得出最终的参数。

- 2. 开始编译：用上一步得到的参数初始化 Compiler 对象,加载所有配置的插件,执行对象的 run 方法开始执行编译。

- 3. 确定入口：根据配置中的 entry 找出所有的入口文件。

- 4. 编译模块：从入口文件出发,调用所有配置的 Loader 对模块进行翻译,再找出该模块依赖的模块,再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。

- 5. 完成模块编译：在经过第 4 步使用 Loader 翻译完所有模块后,得到了每个模块被翻译后的最终内容以及它们之间的依赖关系。

- 6. 输出资源：根据入口和模块之间的依赖关系,组装成一个个包含多个模块的 Chunk,再把每个 Chunk 转换成一个单独的文件加入到输出列表,这步是可以修改输出内容的最后机会。

- 7. 输出完成：在确定好输出内容后,根据配置确定输出的路径和文件名,把文件内容写入到文件系统