<template>
  <div class="unit-list cnfont">
    <!-- 顶部 -->
    <div>
      <nav-header title="选择单元" :showBack="showArrow"></nav-header>
    </div>
    <div class="list-box">
      <vue-better-scroll class="list">
        <div class="reigster" v-if="!isTourist">
          <div v-for="(item, idx) in unitList" :key="idx" class="unit-item" @click='changeUnit(item.key, idx)'>
            <p class="unitText">{{item.value}}</p>
            <i class="iconfont icon-duigou item-icon selected" v-if="currUnitId==item.key"></i>
          </div>
        </div>
        <!-- 下面是游客选单元的列表 -->
        <div class="tourist" v-else>
          <div v-for="(item, idx) in unitList" :key="idx" class="unit-item" :class="{disabled: idx>0}" @click='touristChangeUnit(item, idx)'>
            <p class="unitText">{{item.value}}</p>
            <i class="iconfont icon-duigou item-icon selected" v-if="currUnitId==item.key"></i>
            <i class="iconfont icon-lock1 item-icon" v-if="idx!==0"></i>
          </div>
        </div>
      </vue-better-scroll>
    </div>
  </div>
</template>
<script>
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";

export default {
  name: "unitList",
  data() {
    return {
      gradeId: "",
      showArrow: true
    };
  },
  computed: {
    unitList: function() {
      this.gradeId = Number(this.$route.query.id);
      let gradeList = this.$store.getters.assistGradeList;
      if (gradeList) {
        let grade = gradeList.find(item => item.id === this.gradeId);
        let unitlist = [];
        if (grade) {
          let list = grade.unitList; //当前选择的课程单元列表
          if (list) {
            unitlist = list.map(val => {
              return {
                key: val.id,
                value: val.name
              };
            });
          }
        }
        return unitlist;
      }
    },
    currUnitId: function() {
      let unitId = this.$store.getters.getCurrUnitId;
      return unitId;
    },
    isTourist: function() {
      return this.$store.getters.isTourist;
    }
  },
  mounted() {
    this.pressCode = this.$route.query.pressCode;
  },
  methods: {
    changeUnit(key, idx) {
      this.selectedId = key;
      if (key == this.currUnitId) {
        this.$router.push({ name: "home" });
      } else {
        this.$store.commit("loading", true);
        //将改变的单元值更新到服务器
        if (key !== this.currUnitId) {
          dataService.changeUnit(key).then(
            res => {
              this.$store.commit("loading", false);
              let result = res.data;
              let code = result.code;
              if (code === 200) {
                this.$store.commit("setFirstUnit", idx === 0);
                this.$store.commit("setPressCode", this.pressCode);
                this.$store.commit("setGradeList");
                this.$store.commit("setCurrUnitId", key);
                this.$store.commit("setCurrGradeId", this.gradeId);
                this.$router.push({ name: "home" });
              }
            },
            err => {
              this.$store.commit("loading", false);
            }
          );
        }
      }
    },
    touristChangeUnit(item, idx) {
      if (idx > 0) {
        this.$store.dispatch("showTipsMsg", "注册用户才能选择其他单元！");
      } else {
        this.changeUnit(item.key, 0);
      }
    }
  },
  components: {
    navHeader
  }
};
</script>
<style lang="scss">
@import "~@/assets/css/variables";
.unit-list {
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
      .unit-item {
        height: $text-line-height;
        line-height: $text-line-height;
        position: relative;
        color: $body-text-color;
        border-bottom: 2px solid $stroke-color;
        &.disabled {
          color: $disable-color;
        }
        .unitText {
          display: inline-block;
          width: 100%;
          height: 100%;
          padding: 0 20px;
          font-size: $normal-font-size;
          box-sizing: border-box;
        }
        .item-icon {
          position: absolute;
          top: 0;
          right: 20px;
          height: 100%;
          line-height: $text-line-height;
          &.selected {
            color: $main-color;
          }
        }
      }
    }
  }
}
</style>
