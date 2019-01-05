import reqUrl from '../urlConfig'
import fetch from '@/utility/http'

/**
 * 苹果支付成功后提交数据
 *
 * @param {any} username 订单编号
 * @param {any} transactionDate 交易时间
 * @param {any} transactionIdentifier 交易标识
 * @param {any} transactionReceipt 交易校验数据
 */
let postIapResult = (
  orderNo,
  transactionDate,
  transactionIdentifier,
  transactionReceipt
) =>
  fetch(
    reqUrl.POST_IAP_RESULT,
    {
      username: orderNo,
      transactionDate: transactionDate,
      transactionIdentifier: transactionIdentifier,
      transactionReceipt: transactionReceipt
    },
    'POST'
  )

export default {
  postIapResult
}
