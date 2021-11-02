function adaptor(config) {
    return new Promise((resolve, reject) => {
        // let xhr = new XMLHttpRequest();
        // xhr.open(
        //     config.method.toUpperCase(),
        //     config.url,
        //     true
        // );

        
        // xhr.timeout = config.timeout;
        // xhr.onabort = function() {
        //     reject('xhr is abort');
        //     xhr = null;
        // }

        // xhr.onreadystatechange = function() {
        //     if(xhr.readyState === 4) {
        //         if(xhr.status === 200) {
        //             resolve(xhr && xhr.responseText);
        //         } else {
        //             reject('xhr error')
        //         }
        //     }
        // }
        // xhr.send(config.data);

        setTimeout(() => {
            resolve(config.data)
        }, 1000);
    })
}

export const dispatchRequest = function(config) {
    return adaptor(config).then(function(response) {
        return response;
    }, function(reason) {
        return Promise.reject(reason);
    });
}