//同时发送异步代码的次数
let ajaxTimes = 0;
//发送请求
export default (url, data = {}, method = 'POST',) => {
    ajaxTimes++;
    //显示加载中效果
    uni.showLoading({
        title: '加载中...',
        mask: true,
    })
    // const baseUrl = 'https://111.75.252.147/score';
    const baseUrl = 'https://cxcy.gmu.cn/score';
    //1.new Promise 初始化promise实例的状态为pending
    return new Promise((resolve, reject) => {
        //使用split对得到的cookie进行分割
        let JSESSIONID = uni.getStorageSync("JSESSIONID").split(';')[0].split('=')[1];
        let cookie = 'JSESSIONID=' + JSESSIONID;
        uni.request({
            url: baseUrl + url,
            data,
            method,
            header: {
                'content-type': 'application/x-www-form-urlencoded',
                "cookie": cookie
            },
            success: (res) => {
                resolve(res);
            },
            fail: (err) => {
                //console.log("获取数据失败：",err);
                reject(err);
            },
            complete: () => {
                ajaxTimes--;
                if (ajaxTimes === 0) {
                    //关闭正在等待的图标
                    uni.hideLoading();
                }
            }
        })
    })
}