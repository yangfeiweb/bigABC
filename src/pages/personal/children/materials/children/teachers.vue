<template>
  <div class='teacher cnfont'>
    <nav-header title='我的老师'></nav-header>
    <div class="teacher-info">
      <vue-better-scroll class='list-scroll'>
        <group v-if="teachers && teachers.length ">
          <cell v-for="(teach, idx) in teachers" :key='idx'>
            <span slot="title">
              <span>{{(teach.name) }}</span>
            </span>
            <span slot="title">
              <span class='font'>{{('托管老师') }}</span>
            </span>
            <div>
              <span>{{(teach.mobile)}}</span>
            </div>
          </cell>
        </group>
        <div v-else class='no-teacher'>
          <div class='content'>暂无老师</div>
        </div>
      </vue-better-scroll>
    </div>
  </div>
</template>
<script>
import { Cell, Group } from "vux";
import navHeader from "@/components/navHeader";
export default {
  components: {
    Cell,
    Group,
    navHeader
  },
  mounted() {
    console.log(this);
  },
  computed: {
    teachers: function() {
      let teachers = this.$store.getters.teachers;

      return teachers;
    }
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";

.teacher {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .teacher-info {
    flex: 1;
    width: 100%;
    background: #f0f0f0;
    position: relative;
    overflow: hidden;
    .list-scroll {
      height: 100%;
    }
  }

  .weui-cells {
    border-radius: 50px;
    margin: 20px;
    .weui-cell {
      height: 110px;
      .vux-label {
        font-size: 36px;
      }
      .weui-cell__ft {
        font-size: 32px;
      }
    }
  }
  .font {
    font-size: 28px;
    padding-left: 10px;
    color: gray;
  }
  .no-teacher {
    width: 100%;
    height: 200px;
    line-height: 200px;
    font-size: $normal-font-size;
    text-align: center;
    padding: 10px;
    box-sizing: border-box;
    .content {
      background: #fff;
      border-radius: 20px;
    }
  }
}
</style>
