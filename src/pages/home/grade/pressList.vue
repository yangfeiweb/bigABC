<template>
  <div class="press-list cnfont">
    <!-- 顶部 -->
    <div>
      <nav-header title="选择出版社" :showBack="showArrow"></nav-header>
    </div>
    <!-- 出版社列表 -->
    <div class="list-box">
      <vue-better-scroll class="list" ref="pressList">
        <ul class="content">
          <li class="item-box" v-for="(item,index) in pressList" :key="index" @click="selectPress(item.code)">
            <bgImg :src="item.coverImg" class="press-img"></bgImg>
            <span class="press-name">{{item.name}}</span>
            <i class="iconfont icon-right select" v-if="item.code === currCode"></i>
          </li>
        </ul>
      </vue-better-scroll>
    </div>
  </div>
</template>
<script>
import { Group, Cell } from "vux";
import navHeader from "@/components/navHeader";
import bgImg from "@/components/widgets/bgImg";
import dataService from "@/service/index";
import { SPECIAL_PRESS_CODE } from "@/utility/dict";
export default {
  name: "pressList",
  data() {
    return {
      showArrow: false,
      pressList: []
    };
  },
  computed: {
    currCode() {
      return this.$store.getters.getPressCode;
    }
  },
  created() {
    let list = this.$store.getters.getPressList;
    if (list.length === 0) {
      this.getpressList();
    } else {
      this.pressList = list;
    }
  },
  mounted() {
    if (this.currCode) {
      this.showArrow = true;
    } else {
      this.showArrow = false;
    }
  },
  methods: {
    getpressList() {
      this.$store.commit("loading", true);
      this.$store.dispatch("getPressList").then(
        items => {
          this.pressList = items;
          this.$store.commit("loading", false);
        },
        err => {
          this.$store.commit("loading", false);
        }
      );
    },
    getGradeList(code) {
      this.$store.commit("loading", true);
      let result = this.$store.dispatch("getGradeList", code);
      result.then(
        success => {
          this.$store.commit("loading", false);
        },
        err => {
          this.$store.commit("loading", false);
        }
      );
      return result;
    },
    selectPress(code) {
      if (code) {
        let result = SPECIAL_PRESS_CODE.find(item => item === code);
        if (result) {
          //对特殊的出版社，特殊处理 直接跳到选择单元
          this.getGradeList(code).then((list) => {
            let grade = list[0];
            this.$router.push({ path: "/unitlist/",query: { id: grade.id, pressCode: code } });
          });
        } else {
          if (this.currCode !== code) {
            //和缓存中的pressCode 不一致时重新请求课程列表
            this.getGradeList(code).then(success => {
              this.$router.push({ path: "/gradeList/" });
            });
          } else {
            let gradeList = this.$store.getters.getGradeList;
            this.$store.commit("setAssistGradeList", gradeList);
            this.$router.push({ path: "/gradeList/" });
          }
        }
      }
    }
  },
  components: {
    Group,
    Cell,
    bgImg,
    navHeader
  }
};
</script>
<style lang="scss">
@import "~@/assets/css/variables";
.clearfix:after {
  content: "";
  display: table;
  clear: both;
  overflow: hidden;
}
.active {
  // 当前选择的出版社特殊标记颜色
  color: $main-color;
}
.press-list {
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
  .list-box {
    position: absolute;
    top: $nav-line-height;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
    overflow: hidden;
    box-sizing: border-box;
    .list {
      height: 100%;
      width: 100%;
      border-radius: 20px;
      overflow: hidden;
      background-color: #fff;
      .content {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        list-style: none;
        .item-box {
          position: relative;
          width: 350px;
          font-size: $normal-font-size;
          box-sizing: border-box;
          padding: 10px;
          .press-img {
            width: 300px;
            height: 300px;
          }
          .press-name {
            width: 100%;
            height: 40px;
            text-align: center;
            overflow-wrap: break-word;
          }
          .select {
            position: absolute;
            top: 10px;
            right: 20px;
            font-size: $max-font-size;
            color: $main-color;
          }
        }
      }
    }
  }
}
</style>
