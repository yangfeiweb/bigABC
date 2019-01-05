<template>
  <div class="score-ranking cnfont">
    <div class="header">
      <nav-header title="每日排行榜"></nav-header>
    </div>
    <main class='ranking-container'>
      <vue-better-scroll class="main-content">
        <ul class="ranking-list">
          <li v-for="(item,index) in rankingList" :key='item.username' class="ranking-content clear">
            <p class="crown-list" v-if="index===0">
              <img src="static/images/crown-first.png" alt="">
            </p>
            <p class="crown-list" v-if="index===1">
              <img src="static/images/crown-second.png" alt="">
            </p>
            <p class="crown-list" v-if="index===2">
              <img src="static/images/crown-third.png" alt="">
            </p>
            <p v-if="index>2" class="crown-list-text">{{index+1}}</p>
            <!-- <img class="list-head" v-bind:src="item.icon" alt=""> -->
            <div class="head-img-div">
              <div class='head-img-container'>
                <img class='head-img' :src='item.icon'></img>
              </div>
            </div>
            <p class="list-name">{{item.nickname||'匿名用户'}}</p>
            <p class="list-coin">{{item.score}} 分</p>
          </li>
        </ul>
      </vue-better-scroll>
    </main>
  </div>
</template>

<script>
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
import { resourcePath } from "@/service/urlConfig";

export default {
  data: function() {
    return {};
  },
  computed: {
    rankingList: function() {
      // let list = []
      // let ranks = this.$store.getters.scoreRankings;
      // for(let i = 0; i <10; i++){
      //   list.push(ranks[0])
      // }
      // return list
      return this.$store.getters.scoreRankings;
    }
  },
  mounted: function() {},
  methods: {
    onPullingDown() {
      // 模拟下拉刷新
      console.log("下拉刷新");
    }
  },
  components: {
    navHeader
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";

.score-ranking {
  .clear {
    content: "";
    display: block;
    clear: both;
  }
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }
  .ranking-container {
    position: fixed;
    top: 110px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
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
          border-bottom: 2px solid $stroke-color;
          display: flex;
          .crown-list {
            display: inline-block;
            width: 72px;
            height: 110px;
            line-height: 110px;
            text-align: center;
            > img {
              width: 52px;
              vertical-align: middle;
            }
          }
          .crown-list-text {
            display: inline-block;
            width: 72px;
            font-size: $mini-font-size;
            text-align: center;
          }
          .head-img-div {
            height: 100%;
            width: 80px;
            text-align: center;
            display: inline-block;
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
          .list-name {
            // width: 250px;
            flex: 1;
            height: 110px;
            overflow: hidden;
            display: inline-block;
            vertical-align: middle;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: $normal-font-size;
            color: $emphases-text-color;
          }
          .list-coin {
            display: inline-block;
            margin-left: 50px;
            color: $main-color;
            font-size: $small-font-size;
            font-weight: bold;
          }
        }
      }
      // .ranking-list li:first-child {
      //   border: none;
      // }
    }
    .my-list-content {
      position: fixed;
      right: 30px;
      bottom: 150px;
      width: 240px;
      padding: 0 8px;
      border-top-left-radius: 40px;
      border-top-right-radius: 40px;
      border-bottom-left-radius: 40px;
      border-bottom-right-radius: 40px;
      background: $main-color;
      .my-head {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        padding: 5px;
        background: $bg-color-warm;
        display: inline-block;
        vertical-align: middle;
        margin-top: -8px;
      }
      .my-list {
        display: inline-block;
        color: $nav-color;
        padding: 15px 0;
        margin-left: 15px;
        font-size: $normal-font-size;
      }
    }
  }
}
</style>
