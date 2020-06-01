let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatar: '/images/default_a.jpg',
    avatar_changed: false,
    nm: '',
    sign: '',
    rand: Math.random()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options){
      this.setData(options)
    }
    let page = this;
    wx.request({
      url: app.globalData.domain + '/get_userinfo',
      method: 'POST',
      dataType: 'json',
      data: {
        openid: app.globalData.openid,
        u_id: ''
      },
      success: (res) => {
        let data = res.data;
        if (data.state == 'suc') {
          page.setData({
            nm: data.data.nm,
            sign: data.data.sign,
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      rand: Math.random()
    })
  },
  // 头像
  choose_img: function(){
    let page = this;
    wx.chooseImage({
      success: function(res) {
        let file = res.tempFiles[0]
        if (file.size/1024**2 < 5){
          page.setData({
            avatar: file.path,
            avatar_changed: true
          })
        }else{
          wx.showToast({
            title: '图片需小于5M',
            icon: 'none'
          })
        }
      },
    })
  },
  // 输入
  input_nm: function (e) {
    this.setData({
      nm: e.detail.value
    })
  },
  input_sign: function(e){
    this.setData({
      sign: e.detail.value
    })
  },
  // 提交
  submit: function(){
    let page = this;
    const eventChannel = this.getOpenerEventChannel()
    if (!page.data.nm){
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
    } else if (!page.data.sign) {
      wx.showToast({
        title: '签名不能为空',
        icon: 'none'
      })
    }else{
      wx.showToast({
        title: '上传中',
        icon: 'loading'
      })
      if (!page.data.avatar_changed){
        wx.request({
          url: app.globalData.domain + '/edit_info',
          method: 'POST',
          dataType: 'json',
          data: {
            openid: app.globalData.openid,
            nm: page.data.nm,
            sign: page.data.sign
          },
          success: (res) => {
            if (res.data.state == 'suc') {
              wx.hideToast()
              wx.showToast({
                title: '修改成功',
              })
              eventChannel.emit('a_c', { nm: page.data.nm, sign: page.data.sign });
            }
          }
        })
      }else{
        wx.uploadFile({
          url: app.globalData.domain + '/edit_info',
          filePath: page.data.avatar,
          name: 'avatar',
          formData: {
            openid: app.globalData.openid,
            nm: page.data.nm,
            sign: page.data.sign
          },
          success: (res) => {
            wx.hideToast()
            wx.showToast({
              title: '修改成功',
            })
            eventChannel.emit('a_c', {nm: page.data.nm, sign: page.data.sign});
          }
        })
      }
    }
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