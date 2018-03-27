// share-pages/share-clientAdd.js
const AV = require("../utils/av-webapp-min.js")
const client = require("../model/client-model.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    complate:false,
    from_check:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 转发者的userID
    var that=this
    console.log(options.userId)
    this.setData({
      userId:options.userId
    })
    // 获取用户地址授权
    wx.authorize({
      scope: 'scope.address',
      success: (res => {
        this.chooseAdd(this)
      }),
      fail() { 
        that.fail_auth()
      }
    })
  },

  change:function(){
        // 获取用户授权情况
    wx.getSetting({
      success:(res=>{
        if (res.authSetting["scope.address"] == true){
          this.chooseAdd(this)
        }
        else(
          this.fail_auth()
        )
      })
    })
       
  },

  confirm: function () {
    wx.getUserInfo({
      withCredentials: true,
      success: (res => {
        if (this.data.from_check == true) {
          var userId = this.data.userId
          wx.showLoading({
            title: '正在提交中',
            mask: true
          })
          //关联代购的userid 
          var a = AV.Object.createWithoutData('_User', userId)
          console.log("acl")
          // 新建ACL权限
          var acl = new AV.ACL()
          var query = new AV.Query('_User');
          query.get(userId).then(User => {
            acl.setWriteAccess(User, true);
            acl.setReadAccess(User, true);
            //新增客户表
            new client({
              client_name: this.data.client_name,
              client_phone: this.data.client_phone,
              client_address: this.data.client_address,
              nickName: res.userInfo.nickName,
              avatarUrl: res.userInfo.avatarUrl,
              gender: res.userInfo.gender,
              purchaseUser: a
            }).setACL(acl).save()
              //保存完后再跳转，then()只能链式调用
              .then(res => {
                wx.showToast({
                  title: "提交成功",
                })
                wx.hideLoading()
                this.setData({
                  complate: true
                })
              })
              .catch(console.error);
          })
        }
        else {
          wx.showToast({
            title: '请选择地址',
            image: "/image/icon/warn.png"
          })
        }
      }),
      fail: (() => { this.fail_auth() })
    })
  },

  // 拒绝授权的回调函数
  fail_auth:function(){
    // 提示用户打开设置，然后允许授权
    wx.showModal({
      title: '用户未授权',
      content:"请先进入设置允许相关授权",
      showCancel: false,
      confirmText: "进入设置",
      success: (res => {
        wx.openSetting({
        })
      })
    })
  },

  
  // 选择地址函数
  chooseAdd:function(that){
    //用户填写地址接口
    wx.chooseAddress({
      success: (res => {
        that.setData({
          from_check:true,
          client_name: res.userName,
          client_phone: res.telNumber,
          client_address: res.provinceName + res.cityName + res.countyName + res.detailInfo
        })
      })
    })
  }

 
})