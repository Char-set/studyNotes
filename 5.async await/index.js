// async await


const sleep = (str) => new Promise(r => setTimeout(() => r(str), 1000));

function * generatorFunc() {
    console.log('------------ in -------------');
    const res1 = yield sleep('hello Javascript');
    console.log('------------ first result ---------', res1);
    const res2 = yield sleep('hello Python');
    console.log('------------ second result ---------', res2);
    return 'success';
}

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

asyncToGenerator(generatorFunc)()