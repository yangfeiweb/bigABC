export default function (apiRoot) {
  return {
    GET_HOMEWORK_LIST: apiRoot + 'homework/list',
    GET_HOMEWORK_WORDS: apiRoot + 'homework/words',
    GET_HOMEWORK_TASK_INFO: apiRoot + 'task/infoForHomework',
    GET_REVIEW_TASK_INFO: apiRoot + 'task/infoForReview',
    GET_UNIT_TASK_INFO: apiRoot + 'task/info',
    POST_TASK_SCORE: apiRoot + 'task/score',
    GET_REVIEW_UNIT: apiRoot + 'review/query'
  }
}
