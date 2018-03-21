// warehouse/warehouse.js
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

  client_ware:function(){
    wx.navigateTo({
      url: 'client_warehouse/client_warehouse',
    })
  },

  goods_ware:function(){
    console.log("ok")
    wx.navigateTo({
      url: '/pages/home',
    })
  }

  
})