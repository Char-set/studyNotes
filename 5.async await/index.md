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
