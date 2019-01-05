import _ from 'lodash'

function convert2Boolean(val) {
  let result = false
  if (typeof val === 'string') {
    if (val === 'true' || val === '1') {
      result = true
    }
  } else if (typeof val === 'number') {
    if (val > 0) {
      result = true
    }
  } else if (val === true) {
    result = true
  }
  return result
}

function sortArrByRandom(arr) {
  return _.shuffle(arr)
}

// function sortArrByRandom (arr) {
//   arr = _.cloneDeep(arr)
//   let len = arr.length
//   if (len >= 2) {
//     arr.forEach((item, idx) => {
//       let targetIdx = getRandomIdx(idx, len)
//       arr[idx] = arr[targetIdx]
//       arr[targetIdx] = item
//     })
//   }
//   return arr
// }

// function getRandomIdx (idx, len) {
//   let randomIdx = Math.floor(Math.random() * len)
//   // if (idx === randomIdx) { // 返回跟自己不一样的idx
//   //   return getRandomIdx(idx, len)
//   // }
//   return randomIdx
// }

function getStorageNumId(name) {
  let id = getStorage().getItem(name)
  if (id !== undefined) {
    return parseInt(id)
  }
}

function getMonthLastDay(month) {
  let nextMonth = month + 1
  let nextMonthDate = new Date()
  nextMonthDate.setMonth(nextMonth)
  nextMonthDate.setDate(1)
  let lastDate = new Date(nextMonthDate - 86400000)
  return lastDate.getDate()
}
// format yyyyMMddhhmmss to date obj
function timeStrToObj(str) {
  let yyyy = str.substr(0, 4)
  let mth = str.substr(4, 2) - 1
  let dd = str.substr(6, 2)
  let hh = str.substr(8, 2) || '00'
  let mm = str.substr(10, 2) || '00'
  let ss = str.substr(12, 2) || '00'
  return new Date(yyyy, mth, dd, hh, mm, ss)
}

// format date to yyyyMMddhhmmss
function dateToTimeStr(date) {
  let yyyy = date.getFullYear()
  let mth = dateNum2Str(date.getMonth() + 1)
  let dd = dateNum2Str(date.getDate())
  let hh = dateNum2Str(date.getHours())
  let mm = dateNum2Str(date.getMinutes())
  let ss = dateNum2Str(date.getSeconds())
  return yyyy + mth + dd + hh + mm + ss
}

function dateNum2Str(num) {
  if (num < 10) {
    return '0' + num
  } else {
    return num + ''
  }
}

function getStorage() {
  let plus = window.plus
  if (plus) {
    return plus.storage
  } else {
    return localStorage
  }
}

//返回十六进制的随机颜色
function randHexColor() {
  let r = Math.floor(Math.random() * 256)
  let g = Math.floor(Math.random() * 256)
  let b = Math.floor(Math.random() * 256)
  if (r < 16) {
    r = "0" + r.toString(16);
  } else {
    r = r.toString(16);
  }
  if (g < 16) {
    g = "0" + g.toString(16);
  } else {
    g = g.toString(16);
  }
  if (b < 16) {
    b = "0" + b.toString(16);
  } else {
    b = b.toString(16);
  }

  return '0x' + r + g + b
}

//返回 yyyyMMdd 时间
function parseDate(date) {
  let format = date.toLocaleDateString()
  let data = format.split('/');
  let str = ''
  data.forEach((item) => {
    if (item < 10) {
      item = '0' + item
    }
    str += item
  })
  return str
}

export default {
  convert2Boolean,
  sortArrByRandom,
  getStorageNumId,
  getMonthLastDay,
  timeStrToObj,
  dateToTimeStr,
  getStorage,
  randHexColor,
  parseDate
}
