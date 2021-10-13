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
                // 将 x 作为函数的作用域 this 调用
                // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
                try {
                    then.call(
                        x, 
                        // 如果 resolvePromise 以值 y 为参数被调用，则运行 resolvePromise
                        (y) => {
                            if(called) {
                                return;
                            }

                            called = true;
                            this.resolvePromise(promise, y, resolve, reject);
                        }, 
                        // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
                        (r) => {
                            if(called) {
                                return;
                            }

                            called = true;

                            reject(r);
                        });
                } catch (e) {
                    // 如果调用 then 方法抛出了异常 e：
                    if(called) {
                        return;
                    }
                     // 否则以 e 为据因拒绝 promise
                    reject(e)
                }
            } else {
                // 如果 then 不是函数，以 x 为参数执行 promise
                resolve(x)
            }
        } else {
             // 如果 x 不为对象或者函数，以 x 为参数执行 promise
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

// CALLBACK_LIST 的 设计 是用于一个实例promise，同时注册多个then方法
// const testPromise = new NewPromise((resolve, reject) => {
//     setTimeout(() => {
//         resolve(11)
//     }, 1000);
// })

// testPromise.then(() => {})
// testPromise.then(() => {})
// testPromise.then(() => {})
// testPromise.then(() => {})
// testPromise.then(() => {})


const testPromise = new NewPromise((resolve, reject) => {
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

// 1. 需要关注的是 reject掉的是最初的promise，而testPromise其实是.catch返回的新的promise，并且.catch的回调函数正常执行完成了没有报错，所以是fulfilled

// 2. .catch 打印的过程中，其实是在执行回调函数，而只有回调函数执行完成了，才会改变promise 的 status