// pages/home.js
const AV = require("../../utils/av-webapp-min.js")
import { $wuxBackdrop } from '../../components/wux'
const client = require("../../model/client-model.js")

Page({

  data: {
    animationData: {},
    stop_catch: false,
    btn_width:200,
    txtstyle:"left:0",
    L_index:"false",
    kongkong:false,
    upload_choose:true,
    more_text:true,
  },

  onLoad:function(){
    this.$wuxBackdrop = $wuxBackdrop.init()
  },


  onShow: function () {
    wx.showLoading({
      title: '读取数据中',
      mask: true
    })
    //继承goods表的属性
    var query = new AV.Query("client")
    //按创造时间降序排列
    query.descending('createdAt');
    query.limit(10)
    //需要用箭头函数去忽视this的影响,处理函数写在{}中
    query.find().then(client_data => this.setData({ client_data }))
    query.count().then(count => {
      if (count == 0) {
        this.setData({ kongkong: true })
      }
      else if (count < 11) {
        this.setData({ more_text: false })
      }
      this.setData({ count })
      wx.setNavigationBarTitle({
        title: "客户库（总" + count + "）"
      })
    }
    ).then(wx.hideLoading())
  },

  onReady: function () {
    // 获取用户信息objId
    var userInfo = AV.User.current()
    this.setData({userId:userInfo.id})
  },


 
  upload: function () {
    this.setData({
      upload_choose:false,
    })
    // 打开遮罩
    this.$wuxBackdrop.retain()
  },

  // 点击加号上传
  upload_client:function(){
    wx.authorize({
      scope: 'scope.address',
      success: (res => {
        wx.chooseAddress({
          success:(res=>{
            console.log(res)
            // 关联上传的代购
            var User = AV.User.current()
            var a = AV.Object.createWithoutData('_User', User.id )
            // 新建ACL权限
            var acl = new AV.ACL()
            var query = new AV.Query('_User');
            acl.setWriteAccess(User , true);
            acl.setReadAccess(User , true);
              //新增客户表
              new client({
                client_name: res.userName,
                client_phone: res.telNumber,
                client_address: res.provinceName + res.cityName + res.countyName + res.detailInfo,
                purchaseUser: a
              }).setACL(acl).save()
                //保存完后再跳转，then()只能链式调用
                .then(res => {
                  wx.showToast({
                    title: "提交成功",
                  })
                  wx.hideLoading()
                  this.$wuxBackdrop.release()
                  this.setData({
                    upload_choose: true,
                    kongkong:false
                  })
                })
                .catch(console.error);
          })
        })
      })
    })
  },

  // 点击遮罩取消上传
  cancel_upload:function(){
    this.$wuxBackdrop.release()
    this.setData({
      upload_choose:true
    })
  },

  //左滑删除
  touchS:function(event){
    var L_index = this.data.L_index
    if (L_index != "false") {
        this.data.client_data[L_index].attributes.txtstyle = 0
    }
    //判断触摸点是否为一个
    if(event.touches.length==1){
      //记录开始的X坐标
      this.setData({
        starX:event.touches[0].clientX,
        starY:event.touches[0].clientY
        }) 
    }
  },

  touchM:function(event){
    if(event.touches.length==1){
      var moveX = event.touches[0].clientX;
      var moveY = event.touches[0].clientY;
      var disX = moveX - this.data.starX 
      var disY = moveY - this.data.starY 
      var client_data = this.data.client_data
    
      
      var angle = this.angle(disX,disY);
      
      console.log(angle)
        // Math.abs(angle) 取绝对值
      if (Math.abs(angle)<30){
        //若距离大于0，每次移动都要做次更新
        if (disX <0) {
          this.data.txtstyle = disX
          //最大距离为删除按键的宽度
          if (-disX >= this.data.btn_width) {
            this.data.txtstyle = -this.data.btn_width
          }
        }
        //向右移回
        else if (disX > 0 && this.data.txtstyle != 0) {
          this.data.txtstyle = -this.data.btn_width + disX
          if (disX >= this.data.btn_width) {
            this.data.txtstyle = 0
          }
      }  
    }
    var index = event.currentTarget.dataset.arrId
    client_data[index].attributes.txtstyle = this.data.txtstyle
    //每次移动时，将过渡效果取消
    client_data[index].attributes.ismove = true
      this.setData({
        client_data
      })
    }
  },

  touchE:function(event){
    if (event.changedTouches.length == 1){
      var endX = event.changedTouches[0].clientX;
      var disX = this.data.starX - endX
      var btn_width = this.data.btn_width
      //若移动距离大于删除键的1/2，则直接显示，反之，隐藏。
      var txtstyle = disX > btn_width / 2 ? "-" + btn_width : "0"
      var index = event.currentTarget.dataset.arrId
      this.data.client_data[index].attributes.txtstyle = txtstyle
      //每次移动时，将过渡效果加入
      this.data.client_data[index].attributes.ismove = ""
      this.setData({
        client_data:this.data.client_data,
        //记录txtstyle,面板移动的位置
        txtstyle: txtstyle,
        //记录移动的条目的下标
        L_index: index
      })
    }
  },

  //查看更多
  more_goods: function () {
    wx.showLoading({
      title: '读取数据中',
      mask: true
    })
    var client_data = this.data.client_data
    var skip = client_data.length
      var query = new AV.Query("client")
      //按创造时间降序排列
      query.descending('createdAt');
      query.limit(10)
      query.skip(skip)
      //需要用箭头函数去忽视this的影响,处理函数写在{}中
      query.find().then(res => {
        var client_data = this.data.client_data.concat(res)
        this.setData({ client_data })
        //若请求回来的client_data等于总数count，则隐藏查看更多
        if (client_data.length == this.data.count) {
          this.setData({ more_text: false })
        }
      }).then(wx.hideLoading())
    
  },

  //删除客户信息
  det_client:function(event){
    var arr_id=event.currentTarget.dataset.arrId
    var obj_id = event.currentTarget.dataset.objId
    var client_data = this.data.client_data
    var that=this
    wx.showModal({
      title:"确认要删除该项目？",
      content:"删除后无法复原",
      success:function(event){
        var confirm = event.confirm
        if(confirm){
          //删除数据库数据
          var query = new AV.Query("client")
          var client = AV.Object.createWithoutData('client', obj_id);
          client.destroy().then()
          //删除前端数组
          client_data.splice(arr_id,1)
          //更新计数器
          var count = that.data.count-1
          console.log(count)
          if (count == 0) {
            that.setData({ kongkong: true })
          }
          that.setData({
            client_data: client_data,
            count:count
          })
          wx.setNavigationBarTitle({
            title: "客户库（总" + count + "）"
          })
        }
      }
    })
  },

  onShareAppMessage:function(res){
    var userId = this.data.userId
    if(res.from=="button"){
      console.log(res)
    }
    return {
      title:"填写客户信息",
      imageUrl:"/image/client_group.jpg",	
      path: "/share-pages/share-clientAdd?userId="+userId,
      success:(res=>console.log(res))
    }
  },

  // 计算角度函数
  angle: function (disX,disY) {
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(disY / disX) / (2 * Math.PI);
  },


})


