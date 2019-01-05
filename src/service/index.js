import _ from 'lodash'
import auth from './pageService/auth'
import home from './pageService/home'
import personal from './pageService/personal'
import learning from './pageService/learning'
import ranking from './pageService/ranking'
import message from './pageService/message'
import iap from './pageService/iap'

export default _.merge(auth, home, personal, learning, ranking, message, iap)
