// components/turn_page/turn_page.js
Component({
  lifetimes: {
    attached: function () {
      this.cal_pagenum()
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    num: {
      type: Number,
      value: 0
    },
    show_count: {
      type: Number,
      value: 10
    },
    now: {
      type: Number,
      value: 1
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    page_num: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    cal_pagenum: function () {
      this.setData({
        page_num: Math.ceil(this.data.num / this.data.show_count)
      })
    },
    do_turn: function(e){
      let p = parseInt(e.detail.value);
      if (p<=0 || p>this.data.page_num){
        wx.showToast({
          title: '页码错误!',
          icon: 'none'
        })
      }else{
        wx.hideToast();
        this.triggerEvent('goturn', { p: p })
      }
    },
    go_pre: function(){
      let p = this.data.now - 1
      if (p > 0){
        this.triggerEvent('goturn', { p: p });
      }
    },
    go_next: function(){
      let p = this.data.now + 1;
      if (p <= this.data.page_num) {
        this.triggerEvent('goturn', { p: p });
      }
    }
  }
})
