// 模拟Vue ref 的实现


let activeEffect = null;

function ref(init) {
    class Ref {
        constructor(init) {
            this._value = init;
        }

        get value() {
            trackRefValue(this);
            return this._value;
        }

        set value(newValue) {
            this._value = newValue;
            triggerRefValue(this, newValue);
        }
    }
    return new Ref(init);
}

function effect(fn) {
    activeEffect = new ReactiveEffect(fn)
    fn();
}

class ReactiveEffect {
    constructor(fn) {
        this.fn = fn;
    }
}

function trackRefValue(currentRef) {
    if(!currentRef.dep) {
        currentRef.dep = new Set();
    }
    currentRef.dep.add(activeEffect);
}

function triggerRefValue(currentRef) {

    [...currentRef.dep].forEach(effect => effect.fn())
}





let count = ref(0);


effect(function fn() {
    console.log('effect =====>：', count.value)
})


count.value++;


