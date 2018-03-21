// pages/upload/modify/modify.js
const AV = require("../../../utils/av-webapp-min.js")
const client = require("../../../model/client-model.js")
var public_fn = require("../../../utils/fn.js")

Page({
  data: {},

  onLoad:function(option){
    this.setData({choose_id:option.choose_id})
  },

  //添加数据到lendcloud上
  bindsubmit: function (event) {
    // var user_name = wx.getStorage({
    //   key: 'user',
    //   success: function (res) {
    //     var user_name = res.data.username
    //     console.log("user为" + user_name)
    //     return user_name
    //   },
    // })
    // // 新建一个 ACL 实例
    // var acl = new AV.ACL();
    // acl.setPublicReadAccess(user_name,true);
    // acl.setWriteAccess(user_name,true);

    var submit_from = event.detail.value
    var client_name = submit_from.client_name
    var client_phone = submit_from.client_phone
    var client_address = submit_from.client_address
    var v = public_fn.public_fn.check_from(submit_from)
    if (v != "stop") {
      wx.showLoading({
        title: '正在上传中',
        mask: true
      })
      //新增客户表
      new client({
        client_name: client_name,
        client_phone: client_phone,
        client_address: client_address,
      }).save()
        //保存完后再跳转，then()只能链式调用
        .then(res => {
          if (this.data.choose_id == "client") {
            wx.reLaunch({
              url: '/record/record_upload/record_upload',
            })
          }
          else {
            wx.reLaunch({
              url: '../client_warehouse',
            })
          }
        })
        .catch(console.error);
    }
  },
  
  back: function () {
    wx.navigateBack({})
  }

})