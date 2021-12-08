import Dep from "./dep.js";

export default class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;

        this.key = key;

        this.cb = cb;

        Dep.target = this;

        this.oldValue = vm[key];

        Dep.target = null;
    }

    // 
    update() {
        let newValue = this.vm[this.key];

        if(newValue === this.oldValue) return;
        this.oldValue = newValue;
        this.cb(newValue);
    }
}