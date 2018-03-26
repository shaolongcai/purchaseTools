// pages/upload/modify/modify.js
const AV = require("../../../utils/av-webapp-min.js")
const goods = require("../../../model/goods-model.js")
var public_fn = require("../../../utils/fn.js")

Page({

  data: {
      textarea: "在此输入简介",
      imgUrl:["/image/icon/chose_img2.png"]
  },

  onLoad:function(option){
    this.setData({
      choose_id:option.choose_id
    })
  },

  //获取图片
  getImage:function(){
    var that = this
    wx.chooseImage({
      count:1,
      success:function(res){
        //批量上传
        var imgUrl = res.tempFilePaths
        that.setData({imgUrl})
      }
      })
  },


  //添加数据到lendcloud上
 bindsubmit:function(event){
   var goods_from = event.detail.value
   var goods_name = event.detail.value.goods_name
   var goods_price = event.detail.value.goods_price
   var goods_cost = event.detail.value.goods_cost
   var goods_brief = event.detail.value.goods_brief

   var v = public_fn.public_fn.check_from(goods_from)
  console.log(v)
   if (v=="stop" || this.data.imgUrl[0] =="/image/icon/chose_img2.png"){
     wx.showToast({
       title:"请输入完整信息",
       image:"/image/icon/warn.png",
       mask:true,
       duration:2000
     })
   }
   else{
     wx.showLoading({
       title: '正在上传中',
       mask: true
     })
     this.data.imgUrl.map(imgUrl => () => new AV.File('filename', {
      blob: {
        uri: imgUrl,
      },
    }).save()).reduce(
      (m, p) => m.then(v => AV.Promise.all([...v, p()])),
      AV.Promise.resolve([])
      //Arr.map()方法为每个数组中的元素都调用一次callback并返回结果。Arr.map(obj,callback),then()一定会最后执行
    ).then(
       //新增数据表
      files => 
      new goods({
      goods_name: goods_name,
      imgUrl: files.map(file => file.url()),
      price: goods_price,
      cost:goods_cost,
      brief:goods_brief
        }).save()
        //保存完后再跳转，then()只能链式调用
          .then(res=>{
            var choose_id=this.data.choose_id
            if(choose_id=="goods"){
              wx.reLaunch({
                url: '/record/record_upload/record_upload',
              })
            }
            else{
              wx.reLaunch({
                url: '/pages/goods_list/goods_list',
              })
            }
          }) 
      )
      .catch(console.error); 
   }
 },
  

  back: function(){
    wx.navigateBack({
    })
  }
 
 
})