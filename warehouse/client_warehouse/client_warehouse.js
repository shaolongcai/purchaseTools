// pages/home.js
const AV = require("../../utils/av-webapp-min.js")
var public_fn = require("../../utils/fn.js")

Page({

  data: {
    animationData: {},
    stop_catch: false,
    btn_width:200,
    txtstyle:"left:0",
    L_index:"false",
    kongkong:false
  },


  onShow: function () {
    //创建动画实例
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 200,
      timingFunction: "ease",
    })
    this.animation = animation
  },

  onReady: function () {
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
    query.find().then(client_data => this.setData({ client_data}))
    query.count().then(count => {
      if(count==0){
        this.setData({kongkong:true})
      }
      this.setData({ count })
      wx.setNavigationBarTitle({
        title: "客户库（总" + count + "）"
      })
    }
    ).then(wx.hideLoading())
  },


  //上传商品入口
  upload: function () {
    public_fn.public_fn.stop_catch(this)
    this.animation.scale(1.1).step()
    this.animation.scale(1).step()
    this.setData({ animationData_upload: this.animation.export() })
    wx.navigateTo({
      url: 'client_upload/client_upload',
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
        }) 
    }
  },

  touchM:function(event){
    if(event.touches.length==1){
      var moveX = event.touches[0].clientX;
      var disX = moveX - this.data.starX 
      var client_data = this.data.client_data
      var btn_width = this.data.btn_width
      var txtstyle=this.data.txtstyle
      
      //若距离大于0，每次移动都要做次更新
     if(disX<0){
        txtstyle = disX
        //最大距离为删除按键的宽度
        if (-disX >= btn_width){
          txtstyle = -btn_width
        }
      }
    //向右移回
     else if (disX > 0 && txtstyle!=0){
       txtstyle = -btn_width + disX
       if (disX >= btn_width){
         txtstyle = 0
       }
    }
    var index = event.currentTarget.dataset.arrId
    client_data[index].attributes.txtstyle = txtstyle
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
    if (skip == this.data.count)
    {
      wx.hideLoading()
      wx.showToast({
        title: '没有咯',
        duration:2000,
        image:"/image/icon/warn.png"
      })
      
    }
    else{
      var query = new AV.Query("client")
      //按创造时间降序排列
      query.descending('createdAt');
      query.limit(2)
      query.skip(skip)
      //需要用箭头函数去忽视this的影响,处理函数写在{}中
      query.find().then(res => {
        var client_data = this.data.client_data.concat(res)
        this.setData({ client_data })
      }).then(wx.hideLoading())
    }
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

  //数据为空的上传
  upload_kong: function () {
    wx.navigateTo({
      url: 'client_upload/client_upload',
    })
  },

  //仓库页
  warehouse: function () {
    wx.switchTab({
      url: '/warehouse/warehouse',
    })
  },

  // 客户卡片
  client_add:function(){
    wx.showShareMenu({
      
    })
    // // 获取用户授权
    // wx.authorize({
    //   scope: 'scope.address',
    //   success:(res=>{
    //     // 用户填写地址接口
    //     wx.chooseAddress({
    //       success:(res=>console.log(res))
    //     })
    //   })
    // })
  },

  onShareAppMessage:function(res){
    if(res.from=="button"){
      console.log(res)
    }
    return {
      title:"转发标题",
      path: "/pages/guide",
      success:(res=>console.log(res))
    }
  }

})


