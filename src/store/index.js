import Vue from 'vue'
import Vuex from 'vuex'
import learning from './modules/learning'
import common from './modules/common'
import personal from './modules/personal'
import dataService from '@/service/index'
import { NOT_JOINED_SCHOOL } from '@/utility/dict'
import utility from '@/utility/utility'
import { checkIapOrderStatus } from '@/utility/iap'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = {
  token: '',
  loading: false,
  tipsMsg: '',
  dialogShowing: false,
  dialogTips: '',
  vipTipDialog: false,
  tipsDialogShowing: false,
  plusReady: false,
  isGameing: false,
  switchBackground: false,
  tapAudioPlaying: false
}

const getters = {
  token: state => state.token || localStorage.getItem('token'),
  loading: state => state.loading,
  tipsMsg: state => state.tipsMsg,
  dialogShowing: state => state.dialogShowing,
  plusReady: state => state.plusReady,
  isGameing: state => state.isGameing,
  vipTipDialog: state => state.vipTipDialog,
  tipsDialogShowing: state => state.tipsDialogShowing,
  dialogTips: state => state.dialogTips,
  switchBackground: state => state.switchBackground,
  tapAudioPlaying: state => state.tapAudioPlaying
}

const actions = {
  login (context, { username, pwd, isTourist, captcha, captchaKey }) {
    return new Promise((resolve, reject) => {
      let deviceId = context.getters.deviceId || '21324564'
      dataService
        .login(username, pwd, deviceId, isTourist, captcha, captchaKey)
        .then(
          res => {
            context.commit('loading', false)
            let result = res.data
            let data = result.data
            let code = result.code
            let msg = result.msg
            if (code === 200) {
              if (data) {
                let token = data.token
                let username = data.username
                let name = data.name
                let currentBookId = data.currentBookId
                let currentUnitId = data.currentUnitId
                let schoolName = data.schoolName
                let icon = data.icon
                let nickName = data.nickname
                let pressCode = data.pressCode
                let promotionType = data.promotionType
                context.commit('setToken', token)
                context.commit('setUserInfo', {
                  userName: username,
                  realName: name,
                  pwd: pwd,
                  icon: icon,
                  nickName: nickName,
                  promotionType: promotionType
                })
                if (pressCode) {
                  // 如果返回的有出版社信息, 则写入缓存，并请求课程列表，否则什么都不做
                  context.commit('setPressCode', pressCode)
                  context.dispatch('getGradeList')
                }
                context.commit('setTourist', isTourist || false)
                context.dispatch('getPressList')
                context.dispatch('getSignedTotal')
                context.commit('setSignedInfos', null)
                context.dispatch('getAccountInfo')
                context.commit('setSchoolName', schoolName || NOT_JOINED_SCHOOL)
                if (currentUnitId) {
                  context.commit('setCurrUnitId', currentUnitId)
                  context.commit('setCurrGradeId', currentBookId)
                  context.dispatch('getUnitWords', currentUnitId)
                  context.dispatch('getScoreRankings')
                }
                checkIapOrderStatus()
                resolve(currentUnitId)
              }
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
  logout (context) {
    return new Promise((resolve, reject) => {
      dataService.logout().then(
        res => {
          console.log('----------logout success')
          let isTourist = context.getters.isTourist
          if (isTourist) {
            context.commit('clearTouristInfo')
          }
          context.commit('clearUserInfo')
          context.commit('clearCurrGradeInfo')
          context.commit('clearToken')
          resolve()
        },
        err => {
          console.log('----------logout failed', err)
          let isTourist = context.getters.isTourist
          if (isTourist) {
            context.commit('clearTouristInfo')
          }
          context.commit('clearUserInfo')
          context.commit('clearCurrGradeInfo')
          context.commit('clearToken')
          resolve()
        }
      )
    })
  },
  showTipsMsg (context, msg) {
    context.commit('setTipsMsg', msg)
    setTimeout(() => {
      context.commit('setTipsMsg', '')
    }, 100)
  },
  showTipsDialog (context, tips) {
    context.commit('setDialogTips', tips)
    context.commit('setTipsDialogShowing', true)
  },
  playTapAudio (context) {
    context.commit('setPlayTapAudio', true)
    setTimeout(() => {
      context.commit('setPlayTapAudio', false)
    }, 100)
  }
}

const mutations = {
  setToken (state, val) {
    state.token = val
    utility.getStorage().setItem('token', val)
  },
  clearToken (state) {
    state.token = ''
    utility.getStorage().removeItem('token')
  },
  loading (state, val) {
    state.loading = val
  },
  setTipsMsg (state, val) {
    state.tipsMsg = val
  },
  setVipTipDialog (state, val) {
    state.vipTipDialog = val
  },
  setDialogShowing (state, val) {
    state.dialogShowing = val
  },
  setPlusReady (state, val) {
    state.plusReady = val
  },
  setIsGameing (state, val) {
    state.isGameing = val
  },
  setTipsDialogShowing (state, val) {
    state.tipsDialogShowing = val
  },
  setDialogTips (state, val) {
    state.dialogTips = val
  },
  setSwitchBackground (state, val) {
    state.switchBackground = val
  },
  setPlayTapAudio (state, val) {
    state.tapAudioPlaying = val
  }
}

export default new Vuex.Store({
  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations,
  modules: {
    learning,
    common,
    personal
  },
  strict: debug
})
