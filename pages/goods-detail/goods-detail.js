// pages/goods-detail/goods-detail.js
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
    var that=this
    wx.getStorage({
      key: 'goods_single',
      success: function(res) {
        that.setData({goods_detail:res})
      },
    })
  },

 
})