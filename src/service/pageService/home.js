import reqUrl from '../urlConfig'
import fetch from '@/utility/http'

let getPressList = () => fetch(reqUrl.GET_PRESS_LIST, {})
// 年级课程信息
let getGradeList = pressCode =>
  fetch(reqUrl.GET_GRADE_LIST, {
    pressCode: pressCode
  })

// 课本单元信息
let getUnitData = bookId =>
  fetch(reqUrl.GET_UNIT_LIST, {
    bookId: bookId
  })

// 修改单元信息
let changeUnit = unitId =>
  fetch(
    reqUrl.CHANGE_UNIT,
    {
      unitId: unitId
    },
    'POST'
  )
// 查询单元单词
let getUnitWords = unitId =>
  fetch(reqUrl.GET_UNIT_WORDS, {
    unitId: unitId
  })

// 查询生词本单词
let getForgetList = (page, size) =>
  fetch(reqUrl.GET_FORGET_WORDS, {
    page: page,
    size: size
  })

// 删除生词本中的单词
let delForgetWord = wordNoteId =>
  fetch(
    reqUrl.DEL_FORGET_WORD,
    {
      wordNoteId: wordNoteId
    },
    'POST'
  )

// 标记生词本中的单词可移除
let markForgetPassedWords = wordIds =>
  fetch(
    reqUrl.MARK_FORGET_WORDS,
    {
      wordIds: wordIds
    },
    'POST'
  )
// 加入校区
let joinSchool = schoolNo =>
  fetch(
    reqUrl.JOIN_SCHOOL,
    {
      schoolNo: schoolNo
    },
    'POST'
  )

let buildPromotion = uid =>
  fetch(
    reqUrl.SEND_INSTALL_DATA,
    {
      uid: uid
    },
    'POST'
  )

export default {
  getPressList,
  getGradeList,
  getUnitData,
  getUnitWords,
  getForgetList,
  delForgetWord,
  markForgetPassedWords,
  changeUnit,
  joinSchool,
  buildPromotion
}
