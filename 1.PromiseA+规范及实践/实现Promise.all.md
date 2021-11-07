# Promise.all

官方解释：

> Promise.all() 方法接收一个promise的iterable类型（注：Array，Map，Set都属于ES6的iterable类型）的输入，并且只返回一个Promise实例， 那个输入的所有promise的resolve回调的结果是一个数组。这个Promise的resolve回调执行是在所有输入的promise的resolve回调都结束，或者输入的iterable里没有promise了的时候。它的reject回调执行是，只要任何一个输入的promise的reject回调执行或者输入不合法的promise就会立即抛出错误，并且reject的是第一个抛出的错误信息。

## 小小实现一下

实现一个简单版的 `Promise.all`

### Promise.all 是一个静态方法

`静态方法：`静态方法调用直接在类上进行，不能在类的实例上调用。（类或构造函数）

`实例方法：`不能通过类直接访问，需要通过该类声明的实例才能访问

```js
    Promise.all = function() {},// 静态方法，直接定义在构造函数或者类上

    Promise.prototype.all = function() {}, // 实例方法，定义在prototype上

```

### Promise.all 参数是一个Array类型，返回一个Promise

```js
    Promise.all = function(arr) {
        return new Promise((resolve, reject) => {

        })
    }
```

### 处理入参，获取结果

这里有几个需要注意的点：

- 入参是一个promise的iterable类型，但是仍需要处理入参非Promise类型的情况

- 返回结果是个 x (Promise 类型)

- x.then 方法可以获取所有处理完成后的结果，也是个iterable类型

- x.catch 方法可以获取出错情况

- x.then 方法的回调函数，需要等所有的入参Promise都resolved才返回

- 所有的处理结果顺序，和入参的Promise顺序是一样的

```js
    Promise.all = function(arr) {
        return new Promise((resolve, reject) => {
            let res = [];
            let count = 0;
            for(let i = 0; i < arr.length; i++) {
                Promise.resolve(arr[i])
                    .then((value) => {
                        res[i] = value;
                        count++;
                        if(count === arr.length) {
                            resolve(res);
                        }
                    })
                    .catch((reason) => {
                        reject(reason)
                    })
            }
        })
    }
```

### 常常会出错，或者说考察的地方

- `res[i] = value;` 常有人会写成 `res.push(value)`，这样会导致返回的结果顺序和理想中的不一致

- `count === arr.length` 会被误写为 `res.length === arr.length`。这样会有一个问题，一个数组如果直接 赋值 `arr[1] = 'xxx'`，这样的话，即使 `arr[0]` 还没有赋值，arr的length就是2了，而不是1；

- `arr[i]` 需要用 `Promise.resolve` 包裹，处理一些异常情况


> 下一遍，更新