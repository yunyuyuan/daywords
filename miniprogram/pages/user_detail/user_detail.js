let app = getApp();
let turn_pg;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    uid: '',
    openid: '',
    avatar: '/images/default_a.jpg',
    nm: '',
    sign: '',
    now: 1,
    num: 0,
    show_c: 10,
    lis: [],
    has_sub: 0,
    has_blk: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      uid: app.globalData.openid,
      openid: options.openid,
      nm: options.nm,
      avatar: app.globalData.domain+'/static/img/cov/'+options.openid+'.jpeg'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    turn_pg = this.selectComponent('#id-turn-page');
    app.refresh_page(this.init_page);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  init_page: async function(){
    await this.get_info();
    this.get_lis();
  },
  // 获取用户信息
  get_info: async function(){
    let page = this;
    return new Promise((resolve)=>{
        wx.request({
        url: app.globalData.domain + '/get_userinfo',
        method: 'POST',
        dataType: 'json',
        data: {
          openid: page.data.openid,
          u_id: app.globalData.openid
        },
        success: (res) => {
          let data = res.data;
          if (data.state == 'suc') {
            page.setData(data.data)
          }
          resolve()
        }
      })
    })
  },
  // 获取句子列表
  get_lis: async function(){
    let page = this;
    let p = this.data.now,
        show_c = this.data.show_c;
    wx.request({
      url: app.globalData.domain + '/get_userwords_lis',
      method: 'POST',
      dataType: 'json',
      data: {
        openid: page.data.openid,
        p: p - 1,
        count: show_c
      },
      success: (res)=>{
        let data = res.data;
        if (data.state=='suc'){
          page.setData({
            num: data.data.count,
            lis: data.data.lis,
          })
          turn_pg.setData({
            now: p,
            num: data.data.count,
          })
          turn_pg.cal_pagenum();
          wx.hideLoading();
          wx.stopPullDownRefresh()
        }
      }
    })
  },
  // 订阅/拉黑
  tog_subblk: function(e){
    let t = e.target.dataset.t;
    let page = this;
    let bo = (t=='subs'?page.data.has_sub:page.data.has_blk)==0;
    wx.showLoading({
      title: '处理中',
    })
    wx.request({
      url: app.globalData.domain + '/tog_subblk',
      method: 'POST',
      dataType: 'json',
      data: {
        u_id: app.globalData.openid,
        openid: page.data.openid,
        bool: bo?1:0,
        tp: t
      },
      success: (res)=>{
        if (res.data.state=='suc'){
          if (t=='blks'){
            page.setData({
              has_blk: bo,
              has_sub: bo ? 0 : page.data.has_sub
            })
          }else{
            page.setData({
              has_sub: bo,
              has_blk: bo ? 0 : page.data.has_blk
            })
          }
          wx.showToast({
            title: '成功',
          })
        }
      },
      complete: ()=>{
        wx.hideLoading();
      }
    })
  },
  // 默认头像
  default_img: function(e){
    this.setData({
      avatar: '/images/default_a.jpg'
    })
  },
  turn_page: function(e){
    let p = e.detail.p;
    this.setData({
      now: p
    });
    this.get_lis();
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