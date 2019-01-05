export default function (apiRoot) {
  return {
    // 信息
    GET_MESSAGE_ECORD: apiRoot + 'message/list',
    GET_UN_READ_MSG_COUNT: apiRoot + 'message/unReads',
    MARK_READED_MSG: apiRoot + 'message/mark'
  }
}
