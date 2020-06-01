App({
  onLaunch: function () {
    this.globalData = {
      // domain: 'https://mp.phyer.cn',
      domain: 'http://192.168.1.104:5000',
      color_lis: ['#fff', '#C5F3FF', '#B1FFB2', '#FFF7B1', '#FFBCBA', '#FFAEFF', '#AFBBFF']
    };
  },
  login: async function(){
    let app = this;
    return new Promise(function(resolve){
      wx.login({
        success(res) {
          if (res.code) {
            wx.request({
              url: app.globalData.domain + '/get_openid',
              data: {
                code: res.code
              },
              method: 'POST',
              dataType: 'json',
              success: (res) => {
                let data = res.data;
                if (data.state == 'suc') {
                  app.globalData.openid = data.openid;
                }
                resolve()
              }
            });
          } else {
            console.log('登陆失败')
          }
        }
      })
    })
  },
  // 获取日期
  get_time: function(){
    let date = new Date();
    let s = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    return s;
  },
  // 刷新
  refresh_page: function (cb) {
    wx.hideToast();
    wx.showLoading({
      title: '加载ing...',
    })
    cb()
  }
})