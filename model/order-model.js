const AV = require("../utils/av-webapp-min")
class order extends AV.Object { }

//向SDK注册order表
AV.Object.register(order,"order")
module.exports = order