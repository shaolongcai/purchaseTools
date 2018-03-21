const AV = require("../utils/av-webapp-min")
class client extends AV.Object {}

//向SDK注册client表
AV.Object.register(client,"client")
module.exports = client