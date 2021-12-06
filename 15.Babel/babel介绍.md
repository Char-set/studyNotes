# Babel 介绍


## 是什么

将高版本的js语法，转化为低版本的语法，兼容低版本的浏览器

## 几个关键词

### `plugin`

babel 的插件，用于实现不同的功能

**常见** `Plugin`



### `Preset`

就是多个 `Plugin` 的集合

**常见** `Preset`:

- `babel-preset-env`

    @babel/preset-env是一个智能预设，它可以将我们的高版本JavaScript代码进行转译根据内置的规则转译成为低版本的javascript代码。
    
    preset-env内部集成了绝大多数plugin（State > 3）的转译插件，它会根据对应的参数进行代码转译。

- `babel-preset-react`

    通常我们在使用React中的jsx时，相信大家都明白实质上jsx最终会被编译称为React.createElement()方法。

    babel-preset-react这个预设起到的就是将jsx进行转译的作用。

- `babel-preset-typescript`

    对于TypeScript代码，我们有两种方式去编译TypeScript代码成为JavaScript代码。


    使用tsc命令，结合cli命令行参数方式或者tsconfig配置文件进行编译ts代码。


    使用babel，通过babel-preset-typescript代码进行编译ts代码。

##  常用的 `Babel` 配置

对于 `webpack`，日常使用的 `Babel` 相关配置主要涉及到以下三个相关插件：

- `babel-loader`

- `babel-core`

- `babel-preset-env`

`webpack` 中，`loader` 其实就是一个函数，接受源代码或文件作为参数，返回处理后的内容

那么 `babel-loader` 其实就是一个函数，接受源代码：

```js
/**
 * 
 * @param sourceCode 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理后的代码
 */
function babelLoader (sourceCode,options) {
  // ..
  return targetCode
}

```

**`bable-core`**

上面的 `bable-loader` 仅仅是接受源代码，接口配置参数，它真正要处理源代码的时候，使用的就是 `babel-core`， 这个库可以对我们的源代码进行 `词法分析` -> `语法分析` -> `语义分析`，进而生成 `AST` 抽象语法书，然后对这棵树进行处理，得到新的内容

`babel-core` 使用 `transform` 方法对代码进行编译

```js
const core = require('@babel/core')

/**
 * 
 * @param sourceCode 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理后的代码
 */
function babelLoader (sourceCode,options) {
  // 通过transform方法编译传入的源代码
  let targetCode = core.transform(sourceCode)
  return targetCode
}

```

**`bable-preset-env`**

上面是 `babel-loader` 函数，内部使用 `babel-core` 的 `transform` 方法对源代码进行处理，得到处理后的内容，但是针对代码的处理，我们需要告诉 `babel` 以什么样的规则进行编译

那么 `babel-preset-env` 在这里就是充当一个规则角色：**告诉 `bable` 以什么样的规则对源代码进行处理**

```js
const core = require('@babel/core');

/**
 *
 * @param sourceCode 源代码内容
 * @param options babel-loader相关参数
 * @returns 处理后的代码
 */
function babelLoader(sourceCode, options) {
  // 通过transform方法编译传入的源代码
  let targetCode = core.transform(sourceCode, {
    presets: ['babel-preset-env'],
    plugins: [...]
  });
  return targetCode;
}

```