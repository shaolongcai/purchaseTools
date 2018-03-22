// share-pages/share-clientAdd.js
const AV = require("../utils/av-webapp-min.js")
const client = require("../model/client-model.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    complate:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("客户卡片")
    // 获取用户地址授权
    wx.authorize({
      scope: 'scope.address',
      success: (res => {
        this.chooseAdd(this)
        wx.authorize({
          scope: 'scope.userInfo',
          success: (res => {
            //获取用户信息
            wx.getUserInfo({
              withCredentials: true,
              success: (res => {
                console.log(res.userInfo)
                this.setData({
                  userInfo:res.userInfo
                })
              })
            })
          }
          )
        })
      })
    })
   
    
  },

  change:function(){
    this.chooseAdd(this)
  },

  confirm:function(){
    var userInfo = this.data.userInfo
    
      wx.showLoading({
        title: '正在提交中',
        mask: true
      })
      //新增客户表
      new client({
        client_name: this.data.client_name,
        client_phone: this.data.client_phone,
        client_address: this.data.client_address,
        nickName:userInfo.nickName,
        avatarUrl:userInfo.avatarUrl,
        gender:userInfo.gender
      }).save()
        //保存完后再跳转，then()只能链式调用
        .then(res => {
          console.log(res)
          wx.showToast({
            title: "提交成功",
          })
          wx.hideLoading()
          this.setData({
            complate:true
          })
        })
        .catch(console.error);
    
  },

  
  // 选择地址函数
  chooseAdd:function(that){
    //用户填写地址接口
    wx.chooseAddress({
      success: (res => {
        console.log(res)
        that.setData({
          client_name: res.userName,
          client_phone: res.telNumber,
          client_address: res.provinceName + res.cityName + res.countyName + res.detailInfo
        })
      })
    })
  }

 
})