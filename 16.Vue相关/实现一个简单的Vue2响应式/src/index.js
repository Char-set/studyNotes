log(`index.js is loaded.....`)


import Vue from '../lib/vue.js'


window.vm = new Vue({
    el: '#app',
    data: {
        name: 'Vue js',
        age: '12',
        inputVal: '',
        show: false
    }
})


// const x = new XMLHttpRequest()

// x.open('get', 'https://mpogwi-grey.1o2o.com/api/ehr/metadata/buOperativeList/?parentCode=neurotech');

// x.send();

log(`vm is :`, vm)