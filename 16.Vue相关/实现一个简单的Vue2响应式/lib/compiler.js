log('compiler.js is loaded .......')

import Watcher from "./watcher.js";

export default class Compiler {
    constructor(vm) {
        this.vm = vm;

        this.$el = vm.$el;

        this.compile(this.$el);
    }

    compile(el) {

        [...el.childNodes].forEach(node => {
            if(this.isTextNode(node)) {
                this.compileTextNode(node);
            } else if(this.isElementNode(node)) {
                this.compileElementNode(node);
            }

            if(node.childNodes && node.childNodes.length) {
                this.compile(node);
            }
        })
    }

    compileTextNode(node) {
        log('textNode is:', node);
        let reg = /\{\{(.+?)\}\}/
       
        let val = node.textContent;

        if(reg.test(val)) {
            let key = RegExp.$1.trim();

            node.textContent = val.replace(reg, this.vm[key]);

            new Watcher(this.vm, key, newValue => {
                node.textContent = newValue;
            })
        }
    }

    compileElementNode(node) {
        log('elementNode is:', node);
        
        [...node.attributes].forEach(attr => {
            
            let attrName = attr.name;
            log(attrName)
            if(attrName == 'style') {
                node._originStyle = JSON.parse(JSON.stringify(node.style));
            }
            if(this.isDirective(attrName)) {
                let directive = attrName.substr(2);
                let key = attr.value;

                this.doDirectiveFn(node, directive, key);
            }
        })
    }

    doDirectiveFn(node, dirctive, key) {
        let doFn = this[dirctive + 'Fn'];
        
        doFn && doFn.call(this, node, key, this.vm[key]);
    }

    showFn(node, key, value) {

        const updateFn = (value) => {
            node.style.display = value ? node._originStyle.display : 'none'
        }
        updateFn(value);
        
        new Watcher(this.vm, key, newVal => {
            updateFn(newVal);
        })
        
    }

    modelFn(node, key, value) {
        node.value = value;
        
        node.addEventListener('input', e => {
            this.vm[key] = node.value;
        });

        new Watcher(this.vm, key, (newVal) => {
            node.value = newVal;
        })
    }

    isDirective(attr) {
        return attr.startsWith('v-')
    }

    isTextNode(node) {
        return node.nodeType === 3
    }

    isElementNode(node) {
        return node.nodeType === 1
    }
}