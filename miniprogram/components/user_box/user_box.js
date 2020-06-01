let app = getApp();
Component({
  lifetimes: {
    attached: function(){
      let page = this;
      this.setData({
        avatar: app.globalData.domain + '/static/img/cov/' + page.data.openid +'.jpeg'
      })
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    nm: {
      type: String,
      value: ''
    },
    openid: {
      type: String,
      value: ''
    },
    flw_num: {
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    avatar: '/images/default_a.jpg'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    go_detail: function(){
      let page = this;
      wx.navigateTo({
        url: '/pages/user_detail/user_detail?openid='+page.data.openid,
      })
    },
    default_img: function(e){
      this.setData({
        avatar: '/images/default_a.jpg'
      })
    }
  }
})
