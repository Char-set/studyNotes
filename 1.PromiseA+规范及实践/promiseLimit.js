// 定义状态
const WAIT_STATE = 'wait';
const ING_STATE = 'ing';
const DONE_STATE = 'done';

/**
 * 
 * @param {Array} list Array[item] item => {options, handle}
 * @param {Number} max 最大并发数量
 * @param {Function} callback 回调函数
 * @returns ans  按顺序返回结果
 */
const requestLimit = (list, max = 6, callback) => {
    return new Promise((resolve, reject) => {
        try {
            // 当前已经结束的数量
            let currentCount = 0;
            // 最大通道数量
            let maxCount = max;
            const ans = [];
            // 重新初始化函数列表，并初始化函数状态
            const sequence = [...list].map(item => {
                item._state = WAIT_STATE;
                return item;
            });
            // 函数列表长度
            const len = sequence.length;

            // 启动函数
            const _start = () => {
                // 当 `currentCount` 比需要请求的函数列表长度小，并且 `maxCount > 0` 时，从函数列表中找出一个待请求的任务开始执行
                while(currentCount < len && maxCount > 0) {
                    // 将通道数量减1
                    maxCount--;
                    // 找到一个等待请求的函数
                    let i = sequence.findIndex(item => item._state == WAIT_STATE);
                    if(i == -1) return;

                    // 更改这个函数的状态为 ING_STATE
                    sequence[i]._state = ING_STATE;

                    // 利用 Promise.resolve 包装，执行函数
                    Promise.resolve(sequence[i].handle(sequence[i].options)).then(res => {
                        // 按顺序保存函数结果
                        ans[i] = res;
                    },err => {
                        // 按顺序保存函数报错信息
                        ans[i] = err;
                    }).finally(() => {
                        // 更改函数状态为 DONE_STATE
                        sequence[i]._state = DONE_STATE;

                        // 将 `通道` 和 `currentCount` 分别 + 1
                        currentCount++;
                        maxCount++;

                        // 如果 函数都执行完成
                        if(currentCount == len) {
                            resolve(ans);
                            typeof callback === 'function' && callback(ans);
                        } else {
                            // 否则在启动一次检测函数
                            _start();
                        }
                    });

                }
            }
            // 初次启动函数
            _start();
        } catch (e) {
            // 返回报错信息
            reject(e)
        }
    })

}

const urls =[
    {info:'1', time:2000},
    {info:'2', time:1000},
    {info:'3', time:2000},
    {info:'4', time:2000},
    {info:'5', time:3000},
    {info:'6', time:1000},
    {info:'7', time:2000},
    {info:'8', time:2000},
    {info:'9', time:3000},
    {info:'10', time:1000}
]

function loadImg(url){
    return new Promise((reslove, reject)=>{
        console.log(url.info + '---start')
        setTimeout(()=>{
            console.log(url.info, 'ok!!!')
            reslove(url.info)
        }, url.time)
    })
}

const list = urls.map(item => {
    return {
        options: item,
        handle: loadImg
    }
});

requestLimit(list, 3, ans => {
    console.log('all is end，result is :', ans)
})