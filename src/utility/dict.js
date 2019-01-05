export const VERSION = '1.2.4'
export const VERSION_CODE = '18'
export const API_VERSION = '1.0.0'

// 出版社代码  ---人教版
export const PRESS_CODE = 'RMJY'
// 年级label
export const GRADE_LABEL = {
  L_ONE: '一年级',
  L_TWO: '二年级',
  L_THREE: '三年级',
  L_FOUR: '四年级',
  L_FIVE: '五年级',
  L_SIX: '六年级',
  M_ONE: '初一',
  M_TWO: '初二',
  M_THREE: '初三',
  H_ONE: '高一',
  H_TWO: '高二',
  H_THREE: '高三'
}
// 年级上下册
export const GRADE_PART = {
  UP: '上册',
  DOWN: '下册'
}

export const CAPTCHA_TYPE = {
  registry: 'REGISTER',
  findPwd: 'FIND_PASSWORD',
  pay: 'PAY',
  firstLogin: 'FIRST_LOGIN'
}

export const TASK_SCORE_TYPE = {
  unit: 'LEARN',
  forgetWords: 'FORGET_WORDS',
  homeworkUnit: 'HOMEWORK_UNIT',
  homeworkWord: 'HOMEWORK_WORD',
  reviewUnit: 'REVIEW_UNIT'
}

export const GUEST_TIPS = '此功能对游客暂未开放，请注册账户！'

export const TASK_NO_START = 10000

export const TASK_STEP_TITLE = {
  0: '听单词',
  1: '练口语',
  2: '选图片',
  3: '选词义',
  4: '单词拼写',
  5: '学例句',
  6: '丘比特之箭',
  7: '小龙敲敲乐',
  8: '保卫大嘴龙',
  9: '气球要告白'
}
export const TASK_REVIEW_STEP_TITLE = {
  0: '听单词',
  1: '练口语',
  2: '选图片',
  3: '选词义',
  4: '单词拼写',
  5: '学例句',
  6: '神秘卡罗牌',
  7: '小龙爱消除',
  8: '漫游云端记',
  9: '气球要告白'
}

export const GENDER_MAP = {
  MALE: '男',
  FEMALE: '女',
  UNKNOWN: '未选择'
}

export const NOT_JOINED_SCHOOL = 'not-joined'

export const REWARD_TYPE = {
  DRAGON_COIN: '龙币',
  DRAGON_DIAMOND: '钻石'
}

export const DEFAULT_HEAD_IMG_URL = 'static/images/head.png'

export const PAYMENT_TYPE = {
  ALIPAY: 'QUICK_MSECURITY_PAY',
  WECHAT: 'APP',
  APPLE: 'APPLE_IN_APP'
}
export const CHARGE_TYPE = {
  month: 'MONTH',
  year: 'YEAR'
}

export const FORGET_TASKS = [
  {
    played: 'N',
    taskNo: 0
  },
  {
    played: 'N',
    taskNo: 1
  },
  {
    played: 'N',
    taskNo: 2
  },
  {
    played: 'N',
    taskNo: 3
  },
  {
    played: 'N',
    taskNo: 4
  },
  {
    played: 'N',
    taskNo: 5
  },
  {
    played: 'N',
    taskNo: 6
  },
  {
    played: 'N',
    taskNo: 7
  },
  {
    played: 'N',
    taskNo: 8
  }
]

export const HOMEWORK_STATUS = {
  INIT: '未开始',
  ING: '正在进行'
}

export const ORDER_STATUS = {
  init: 'INIT',
  waiting: 'WAIT_PAY',
  paying: 'ING',
  success: 'SUCCESS',
  fail: 'FAIL',
  closed: 'CLOSED'
}

export const VIP_PRODUCT_TYPE = 'VIP_CHARGE'

export const COIN_RANKING_TYPE = {
  learn: 'L_DRAGON_COIN',
  game: 'G_DRAGON_COIN'
}

export const RANKING_AREA_TYPE = {
  all: 'ALL',
  school: 'SCHOOL'
}

export const SPECIAL_PRESS_CODE = ['BABY']