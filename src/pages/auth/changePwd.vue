<template>
  <div class='change-pwd cnfont'>
    <nav-header title='密码管理'></nav-header>
    <div class='box'>
      <group>
        <x-input :type="showOldPwd?'text':'password'" title='旧密码:' v-model='oldPassword' :min="6" :max="16" placeholder='输入旧密码'>
          <i v-if='showOldPwd' class='iconfont icon-eye' slot='right' @click='showOldPwd = false'></i>
          <i v-else class='iconfont icon-eyes' slot='right' @click='showOldPwd = true'></i>
        </x-input>
        <x-input :type="showNewPwd?'text':'password'" title="新密码:" v-model="newPwd" :min="6" :max="16" placeholder='输入新密码'>
          <i v-if='showNewPwd' class='iconfont icon-eye' slot='right' @click='showNewPwd = false'></i>
          <i v-else class='iconfont icon-eyes' slot='right' @click='showNewPwd = true'></i>
        </x-input>
        <x-input :type="showNewPwdCfm?'text':'password'" title="确认新密码:" v-model="cfmPwd" :min="6" :max="16" placeholder='再次输入新密码'>
          <i v-if='showNewPwdCfm' class='iconfont icon-eye' slot='right' @click='showNewPwdCfm = false'></i>
          <i v-else class='iconfont icon-eyes' slot='right' @click='showNewPwdCfm = true'></i>
        </x-input>
      </group>
      <div class='tips'>
        密码6-16个字符，可由中英文、数字组成
      </div>
      <a @click='changePass'>确认修改</a>
    </div>
  </div>
</template>
<script>
import { Group, XInput } from "vux";
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
export default {
  data() {
    return {
      showOldPwd: false,
      showNewPwd: false,
      showNewPwdCfm: false,
      oldPassword: "",
      newPwd: "",
      cfmPwd: ""
    };
  },
  methods: {
    changePass: function() {
      if (!this.oldPassword) {
        this.$store.dispatch("showTipsMsg", "请输入旧密码");
        return;
      }
      if (!this.newPwd) {
        this.$store.dispatch("showTipsMsg", "请输入新密码");
        return;
      }
      if (!this.cfmPwd) {
        this.$store.dispatch("showTipsMsg", "请再次输入新密码");
        return;
      }
      if (this.newPwd != this.cfmPwd) {
        this.$store.dispatch("showTipsMsg", "两次密码不一致，请重新确认");
        return;
      }
      this.$store.commit("loading", true);
      dataService.changePassword(this.oldPassword, this.newPwd).then(res => {
        let result = res.data;
        let code = result.code;
        let msg = result.msg;
        if (code == 200) {
          this.$store.commit("updateUserPwd", this.newPwd);
          this.$store.dispatch("showTipsMsg", "修改成功");
          setTimeout(() => {
            this.$router.go(-1);
          }, 500);
        } else {
          this.$store.dispatch("showTipsMsg", msg || "修改失败");
        }
        this.$store.commit("loading", false);
      });
    }
  },
  components: {
    Group,
    XInput,
    navHeader
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";
.change-pwd {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  .box {
    flex: 1;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    .weui-cells {
      border-radius: 50px;
      .weui-cell {
        height: 110px;
        .weui-label {
          font-size: 36px;
        }
      }
    }
    input {
      font-size: $normal-font-size;
      font-family: initial;
      &::-webkit-input-placeholder {
        /* WebKit, Blink, Edge */
        color: $desc-text-color;
        font-size: $small-font-size;
        font-family: "cnfont";
      }
    }
    .tips {
      padding-top: 30px;
      text-align: center;
      color: #e4393c;
      font-size: 28px;
    }
    a {
      display: block;
      width: 610px;
      height: 100px;
      line-height: 100px;
      text-align: center;
      background-color: $main-color;
      border-radius: 30px;
      margin: 50px auto 0;
      font-size: $large-font-size;
      color: #fff;
      &:active {
        background-color: $main-dark-color;
      }
    }
  }
}
</style>

