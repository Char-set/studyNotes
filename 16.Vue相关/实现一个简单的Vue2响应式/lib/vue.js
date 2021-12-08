console.log('Vue js is loaded.....');

import Compiler from './compiler.js'
import Observer from './observer.js'

class Vue {
    constructor(opts) {
        this.$options = opts || {};

        this.$data = opts.data || {};

        this.$el = opts.el ? document.querySelector(opts.el) : null;


        this._init(opts);

        new Observer(this.$data);

        new Compiler(this);

    }

    _init(opts) {
        this._proxyData(this.$data)
    }

    _proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },

                set(newValue) {
                    if(data[key] === newValue) return;

                    data[key] = newValue;
                }
            })
        })
    }
}


export default Vue;