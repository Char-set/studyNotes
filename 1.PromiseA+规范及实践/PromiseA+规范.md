# PromiseA+规范

## 术语

1. promise 是有then方法的对象或者函数 
2. thenable 是一个有then方法的对象或者是函数
3. value promise状态成功时的值，resolve(value), string number boolean undefined thenable promise
4. reason promise状态失败时的值，reject(reason)
5. exception 使用throw抛出的异常

## 规范

### Promise Status

有三种状态，他们之间的流转关系

1. pending
    
    1.1 初始状态，可改变

    1.2 在resolve和reject之前都处于这个状态


    1.3 通过resolve -> fulfilled状态

    1.4 通过reject -> rejected状态

2. fulfilled

    2.1 最终态，不可变

    2.2 一个promise被resolve之后会变成这个状态

    2.3 必须拥有一个value

3. rejected

    3.1 最终态，不可变

    3.2 一个promise被reject之后会变成这个状态

    3.3 必须拥有一个reason

总结一下：

```
pending -> resolve(value) -> fulfilled

pending -> reject(reason) -> rejected
```

### then

promise 应该提供一个then方法，用来访问最终的结果，无论`value`还是`reason`

``` js
promise.then(onFulfilled, onRejected)
```

1. 参数规范

    1.1 onFulfilled 必须是函数类型，如果传入的不是函数，应该被**忽略**.

    1.2 onRejected 必须是函数类型，如果传入的不是函数，应该被**忽略**.

2. onFulfilled特性

    2.1 在promise变成fulfilled时，应该调用onFulfilled，参数是value.（onFulfilled的执行时机？）

    2.2 在promise变成fulfilled之前，不该用调用 onFulfilled

    2.3 只能被调用一次 （怎么实现只调用一次？）

3. onRejected特性

    3.1 在promise变成rejected时，调用onRejected，参数是reason

    3.2 在promise变成rejected之前，不该用调用 onRejected

    3.3 只能被调用一次 （怎么实现只调用一次？）

4. onFulfilled 和 onRejected 应该是微任务阶段执行

    实现promise的时候，如何去生成微任务？

5. then 方法可以被调用多次

    5.1 promise状态变成 fulfilled 后，所有的 onFulfilled 回调都需要按照注册的顺序执行

    5.2 promise状态变成 rejected 后，所有的 onRejected 回调都需要按照注册的顺序执行

6. 返回值

    then 应该返回一个promise

    ```js
    const promise2 = promise1.then(onFulfilled, onRejected)
    ```

    6.1 onFulfilled 或 onRejected 执行结果为x，调用 **resolvePromise** 方法

    6.2 onFulfilled 或 onRejected 执行过程中抛出了异常e，promise2需要被rejected

    6.3 如果 onFulfilled 不是一个函数，promise2 以 promise1 的 value 触发 fulfilled

    6.4 如果 onRejected 不是一个函数，promise2 以 promise1 的 reason 触发 fulfilled

7. resolvePromise

    ```js
    resolvePromise(promise2, x, resolve, reject)
    ```
    7.1 如果promise2和x相等，reject typeError

    7.2 如果x是一个promise

        如果x pending，promise必须要在pending状态，直到x的状态变更。
        如果x fulfilled，value -> fulfilled
        如果x rejected，reason -> rejected
    
    7.3 如果 x 是一个Object / Function

    ``` js
        try {
            // 尝试去获取 x 的then属性
            let then = x.then;
        } catch(e) {
            // 如果出错，需要reject
            reject e
        }
    ```
    如果 then 是一个函数，执行 then.call(x, resolvePromiseFn, rejectPromiseFn)
    
    如果 then 不是一个函数，fulfilled promise x