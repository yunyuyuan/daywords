let app = getApp();
let turn_pg;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 0,
    now: 1,
    show_c: 15,
    lis: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.refresh_page(this.init_page)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  init_page: function () {
    let page = this;
    turn_pg = this.selectComponent('#id-turn-page');
    let p = this.data.now,
      show_c = this.data.show_c;
    wx.request({
      url: app.globalData.domain + '/get_lis',
      method: 'POST',
      dataType: 'json',
      data: {
        openid: app.globalData.openid,
        what: 'flws',
        p: p - 1,
        count: show_c,
      },
      success: (res) => {
        let data = res.data;
        if (data.state == 'suc') {
          data.data.lis.filter((e) => {
            e['avatar'] = (app.globalData.domain + '/static/img/cov/' + e.openid + '.jpeg');
            e['checked'] = false;
          })
          page.setData({
            num: data.data.count,
            lis: data.data.lis,
          })
          if (turn_pg){
            turn_pg.setData({
              now: 1,
              num: data.data.count
            })
            turn_pg.cal_pagenum()
          }
        }
        wx.hideLoading();
      }
    })
  },
  // 默认头像
  default_img: function (e) {
    let lis = this.data.lis;
    lis[parseInt(e.target.dataset.idx)].avatar = '/images/default_a.jpg'
    this.setData({
      lis: lis
    })
  },
  // 跳转到详情
  go_user: function (e) {
    wx.navigateTo({
      url: '/pages/user_detail/user_detail?openid=' + e.currentTarget.dataset.id,
    })
  },
  turn_page: function (p) {
    this.setData({
      now: p
    })
    this.init_page()
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    app.refresh_page(this.init_page)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})