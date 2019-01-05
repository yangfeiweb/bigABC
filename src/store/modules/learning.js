import dataService from '@/service/index'
import { resourcePath } from '@/service/urlConfig'
import { TASK_SCORE_TYPE, FORGET_TASKS } from '@/utility/dict'
import utility from '@/utility/utility'
import _ from 'lodash'

const state = {
  unitWords: [],
  flowWords: [],
  flowType: TASK_SCORE_TYPE.unit,
  flowTask: [],
  flowId: '',
  flowTitle: '',
  currStepPart: 0,
  learningBack: false,
  isFirstUnit: false,
  forgetWrongWords: []
}

const getters = {
  unitWords: state => state.unitWords,
  flowTask: state => state.flowTask,
  flowWords: state => state.flowWords,
  currStepPart: state => state.currStepPart,
  currFlowStepWords: (state, getters) => {
    // return testWords;
    let words = getters.flowWords
    let currFlows = getters.flowTask
    let stepCount = 1
    let flowsCount = currFlows.length
    if (flowsCount === 19) {
      stepCount = 2
    } else if (flowsCount === 28) {
      stepCount = 3
    }
    if (stepCount > 1) {
      let currStep = getters.currStepPart
      let wordCount = words.length
      let perWords = Math.ceil(wordCount / stepCount)
      return words.slice(currStep * perWords, (currStep + 1) * perWords)
    } else {
      return words
    }
  },
  flowType: state => state.flowType,
  flowId: state => state.flowId,
  flowTitle: state => state.flowTitle,
  learningBack: state => state.learningBack,
  isFirstUnit: state =>
    state.isFirstUnit ||
    utility.convert2Boolean(utility.getStorage().getItem('isFirstUnit')),
  forgetWrongWords: state => state.forgetWrongWords
}

const actions = {
  getUnitWords ({ commit, state, dispatch }, currUnitId) {
    commit('clearUnitWords')
    return dataService.getUnitWords(currUnitId).then(res => {
      let result = res.data
      let code = result.code
      let unitWords = result.data
      console.log('------unitWords', unitWords)
      if (code === 200 && unitWords) {
        unitWords.forEach(word => {
          word.imgName = word.imgUrl
          word.voiceName = word.voiceUrl
          word.imgUrl = resourcePath + word.imgUrl
          word.voiceUrl = resourcePath + word.voiceUrl
          let statements = word.statements
          if (statements) {
            statements.forEach(item => {
              item.imgName = item.imgUrl
              item.voiceName = item.voiceUrl
              item.imgUrl = resourcePath + item.imgUrl
              item.voiceUrl = resourcePath + item.voiceUrl
            })
          }
        })
        commit('setUnitWords', unitWords)
        commit('setFlowWords', unitWords)
      }
    })
  },

  getUnitFlowTask ({ commit, state }, unitId) {
    return dataService.getUnitTaskInfo(unitId).then(res => {
      let resultData = res.data
      let code = resultData.code
      if (code === 200) {
        let flows = resultData.data
        commit('setFlowId', unitId)
        commit('setFlowTask', flows)
      }
    })
  },
  goUnitTask ({ commit, state, dispatch, getters }) {
    return new Promise(function (resolve, reject) {
      commit('setFlowType', TASK_SCORE_TYPE.unit)
      let unitId = getters.getCurrUnitId
      let unitlist = getters.currUnitList
      if (unitlist) {
        let unitIdx = unitlist.findIndex(item => {
          return item.id === unitId
        })
        if (unitIdx === 0) {
          commit('setFirstUnit', true)
        } else {
          commit('setFirstUnit', false)
        }
      }
      dispatch('getUnitFlowTask', unitId).then(
        res => {
          if (!state.unitWords || state.unitWords.length === 0) {
            dispatch('getUnitWords').then(
              success => {
                resolve()
              },
              err => {
                reject(err)
              }
            )
          } else {
            commit('setFlowWords', state.unitWords)
            resolve()
          }
        },
        err => {
          this.$store.commit('loading', false)
          reject(err)
        }
      )
    })
  },
  goHomeworkTask ({ commit, state, dispatch, rootGetters }, info) {
    return new Promise(function (resolve, reject) {
      let homeworkType = info.type
      let type = TASK_SCORE_TYPE.homeworkUnit
      if (homeworkType === 'BY_WORD') {
        type = TASK_SCORE_TYPE.homeworkWord
      }
      let homeworkId = info.id
      let pressCode = rootGetters.getPressCode
      commit('setFlowType', type)
      commit('setFlowId', homeworkId)
      dataService.getHomeworkTaskInfo(homeworkId, pressCode).then(
        res => {
          let resultData = res.data
          let code = resultData.code
          if (code === 200) {
            let flows = resultData.data
            commit('setFlowTask', flows)
            dataService.getHomeworkWords(homeworkId).then(
              res => {
                let wordsResult = res.data
                let code = wordsResult.code
                if (code === 200) {
                  let words = wordsResult.data
                  words.forEach(word => {
                    word.imgName = word.imgUrl
                    word.voiceName = word.voiceUrl
                    word.imgUrl = resourcePath + word.imgUrl
                    word.voiceUrl = resourcePath + word.voiceUrl
                    let statements = word.statements
                    if (statements) {
                      statements.forEach(item => {
                        item.imgName = item.imgUrl
                        item.voiceName = item.voiceUrl
                        item.imgUrl = resourcePath + item.imgUrl
                        item.voiceUrl = resourcePath + item.voiceUrl
                      })
                    }
                  })
                  commit('setFlowWords', words)
                  resolve()
                } else {
                  // 作业已完成
                  reject(wordsResult.msg)
                }
              },
              err => {
                let errResult = err.data
                reject(errResult.msg)
              }
            )
          } else {
            reject(resultData.msg)
          }
        },
        err => {
          let errResult = err.data
          reject(errResult.msg)
        }
      )
    })
  },
  goReviewTask ({ commit, state, dispatch }, { reviewId, reviewUnitId }) {
    console.log('reviewId', reviewId)
    console.log('reviewUnitId', reviewUnitId)
    return new Promise(function (resolve, reject) {
      commit('setFlowType', TASK_SCORE_TYPE.reviewUnit)
      commit('setFlowId', reviewId)
      dataService.getReviewTaskInfo(reviewId).then(
        res => {
          let resultData = res.data
          let code = resultData.code
          if (code === 200) {
            let flows = resultData.data
            commit('setFlowTask', flows)
            dataService.getUnitWords(reviewUnitId).then(
              res => {
                let wordsResult = res.data
                let code = wordsResult.code
                if (code === 200) {
                  let words = wordsResult.data
                  words.forEach(word => {
                    word.imgName = word.imgUrl
                    word.voiceName = word.voiceUrl
                    word.imgUrl = resourcePath + word.imgUrl
                    word.voiceUrl = resourcePath + word.voiceUrl
                    let statements = word.statements
                    if (statements) {
                      statements.forEach(item => {
                        item.imgName = item.imgUrl
                        item.voiceName = item.voiceUrl
                        item.imgUrl = resourcePath + item.imgUrl
                        item.voiceUrl = resourcePath + item.voiceUrl
                      })
                    }
                  })
                  commit('setFlowWords', words)
                  resolve()
                } else {
                  reject(wordsResult.msg)
                }
              },
              err => {
                let errResult = err.data
                reject(errResult.msg)
              }
            )
          } else {
            reject(resultData.msg)
          }
        },
        err => {
          let errResult = err.data
          reject(errResult.msg)
        }
      )
    })
  },
  goForgetTask (context, words) {
    context.commit('setFlowWords', words)
    context.commit('setFlowTitle', '生词本学习')
    context.commit('setFlowType', TASK_SCORE_TYPE.forgetWords)
    context.commit('setFlowTask', _.cloneDeep(FORGET_TASKS))
  }
}

const mutations = {
  setFlowTask (state, val) {
    state.flowTask = val
  },
  updateFlowStepTask (state, val) {
    let flows = state.flowTask
    if (flows) {
      let taskNo = val.taskNo
      flows.forEach(item => {
        if (item.taskNo === taskNo) {
          if (item.playDays != null) {
            item.playDays = val.playDays
          }
          if (item.played != null) {
            item.played = val.played
          }
        }
      })
    }
  },
  setFlowWords (state, val) {
    // console.log('-----commit...setFlowWords...' + JSON.stringify(val))
    state.flowWords = val
  },
  setLearningBack (state, val) {
    state.learningBack = val
  },
  setFlowId (state, val) {
    state.flowId = val
  },
  setFlowTitle (state, val) {
    state.flowTitle = val
  },
  setFlowType (state, val) {
    state.flowType = val
  },
  setUnitWords (state, val) {
    state.unitWords = val
  },
  clearUnitWords (state) {
    state.unitWords = []
  },
  setCurrStepPart (state, val) {
    console.log('------setCurrStepPart ', val)
    state.currStepPart = val
  },
  setFirstUnit (state, val) {
    state.isFirstUnit = val
    utility.getStorage().setItem('isFirstUnit', val)
  },
  setForgetWrongWrods (state, val) {
    state.forgetWrongWords = val
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
