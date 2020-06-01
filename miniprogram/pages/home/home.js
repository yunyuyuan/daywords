// miniprogram/pages/home/home.js
let app = getApp();
let turn_pg;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    words_lis: [],
    now: 1,
    num: 0,
    show_count: 10,
    only_sub: true,
    time: app.get_time()
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
    app.login().then(() => {
      app.refresh_page(this.init_page);
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  init_page: function(){
    this.get_today().then(()=>{
      wx.hideLoading();
      wx.stopPullDownRefresh()
    })
  },
  // 加载今日一词
  get_today: function(is_turn){
    let page = this;
    turn_pg = this.selectComponent('#id-turn-page');
    let show_c = page.data.show_count;
    let p = page.data.now;
    let date = app.get_time();
    return new Promise((resolve)=>{
        wx.request({
        url: app.globalData.domain + '/get_today',
        method: 'POST',
        dataType: 'json',
        data: {
          openid: app.globalData.openid,
          time: date,
          p: p-1,
          count: show_c,
          what: page.data.only_sub?'sub':'all'
        },
        success: (res)=>{
          if (res.data.state=='suc'){
            page.setData({
                words_lis: res.data.data.lis,
                num: res.data.data.count
            })
          }
          if (is_turn && turn_pg){
            turn_pg.setData({
              now: page.data.now,
              num: res.data.data.count
            })
          }
        },
        complete: ()=>{
          resolve()
        }
      })
    })
  },
  // 切换
  change_show: function(){
    this.setData({
      only_sub: !this.data.only_sub
    })
    wx.showLoading({
      title: '加载中',
    })
    this.get_today().then(()=>{
      wx.hideLoading()
    })
  },
  // 翻页
  turn_page: function(e){
    let p = e.detail.p;
    this.setData({
      now: p
    });
    this.get_today(true);
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
    app.refresh_page(this.init_page);
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