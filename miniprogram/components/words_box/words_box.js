let app = getApp();
Component({
  lifetimes: {
    attached: function () {
      let page = this;
      this.setData({
        avatar: app.globalData.domain + '/static/img/cov/' + page.data.openid + '.jpeg'
      })
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    show_a: {
      type: Boolean,
      value: true
    },
    content: {
      type: String,
      value: ''
    },
    color: {
      type: Number,
      value: 0
    },
    p_num: {
      type: Number,
      value: 0
    },
    openid: {
      type: String,
      value: ''
    },
    wordsid: {
      type: String,
      value: ''
    },
    time: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    avatar: '/images/default_a.jpg',
    color_lis: app.globalData.color_lis
  },

  /**
   * 组件的方法列表
   */
  methods: {
    go_user: function (e){
      let openid = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/user_detail/user_detail?openid='+openid,
      })
    },
    go_words: function (e){
      let wordsid = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/words_detail/words_detail?wordsid=' + wordsid,
      })
    },
    default_img: function (e) {
      this.setData({
        avatar: '/images/default_a.jpg'
      })
    }
  }
})
