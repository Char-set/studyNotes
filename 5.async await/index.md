# 理解 async 和 await

## 基本使用

假如我们有如下两个方法

```js
    const promisetFn = new Promise((rl, rj) => {
        setTimeout(() => {
            rl('[promisetFn] >>>>>> 我 2 秒后才执行完了')
        }, 2000);
    });

    const afterFn = () => {
        console.log('[afterFn] >>>>>> 我需要在 promisetFn 方法执行后在执行')
    }
```

`afterFn` 方法需要在 `promisetFn` 执行完成之后再执行，在不使用 `async 和 await` 的情况下，我们可以这样

```js
    promisetFn.then((result) => {

        console.log(result);

        afterFn();
    });

    // [promisetFn] >>>>>> 我 2 秒后才执行完了
    // [afterFn] >>>>>> 我需要在 promisetFn 方法执行后在执行
```
可是上面的方法，如果业务逻辑复杂，就会涉及需要一直 `链式调用then` 的问题，看起来并不是很舒服

所以我们可以使用 `async await` ，如下：

> 由于 `await` 需要 在 `async function` 内才能使用，所以定义一个执行函数 run

> 如果是 ESM 的话，已经可以支持 `Top-level await`

```js
    const run = async () => {

        let result = await promisetFn;

        console.log(result);

        afterFn();
    }

    run();
```
## 那么 `async await` 到底是个啥？

[`MDN：`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await) 官方解释：
>await  操作符用于等待一个Promise 对象。它只能在异步函数 async function 中使用。

>await 表达式会暂停当前 async function 的执行，等待 Promise 处理完成。若 Promise 正常处理(fulfilled)，其回调的resolve函数参数作为 await 表达式的值，继续执行 async function。

>若 Promise 处理异常(rejected)，await 表达式会把 Promise 的异常原因抛出。

>另外，如果 await 操作符后的表达式的值不是一个 Promise，则返回该值本身。

那其实 `async await` 就是一个语法糖，可以让开发者控制函数执行的顺序。那纠其根本，是啥呢？

## `生成器函数` 和 `迭代器`

在 `Javascript` 中，可以使用 function * funcName 去创建一个生成器函数，函数内部可以使用 `yield` 关键字中断函数的执行。最初调用时，生成器函数不执行任何代码，而是返回一种称为 `Generator` 的迭代器。 通过调用生成器的下一个方法消耗值时，`Generator` 函数将执行，直到遇到yield关键字。

```js
    // 生成器函数
    function* makeRangeIterator(start = 0, end = Infinity, step = 1) {
        for (let i = start; i < end; i += step) {
            yield i;
        }
    }
    // 迭代器
    var a = makeRangeIterator(1, 10, 2)

    a.next() // {value: 1, done: false}
    a.next() // {value: 3, done: false}
    a.next() // {value: 5, done: false}
    a.next() // {value: 7, done: false}
    a.next() // {value: 9, done: false}
    a.next() // {value: undefined, done: true}
```

这个生成器函数 加上 `yield` 是不是和 `async await` 很像？、

这里还需要处理一下参数传递的问题，下面这个例子

```js
    const sleep = (str) => new Promise(r => setTimeout(() => r(str), 1000));

    function * generatorFunc() {
        console.log('------------ in -------------');
        const res1 = yield sleep('hello Javascript');
        console.log('------------ first result ---------', res1);
        const res2 = yield sleep('hello Python');
        console.log('------------ second result ---------', res2);
        return 'success';
    }

    const gen = generatorFunc();

    const r = gen.next('第一次运行参数');

    console.log(1, r);

    const e = gen.next('第二次运行参数');

    console.log(1, e);

    const s = gen.next('第三次运行参数');

    console.log(1, s);

    // 得到输出如下：
    // ------------ in -------------
    // 1 { value: Promise { <pending> }, done: false }
    // ------------ first result --------- 第二次运行参数
    // 1 { value: Promise { <pending> }, done: false }
    // ------------ second result --------- 第三次运行参数
    // 1 { value: 'success', done: true }
```

可以看到，`next` 函数第一次执行的参数，其实没有任何作用；而之后的每个 `next` 函数运行参数，会作为上一次结果返回

所以，`async await` 其实就是语法糖，它的底层就是 `Generator` 生成器

`注意问题：` 生成器函数是需要手动触发的 xxx.next()，但需要他是自动执行的

上述代码，如果我们手动将整个流程执行完毕，会需要这么写

```js
    // 手动执行方案
    const gen = generatorFunc();

    const p = gen.next();

    p.value.then(v1 => {
        const g1 = gen.next(v1);
        console.log('这里拿到的参数 v1 是：', v1);

        g1.value.then(v2 => {
            const g2 = gen.next(v2);
            console.log('这里拿到的参数 v2 是：', v2);

            console.log('这里拿到的参数 v3 是：', g2.value);
        })
    }); 
```

## 包装生成器，自动执行

依据上面的流程，其实可以包装生成器函数，返回一个可以自动执行的 Promise 函数

```js
    const sleep = (str) => new Promise(r => setTimeout(() => r(str), 1000));

    function * generatorFunc() {
        console.log('------------ in -------------');
        const res1 = yield sleep('hello Javascript');
        console.log('------------ first result ---------', res1);
        const res2 = yield sleep('hello Python');
        console.log('------------ second result ---------', res2);
        return 'success';
    }

    // ----------------------------- 封装分割线 -----------------------------------

    // 执行迭代器的next或者throw方法
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
            var result = gen[key](arg);
            var value = result.value;
        } catch (e) {
            reject(e);
            return;
        }

        // 迭代器如果执行完成，会拥有done属性
        if(result.done) {
            resolve(value);
        } else {
            // 否则，当作Promise处理，在then回调后，继续执行 迭代器的 next 或者 throw 方法
            Promise.resolve(value).then(_next, _throw) 
        }
    }

    // 包装生成器函数，返回 Promise 函数
    function asyncToGenerator(fn) {
        return function() {
            // 储存执行的上下文
            var self = this, args = arguments;
            // async 最终返回的是一个 Promise
            return new Promise((resolve, reject) => {
                // 先执行，得到迭代器 gen
                var gen = fn.apply(self, args);

                // 迭代器 应该有用两个方法 next 和 throw

                // 提取next函数
                function _next(value) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
                }
                // 提取throw函数
                function _throw(value) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', value);
                }
                // 第一次启动next
                _next()
            })
        }
    }

    // ----------------------------- 封装分割线 -----------------------------------

    // 执行
    asyncToGenerator(generatorFunc)()
```

