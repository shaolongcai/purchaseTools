const AV = require("../utils/av-webapp-min")
class goods extends AV.Object{}

//向SDK注册goods表
AV.Object.register(goods,"goods")
module.exports = goods