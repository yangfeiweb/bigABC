<template>
  <div class="ranking cnfont clear">
    <div class="header">
      <nav-header :showBack='false'>
        <div slot="title" class="ranking-title">
          <div class='areas'>
            <span class="area-item" :class='{active:areaType==="all"}' @click='areaType="all"'>全国榜</span>
            <span class="area-item" :class='{active:areaType==="school"}' @click='areaType="school"'>校区榜</span>
          </div>
        </div>
      </nav-header>
    </div>

    <ul class="change-tap clear">
      <li @click="learnHandle">
        <a v-bind:class="{ active: isLearn }">学习榜</a>
      </li>
      <li @click="gameHandle">
        <a v-bind:class="{ active: !isLearn }">游戏榜</a>
      </li>
    </ul>

    <main class="ranking-Body">
      <rankingInfo v-show="isLearn" rankingType='learn' :areaType='areaType' :refresh='isLearn'></rankingInfo>
      <rankingInfo v-show="!isLearn" rankingType='game' :areaType='areaType' :refresh='!isLearn'></rankingInfo>
    </main>
  </div>
</template>

<script>
import navHeader from "@/components/navHeader";
import rankingInfo from "./children/rankingInfo.vue";
import dataService from "@/service/index";

export default {
  data: function() {
    return {
      isLearn: true,
      areaType: "all"
    };
  },
  watch: {
    areaType: function(val) {
      this.$store.dispatch("playTapAudio");
    },
    isLearn: function(val) {
      this.$store.dispatch("playTapAudio");
    }
  },
  methods: {
    learnHandle: function() {
      this.isLearn = true;
    },
    gameHandle: function() {
      this.isLearn = false;
    }
  },
  components: {
    navHeader,
    rankingInfo
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";
.ranking {
  width: 100%;
  height: 100%;
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
    .ranking-title {
      .areas {
        width: 320px;
        height: 60px;
        line-height: 60px;
        background: #fff;
        border-radius: 50px;
        display: inline-block;
        vertical-align: middle;

        .area-item {
          color: $main-color;
          font-size: $normal-font-size;
          padding: 5px 15px;
          &.active {
            color: #fff;
            background: $main-color;
            border-radius: 30px;
            border: none;
          }
        }
      }
    }
  }
  .change-tap {
    width: 100%;
    position: fixed;
    top: 110px;
    z-index: 10;
    left: 0;
    font-size: $small-font-size;
    list-style: none;
    display: flex;
    justify-content: space-between;
    color: #747474;
    background: $nav-color;
    > li {
      width: 50%;
      text-align: center;
      height: 82px;
      line-height: 82px;
      > a {
        display: inline-block;
        line-height: 82px;
      }
    }
  }
  .active {
    border-bottom: 3px solid $main-color;
    color: $main-color;
  }
  .ranking-Body {
    position: fixed;
    top: 192px;
    left: 0;
    right: 0;
    bottom: 100px;
  }
}
</style>
