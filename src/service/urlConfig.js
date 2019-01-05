import _ from 'lodash'
import auth from './pageUrl/auth'
import home from './pageUrl/home'
import personal from './pageUrl/personal'
import learning from './pageUrl/learning'
import ranking from './pageUrl/ranking'
import message from './pageUrl/message'
import iap from './pageUrl/iap'

// const apiRoot = 'http://192.168.0.104:9005/api/'
// export const resourcePath = 'http://192.168.0.104:8500'
// const postIapRoot = 'http://192.168.0.104:9003/'

// const apiRoot = 'http://192.168.0.113:9005/api/'
// export const resourcePath = 'http://192.168.0.113:8500'
// const postIapRoot = 'http://192.168.0.113:9003/'

// const apiRoot = 'http://long.angle.so/app/api/'
// export const resourcePath = 'http://long.angle.so/static'

// const apiRoot = 'http://bigabc.angle.so/app/api/'
// export const resourcePath = 'http://bigabc.angle.so/resources'

const apiRoot = 'http://www.api.bigabc.cn/api/'
export const resourcePath = 'http://www.res.bigabc.cn'
const postIapRoot = 'http://mq.bigabc.cn/'

export default _.merge(
  auth(apiRoot),
  home(apiRoot),
  personal(apiRoot),
  learning(apiRoot),
  ranking(apiRoot),
  message(apiRoot),
  iap(postIapRoot)
)
