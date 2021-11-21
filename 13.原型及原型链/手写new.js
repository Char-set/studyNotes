function makeNew() {

    // 新建一个空对象
    let o = new Object();

    // 拿到参数 -> 构造函数
    let FunctionConstructor = [].shift.call(arguments);

    // 将新建的对象的 原型对象 指向 构造函数的原型
    o.__proto__ = FunctionConstructor.prototype;

    // 执行构造函数，将o作为构造函数的this
    let result = FunctionConstructor.apply(o, arguments);

    // 判断构造函数的结构是否为 对象类型
    return typeof result === 'object' ? result : 0
}

