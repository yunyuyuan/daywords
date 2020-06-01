// miniprogram/pages/i/i.js
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nm: '用户名',
    sign: '签名',
    avatar: '',
    flws_num: 0,
    blks_num: 0,
    subs_num: 0,
    has_up: false,
    title: '',
    desc: '',
    rand: Math.random(),
    color_lis: app.globalData.color_lis,
    chose_c_idx: 0
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },
  init_page: function(){
    let page = this;
    let date = app.get_time();
    // 页面信息
    wx.request({
      url: app.globalData.domain+'/get_i_info',
      method: 'POST',
      dataType: 'json',
      data: {
        openid: app.globalData.openid,
        time: date
      },
      success: (res) => {
        if (res.data.state=='suc'){
          let data = res.data.data
          page.setData({
            avatar: (data.has_cov ? (app.globalData.domain + '/static/img/cov/' + app.globalData.openid + '.jpeg') :'/images/default_a.jpg'),
            nm: data.nm,
            sign: data.sign,
            flws_num: data.flws,
            blks_num: data.blks,
            subs_num: data.subs,
          })
          if (res.data.data.title){
            page.setData({
              has_up: true,
              title: data.title,
              desc: data.cont,
              chose_c_idx: parseInt(data.color)
            })
          }else{
            page.setData({
              has_up: false
            })
          }
          wx.hideLoading();
          wx.stopPullDownRefresh()
        }
      }
    })
  },
  // 修改颜色
  change_color: function(e){
    this.setData({
      chose_c_idx: e.target.dataset.idx
    });
  },
  // 获取输入
  get_title: function(e){
    this.setData({
      title: e.detail.value
    })
  },
  get_desc: function (e) {
    this.setData({
      desc: e.detail.value
    })
  },
  // 提交/修改
  submit: function(e){
    let page = this;
    let title = this.data.title,
        desc = this.data.desc;
    if (!title.length){
      this.show_dlg('句子不能为空!')
    } else if (!desc.length){
      this.show_dlg('解释/出处不能为空!')
    }else{
      wx.showToast({
        title: '上传中...',
        icon: 'loading',
      })
      let date = app.get_time();
      wx.request({
        url: app.globalData.domain+'/add_words',
        method: 'POST',
        dataType: 'json',
        data: {
          openid: app.globalData.openid,
          title: title,
          content: desc,
          color: page.data.chose_c_idx,
          time: date
        },
        success: (res)=>{
          if (res.data.state=='suc'){
            wx.showToast({
              title: '上传成功',
            })
          }
        }
      })
    }
  },
  // 验证输入
  show_dlg: function(s){
    wx.showModal({
      title: '错误',
      content: s,
      showCancel: false,
      confirmText: '确认',
    })
  },
  // 编辑信息
  edit_info: function(){
    let page = this;
    wx.navigateTo({
      url: '/pages/i/edit_info/edit_info?avatar=' + page.data.avatar,
      events: {
        a_c: function (data) {
          page.setData({
            rand: Math.random(),
            nm: data.nm,
            sign: data.sign
          })
        }
      }
    })
  },
  // 跳转
  nvgt: function(e){
    let s = e.currentTarget.dataset.s;
    wx.navigateTo({
      url: '/pages/i/'+s+'/'+s,
    })
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