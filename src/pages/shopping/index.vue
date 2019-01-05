<template>
  <div class="shopping cnfont clear">
    <div class="header">
      <nav-header :showBack='false'>
        <div slot="title" class="shopping-title">
          <div class='areas'>
            <span class="area-item" :class='{active:areaType==="gold"}' @click='goldHandle' goldHandle>金币</span>
            <span class="area-item" :class='{active:areaType==="diamond"}' @click='diamondHandle'>钻石</span>
          </div>
        </div>
      </nav-header>
    </div>

    <ul class="change-tap clear">
      <li>
        <img src="static/images/icon-coin.png" alt="">
        <span>300</span>
      </li>
      <li>
        <img src="static/images/icon-diamond.png" alt="">
        <span>300</span>
      </li>
    </ul>

    <main class="shopping-Body">
      <shoppingInfo v-show="isGold" :areaType='areaType' :refresh='isGold'></shoppingInfo>
      <shoppingInfo v-show="!isGold" :areaType='areaType' :refresh='!isGold'></shoppingInfo>
    </main>
  </div>
</template>

<script>
import navHeader from "@/components/navHeader";
import shoppingInfo from "./children/shoppingInfo.vue";
import dataService from "@/service/index";

export default {
  data: function() {
    return {
      isGold: true,
      areaType: "gold"
    };
  },
  methods: {
    goldHandle: function() {
      this.isGold = true;
      this.areaType="gold";
    },
    diamondHandle: function() {
      this.isGold = false;
      this.areaType="diamond";
    }
  },
  components: {
    navHeader,
    shoppingInfo
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";
.shopping {
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
    .shopping-title {
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
          padding: 5px 30px;
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
      >img{
        width:12%;
        vertical-align: sub;
        margin-right: 40px;
      }
      > span {
        display: inline-block;
        line-height: 82px;
        font-size:$normal-font-size;
        color:#FCC024;
      }
    }
  }
  // .active {
  //   border-bottom: 3px solid $main-color;
  //   color: $main-color;
  // }
  .shopping-Body {
    position: fixed;
    top: 192px;
    left: 0;
    right: 0;
    bottom: 100px;
  }
}
</style>
