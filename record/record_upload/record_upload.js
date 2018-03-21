// record/record_upload/record_upload.js
const AV = require("../../utils/av-webapp-min.js")
const order = require("../../model/order-model.js")
var public_fn = require("../../utils/fn.js")


Page({
  /**
   * 页面的初始数据
   */
  data: {
    goods_name: "选择商品：",
    client_name: "选择客户",
    goods_hidden: true,
    client_hidden: true,
    kongkong: false
  },

  //若是上传后回到上传订单页面的，则自动打开选择面板
  onLoad: function (option) {
    var user = AV.User.current()
  },

  choose_goods: function (event) {
    var choose_id = event.currentTarget.dataset.id
    this.setData({ choose_id })
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
    query.find().then(res => public_fn.public_fn.pocess(res, "goods_data", this, ""))
    query.count().then(count => {
      this.setData({
        goods_hidden: false,
        count: count
      })
      wx.setNavigationBarTitle({
        title: "选择商品（总" + count + "）"
      })
      if (count == 0) { this.setData({ kongkong: true }) }
    }
    ).then(wx.hideLoading())
  },

  choose_client: function () {
    wx.showLoading({
      title: '读取数据中',
      mask: true
    })
    var query = new AV.Query("client")
    query.descending('createdAt');
    query.limit(10)
    query.find().then(res => this.setData({ client_data: res }))
    query.count().then(count => {
      this.setData({
        client_hidden: false,
        count: count
      })
      wx.setNavigationBarTitle({
        title: "选择客户（总" + count + "）"
      })
      if (count == 0) { this.setData({ kongkong: true }) }
    }
    ).then(wx.hideLoading())
  },

  //提交
  bindsubmit: function (event) {

    let order_info = event.detail.value
    console.log(order_info)
    if (this.data.goods_objId != undefined && this.data.client_objId != undefined && order_info.goods_num!="" ) {
      new order({
        goods_objId: this.data.goods_objId,
        goods_name: this.data.goods_name,
        client_name: this.data.client_name,
        client_objId: this.data.client_objId,
        goods_num: order_info.goods_num,
        pay_state: order_info.pay_state
      }).save()
        // .setACL(acl)
        //保存完后再跳转，then()只能链式调用
        .then(wx.reLaunch({
          url: '/record/record',
        }))
        .catch(console.error);
    }
    else{
      wx.showToast({
        title: "请输入完整信息",
        image: "/image/icon/warn.png",
        mask: true,
        duration: 1500
      })
    }
  },

  //选择商品
  onChoose_goods: function (event) {
    var arrId = event.currentTarget.dataset.arrId
    var objId = event.currentTarget.dataset.objId
    var goods_name = this.data.goods_data[arrId].attributes.goods_name
    this.setData({ 
      goods_objId: objId,
      goods_name: goods_name,
      goods_hidden: true
      })
  },

  //选择客户
  onChoose_client: function (event) {
    var arrId = event.currentTarget.dataset.arrId
    var objId = event.currentTarget.dataset.objId
    var client_name = this.data.client_data[arrId].attributes.client_name
    this.setData({ 
      client_objId: objId,
      client_name: client_name,
      client_hidden: true
      })
  },

  //更多商品
  more_goods: function () {
    var goods_data = this.data.goods_data
    var query = this.more(goods_data, "goods", this)
    //查询
    query.find().then(res => {
      var more_data = public_fn.public_fn.pocess(res, "goods_data", this, true)
      var data = goods_data.concat(more_data)
      this.setData({ goods_data: data })
    }).then(wx.hideLoading())
  },
  //更多客户信息
  more_client: function () {
    var client_data = this.data.client_data
    var query = this.more(client_data, "client", this)
    //查询
    query.find().then(res => {
      var data = client_data.concat(res)
      this.setData({ client_data: data })
    }
    ).then(wx.hideLoading())
  },


  // 封装请求数据库的函数,data_name为数据名，data_table为数据表名
  more: function (data_name, data_table, that) {
    wx.showLoading({
      title: '读取数据中',
      mask: true
    })
    var skip = data_name.length
    var count = that.data.count
    if (skip == count) {
      wx.showToast({
        title: '没有更多咯',
        image: "/image/icon/warn.png"
      })
    }
    else {
      var query = new AV.Query(data_table)
      //按创造时间降序排列
      query.descending('createdAt');
      query.limit(10)
      query.skip(skip)
      that.setData({ skip })
      return query
      //需要用箭头函数去忽视this的影响,处理函数写在{}中
    }
  },

  //没有数据时的上传按键
  upload_kong: function (event) {
    var choose_id = this.data.choose_id
    if (choose_id == "goods") {
      wx.navigateTo({
        url: '/pages/upload/modify/modify?choose_id=goods'
      })
    }
    else {
      wx.navigateTo({
        url: "/warehouse/client_warehouse/client_upload/client_upload?choose_id=client"
      })
    }
  },

  back: function () {
    wx.switchTab({
      url: '../record',
    })
  },

})