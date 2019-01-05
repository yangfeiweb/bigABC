import reqUrl from '../urlConfig'
import fetch from '@/utility/http'
import { PAYMENT_TYPE, VERSION_CODE, VIP_PRODUCT_TYPE } from '@/utility/dict'

let postUserImg = file => {
  return fetch(reqUrl.POST_USER_IMG, {
    file: file
  }, 'POST')
}

let getUserInfo = () => fetch(reqUrl.GET_INFO_DATA, {})

let signData = () => fetch(reqUrl.POST_SIGN_DATA, {}, 'POST')
// 查询学习记录
let getLearnRecord = (grade, gradeTime) => fetch(reqUrl.GET_LEARNR_ECORD, {
  grade: grade,
  gradeTime: gradeTime
})
let updatedUserInfo = (nickname, realName, gender) => fetch(
  reqUrl.UPDATE_USERINFO,
  {
    nickname: nickname,
    name: realName,
    gender: gender
  },
  'POST'
)
// 账户信息查询
let getAccountInfo = () => fetch(reqUrl.GET_ACCOUNT_INFO, {})

// 查询签到总天数
let getSignedTotal = () => fetch(reqUrl.GET_SIGN_TOTAL)

// 查询签到信息
let getSignInfos = month => fetch(reqUrl.GET_SIGN_INFOS, {
  month: month || ''
})

//新版签到
let signSerialIn = () => fetch(reqUrl.GET_SIGN_SERIALIN, {}, 'POST')
//新版查询签到信息
let getSerialInfos = () => fetch(reqUrl.GET_SIGN_SERIALINFOS)

// 提交签到信息
let postSignData = () => fetch(reqUrl.POST_SIGN_DATA, {}, 'POST')

// 提交支付订单
let postPaymentOrder = (productNo, chargeStyle) => fetch(
  reqUrl.POST_PAYMENT_ORDER,
  {
    productNo: productNo,
    chargeStyle: chargeStyle,
    tradeType: PAYMENT_TYPE[chargeStyle]
  },
  'POST'
)
// 查询订单状态
let queryPaymentOrder = orderNo => fetch(reqUrl.QUERY_PAYMENT_ORDER, {
  orderNo: orderNo
})

// 查询订单列表
let getOrderList = (pageIdx = 0, pageSize = 20) => fetch(reqUrl.GET_ORDER_LIST, {
  page: pageIdx,
  size: pageSize
})
// 检查版本信息
let checkVersion = (osType) => fetch(reqUrl.CHECK_VERSION, {
  osType: osType,
  versionCode: VERSION_CODE
})

// 提交建议
let submitSuggestion = (val, osType) => fetch(
  reqUrl.SUBMIT_SUGGESTION,
  {
    osType: osType,
    content: val
  },
  'POST'
)

// 获得VIP列表
let getVipProductList = publishType => fetch(reqUrl.GET_PRODUCT_LIST, {
  productType: VIP_PRODUCT_TYPE,
  publishType: publishType
})

export default {
  updatedUserInfo,
  postUserImg,
  getUserInfo,
  signData,
  getLearnRecord,
  getAccountInfo,
  getSignedTotal,
  getSignInfos,
  postSignData,
  postPaymentOrder,
  queryPaymentOrder,
  getOrderList,
  checkVersion,
  submitSuggestion,
  getVipProductList,
  signSerialIn,
  getSerialInfos
}
