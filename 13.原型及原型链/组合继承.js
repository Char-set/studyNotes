function Parent(name) {
    this.name = name
}

Parent.prototype.eat = function () {
    console.log(`${this.name} want eat`);
}

function Child(age) {
    Parent.apply(this, Array.prototype.slice.call(arguments, 1));
}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// 这里，从父类的原型对象上拷贝出一个新的对象，赋值给子类的原型对象，而不是将父类的实例赋值给子类的原型对象，
// 避免了调用父类的构造方法