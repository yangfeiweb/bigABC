<template>
  <div class='my-data cnfont'>
    <nav-header title='我的资料' goBackUrl='/main/personal'></nav-header>
    <div class='space'>
      <div>基本情况</div>
      <group class='up'>
        <cell link='/personInfos/picEdit'>
          <span slot="title" class='size'>
            <span>头像修改</span>
          </span>
          <span slot="title" class='size'>
            <span class='font'>修改用户头像</span>
          </span>
          <div class='img-container'>
            <img :src="userIcon">
          </div>
        </cell>
        <cell link='/personInfos/infoDetail'>
          <span slot="title" class='size'>
            <span>资料编辑</span>
          </span>
          <span slot="title">
            <span class='font'>查看/修改资料</span>
          </span>
        </cell>
        <cell v-show="!isTourist" link='/auth/changePwd'>
          <span slot="title" class='size'>
            <span>密码管理</span>
          </span>
          <span slot="title">
            <span class='font'>登录密码</span>
          </span>
        </cell>
      </group>
      <div>学习信息</div>
      <group class='down'>
        <cell link='/pressList'>
        <!-- <cell link='/gradeList'> -->
          <span slot="title" class='size'>
            <span>我的年级</span>
          </span>
          <span slot="title">
            <span class='font'>当前年级</span>
          </span>
          <div>
            <span>{{currGrade}}</span>
          </div>
        </cell>
        <cell link='/personInfos/teachers'>
          <span slot="title" class='size'>
            <span>我的老师</span>
          </span>
          <span slot="title">
            <span class='font'>查看老师</span>
          </span>
        </cell>
      </group>
      <group>
        <cell class='school'>
          <span slot="title" class='size'>
            <span>所属学校</span>
          </span>
          <div>
            <span class='school-name'>{{schoolName}}</span>
          </div>
        </cell>
      </group>

    </div>
  </div>
</template>
<script>
import { Group, Cell } from "vux";
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
import { NOT_JOINED_SCHOOL } from "@/utility/dict";
export default {
  components: {
    Group,
    Cell,
    navHeader
  },
  computed: {
    currGrade() {
      let gradeInfo = this.$store.getters.currGradeInfo;
      return (gradeInfo && gradeInfo.label) || "";
    },
    userIcon: function() {
      let userInfo = this.$store.getters.userInfo;
      return (userInfo && userInfo.icon) || "";
    },
    schoolName: function() {
      let name = this.$store.getters.schoolName;
      if (name === NOT_JOINED_SCHOOL) {
        name = "未加入校区";
      }
      return name;
    },
    isTourist: function() {
      return this.$store.getters.isTourist;
    }
  },
  created() {
  }
};
</script>

<style lang='scss' >
@import "~@/assets/css/variables.scss";
.my-data {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  .space {
    flex: 1;
    height: 100%;
    padding: 20px;
    .weui-cells {
      border-radius: 50px;
      .weui-cell {
        height: 100px;
        padding: 0;
      }
      .vux-label {
        margin-left: 50px;
      }
      .weui-cell__ft:after {
        height: 20px;
        width: 20px;
        border-color: black;
        margin-right: 40px;
      }
      .weui-cell__ft {
        padding-right: 90px;
        display: flex;
        align-items: center;
        height: 100%;
        .img-container {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          img {
            width: 130%;
            left: 50%;
            top: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
          }
        }
        .school-name{
          font-size: $small-font-size;
        }
      }
    }
    .up {
      height: 330px;
    }
    .down {
      height: 220px;
    }
    .size {
      font-size: 32px;
    }
    .font {
      font-size: 22px;
      padding-left: 40px;
      color: gray;
    }
  }
}
</style>

