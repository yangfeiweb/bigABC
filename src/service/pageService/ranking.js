import reqUrl from '../urlConfig'
import fetch from '@/utility/http'

// 每日分数排行
let getScoreRanking = unitId =>
  fetch(reqUrl.GET_SCORE_RANKING, { unitId: unitId }, 'GET')

// 龙币排行
let getCoinRanking = (areaType, topType, grade) =>
  fetch(
    reqUrl.GET_COIN_RANKING,
    {
      topType: topType,
      grade: grade,
      gradeDragonTopType: areaType
    },
    'GET'
  )

export default { getScoreRanking, getCoinRanking }
