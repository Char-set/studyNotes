function Parent(name) {
    this.name = name;
}

function Child() {
    
}

Child.prototype = new Parent();
Child.prototype.constructor = Child;


// 缺点：

// 1、如果父类构造函数有引用类型的，子类修改后，所有实例都会受到影响

// 因为这种方法，就是将父类的一个实例，放到了子类的原型对象上 prototype = new Parent()，
// 所以一旦子类的实例修改某个引用类型的对象后，所有实例都会受到影响

// 2、子类没有办法传递参数给父类

