/**
 * 实现一个简单版本的 commonjs 模块加载器，偏浏览器端
 * 
 * 指导准则：COMMONJS 规范
 * 
 * 主要 2 个部分：
 * 
 * 1、模块加载器 （解析文件地址，获得文件源代码；一层一层往外找，node_modules，global_node_modules）
 * 2、模块解析  （执行文件内容，Node 里面是使用了 V8 执行）
 */

class Module {
    constructor(moduleName, source) {
        // 暴露数据
        this.exports = {};

        //保存一下模块的信息
        this.moduleName = moduleName;

        // 缓存
        this.$cacheModule = new Map();

        // 源代码
        this.$source = source;
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

        /**
         * 省略加载器查找文件的过程
         * 
         * 否则这里应该执行加载器方法，获取文件源代码
         */

        // 创建模块对象
        const module = new Module(moduleName, source);

        // 执行文件内容
        const exports = this.compile(module, source);

        //缓存
        this.$cacheModule.set(moduleName, module);

        //返回module的exports
        return exports;
    }

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
    /**
     * 简单实现一个能在浏览器中运行的解释器 vm.runInThisContext
     * 目标:
     * 创建一个隔离的沙箱环境，来执行我们的代码字符串
     * 
     * 隔离：1、不能访问闭包的标量，2、不能访问全局的变量，3、只能访问我们传入的变量
     * 
     * 
     * 
     * @param {*} code 代码字符串
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
        // 传入 module, exports, require 执行
        compiler.call(module, module, module.exports, this.require);
        // 返回 exports 的引用
        return module.exports;
    }
}

const m = new Module();

// a.js
const sourceCodeFromA = `
    const b = require('b.js', 'exports.action = function() { console.log("successfully 🎉")}');

    b.action();
`

m.require('a.js', sourceCodeFromA);