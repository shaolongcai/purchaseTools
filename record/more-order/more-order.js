// record/more-order/more-order.js
const AV = require("../../utils/av-webapp-min.js")
var public_fn = require("../../utils/fn.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    res_arr: [],
    date_arr: [],
    limit: 10,
    skip: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var pay_type = options.payId
    this.setData({ pay_type })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '加载中',
    })
    var pay_type = this.data.pay_type
    var limit = this.data.limit
    if (pay_type == "paid") {
      var paid = ["1", "2"]
      var query = new AV.Query("order")
      query.containsAll('pay_state', paid);
      query.limit(limit)
      query.descending('createdAt');
    }
    else {
      var postage = ["1"]
      var cost = ["2"]
      var postage_query = new AV.Query("order")
      postage_query.notContainedIn('pay_state', postage);
      var cost_query = new AV.Query("order")
      cost_query.notContainedIn('pay_state', cost);
      var query = AV.Query.or(postage_query, cost_query)
      query.limit(limit)
      query.descending('updatedAt');
    }

    query.find().then(res => {
      var res_arr = this.data.res_arr
      var date_arr = this.data.date_arr
      var At = res[0].createdAt.toLocaleDateString()
      //初始化arr，第一个数组
      var date_res = res[0]
      //处理名字方法
      this.pocess(date_res)
      var arr = [date_res]
      res_arr.push(arr)
      //初始化日期
      date_arr.push(At)

      //把某一属性归类的方法，归类成一个数组
      for (var i = 0; i < res.length; i++) {
        var At = res[i].createdAt.toLocaleDateString()
        var At_N = res[i + 1].createdAt.toLocaleDateString()
        var date_res = res[i]
        var date_res_N = res[i + 1]

        //处理名字方法
        this.pocess(date_res_N)

        //若相同时间，则放上一个数组
        if (At == At_N) {
          res_arr[res_arr.length - 1].push(date_res_N)
        }
        //不同时再设置新的arr，同时push上数组
        else {
          //新设订单数组,PUSH上去
          var arr = [date_res_N]
          res_arr.push(arr)
          //放上下一个时间
          date_arr.push(At_N)
        }
        this.setData({ res_arr })
        this.setData({ date_arr })
      }
    })
    query.count().then(count => {
      this.setData({ count })
      wx.setNavigationBarTitle({
        title: "查看全部（总" + count + "）"
      })
    }
    ).then(wx.hideLoading())

  },

  //   //查看更多
  more_order: function () {
    var pay_type = this.data.pay_type
    var skip = this.data.skip
    var limit = this.data.limit
    if (pay_type == "paid") {
      var paid = ["1", "2"]
      var query = new AV.Query("order")
      query.containsAll('pay_state', paid);
      query.limit(limit)
      query.skip(skip)
      query.descending('createdAt');
    }
    else {
      var postage = ["1"]
      var cost = ["2"]
      var postage_query = new AV.Query("order")
      postage_query.notContainedIn('pay_state', postage);
      var cost_query = new AV.Query("order")
      cost_query.notContainedIn('pay_state', cost);
      var query = AV.Query.or(postage_query, cost_query)
      query.limit(limit)
      query.skip(skip)
      query.descending('updatedAt');
    }
    if(skip>=this.data.count){
      wx.showToast({
        title: '没有更多啦',
        mask: true,
        image: "/image/icon/warn.png"
      })
    }
    else{
      skip = skip + limit
      this.setData({ skip })
      query.find().then(res => {
          var date_arr = this.data.date_arr
          var res_arr = this.data.res_arr
          //判断是否等于上一个日期
          var At = res[0].createdAt.toLocaleDateString()
          var At_last = date_arr[date_arr.length - 1]
          var date_res = res[0]
          this.pocess(date_res)
          if (At == At_last) {
            res_arr[res_arr.length - 1].push(date_res)
          }
          else {
            var arr = [date_res]
            res_arr.push(arr)
            date_arr.push(At)
          }
          //当只有一项时，不会再进入循环
          this.setData({ res_arr })
          this.setData({ date_arr })

          for (var i = 0; i < res.length; i++) {
            var At = res[i].createdAt.toLocaleDateString()
            var At_N = res[i + 1].createdAt.toLocaleDateString()
            var date_res = res[i]
            var date_res_N = res[i + 1]
            this.pocess(date_res_N)
            //若相同时间，则放上一个数组
            if (At == At_N) {
              res_arr[res_arr.length - 1].push(date_res_N)
            }
            //不同时再设置新的arr，同时push上数组
            else {
              //新设订单数组,PUSH上去
              var arr = [date_res_N]
              res_arr.push(arr)
              //放上下一个时间
              date_arr.push(At_N)
            }
            this.setData({ res_arr })
            this.setData({ date_arr })
          }
      })
    }
  },

  //查看详情
  detail: function (event) {
    var goods_objId = event.currentTarget.dataset.objid
    var order_objId = event.currentTarget.dataset.orderid
    wx.navigateTo({
      url: '../order_detail/order_detail?goods_objId=' + goods_objId + "&order_objId=" + order_objId
    })
  },

  //处理名字
  pocess: function (data) {
    var goods_name = data.attributes.goods_name
    if (goods_name.length > 8) {
      data.attributes.goods_name_change = goods_name.substring(0, 8) + "..."
    }
    else {
      data.attributes.goods_name_change = goods_name
    }
  }

})