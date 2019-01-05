function getRandom (length) {
  return Math.floor(Math.random() * length) + 1
}

function copyObj (data, length, flag) {
  let arr = []
  for (let i = 0; i < length; i++) {
    let newData = {}
    Object.keys(data).forEach(item => {
      newData[item] = data[item]
    })
    newData.id = i
    flag && (newData.recommendationIndex = getRandom(5))
    arr.push(newData)
  }
  return arr
}

function createDummayData (data) {
  const pageIdx = 0
  const pageCount = 30
  let result = {
    success: true,
    msg: 'ok',
    data: data
  }
  data['pageIdx'] = pageIdx
  data['total'] = pageCount
  return result
}

module.exports = { copyObj, getRandom, createDummayData }
