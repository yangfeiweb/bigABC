<template>
  <div class='data-box cnfont'>
    <nav-header title='资料详情'>
      <a slot="right" class="edit-icon" @click='updateUser'>
        <i class='iconfont icon-duihao'></i>保存</a>
    </nav-header>
    <div class='infoedit-space'>
      <group>
        <x-input title="昵称:" name="username" v-model="nickName" class='name-input' :max='20'></x-input>
      </group>
      <group>
        <x-input title="姓名:" name="realName" v-model="realName" class='name-input' :max='10'></x-input>
      </group>
      <group class='gender-group'>
        <span class='gender'>性别：</span>
        <checker v-model="gender" class='gender-checker' radio-required default-item-class="gender-item" selected-item-class="gender-item-selected">
          <checker-item value='MALE'>
            <icon type="success"></icon>
            <icon type="circle"></icon> 男
          </checker-item>
          <checker-item value='FEMALE'>
            <icon type="success"></icon>
            <icon type="circle"></icon> 女
          </checker-item>
        </checker>
      </group>
    </div>
  </div>
</template>
<script>
import { Group, XInput, Checker, CheckerItem, Icon } from "vux";
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
export default {
  components: {
    Group,
    XInput,
    Checker,
    CheckerItem,
    Icon,
    navHeader
  },
  data() {
    return {
      nickName: "",
      realName: "",
      gender: "UNKONWN"
    };
  },
  mounted() {
    this.nickName = this.$store.getters.userInfo.nickName || "";
    this.realName = this.$store.getters.userInfo.realName || "";
    this.gender = this.$store.getters.userInfo.gender || "UNKONWN";
  },
  methods: {
    handleClickBack() {
      this.$router.go(-1);
    },
    updateUser: function() {
      if (this.nickName == "") {
        this.$store.dispatch("showTipsMsg", "昵称不能为空！");
        return;
      }
      if (this.realName == "") {
        this.$store.dispatch("showTipsMsg", "姓名不能为空！");
        return;
      }
      if (this.gender == "UNKONWN") {
        this.$store.dispatch("showTipsMsg", "请选择性别");
        return;
      }
      dataService
        .updatedUserInfo(this.nickName, this.realName, this.gender)
        .then(res => {
          let result = res.data;
          let data = result.data;
          let code = result.code;
          if (code == 200) {
            this.$store.commit("updateUserInfo", {
              gender: this.gender,
              nickName: this.nickName,
              realName: this.realName
            });
            this.$router.go(-1);
          }
        });
    }
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";

.data-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;

  .edit-icon {
    color: #fff;
    padding: 0 20px;
    font-size: $normal-font-size;
    height: 100%;
    display: inline-block;
  }

  .gender-group {
    font-size: $normal-font-size;
    .gender {
      margin-left: 20px;
      font-size: $normal-font-size;
    }
    .gender-checker {
      display: inline-block;
      font-size: $normal-font-size;
      .weui-icon {
        font-size: $large-font-size;
      }
      .gender-item {
        .weui-icon-success {
          display: none;
        }
        .weui-icon-circle {
          display: inline-block;
        }
      }
      .gender-item-selected {
        .weui-icon-circle {
          display: none;
        }
        .weui-icon-success {
          display: inline-block;
          color: $main-color;
        }
      }
    }
    // .radio-icon{
    //   font-size: $normal-font-size;
    //   .weui-icon{
    //     font-size: $large-font-size;
    //   }
    //   .weui-icon-success, .weui-icon-success-circle{
    //     // color:$main-color;
    //     &::before{
    //       color:$main-color;
    //     }
    //   }
    // }
  }
  .infoedit-space {
    flex: 1;
    height: 100%;
    padding: 30px;
    .name-input {
      height: 80px;
      font-size: $normal-font-size;
      input {
        font-family: cnfont;
      }
    }
    .weui-cells {
      border-radius: 50px;
      height: 110px;
      line-height: 110px;
      .weui-cell {
        height: 110px;
        .weui-label {
          font-size: $normal-font-size;
          margin-left: 20px;
        }
      }
    }
  }
}
</style>
