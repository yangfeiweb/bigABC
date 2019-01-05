/**
 * 1. 测试请求返回数据
 * @url /getTestData
 *
 */
var utility = require("../utility");
const applyList = [
  {
    id: 1,
    name: "模块一"
  },
  {
    id: 2,
    name: "模块二"
  },
  {
    id: 3,
    name: "模块三"
  },
  {
    id: 4,
    name: "模块四"
  },
  {
    id: 5,
    name: "模块五"
  }
];

module.exports = utility.createDummayData(applyList);
