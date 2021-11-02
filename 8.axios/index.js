import Axios from './src/Axios.js';

// const axios = new Axios({});

const creatAxios = (defaultConfig) => {
    let context = new Axios(defaultConfig);

    let instance = (function(fn, thisArg) {
        return function warp() {
            return fn.apply(thisArg, arguments);
        }
    })(context.request, context);

    return instance;
}

let config  = {
    data:'123',
    interceptor: {
        fulfilled: async (config) => {
            console.log(config,'____interceptor___fulfilled')

            return config;
        },
        rejected: async (config) => {
            console.log(config,'____interceptor___rejected');

            return config;
        },
    }
}

let axios = creatAxios({});
axios.Axios = Axios;
debugger
// debugger
axios(config).then(console.log)
console.log(axios,'_____')