function Parent(name) {
    this.name = name;

    this.eat = function() {
        console.log('eat ----->')
    }
}

function Child(age) {
    Parent.apply(this, Array.prototype.slice.call(arguments, 1));
    this.age = age;
}

const c1 = new Child(1, 'haha');
const c2 = new Child(2, 'xixi');


// 存在问题：

// 每次实例化一个子类，都会同时实例化一个父类，

// 父类里的公共方法，在子类的实例上，会被多次开辟内存空间创建，浪费内存

// console.log(c1.eat === c2.eat) //false
