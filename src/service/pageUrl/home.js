export default function (apiRoot) {
  return {
    GET_PRESS_LIST: apiRoot + 'press/list',
    GET_GRADE_LIST: apiRoot + 'book/list',
    GET_UNIT_LIST: apiRoot + 'book/units',
    GET_UNIT_WORDS: apiRoot + 'unit/words',
    GET_FORGET_WORDS: apiRoot + 'wordNote/list',
    DEL_FORGET_WORD: apiRoot + 'wordNote/delete',
    MARK_FORGET_WORDS: apiRoot + 'wordNote/markPass',
    CHANGE_UNIT: apiRoot + 'changeUnit',
    JOIN_SCHOOL: apiRoot + 'joinSchool',
    SEND_INSTALL_DATA: apiRoot + 'promotion'
  }
}
