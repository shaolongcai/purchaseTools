// record/goods_detail/goods_detail.js
const AV = require("../../utils/av-webapp-min.js")
const order = require("../../model/order-model.js")
Page({

  data: {
    pay_toast:"true"
  },

  onLoad: function (options) {
      this.setData({
        goods_objId:options.goods_objId,
        order_objId: options.order_objId
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var query = new AV.Query("order")
    let order_objId = this.data.order_objId
    query.get(order_objId).then(order_data => this.setData({order_data}))
  },

  change_pay:function(){
    this.setData({
      pay_toast: ""
    })
  },

  cancel:function(){
    this.setData({
      pay_toast: "true"
    })
  },

  checkbox_change:function(event){
    var pay_state = event.detail.value
    this.setData({pay_state})
  },

  confirm:function(){
    var pay_state = this.data.pay_state
    var order_objId=this.data.order_objId
    var order = AV.Object.createWithoutData('order', order_objId );
    order.set("pay_state", pay_state)
    order.save().then(wx.reLaunch({
      url: '/record/record',
    }))
  },

  //删除函数
  delete_order: function () {
    var order_objId = this.data.order_objId
    wx.showModal({
      title: '确认删除？',
      content: '删除后无法复原',
      success: function (res) {
        if (res.confirm == true) {
          wx.showLoading({
            title: '请稍等',
          })
          var order = AV.Object.createWithoutData('order', order_objId);
          order.destroy().then(wx.reLaunch({
            url: '/record/record',
          }))
        }
      }
    })
  },

  back:function(){
    wx.navigateBack({
    })
  }

 
})