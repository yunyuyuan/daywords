let app = getApp();
let turn_pg;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    lis: [],
    sc_s: '',
    at: 'words',
    animate_at: '',
    show_count: 10,
    num: 0,
    now: 1
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
    app.refresh_page(this.init_page);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
  init_page: function(){
    this.do_search().then(() => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    })
  },
  // 输入搜索值
  input_: function(e){
    this.setData({
      sc_s: e.detail.value,
    })
  },
  // 点击搜索按钮
  click_sc: function(){
    this.do_search().then(()=>{
      wx.hideLoading()
    })
  },
  // 切换句子/用户
  change_at: function(e){
    let at = e.currentTarget.dataset.s;
    let ani = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out',
    });
    ani.left((at=='words'?'5%':'55%')).step();
    this.setData({
      at: at,
      animate_at: ani.export(),
      // 重置页码
      lis: [],
      now: 1,
      num: 0
    });
    this.do_search()
  },
  // 执行搜索
  do_search: async function(is_turn){
    let page = this;
    turn_pg = this.selectComponent('#id-turn-page');
    let show_c = this.data.show_count,
        p = this.data.now,
        s = this.data.sc_s;
    let cmd;
    wx.showToast({
      title: '载入中...',
      icon: 'loading'
    })
    wx.request({
      url: app.globalData.domain + '/search',
      method: 'POST',
      dataType: 'json',
      data: {
        openid: app.globalData.openid,
        at: page.data.at,
        s: s,
        p: p-1,
        count: show_c,
      },
      success: (res) => {
        let data = res.data;
        if (data.state=='suc'){
          page.setData({
            lis: data.data.lis,
            num: data.data.count
          })
          if (turn_pg){
            turn_pg.setData({
              now: is_turn ? page.data.now:1,
              num: data.data.count
            })
            turn_pg.cal_pagenum()
          }
        }
        wx.hideToast();
      }
    })
  },
  turn_page: function(p){
    this.setData({
      now: p.detail.p,
    })
    this.do_search(true)
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