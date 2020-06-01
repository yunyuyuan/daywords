let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nm: '',
    avatar: '',
    id: '',
    openid: '',
    title: '',
    cont: '',
    color: '',
    crt_time: '',
    prs_num: '',
    has_prs: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options){
      this.setData({
        id: options.wordsid
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    app.refresh_page(this.init_page);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  init_page: function(){
    let page = this;
    wx.request({
      url: app.globalData.domain + '/get_wordsinfo',
      method: 'POST',
      dataType: 'json',
      data: {
        id: page.data.id,
      },
      success: (res) => {
        let data = res.data;
        if (data.state == 'suc') {
          data.data.color = app.globalData.color_lis[data.data.color];
          data.data.avatar = app.globalData.domain+'/static/img/cov/'+data.data.openid+'.jpeg'
          page.setData(data.data)
        }
        wx.hideLoading();
        wx.stopPullDownRefresh()
      }
    })
  },
  //转到用户详情
  go_user: function(){
    let page = this;
    wx.navigateTo({
      url: '/pages/user_detail/user_detail?openid='+page.data.openid,
    })
  },
  do_prs: function(){
    let page = this;
    let bo = page.data.has_prs==0;
    wx.request({
      url: app.globalData.domain + '/tog_prs',
      method: 'POST',
      dataType: 'json',
      data: {
        openid: app.globalData.openid,
        id: page.data.id,
        bool: bo?1:0,
      },
      success: (res)=>{
        let data = res.data;
        if (data.state=='suc'){
          this.setData({
            has_prs: bo,
            prs_num: page.data.prs_num+(bo?1:-1)
          })
        }
      }
    })
  },
  // 图片记载
  default_img: function(e){
    this.setData({
      avatar: '/images/default_a.jpg'
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