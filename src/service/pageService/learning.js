import reqUrl from '../urlConfig'
import fetch from '@/utility/http'
import {TASK_SCORE_TYPE } from '@/utility/dict'

// 查询作业列表
let getHomeworkList = (page = 0, size = 10) =>
  fetch(reqUrl.GET_HOMEWORK_LIST, {
    page: page,
    size: size
  })

// 查询作业单词列表
let getHomeworkWords = homeworkId =>
  fetch(
    reqUrl.GET_HOMEWORK_WORDS,
    {
      homeworkId: homeworkId
    },
    'POST'
  )

// 获取作业任务信息
let getHomeworkTaskInfo = (homeworkId, pressCode,taskNo) =>
  fetch(reqUrl.GET_HOMEWORK_TASK_INFO, {
    homeworkId: homeworkId,
    pressCode: pressCode,
    taskNo: taskNo
  })

// 获取单元任务信息
let getUnitTaskInfo = (unitId, taskNo) =>
  fetch(reqUrl.GET_UNIT_TASK_INFO, {
    unitId: unitId,
    taskNo: taskNo
  })

// 任务打分
let sendTaskScore = (taskNo, wrongWordIds, time, scoreType, score, id, pressCode) =>
  fetch(
    reqUrl.POST_TASK_SCORE,
    {
      taskNo: taskNo,
      wrongWordIds: wrongWordIds,
      time: time,
      score: score,
      scoreType: scoreType,
      unitId: scoreType === TASK_SCORE_TYPE.unit ? id : '',
      homeworkId: (scoreType === TASK_SCORE_TYPE.homeworkUnit || scoreType === TASK_SCORE_TYPE.homeworkWord) ? id : '',
      reviewId: scoreType === TASK_SCORE_TYPE.reviewUnit ? id : '',
      pressCode: pressCode
    },
    'POST'
  )

// 获取要复习的单元
let getReviewUint = () => fetch(reqUrl.GET_REVIEW_UNIT)

// 获取复习任务信息
let getReviewTaskInfo = (reviewId, taskNo) =>
  fetch(reqUrl.GET_REVIEW_TASK_INFO, {
    reviewId: reviewId,
    taskNo: taskNo
  })

export default {
  getHomeworkList,
  getHomeworkWords,
  getHomeworkTaskInfo,
  getUnitTaskInfo,
  sendTaskScore,
  getReviewUint,
  getReviewTaskInfo
}
