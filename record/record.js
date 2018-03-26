// pages/record/record.js
const AV = require("../utils/av-webapp-min.js")
var public_fn = require("../utils/fn.js")

Page({

  data: {},

  onLoad:function(){
    //授权请求
    wx.authorize({
      scope: "scope.userInfo",
      success: (res => {
        wx.getUserInfo({
          success: (userInfo => {
            const user = AV.User.current();
            user.set(userInfo).save().then(user =>
              this.setData({ user })
            )
          })
        })
      })
    })
  },

  onReady: function () {
    wx.showLoading({
      title: '努力加载中!',
      mask:true
    })

    var that = this
    var paid = ["1","2"]
    var postage = ["1"] 
    var cost = ["2"] 
    //查询已全付款的商品
    var query = new AV.Query("order")
    query.containsAll('pay_state', paid);
    query.limit(3)
    query.descending('createdAt');
    query.find().then(res => public_fn.public_fn.pocess(res, "order_info_paid", this, ""))
   
    //查询未全付款的商品
    var postage_query = new AV.Query("order")
    postage_query.notContainedIn('pay_state', postage);
    var cost_query = new AV.Query("order")
    cost_query.notContainedIn('pay_state', cost);
    var query_or = AV.Query.or(postage_query, cost_query)
    query_or.limit(3)
    query_or.descending('updatedAt');
    query_or.find()
    .then(res =>public_fn.public_fn.pocess(res, "order_info_paying",this,""))
    //统计查询回来的未付款和已付款商品数
    query_or.count()
    .then(paying_count => query.count().then(paid_count => {
      //相加得到总数
      let all_pay_count = paying_count+paid_count
      this.setData({
        all_pay_count: all_pay_count,
        paying_count: paying_count
      })
    }))
  },

  //处理数据函数
  process: function(query_data,that){
    for(var index in query_data){
      var goods_name = query_data.goods_name[index]
      if(goods_name.length>2){
        goods_name = goods_name.substring(0,2) + "..."
      }
    }
  },

  detail:function(event){
    var goods_objId = event.currentTarget.dataset.goodsid
    var order_objId = event.currentTarget.dataset.orderid
    wx.navigateTo({
      url: 'order_detail/order_detail?goods_objId=' + goods_objId + "&order_objId=" + order_objId
    })
  },

  pay_more:function(event){
    var payId = event.currentTarget.dataset.payid
    wx.navigateTo({
      url: 'more-order/more-order?payId='+payId,
    })
  },

  upload_order:function(){
    wx.navigateTo({
      url: 'record_upload/record_upload',
    })
  },

})