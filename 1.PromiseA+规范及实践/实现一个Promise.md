# 一步步实现一个Promise

## 1. promise应该是一个构造函数或者class

```js
    // 使用 `es6` class 语法
    class NewPromise {
        constructor() {
            
        }
    }
    const promise =  new NewPromise(); 
```

## 2. 定义三种状态。

```js
    const PENDIND = 'pending';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';
```

## 3. 初始化Promise的状态

```js
    class NewPromise {
        constructor() {
            // promise的状态，初始为pending
            this.status = PENDIND;
            // fulfilled的值
            this.value = null;
            // rejected的值
            this.reason = null;
        }
    }
```

## 4. 实现 resolve 和 reject 方法

    4.1 这两个方法要更改status，从 pending 变成 fulfilled / rejected

    4.2 入参分别是 value / reason

    4.3 状态变更时，需要判断当前状态是不是pending

```js
    const PENDIND = 'pending';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';


    class NewPromise {
        constructor() {
            // promise的状态，初始为pending
            this.status = PENDIND;
            // fulfilled的值
            this.value = null;
            // rejected的值
            this.reason = null;
        }

        resolve(value) {
            if(this.status === PENDIND) {
                this.value = value;
                this.status = FULFILLED;
            }
            
        }

        reject(reason) {
            if(this.status === PENDIND) {
                this.reason = reason;
                this.status = REJECTED;
            }
        }
    }
```

## 5. 对于实例化promise时的入参处理

    5.1 入参是一个函数，接受resolve reject两个参数

    5.2 初始化promise的时候，就要执行这个函数，并且有任何的报错都要通过reject抛出去

```js
    class NewPromise {
        constructor(fn) {
            // promise的状态，初始为pending
            this.status = PENDIND;
            // fulfilled的值
            this.value = null;
            // rejected的值
            this.reason = null;

            // 初始化时即同步执行传入的函数
            try {
                fn(this.resolve.bind(this), this.reject.bind(this));
            } catch (error) {
                this.reject(error);
            }
        }
    }
```

## 6. then 方法

    6.1 then 接受两个参数， onFulfilled 和 onRejected

```js
    then(onFulfilled, onRejected) {
        
    }
```

    6.2 检查并处理参数，如果参数不是函数，就忽略

```js
    then(onFulfilled, onRejected) {
        const realOnFulfilled = this.$isFunction(onFulfilled) ? onFulfilled : (value) => value;
        const realOnRejected = this.$isFunction(onRejected) ? onRejected : (value) => value;
    }

    $isFunction(param) {
        return typeof param == 'function'
    }
```

    6.3 then 的返回时一个整体的promise

```js
    then(onFulfilled, onRejected) {
        const realOnFulfilled = this.$isFunction(onFulfilled) ? onFulfilled : (value) => value;
        const realOnRejected = this.$isFunction(onRejected) ? onRejected : (value) => value;

        const promise2 = new NewPromise((resolve, reject) => {});

        return promise2;
    }
```

    6.4 根据当前promise的状态，调用不同的函数

```js
    then(onFulfilled, onRejected) {
        const realOnFulfilled = this.$isFunction(onFulfilled) ? onFulfilled : (value) => value;
        const realOnRejected = this.$isFunction(onRejected) ? onRejected : (value) => value;

        const promise2 = new NewPromise((resolve, reject) => {
            switch (this.status) {
                case FULFILLED: {
                    realOnFulfilled();
                    break;
                }

                case REJECTED: {
                    realOnRejected();
                    break;
                }
            
                default:
                    break;
            }
        });

        return promise2;
    }
```

    6.5 如果promise的状态不是同步改变的，应该怎么去判断状态且正确执行对应的回调

    6.5.1 首先拿到所有的callback；调用then的时候，如果promise状态还是pending，就把callback存入数组

```js
    switch (this.status) {
        case FULFILLED: {
            realOnFulfilled();
            break;
        }

        case REJECTED: {
            realOnRejected();
            break;
        }

        case PENDIND : {
            this.FULFILLED_CALLBACK_LIST.push(realOnFulfilled);
            this.REJECTED_CALLBACK_LIST.push(realOnRejected);
            break;
        }
    
        default:
            break;
    }
```

    6.5.2 使用es6的getter，setter，监听status变化，执行相应函数

```js
    get status() {
        return this._status;
    }

    set status(newStatus) {
        this._status = newStatus;

        switch (newStatus) {
            case FULFILLED: {
                this.FULFILLED_CALLBACK_LIST.forEach(callback => {
                    callback(this.value);
                });
                break;
            }
            case REJECTED: {
                this.REJECTED_CALLBACK_LIST.forEach(callback => {
                    callback(this.reason);
                });
                break;
            }
        }
    }
```

## 7. then的返回值

    7.1 如果onFulfilled 或者 onRejected 抛出一个异常e，那么新的promise必须reject e;

```js
    // 封装一下方法 realOnFulfilled realOnRejected
    const fulfilledMicrotask = () => {
        try {
            realOnFulfilled(this.value);
        } catch (e) {
            reject(e);
        }
    }

    const rejectedMicrotask = () => {
        try {
            realOnRejected(this.reason);
        } catch (e) {
            reject(e)
        }
    }


    switch (this.status) {
        case FULFILLED: {
            // realOnFulfilled();
            fulfilledMicrotask()
            break;
        }

        case REJECTED: {
            // realOnRejected();
            rejectedMicrotask();
            break;
        }

        case PENDIND : {
            this.FULFILLED_CALLBACK_LIST.push(fulfilledMicrotask);
            this.REJECTED_CALLBACK_LIST.push(rejectedMicrotask);
            break;
        }
    
        default:
            break;
    }
```

    7.2 返回值应该是一个新的promise

```js
    then(onFulfilled, onRejected) {
        // ....

        return promise2;
    }
```

    7.3 如果 onFulfilled 或者 onRejected 返回一个值 x，运行resolvePromise方法.

```js
    const fulfilledMicrotask = () => {
        try {
            const x = realOnFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
            reject(e);
        }
    }

    const rejectedMicrotask = () => {
        try {
            const x = realOnRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
            reject(e)
        }
    }
```


## 8. resolvePromise

```js
    resolvePromise(promise, x, resolve, reject) {
        // 防止死循环
        if(promise === x) {
            return reject(new TypeError('The promise and the return value are the same'))
        }

        if(x instanceof NewPromise) {
            queueMicrotask(() => {
                x.then(y => {
                    this.resolvePromise(promise, y, resolve, reject)
                }, reject)
            })
        } else if(typeof x === 'object' || this.$isFunction(x)) {
            if(x === null) {
                return resolve(x)
            }

            let then = null;

            try {
                then = x.then;
            } catch (e) {
                // 如果取x.then报错，需要reject出去
                return reject(e)
            }
            // 如果then是一个函数
            if(this.$isFunction(then)) {
                // 只能执行一次
                let called = false;

                try {
                    then.call(x, (y => {
                        if(called) {
                            return;
                        }

                        called = true;
                        this.resolvePromise(promise, y, resolve, reject);
                    }), (r) => {
                        if(called) {
                            return;
                        }

                        called = true;

                        reject(r);
                    })
                } catch (e) {
                    if(called) {
                        return;
                    }
                    reject(e)
                }
            } else {
                resolve(x)
            }
        } else {
            resolve(x);
        }
    }
```

## 9. onFulfilled onRejected 应该在微任务里执行

```js
    queueMicrotask(() => { /* code */})
```

# 几个思考

## CALLBACK_LIST 设计为一个数组？

```js
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(111);
        }, 1000)
    });

    promise.then(value => {})
    .then(value => {})
    .then(value => {})
    .then(value => {})
    .then(value => {})
```
`上方写法无意义：`then方法返回的是一个新的promise，意味着每次CALLBACK_LIST都初始化为空，结果无意义；

`设计是有意义的：`对同一个promise注册多个then回调

```js
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(111);
        }, 1000)
    });

    promise.then(value => {});
    promise.then(value => {});
    promise.then(value => {});
    promise.then(value => {});
    promise.then(value => {});
    promise.then(value => {});
```

## 下方console的输出？

```js
    const testPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(1111);
        }, 1000);
    }).catch(e => {
        console.log('报错',e);
        console.log(testPromise);   //testPromise 的status 为 pending
    });

    setTimeout(() => {
        console.log(testPromise);   //testPromise 的status 为 fulfilled
    }, 3000);
```

`结果：` catch 方法里输出的 promise 的 status 为 pending；setTimeout 输出的 promise 的 status 为 fulfilled

`解析：` 

`1：`需要关注的是 reject掉的是最初的promise，而testPromise其实是.catch返回的新的promise，并且.catch的回调函数正常执行完成了没有报错，所以是fulfilled

`2：`.catch 打印的过程中，其实是在执行回调函数，而只有回调函数执行完成了，才会改变promise 的 status

# 完整版代码

```js
    const PENDIND = 'pending';
    const FULFILLED = 'fulfilled';
    const REJECTED = 'rejected';


    class NewPromise {
        // 成功状态的回调
        FULFILLED_CALLBACK_LIST = [];
        // 失败状态的回调
        REJECTED_CALLBACK_LIST = [];

        // 私有变量，储存真正的status
        _status = PENDIND;

        constructor(fn) {
            // promise的状态，初始为pending
            this.status = PENDIND;
            // fulfilled的值
            this.value = null;
            // rejected的值
            this.reason = null;

            // 初始化时即同步执行传入的函数
            try {
                fn(this.resolve.bind(this), this.reject.bind(this));
            } catch (error) {
                this.reject(error);
            }
        }

        get status() {
            return this._status;
        }

        set status(newStatus) {
            this._status = newStatus;

            switch (newStatus) {
                case FULFILLED: {
                    this.FULFILLED_CALLBACK_LIST.forEach(callback => {
                        callback(this.value);
                    });
                    break;
                }
                case REJECTED: {
                    this.REJECTED_CALLBACK_LIST.forEach(callback => {
                        callback(this.reason);
                    });
                    break;
                }
            }
        }

        resolve(value) {
            if(this.status === PENDIND) {
                this.value = value;
                this.status = FULFILLED;
            }
            
        }

        reject(reason) {
            if(this.status === PENDIND) {
                this.reason = reason;
                this.status = REJECTED;
            }
        }

        then(onFulfilled, onRejected) {
            const realOnFulfilled = this.$isFunction(onFulfilled) ? onFulfilled : (value) => value;
            const realOnRejected = this.$isFunction(onRejected) ? onRejected : (value) => value;

            const promise2 = new NewPromise((resolve, reject) => {

                const fulfilledMicrotask = () => {
                    queueMicrotask(() => {
                        try {
                            const x = realOnFulfilled(this.value);
                            this.resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                }

                const rejectedMicrotask = () => {
                    queueMicrotask(() => {
                        try {
                            const x = realOnRejected(this.reason);
                            this.resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e)
                        }
                    });
                }


                switch (this.status) {
                    case FULFILLED: {
                        // realOnFulfilled();
                        fulfilledMicrotask()
                        break;
                    }

                    case REJECTED: {
                        // realOnRejected();
                        rejectedMicrotask();
                        break;
                    }

                    case PENDIND : {
                        this.FULFILLED_CALLBACK_LIST.push(fulfilledMicrotask);
                        this.REJECTED_CALLBACK_LIST.push(rejectedMicrotask);
                        break;
                    }
                
                    default:
                        break;
                }
            });

            return promise2;
        }

        catch(onRejected) {
            return this.then(null, onRejected);
        }

        resolvePromise(promise, x, resolve, reject) {
            // 防止死循环
            if(promise === x) {
                return reject(new TypeError('The promise and the return value are the same'))
            }

            if(x instanceof NewPromise) {
                queueMicrotask(() => {
                    x.then(y => {
                        this.resolvePromise(promise, y, resolve, reject)
                    }, reject)
                })
            } else if(typeof x === 'object' || this.$isFunction(x)) {
                if(x === null) {
                    return resolve(x)
                }

                let then = null;

                try {
                    then = x.then;
                } catch (e) {
                    // 如果取x.then报错，需要reject出去
                    return reject(e)
                }
                // 如果then是一个函数
                if(this.$isFunction(then)) {
                    // 只能执行一次
                    let called = false;

                    try {
                        then.call(x, (y => {
                            if(called) {
                                return;
                            }

                            called = true;
                            this.resolvePromise(promise, y, resolve, reject);
                        }), (r) => {
                            if(called) {
                                return;
                            }

                            called = true;

                            reject(r);
                        })
                    } catch (e) {
                        if(called) {
                            return;
                        }
                        reject(e)
                    }
                } else {
                    resolve(x)
                }
            } else {
                resolve(x);
            }
        }

        $isFunction(param) {
            return typeof param == 'function'
        }

        static resolve(value) {
            if(value instanceof NewPromise) {
                return value;
            }

            return new NewPromise(resolve => resolve(value));
        }

        static reject(reason) {
            return new NewPromise((resolve, reject) => {
                reject(reason);
            });
        }
    }
```

`注意：`.race .all 暂且实现，等待更新；此版本和标准的Promise，在宏任务、微任务的执行顺序上会有差异，不可用于生产。同时，对于微任务的执行，此版本直接使用了 `queueMicrotask` api，兼容性上会有问题；