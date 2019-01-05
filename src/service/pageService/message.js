import reqUrl from '../urlConfig'
import fetch from '@/utility/http'

// 信息
let getMessage = (page, size, messageType) =>
  fetch(
    reqUrl.GET_MESSAGE_ECORD,
    {
      page: page,
      size: size,
      messageType: messageType
    },
    'GET'
  )

  // 获取未读消息数量
let getUnreadMsgCount = () =>
  fetch(reqUrl.GET_UN_READ_MSG_COUNT, {
    messageType: 'MESSAGE'
  })

// 标记已读消息
let markReadedMsg = ids =>
  fetch(
    reqUrl.MARK_READED_MSG,
    {
      markType: 'READ',
      ids: ids
    },
    'POST'
  )

// 删除消息
let deleteMsg = ids =>
  fetch(
    reqUrl.MARK_READED_MSG,
    {
      markType: 'DELETE',
      ids: ids
    },
    'POST'
  )

export default { getMessage, getUnreadMsgCount, markReadedMsg, deleteMsg }
