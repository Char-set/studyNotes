# 一步步实现一个简单的 COMMONJS 模块加载器

## 1. 使用es6的class语法

```js
    // 使用 `es6` class 语法
    class Module {
        constructor() {
            
        }
    }
```

## 2.初始化exports，保存模块信息

```js
    class Module {
        constructor(moduleName) {
            // 暴露数据
            this.exports = {};

            //保存一下模块的信息
            this.moduleName = moduleName;
        }
    }
```

## 3.实现require函数

`TODO`: 由于模块的加载，要使用到node的fs模块，应用相应的规则（先根据相对路径找，再到对应的node_modules中查找，以及最后在全局global_node_modules中查找）找到文件具体位置，最后的目的其实就是获取文件的源代码，较为复杂，不在此实现。现采用直接将文件源代码传入require方法替代

```js
class Module {
    constructor(moduleName, source) {
        // ...

        // 源代码
        this.$source = source;
    }

    /**
     * require
     * 
     * useage: require('./a.js')
     * 
     * @param {string} moduleName  模块的名称，文件路径
     * @param {string} source 文件的源代码
     * 
     * @return {object} require 返回的结果就是 exports 的引用
     */
    require = (moduleName, source) => {

         /**
         * 省略加载器查找文件的过程
         * 
         * 否则这里应该执行加载器方法，获取文件源代码
         */

        // 创建模块对象
        const module = new Module(moduleName, source);

        // 执行文件内容
        // TODO
        const exports = this.compile(module, source);

        //缓存
        this.$cacheModule.set(moduleName, module);

        return module.exports;
    }
}
```


## 4.实现一个简单的`隔离`沙箱环境

`问题：`为什么要创建一个隔离的沙箱环境去执行文件源代码？

可以想象一下，如果文件内容的执行过程可以访问全局变量，那么意味着文件的执行会出现意想不到的问题；比如：有一个全局变量 `case`，在文件 `a.js` 写到 `if(case != null){ //... }`，但其实变量 `case` 在 `a.js` 中是没有定义的，按照道理文件执行会出错。但如果`文件内容的执行过程可以访问全局变量`，就会出现错误，导致文件会正常执行。

### 实现沙箱方案：

`eval：`可以访问全局/闭包，但实际需要解释执行 ❌

`new Function：`不可以访问闭包，可以访问全局，只编译一次 1 ✅

`proxy：`可以拦截属性的获取，保证不能访问全局变量 2 ✅

`with：`with 包裹的对象，会被放到原型链的顶部，而且是通过 in 操作符判断的；通过 with 塞入我们传入的数据对象 3 ✅

```js
    /**
     * 简单实现一个能在浏览器中运行的解释器 vm.runInThisContext
     * 目标:
     * 创建一个隔离的沙箱环境，来执行我们的代码字符串
     * 
     * 隔离：1、不能访问闭包的标量，2、不能访问全局的变量，3、只能访问我们传入的变量
     * 
     * 
     * 
     * @param {string} code 代码字符串
     */

    $runInThisContext = (code, whiteList=['console']) => {

        // 使用 with 保证可以通过我们传入的 sandbox 对象取数据
        const wrapper = `with(sandbox) {${code}}`
        // new Function 不能访问闭包
        const func = new Function('sandbox', wrapper);

        return function(sandbox) {
            if(!sandbox || typeof sandbox !== 'object') {
                throw Error('sandbox parameter must be an object');
            }

            // 代理

            const proxiedObject = new Proxy(sandbox, {
                // 专门处理 in 操作符
                has(target, key) {
                    if(!whiteList.includes(key)) {
                        return true;
                    }
                },
                get(target, key, receiver) {
                    if(key === Symbol.unscopables) {
                        return void 0;
                    }

                    return Reflect.get(target, key, receiver);
                }
            });

            return func(proxiedObject);
        }

    }
```

## 5.实现一个IIFE函数

```js
    /**
     * 
     * 拼接一个闭包，使用自执行函数 IIFE
     * 
     * @param {string} code 代码字符串
     */

    $wrap = (code) => {
        const wrapper = [
            'return (function (module, exports, require){',
            '\n});'
        ]

        return wrapper[0] + code + wrapper[1];
    }
```

## 6.实现require函数中的compile方法， 向文件中注入 `module` `exports` `require`

```js
    /**
     * 
     * 执行文件的内容，将执行结果挂载在module的exports属性上，并且返回 exports 的引用
     * 
     * function (proxiedSandbox) {
     *     // const wrapper = `with(sandbox) {${code}}` 的结果
     *     with(proxiedSandbox) {
     *         // this.$wrap(source) 的结果
     *         return (function (module, exports, require) {
     *             // 文字内容字符串
     *         }) 
     *     }
     * }
     * 
     * @param {string} module 模块对象
     * @param {string} source 文件源代码
     * 
     * @return {object} exports 的引用
     */

    compile = (module, source) => {
        //TODO
        // 拼接iife
        const iifeString = this.$wrap(source);
        // 创建沙箱的执行环境
        const compiler = this.$runInThisContext(iifeString)({});
        // 注入 module, exports, require 执行
        compiler.call(module, module, module.exports, this.require);
        // 返回 exports 的引用
        return module.exports;
    }
```

## 7.实现require的缓存
```js
    constructor(moduleName, source) {
        // ...

        // 缓存
        this.$cacheModule = new Map();
        
        // ...
    }

    /**
     * require
     * 
     * useage: require('./a.js')
     * 
     * @param {string} moduleName  模块的名称，文件路径
     * @param {string} source 文件的源代码，省略了使用node的fs模块，根据规则（一层一层往外找，node_modules，global_node_modules））查找源代码的过程，直接传入文件源代码
     * 
     * @return {object} require 返回的结果就是 exports 的引用
     */
    require = (moduleName, source) => {
        // 每一次 reuqire 都执行文件内容的话，开销太大，所以加缓存
        if(this.$cacheModule.has(moduleName)) {
            // 注意返回的是执行之后的 exports对象
            return this.$cacheModule.get(moduleName).exports;
        }
        
        // ...

        //返回module的exports
        return exports;
    }
```