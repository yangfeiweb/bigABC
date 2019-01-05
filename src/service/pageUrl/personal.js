export default function (apiRoot) {
  return {
    GET_LEARNR_ECORD: apiRoot + 'learn/records', // 学习记录
    POST_USER_IMG: apiRoot + 'changeIcon', // 修改头像
    GET_INFO_DATA: apiRoot + 'info', // 获取用户基本信息
    LOGOUT: apiRoot + 'logout', // 退出登录
    POST_SIGN_DATA: apiRoot + 'sign/in', // 签到,
    GET_SIGN_INFOS: apiRoot + 'sign/info', // 签到,
    GET_SIGN_TOTAL: apiRoot + 'sign/total', // 签到,
    GET_SIGN_SERIALIN: apiRoot + 'sign/serialIn', //新版签到
    GET_SIGN_SERIALINFOS: apiRoot + 'sign/serialInfo', //新版查询信息
    UPDATE_USERINFO: apiRoot + 'update', // 更新用户信息
    GET_ACCOUNT_INFO: apiRoot + 'account/info', // 获取账户信息
    POST_PAYMENT_ORDER: apiRoot + 'order/create', // 创建订单
    QUERY_PAYMENT_ORDER: apiRoot + 'order/query', // 查询订单
    GET_ORDER_LIST: apiRoot + 'order/list', // 获取订单列表
    CHECK_VERSION: apiRoot + 'appVersion/queryUpdate', // 版本更新
    SUBMIT_SUGGESTION: apiRoot + 'suggestion/add', // 提交建议
    GET_PRODUCT_LIST: apiRoot + 'product/list' // 查询产品信息
  }
}
