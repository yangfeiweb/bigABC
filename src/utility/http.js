import VueResource from 'vue-resource'
import Vue from 'vue'
import store from '@/store/index'
import router from '@/router/index'
import { API_VERSION, VERSION_CODE } from '@/utility/dict'
import utility from '@/utility/utility'
import md5 from 'js-md5'
Vue.use(VueResource)

export default function (url = '', params = {}, type = 'GET') {
  type = type.toUpperCase()
  let result = setRequest(url, params, type)
  result.then(
    res => {
      // console.log('======res...' + res)
      let resultData = res.data
      let code = resultData.code
      // console.log('==========code...' + code)
      if (code === 401) {
        store.commit('loading', false)
        // 重新登陆， 重新请求
        store.commit('clearToken')
        let userInfo = store.getters.userInfo
        if (userInfo && userInfo.username && userInfo.pwd) {
          store
            .dispatch('login', {
              username: userInfo.username,
              pwd: userInfo.pwd,
              isTourist: userInfo.isTourist
            })
            .then(res => {
              return setRequest(url, params, type)
            })
        } else {
          router.replace({ name: 'login' })
        }
      } else if (code === 402) {
        store.commit('loading', false)
        // 退出登录
        store.dispatch('showTipsMsg', '账号在其他地方登录，请重新登录！')
        store.commit('clearToken')
        store.commit('clearUserInfo')
        router.replace({ name: 'login' })
      } else if (code === 600) {
        store.commit('loading', false)
        if (store.getters.isTourist) {
          store.commit('setTouristTipDialog', true)
        } else {
          store.commit('setVipTipDialog', true)
        }
      } else if (code === 202) {
        store.dispatch('showTipsDialog', '系统正在升级中，请稍后！')
      } else if (code !== 200) {
        store.commit('loading', false)
        let msg = resultData.msg
        store.dispatch('showTipsMsg', msg || '请求失败，请重试！')
      }
    },
    () => {
      // 错误提示
      store.commit('loading', false)
      store.dispatch('showTipsMsg', '网络不佳，请重试！')
    }
  )
  return result
}

function setRequest (url, params, type) {
  let result
  let token = store.getters.token
  if (token) {
    params['token'] = token
  }
  params['version'] = API_VERSION
  params['versionCode'] = VERSION_CODE
  let ts = utility.dateToTimeStr(new Date())
  params['ts'] = ts
  params['sign'] = getRequestSign(params)
  // let plus = window.plus
  // if (process.env.NODE_ENV === 'production' && plus) {
  //   result = new Promise((resolve, reject) => {
  //     let xhr = new plus.net.XMLHttpRequest()
  //     if (type === 'POST') {
  //       xhr.open(type, url)
  //     } else {
  //       let paramArr = []
  //       for (let key in params) {
  //         let val = params[key]
  //         paramArr.push(key + '=' + val)
  //       }
  //       xhr.open(type, url + '?' + paramArr.join('&'))
  //     }
  //     xhr.onreadystatechange = () => {
  //       if (xhr.readyState === 4) {
  //         let res = xhr.responseText
  //         console.log('--------------res ' + res)
  //         console.log(typeof res)
  //         resolve({ data: JSON.parse(res) })
  //       }
  //     }
  //     xhr.ontimeout = e => {
  //       reject(e)
  //     }
  //     xhr.onerror = e => {
  //       reject(e)
  //     }
  //     if (type === 'POST') {
  //       console.log('=====pramms' + JSON.stringify(params))
  //       xhr.send(JSON.stringify(params))
  //     } else {
  //       xhr.send()
  //     }
  //   })
  // } else {
  if (type === 'GET') {
    result = Vue.http.get(url, { params: params, timeout: 5000 })
  } else if (type === 'POST') {
    result = Vue.http.post(url, params, { emulateJSON: true, timeout: 10000 })
  } else if (type === 'DELETE') {
    result = Vue.http.delete(url, {
      params: params,
      emulateHTTP: true,
      timeout: 10000
    })
  }
  // }
  return result
}

export function getRequestSign (params) {
  if (!params) {
    params = {}
  }
  let paramArr = []
  for (let key in params) {
    let val = params[key]
    if (val !== undefined && val !== null && val !== '') {
      paramArr.push(`${key}=${val}`)
    }
  }
  paramArr.sort()

  let key = '111111'
  // if (process.env.NODE_ENV === 'production') {
  key =
    'aEpPb3dld2w3QU1BdGI2aTQyMWxYNlRxRW81WTFWd3BOSlRMaXUyU3RUeWZMcm9VQ0Z1TG5qalhpSWdhM25OZw=='
  // }
  let paramStr = paramArr.join('&') + `&key=${key}`
  return md5(paramStr)
}
