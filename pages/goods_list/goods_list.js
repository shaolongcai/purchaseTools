// pages/home.js
const AV = require("../../utils/av-webapp-min.js")
var public_fn = require("../../utils/fn.js")

Page({

  data: {
    onselect: [],
    onselect_arr: [],
    delete_operate: "",
    animationData: {},
    stop_catch: false,
    kongkong:false
  },

  onShow: function () {
    //创建动画实例
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 200,
      timingFunction: "ease",
    })
    //view动画,设定动画时长
    var animation_delete = wx.createAnimation({
      transformOrigin: "0% 50%",
      duration: 800,
      timingFunction: "ease",
    })
    this.animation = animation
    this.animation_delete = animation_delete
  },

  onLoad: function () {

  },

  onReady: function () {
    wx.showLoading({
      title: '读取数据中',
      mask: true
    })
    //继承goods表的属性
    var query = new AV.Query("goods")
    //按创造时间降序排列
    query.descending('createdAt');
    query.limit(10)
    //需要用箭头函数去忽视this的影响,处理函数写在{}中
    query.find().then(goods_data => this.pocess(goods_data, this, ""))
    query.count().then(count => {
      if(count==0){
        this.setData({kongkong:true})
      }
      this.setData({ count })
      wx.setNavigationBarTitle({
        title: "商品库（总" + count + "）"
      })
    }
    ).then(wx.hideLoading())
  },

  //处理名称长度的函数
  pocess: function (data, that, is_more) {
    var goods_data = that.data.goods_data
    for (var index in data) {
      var goods_name = data[index].attributes.goods_name
      if (goods_name.length > 7) {
        data[index].attributes.goods_name_change = goods_name.substring(0, 6) + "..."
      }
      else {
        data[index].attributes.goods_name_change = goods_name
      }
    }
    //第一次加载
    if (is_more == "") {
      that.setData({ goods_data: data })
    }
    else {
      //concat不会改变原来的数组
      var goods_data = goods_data.concat(data)
      that.setData({ goods_data })
    }

  },

  //上传商品入口
  upload: function () {
    public_fn.public_fn.stop_catch(this)
    this.animation.scale(1.1).step()
    this.animation.scale(1).step()
    this.setData({ animationData_upload: this.animation.export() })
    wx.navigateTo({
      url: '/pages/upload/modify/modify',
    })

  },

  //选择商品
  onselect: function (event) {
    var delete_operate = this.data.delete_operate
    //获取arrID用来删数组
    var goods_arr_id = event.currentTarget.dataset.arrId
    var goods_data = this.data.goods_data
    var goods = goods_data[goods_arr_id]

    //开启删除模式
    if (delete_operate == true) {
      //用来暂时储存被选中的数组
      var onselect = this.data.onselect
      var onselect_arr = this.data.onselect_arr
      //获取objID用来删数据库数据
      var goods_obj_id = event.currentTarget.dataset.objId

      //判断onchose的值
      if (goods.attributes.onchose == "true") {
        //移除被选择的arr_id和obj_id
        onselect.splice(onselect.indexOf(goods_obj_id), 1)
        this.setData({ onselect })
        onselect_arr.splice(onselect_arr.indexOf(goods_arr_id), 1)
        this.setData({ onselect_arr })
        //onchose属性取反
        goods.attributes.onchose = ""
        this.setData({ goods_data })
      }
      else if (onselect.length < 3) {
        onselect.push(goods_obj_id)
        this.setData({ onselect })
        onselect_arr.push(goods_arr_id)
        this.setData({ onselect_arr })
        //只有在attributes添加属性，才会在传给xml序列化时留下
        goods.attributes.onchose = "true"
        this.setData({ goods_data })
      }
    }

    else {
      wx.setStorage({
        key: 'goods_single',
        data: goods,
      })
      wx.navigateTo({
        url: 'goods-detail/goods-detail',
      })
    }

  },

  // 执行删除操作
  delete_btn: function () {
    var onselect = this.data.onselect
    var onselect_arr = this.data.onselect_arr

    if (onselect.length == 0) {
      wx.showToast({
        title: '请选择商品',
        image: "/image/icon/warn.png",
        mask: true,
        duration: 1000
      })
    }

    else {
      public_fn.public_fn.delete_post(this, onselect)
      //数组从大到小排列，保证删除的下标不变
      onselect_arr.sort(function (m, n) {
        return n - m
      })
      for (var i = 0; i < onselect_arr.length; i++) {
        this.data.goods_data.splice(onselect_arr[i], 1)
      }
      this.setData({ goods_data: this.data.goods_data })
      //改变BarTitle的计数器
      var count = this.data.count - onselect.length
      if (count == 0) {
        this.setData({ kongkong: true })
      }
      this.setData({count})
      wx.setNavigationBarTitle({
        title: "商品库（总" + count + "）"
      })

      //清空选择数组
      onselect = []
      this.setData({ onselect })
      onselect_arr = []
      this.setData({ onselect_arr })

      //退出删除模式
      var delete_operate = ""
      this.setData({ delete_operate })
      this.animation_delete.translateY(-10).step()
      this.setData({ animationData_delete: this.animation_delete.export() })
    }
  },


  //启动删除模式
  delete_model: function () {
    //开启删除模式
    var delete_operate = true
    this.setData({ delete_operate })
    //图片动画
    this.animation.scale(1.1).step()
    this.animation.scale(1).step()
    this.setData({ animationData: this.animation.export() })

    setTimeout(
      function () {
        this.animation_delete.translateY(100).step()
        this.setData({ animationData_delete: this.animation_delete.export() })
      }.bind(this), 500  //bing()方法可以将this或者其它参数传进调用bing()方法的函数里
    )
  },

  //取消删除模式
  delete_cancel: function () {
    this.animation_delete.translateY(-10).step()
    this.setData({ animationData_delete: this.animation_delete.export() })
    //取消删除模式
    var delete_operate = ""
    this.setData({ delete_operate })

    //清空选择的勾
    var onselect_arr = this.data.onselect_arr
    var goods_data = this.data.goods_data
    for (var index in onselect_arr) {
      goods_data[onselect_arr[index]].attributes.onchose = ""
    }
    this.setData({ goods_data })

    //清空选择数组
    onselect = []
    this.setData({ onselect })
    onselect_arr = []
    this.setData({ onselect_arr })
  },

  //查看更多
  more_goods: function () {
    wx.showLoading({
      title: '读取数据中',
      mask: true
    })
    var count=this.data.count
    var goods_data = this.data.goods_data
    var skip = goods_data.length

    if(count==goods_data.length){
      wx.showToast({
        title: '已经没有更多了',
        image: "/image/icon/warn.png"
      })
    }
    else{
      var query = new AV.Query("goods")
      //按创造时间降序排列
      query.descending('createdAt');
      query.limit(10)
      query.skip(skip)
      this.setData({ skip })
      //需要用箭头函数去忽视this的影响,处理函数写在{}中
      query.find().then(res => this.pocess(res, this, true)).then(wx.hideLoading())
    }
  },

  //空数据上传
  upload_kong:function(){
    wx.navigateTo({
      url: '/pages/upload/modify/modify',
    })
  },

 
})


