// pages/ guide.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 用缓存判断是否第一次进入
    wx.getStorage({
      key: 'first_coming',
      success: function(res) {
        wx.switchTab({
          url: '/record/record',
        })
      },
      fail:function(){
        wx.setStorage({
          key: 'first_coming',
          data: 'true',
        })
      }
    })
  },

  client:function(){
    wx.switchTab({
      url: '/pages/client_warehouse/client_warehouse',
    })
  },

  goods:function(){
    wx.switchTab({
      url: '/pages/goods_list/goods_list',
    })
  },

  order:function(){
    wx.switchTab({
      url: '/record/record',
    })
  }
})