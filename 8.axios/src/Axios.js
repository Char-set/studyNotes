import {dispatchRequest} from './DispatchRequest.js'

export default class Axios {
    constructor(config) {
        this.defaults = config;
    }

    request(config) {
        config = Object.assign(this.defaults, config);

        let chain = [dispatchRequest, undefined];

        // 如果有请求拦截器
        if(config.interceptor) {
            chain.unshift(
                config.interceptor.fulfilled,
                config.interceptor.rejected
            )
        }

        // 如果有相应拦截器
        if(config.adaptor) {
            chain.push(
                config.adaptor.fulfilled,
                config.adaptor.rejected
            )
        }

        let promise = Promise.resolve(config);

        while(chain.length) {
            promise = promise.then(chain.shift(), chain.shift())
        }

        return promise;

    }
}