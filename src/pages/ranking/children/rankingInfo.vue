<template>
  <div class="ranking-container">
    <div class="first-place">
      <img :src="bgImg" />
      <div class="first-info">
        <div class="first-head">
          <img class="crown-first" src="static/images/crown-first.png" alt="">
          <img class="person-head" v-bind:src="firstPlace && firstPlace.icon" alt="">
        </div>
        <p class="first-title">{{firstPlace &&((firstPlace.nickname||'匿名用户') + ' ' +firstPlace.score +'币')}}</p>
      </div>
    </div>
    <div class="scroll-container">
      <vue-better-scroll class="main-content" ref="scroll">
        <ul class="ranking-list">
          <li v-for="(item,index) in rankList" :key='item.username' class="ranking-content clear">
            <p class="crown-list" v-if="index===0">
              <img src="static/images/crown-second.png" alt="">
            </p>
            <p class="crown-list" v-if="index===1">
              <img src="static/images/crown-third.png" alt="">
            </p>
            <p v-if="index>1" class="crown-list-text">{{index+2}}</p>
            <div class="head-img-div">
              <div class='head-img-container'>
                <img class='head-img' :src='item&&item.icon'></img>
              </div>
            </div>
            <p class="list-name">{{item&&item.nickname||'匿名用户'}}</p>
            <p class="list-coin">{{item&&item.score}}币</p>
          </li>
        </ul>
      </vue-better-scroll>
      <!-- 我的名次 -->
      <div class="my-location-content" :class='locationCls'>
        <div class='head-img-container'>
          <img class='head-img' :src="userInfo && userInfo.icon" @click="showMyLocation"></img>
        </div>
        <p class="my-location">{{myLocation}}</p>
      </div>
    </div>
  </div>
</template>


<script>
import dataService from "@/service/index";
import { resourcePath } from "@/service/urlConfig";
import {
  DEFAULT_HEAD_IMG_URL,
  COIN_RANKING_TYPE,
  RANKING_AREA_TYPE
} from "@/utility/dict";
export default {
  name: "learnRanks",
  props: {
    refresh: {
      type: Boolean,
      default: false
    },
    rankingType: {
      type: String,
      default: "learn" // learn, game
    },
    areaType: {
      type: String,
      default: "all" // all, school
    }
  },
  data: function() {
    return {
      pullDownRefreshObj: {
        threshold: 20,
        stop: 40
      },
      startY: 0, // 纵轴方向初始化位置
      rankList: [],
      firstPlace: null,
      scroll: null,
      myLocation: "未进榜",
      locationStatus: 0 // 0:'' 1: show, 2: hide
    };
  },
  computed: {
    grade: function() {
      //当前选择年级代码
      let gradeInfo = this.$store.getters.currGradeInfo;
      return (gradeInfo && gradeInfo.grade) || "";
    },
    userInfo: function() {
      return this.$store.getters.userInfo;
    },
    locationCls: function() {
      if (this.locationStatus == 1) {
        return "show";
      } else if (this.locationStatus == 2) {
        return "hide";
      } else {
        return "";
      }
    },
    bgImg: function() {
      if (this.rankingType === "learn") {
        return "static/images/rank-learning.jpg";
      } else {
        return "static/images/rank-game.jpg";
      }
    }
  },
  watch: {
    refresh: function(val) {
      if (val) {
        this.$refs.scroll && this.$refs.scroll.refresh();
      }
    },
    areaType: function() {
      this.getRankingData();
    }
  },
  mounted: function() {
    this.getRankingData();
  },
  methods: {
    //请求数据
    getRankingData: function() {
      let topType = COIN_RANKING_TYPE[this.rankingType];
      let areaType = RANKING_AREA_TYPE[this.areaType];
      this.rankList = [];
      dataService.getCoinRanking(areaType, topType, this.grade).then(res => {
        let result = res.data;
        let data = result.data;
        let code = result.code;
        let msg = result.msg;
        if (code == 200) {
          if (data) {
            this.rankList = data;
            //将图片请求地址进行拼接
            this.rankList.forEach((val, idx) => {
              if (val.icon) {
                val.icon = resourcePath + val.icon;
              } else {
                val.icon = DEFAULT_HEAD_IMG_URL;
              }
              let userName = val.username;
              if (userName === this.userInfo.userName) {
                this.myLocation = `No.${idx + 1}`;
              }
            });

            //更新 滚动状态
            this.$refs.scroll && this.$refs.scroll.forceUpdate(true);

            //摘除排行第一的数据 显示在 最上边
            this.firstPlace = this.rankList[0];
            // console.log(this.firstPlace);

            //摘除排行第一的数据后剩余的对象数组
            this.rankList = this.rankList.splice(1);
            // console.log(this.rankList);
          }
        }
      });
    },
    onPullingDown() {
      console.log("下拉刷新");
    },
    showMyLocation: function() {
      if (this.locationStatus == 1 || this.locationStatus == 2) {
        return;
      }
      this.locationStatus = 1;
      setTimeout(() => {
        this.locationStatus = 2;
        setTimeout(() => {
          this.locationStatus = 0;
        }, 1200);
      }, 2000);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../../assets/css/variables.scss";
.clear:after {
  content: "";
  display: block;
  clear: both;
}
.ranking-container {
  width: 100%;
  height: 100%;
  color: $body-text-color;
  // position: relative;
  .first-place {
    width: 100%;
    height: 330px;
    position: absolute; //为了设定z-index 遮住刷新按钮
    z-index: 10;
    > img {
      width: 100%;
      height: 330px;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }
    .first-info {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      text-align: center;
      .first-head {
        width: 200px;
        // margin: 0 auto;
        text-align: center;
        margin-top: 100px;
        color: $nav-color;
        display: inline-block;

        position: relative; //配合王冠做绝对定位
        .person-head {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          padding: 5px;
          background: $bg-color-warm;
        }
        .crown-first {
          width: 60px;
          position: absolute;
          top: -55px;
          left: 70px;
        }
      }
      .first-title {
        color: #fff;
        font-size: $normal-font-size;
      }
    }
  }
  .scroll-container {
    padding: 10px;
    position: absolute;
    top: 4.4rem;
    bottom: 0px;
    left: 0;
    right: 0;
  }
  .main-content {
    height: 100%;
    background: #fff;
    border-radius: 30px;
    overflow: hidden;
    .ranking-list {
      list-style: none;
      margin: 0 auto;
      padding: 0 $padding;
      .ranking-content {
        height: $text-line-height;
        line-height: $text-line-height;
        border-top: 2px solid $stroke-color;
        display: flex;
        .crown-list {
          display: inline-block;
          width: 72px;
          height: 110px;
          line-height: 110px;
          text-align: center;
          vertical-align: middle;
          > img {
            width: 52px;
            vertical-align: middle;
          }
        }
        .head-img-div {
          height: 100%;
          width: 80px;
          text-align: center;
          display: inline-block;
        }
        .crown-list-text {
          display: inline-block;
          vertical-align: middle;
          width: 72px;
          font-size: $mini-font-size;
          text-align: center;
        }

        .list-name {
          // width: 250px;
          flex: 1;
          height: 110px;
          overflow: hidden;
          display: inline-block;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
          font-size: $normal-font-size;
          color: $emphases-text-color;
        }
        .list-coin {
          display: inline-block;
          margin-left: 50px;
          color: $main-color;
          font-size: $small-font-size;
          vertical-align: middle;
          font-weight: bold;
        }
      }
    }
    .ranking-list li:first-child {
      border: none;
    }
  }
  .my-location-content {
    position: fixed;
    right: 30px;
    bottom: 150px;
    width: 90px;
    border-radius: 60px;
    background: rgba(255, 95, 95, 0.75);
    padding: 15px;
    box-sizing: border-box;
    overflow: hidden;
    .my-location {
      display: inline-block;
      position: absolute;
      color: $nav-color;
      font-size: $normal-font-size;
      vertical-align: middle;
      width: 140px;
      left: 90px;
      top: 15px;
    }
    &.show {
      animation-name: showLocation;
      animation-duration: 0.6s;
      animation-timing-function: linear;
      animation-iteration-count: 1;
      animation-play-state: running;
      width: 240px;
      .head-img-container {
        animation-name: imgShowRotate;
        animation-duration: 0.6s;
        animation-timing-function: linear;
        animation-iteration-count: 1;
        animation-play-state: running;
      }
    }
    &.hide {
      animation-name: hideLocation;
      animation-duration: 0.6s;
      animation-timing-function: linear;
      animation-iteration-count: 1;
      animation-play-state: running;
      width: 90px;
      .head-img-container {
        animation-name: imgHideRotate;
        animation-duration: 0.6s;
        animation-timing-function: linear;
        animation-iteration-count: 1;
        animation-play-state: running;
      }
    }
  }
  .head-img-container {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    display: inline-block;
    position: relative;
    vertical-align: middle;
    background: $bg-color-warm;
    .head-img {
      width: 130%;
      left: 50%;
      top: 50%;
      position: absolute;
      transform: translate(-50%, -50%);
    }
  }

  @keyframes showLocation {
    0% {
      width: 90px;
    }

    100% {
      width: 240px;
    }
  }
  @keyframes hideLocation {
    0% {
      width: 240px;
    }

    100% {
      width: 90px;
    }
  }
  @keyframes imgShowRotate {
    0% {
      transform: rotate(360deg);
    }

    100% {
      transform: rotate(0deg);
    }
  }
  @keyframes imgHideRotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
