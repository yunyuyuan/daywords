Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
        "pagePath": "/pages/home/home",
        "iconPath": "/images/home.png",
        "selectedIconPath": "/images/home_s.png",
        "text": "今日"
      },
      {
        "pagePath": "/pages/ground/ground",
        "iconPath": "/images/sub.png",
        "selectedIconPath": "/images/sub_s.png",
        "text": "众说"
      },
      {
        "pagePath": "/pages/i/i",
        "iconPath": "/images/my.png",
        "selectedIconPath": "/images/my_s.png",
        "text": "我的"
      }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      this.setData({
        selected: data.index
      })
      wx.switchTab({ url })
    }
  }
})