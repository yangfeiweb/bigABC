export default function (apiRoot) {
  return {
    // 每日分数排行
    GET_SCORE_RANKING: apiRoot + 'top/todayUnit',
    // 龙币排行
    GET_COIN_RANKING: apiRoot + 'top/gradeDragon'
  }
}
