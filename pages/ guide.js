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
  
  },

  client:function(){
    wx.switchTab({
      url: '/pages/client_warehouse/client_warehouse',
    })
  }
})