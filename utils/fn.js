const AV = require("../utils/av-webapp-min.js")
const goods = require("../model/goods-model.js")

var public_fn = {
  delete_post: function (that, onselect) {
    for (var inde in onselect) {
      var goods_id = onselect[inde]
      //创建查询实例，查询对应objId的imgUrl，通过查询回来的实例，拿到imgUrl，然后再删除图片
      var query = new AV.Query("goods")
      query.get(goods_id).then((goods) => {
        //删除数据库字段的操作要在查询后，不然删掉后查询不到实例
        var id = goods.id
        var goods_data = AV.Object.createWithoutData('goods', id);
        goods_data.destroy().then();
        //字符串查询后，获取文件objid，然后进行循环删除
        var imgUrl = goods.attributes.imgUrl
        for (var index in imgUrl) {
          var img_key = imgUrl[index].split("/")
          var query = new AV.Query('_File');
          //将URL拆分后，第三个就是key，查询key
          query.contains('key', img_key[3])
          query.find().then(
            //查询后，获取图片实例的ID，进行删除（总是查询完所有实例后，才删除）
            function (res) {
              var img = AV.File.createWithoutData(res[0].id);
              img.destroy().then();
            }
          )
        }
      })
    }
    //删除数据库数据
  },

  add_post: function () {
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
          goods_name: this.data.name,
          imgUrl: files.map(file => file.url()),
          price: this.data.price,
        }).save()
          //保存完后再跳转，then()只能链式调用
          .then(wx.redirectTo({
            url: '/pages/home',
          }))
      ).catch(console.error);
  },

  //阻止用户多次点击的函数
  stop_catch: function (that) {
    that.setData({
      stop_catch:true
    })
    setTimeout(function(){
      that.setData({
        stop_catch:false
      })
    },800)
   },

  //处理函数 data:请求结果，that:this,is_more是否请求更多，bing_name:页面的绑定的对象名称,!记得加双引号
  pocess: function (data,bing_name,that,is_more) {
    var page_bing={}
    for (var index in data) {
      var goods_name = data[index].attributes.goods_name
      if (goods_name.length > 8) {
        data[index].attributes.goods_name_change = goods_name.substring(0, 8) + "..."
      }
      else {
        data[index].attributes.goods_name_change = goods_name
      }
    }

    //第一次加载
    if(is_more=="") {
      page_bing[bing_name]=data
      that.setData(page_bing)
    }
    else if (data == "") {
      return 0
    }
    else {
      return data
    }
   wx.hideLoading()
  },

  //检查填写的完整性,表格中的每一项
  check_from: function (submit_from) {
    for (var value in submit_from) {
      if (submit_from[value] == "") {
        wx.showToast({
          title: "请输入完整信息",
          image: "/image/icon/warn.png",
          mask: true,
          duration: 1500
        })
        //一有空值，立即停止
        return "stop"
      }
    }
  },
}

module.exports = {
  public_fn: public_fn
}

 //删除文件
    // var img = AV.Object.createWithoutData(re[0].id);
    // img.destroy().then(function (success) {
    //   console.log(img)
    // }, function (error) {  //then后输出的是删除的那个ID

    // });

        //关联数据
    // var file = new AV.Object('_File')
    // var re_data = AV.Object.createWithoutData('goods', '5a4f304444d904006eac92e2')
    // file.set('targetdata', re_data);
    // file.save()
    // console.log(re_data)

    //文件关联
    // var file = AV.File.withURL('test.jpg','http://ac-ygyswtag.clouddn.com/75a314e31efdfbad0036.jpg');
    // var goods = new AV.Object('goods');
    // goods.set('girl', file);
    // goods.save();
    // console.log(goods)