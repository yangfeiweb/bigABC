// import http from '@/utility/http'
import dataService from '@/service/index'
import { resourcePath } from '@/service/urlConfig'
import { DEFAULT_HEAD_IMG_URL, NOT_JOINED_SCHOOL } from '@/utility/dict'
import utility from '@/utility/utility'
const state = {
  teachers: [],
  families: [],
  schoolName: '',
  coins: 0,
  diamonds: 0,
  userInfo: {
    userName: '',
    pwd: '',
    nickName: '',
    icon: '',
    gender: ''
  },
  vipDeadline: '',
  signedTotal: 0,
  signedInfos: null,
  isTourist: false,
  deviceId: ''
}

const getters = {
  teachers: state => state.teachers,
  schoolName: state => state.schoolName,
  coins: state => state.coins,
  diamonds: state => state.diamonds,
  gender: state => state.gender,
  families: state => state.families,

  userInfo: state => {
    let userInfo = state.userInfo
    if (!userInfo.userName && utility.getStorage().getItem('userInfo')) {
      return JSON.parse(utility.getStorage().getItem('userInfo'))
    }
    return userInfo
  },
  isTourist: state => {
    return utility.convert2Boolean(
      state.isTourist || utility.getStorage().getItem('isTourist')
    )
  },
  userName: (state, getters) => getters.userInfo && getters.userInfo.userName,
  vipDeadline: state => state.vipDeadline,
  signedTotal: state => state.signedTotal,
  signedInfos: state => state.signedInfos,
  deviceId: state => state.deviceId
}

const actions = {
  getAccountInfo ({ commit, state }) {
    dataService.getAccountInfo().then(res => {
      let result = res.data
      let code = result.code
      let data = result.data
      if (code === 200) {
        commit('updateCoin', data.dragon)
        commit('updateDiamonds', data.diamond)
      }
    })
  },

  getPersonalInfo (context) {
    dataService.getUserInfo().then(res => {
      let result = res.data
      let code = result.code
      let data = result.data
      if (code === 200) {
        if (data) {
          let username = data.username
          let nickname = data.nickname
          let icon = data.icon
          let currentBookId = data.currentBookId
          let currentUnitId = data.currentUnitId
          let schoolName = data.schoolName
          let families = data.families
          let gender = data.gender
          let realName = data.name
          let teachers = data.teachers
          let vipDeadline = data.vipDeadTime
          context.commit('setUserInfo', {
            userName: username,
            pwd: this.pwd,
            nickName: nickname,
            realName: realName,
            gender: gender,
            icon: icon
          })
          context.commit('setCurrUnitId', currentUnitId)
          context.commit('setCurrGradeId', currentBookId)
          context.commit('setTeachers', teachers)
          context.commit('setFamilies', families)
          context.commit('setSchoolName', schoolName || NOT_JOINED_SCHOOL)
          context.commit('setVipDeadline', vipDeadline)
        }
      }
    })
  },

  getSignedTotal (context) {
    // 获取签到信息
    dataService.getSignedTotal().then(res => {
      let result = res.data
      let resultData = result.data
      if (resultData) {
        context.commit('setSignedTotal', resultData.total || 0)
      }
    })
  },
  getSignedInfos (context) {
    dataService.getSignInfos().then(res => {
      let result = res.data
      if (result.code === 200) {
        let data = result.data
        data &&
          data.forEach(item => {
            item.signDate = utility.timeStrToObj(item.signTime)
          })
        context.commit('setSignedInfos', data)
      }
    })
  }
}

const mutations = {
  updateCoin (state, val) {
    state.coins = val
  },
  updateDiamonds (state, val) {
    state.diamonds = val
  },
  setTeachers (state, teachers) {
    state.teachers = teachers
  },
  setUserInfo (state, { userName, pwd, nickName, icon, gender, realName, promotionType }) {
    if (!state.userInfo) {
      state.userInfo = {}
    }
    userName && (state.userInfo.userName = userName)
    pwd && (state.userInfo.pwd = pwd)
    nickName && (state.userInfo.nickName = nickName)
    realName && (state.userInfo.realName = realName)
    if (icon) {
      state.userInfo.icon = resourcePath + icon
    } else {
      state.userInfo.icon = DEFAULT_HEAD_IMG_URL
    }
    gender && (state.userInfo.gender = gender)
    promotionType && (state.userInfo.promotionType = promotionType)
    utility.getStorage().setItem('userInfo', JSON.stringify(state.userInfo))
    userName && utility.getStorage().setItem('userName', userName)
  },
  setTourist (state, isTourist) {
    state.isTourist = isTourist || false
    utility.getStorage().setItem('isTourist', isTourist || false)
  },
  updateUserInfo (state, { userName, pwd, nickName, gender, realName }) {
    userName && (state.userInfo.userName = userName)
    pwd && (state.userInfo.pwd = pwd)
    nickName && (state.userInfo.nickName = nickName)
    realName && (state.userInfo.realName = realName)
    gender && (state.userInfo.gender = gender)
    utility.getStorage().setItem('userInfo', JSON.stringify(state.userInfo))
    userName && utility.getStorage().setItem('userName', userName)
  },
  updateUserPwd (state, pwd) {
    let userInfo = state.userInfo
    let userInfoStr = utility.getStorage().getItem('userInfo')
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr)
    }
    userInfo.pwd = pwd
    userInfoStr && (state.userInfo = userInfo)
    utility.getStorage().setItem('userInfo', JSON.stringify(userInfo))
  },
  updateUserIcon (state, icon) {
    console.log('----updateUserIcon' + icon)
    let userInfo = state.userInfo
    let userInfoStr = utility.getStorage().getItem('userInfo')
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr)
    }
    userInfo.icon = resourcePath + icon
    userInfoStr && (state.userInfo = userInfo)
    utility.getStorage().setItem('userInfo', JSON.stringify(userInfo))
  },
  setFamilies (state, val) {
    state.families = val
  },
  setSchoolName (state, val) {
    state.schoolName = val
  },
  setVipDeadline (state, val) {
    state.vipDeadline = val
  },
  setSignedTotal (state, val) {
    state.signedTotal = val
  },
  setSignedInfos (state, val) {
    state.signedInfos = val
  },
  setDeviceId (state, val) {
    state.deviceId = val
  },
  clearUserInfo (state) {
    state.schoolName = ''
    state.families = null
    state.userInfo = {}
    state.teachers = null
    state.coins = ''
    state.diamonds = ''
    utility.getStorage().removeItem('userInfo')
  },
  clearTouristInfo (state) {
    state.isTourist = false
    utility.getStorage().setItem('isTourist', false)
    utility.getStorage().removeItem('userName')
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
