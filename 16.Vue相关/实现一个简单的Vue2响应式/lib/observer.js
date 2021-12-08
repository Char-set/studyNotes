log(`observer.js is loaded ......`)

import Dep from './dep.js';
export default class Observer {
    constructor(data) {
        
        this.walk(data);
    }

    walk(data) {
        if(!data || typeof data !== 'object') return;

        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
        })
    }

    defineReactive(obj, key, value) {
        this.walk(value);

        let dep = new Dep();

        const self = this;

        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            get(){
                Dep.target && dep.addSub(Dep.target);
                return value
            },
            set(newValue){
                if(value === newValue) return;

                value = newValue;

                self.walk(newValue);

                dep.notify();
            }
        })
    }
}