import dataService from '@/service/index'
import { GRADE_LABEL, GRADE_PART, DEFAULT_HEAD_IMG_URL } from '@/utility/dict'
import utility from '@/utility/utility'
import { resourcePath } from '@/service/urlConfig'
import { clearCache, installPkg } from '@/utility/io'

const state = {
  pressCode: '',
  pressList: [],
  currGradeId: null,
  currUnitId: null,
  gradeList: [],
  assistGradeList: [], // 辅助的课程列表,主要在选择课程页面使用 为了避免在选择出版社时，出现数据紊乱
  scoreRankings: [],
  unreadMsgs: '',
  cachedId: '',
  showTouristTipDialog: false
}

const getters = {
  getGradeList: state => state.gradeList,
  getCurrGradeId: state =>
    state.currGradeId || utility.getStorageNumId('currGradeId'),
  getSelectedGradeId: state =>
    state.selectedGradeId || utility.getStorageNumId('selectedGradeId'),
  getUnitList: state => id => {
    let grade = state.gradeList.find(val => val.id === id)
    if (grade) {
      return grade.unitList
    }
  },
  getCurrUnitId: state =>
    state.currUnitId || utility.getStorageNumId('currUnitId'),
  currGradeInfo: (state, getters) => {
    return state.gradeList.find(item => {
      return item.id === getters.getCurrGradeId
    })
  },
  currUnitInfo: (state, getters) => {
    let unitList = getters.currUnitList
    let currUnitId = getters.getCurrUnitId
    return (
      unitList &&
      unitList.find(unit => {
        return unit.id === currUnitId
      })
    )
  },
  showTouristTipDialog: state => state.showTouristTipDialog,
  currUnitList: (state, getters) => getters.getUnitList(getters.getCurrGradeId),
  scoreRankings: state => state.scoreRankings,
  unreadMsgs: state => state.unreadMsgs,
  cachedId: state => state.cachedId,
  getPressCode: state => state.pressCode,
  getPressList: state => state.pressList,
  assistGradeList: state => state.assistGradeList
}

const actions = {
  getPressList ({ commit }) {
    return new Promise((resolve, reject) => {
      dataService.getPressList().then(
        res => {
          let result = res.data
          let code = result.code
          let lists = result.data
          if (code === 200) {
            lists.forEach(item => {
              item.coverImg = resourcePath + item.coverImg
            })
            commit('setPressList', lists)
            resolve(lists)
          } else {
            reject(code)
          }
        },
        err => {
          reject(err)
        }
      )
    })
  },
  getGradeList ({ dispatch, commit, state }, code) {
    let pressCode = code || state.pressCode
    return new Promise((resolve, reject) => {
      dataService.getGradeList(pressCode).then(
        res => {
          let resultData = res.data
          let resultCode = resultData.code
          let data = resultData.data
          let msg = resultData.msg
          if (resultCode === 200) {
            let gradeList = data.map(val => {
              val.label = GRADE_LABEL[val.grade] + GRADE_PART[val.gradeTime]
              val.unitList.sort((a, b) => a.unitValue - b.unitValue)
              return val
            })
            commit('setAssistGradeList', gradeList) // 设置课程列表
            if (!code) {
              commit('setGradeList')
            }
            resolve(gradeList)
          } else {
            reject(msg)
          }
        },
        err => {
          reject(err)
        }
      )
    })
  },
  getScoreRankings (context) {
    return new Promise((resolve, reject) => {
      let currUnitId = context.getters.getCurrUnitId
      currUnitId &&
        dataService.getScoreRanking(currUnitId).then(
          res => {
            let result = res.data
            let code = result.code
            let msg = result.msg
            if (code === 200) {
              let data = result.data
              if (data) {
                data.forEach(item => {
                  let icon = item.icon
                  if (icon) {
                    item.icon = resourcePath + icon
                  } else {
                    item.icon = DEFAULT_HEAD_IMG_URL
                  }
                })
                context.commit('setScoreRanking', data)
              }
              resolve()
            } else {
              reject(msg)
            }
          },
          err => {
            reject(err)
          }
        )
    })
  },
  getUnreadMsgs (context) {
    dataService.getUnreadMsgCount().then(res => {
      let result = res.data
      if (result && result.data) {
        let count = result.data.unReads || 0
        context.commit('setUnreadMsgCount', count)
      }
    })
  },
  checkVersion (context) {
    console.log('------check version...')
    return new Promise((resolve, reject) => {
      let plus = window.plus
      if (plus && plus.os.name.toLowerCase() === 'android') {
        plus.nativeUI.showWaiting('检测更新...')
        let forceClearCache = false
        dataService.checkVersion('ANDROID').then(
          res => {
            let result = res.data
            plus.nativeUI.closeWaiting()
            if (result) {
              let code = result.code
              if (code === 200) {
                let data = result.data
                let needUpdate = data.needUpdate
                if (needUpdate === 'Y') {
                  let versionInfo = data.version
                  let version = versionInfo.version
                  let forceUpdate = versionInfo.forceUpdate
                  let downloadUrl = versionInfo.downloadUrl
                  let content = versionInfo.content
                  if (forceUpdate === 'Y' && downloadUrl) {
                    plus.nativeUI.confirm(
                      `${content} 是否现在更新？`,
                      function (e) {
                        var i = e.index
                        if (i === 0) {
                          let wgtWaiting = plus.nativeUI.showWaiting(
                            `新版本${version}更新中...`
                          )
                          let downloader = plus.downloader.createDownload(
                            downloadUrl,
                            {
                              filename: '_doc/update/'
                            },
                            function (d, status) {
                              console.log('------download package..ok.')
                              if (status === 200) {
                                if (forceClearCache) {
                                  clearCache('_downloads/').then(
                                    success => {
                                      installPkg(d.filename).then(
                                        res => {
                                          resolve()
                                        },
                                        () => {
                                          resolve()
                                        }
                                      )
                                    },
                                    () => {
                                      installPkg(d.filename).then(
                                        res => {
                                          resolve()
                                        },
                                        () => {
                                          resolve()
                                        }
                                      )
                                    }
                                  )
                                } else {
                                  installPkg(d.filename).then(
                                    res => {
                                      resolve()
                                    },
                                    () => {
                                      resolve()
                                    }
                                  )
                                }
                              } else {
                                plus.nativeUI.alert('下载失败！')
                              }
                              plus.nativeUI.closeWaiting()
                            }
                          )
                          downloader.addEventListener('statechanged', function (
                            download,
                            status
                          ) {
                            switch (download.state) {
                              case 2:
                                wgtWaiting.setTitle(`新版本${version}更新中`)
                                break
                              case 3:
                                var percent =
                                  download.downloadedSize /
                                  download.totalSize *
                                  100
                                let p = parseInt(percent)
                                let title = `更新到V${version}中...${p}%`
                                wgtWaiting.setTitle(title)
                                break
                              case 4:
                                wgtWaiting.setTitle('下载完成！')
                                break
                            }
                          })
                          downloader.start()
                        } else {
                          plus.runtime.quit()
                        }
                      },
                      `检测到新版本：${version}`,
                      ['是', '否']
                    )
                  } else {
                    resolve()
                  }
                } else {
                  resolve()
                }
              } else {
                reject(result)
              }
            }
          },
          err => {
            plus.nativeUI.closeWaiting()
            reject(err)
          }
        )
      } else {
        resolve()
      }
    })
  }
}

const mutations = {
  setPressCode (state, code) {
    console.log('*------------set press code', code)
    state.pressCode = code
  },
  setPressList (state, list) {
    console.log('*------------set press list', list)
    state.pressList = list
  },
  setAssistGradeList (state, gradeList) {
    state.assistGradeList = gradeList
  },
  setGradeList (state) {
    state.gradeList = state.assistGradeList
  },
  setCurrGradeId (state, id) {
    state.currGradeId = id
    utility.getStorage().setItem('currGradeId', id)
  },
  setCurrUnitId (state, id) {
    state.currUnitId = id
    utility.getStorage().setItem('currUnitId', id)
  },
  setScoreRanking (state, val) {
    state.scoreRankings = val
  },
  setUnreadMsgCount (state, val) {
    if (val) {
      state.unreadMsgs = val + ''
    } else {
      state.unreadMsgs = ''
    }
  },
  setCachedId (state, val) {
    console.log('-------------set cached id ' + val)
    state.cachedId = val
  },
  setTouristTipDialog (state, val) {
    state.showTouristTipDialog = val
  },
  clearCurrGradeInfo (state) {
    state.pressCode = ''
    state.currGradeId = ''
    state.currUnitId = ''
    state.pressList = []
    state.assistGradeList = []
    state.gradeList = []
    state.scoreRankings = []
    utility.getStorage().removeItem('currGradeId')
    utility.getStorage().removeItem('currUnitId')
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
