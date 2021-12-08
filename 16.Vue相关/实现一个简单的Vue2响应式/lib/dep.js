log(`dep.js is loaded .....`)

class Dep {
    constructor() {
        this.subs = [];
    }

    addSub(sub) {
        if(sub && sub.update) {
            this.subs.push(sub);
        }
    }

    notify() {
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}

Dep.target = null;

export default Dep;