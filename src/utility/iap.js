// import router from '@/router/index'
import dataService from '@/service/index'
import { setTimeout } from 'timers'
// 缓存iap订单结果
export function setIapOrderInfo (
  orderNo,
  transactionDate,
  transactionIdentifier,
  transactionReceipt
) {
  let iapOrder = window.plus.storage.getItem('iapOrder')
  if (iapOrder) {
    iapOrder = JSON.parse(iapOrder)
    let orderItem = iapOrder.find(item => {
      return item.orderNo === orderNo
    })
    if (!orderItem) {
      iapOrder.push({
        orderNo: orderNo,
        transactionDate: transactionDate,
        transactionIdentifier: transactionIdentifier,
        transactionReceipt: transactionReceipt,
        status: -1,
        errTimes: 0
      })
    }
  } else {
    iapOrder = [
      {
        orderNo: orderNo,
        transactionDate: transactionDate,
        transactionIdentifier: transactionIdentifier,
        transactionReceipt: transactionReceipt,
        status: -1,
        errTimes: 0
      }
    ]
  }
  window.plus.storage.setItem('iapOrder', JSON.stringify(iapOrder))
}

// 缓存iap订单结果状态， 如果status状态为200 则移除该order
export function updateIapOrderStatus (orderNo, status, errTimes) {
  let iapOrder = window.plus.storage.getItem('iapOrder')
  if (iapOrder) {
    iapOrder = JSON.parse(iapOrder)
    let idx = -1
    let orderItem = iapOrder.find((item, itemIdx) => {
      if (item.orderNo === orderNo) {
        idx = itemIdx
        return true
      }
      return false
    })
    if (orderItem) {
      orderItem.status = status
      orderItem.errTimes = errTimes
      if (status === 200) {
        iapOrder.splice(idx, 1)
      }
      if (iapOrder.length === 0) {
        window.plus.storage.removeItem('iapOrder')
      } else {
        window.plus.storage.setItem('iapOrder', JSON.stringify(iapOrder))
      }
    //   if (status === 200 || status === 201) {
    //     router.push({ name: 'payResult', params: { orderNo: orderNo } })
    //   }
    }
  }
}
// 检查更新支付状态status
export function checkIapOrderStatus () {
  let osName = window.plus && window.plus.os.name
  if (osName && osName.toLowerCase() === 'ios') {
    let iapOrder = window.plus.storage.getItem('iapOrder')
    if (iapOrder) {
      iapOrder = JSON.parse(iapOrder)
      iapOrder.forEach(item => {
        let orderNo = item.orderNo
        let transactionDate = item.transactionDate
        let transactionIdentifier = item.transactionIdentifier
        let transactionReceipt = item.transactionReceipt
        let errTimes = item.errTimes
        let status = item.status
        postIapResult(
          orderNo,
          transactionDate,
          transactionIdentifier,
          transactionReceipt,
          errTimes,
          status
        )
      })
    }
  }
}
// 提交支付结果到后台
function postIapResult (
  orderNo,
  transactionDate,
  transactionIdentifier,
  transactionReceipt,
  errTimes,
  orderStatus
) {
  if (errTimes > 3) {
    if (orderStatus !== -1 && orderStatus !== 201) {
      removeIapOrderItem(orderNo)
    } else {
      // 提交失败或已提交无返回结果，重置
      updateIapOrderStatus(orderNo, orderStatus, 0)
    }
    return
  }
  dataService
    .postIapResult(
      orderNo,
      transactionDate,
      transactionIdentifier,
      transactionReceipt
    )
    .then(
      res => {
        let result = res.data
        let code = result.code
        let errTime = 0
        if (code !== 200 && code !== 201) {
          errTime = errTimes + 1
        }
        updateIapOrderStatus(orderNo, code, errTime)
      },
      () => {
        updateIapOrderStatus(orderNo, -1, errTimes++)
        setTimeout(() => {
          postIapResult(
            orderNo,
            transactionDate,
            transactionIdentifier,
            transactionReceipt,
            errTimes,
            orderStatus
          )
        }, 1500)
      }
    )
}
export function getIapOrder () {
  return window.plus.storage.getItem('iapOrder')
}

export function removeIapOrderItem (orderNo) {
  let iapOrder = window.plus.storage.getItem('iapOrder')
  if (iapOrder) {
    iapOrder = JSON.parse(iapOrder)
    let idx = iapOrder.findIndex(item => {
      return item.orderNo === orderNo
    })
    if (idx !== -1) {
      iapOrder.splice(idx, 1)
      if (iapOrder.length > 0) {
        window.plus.storage.setItem('iapOrder', JSON.stringify(iapOrder))
      } else {
        window.plus.storage.removeItem('iapOrder')
      }
    }
  }
}
