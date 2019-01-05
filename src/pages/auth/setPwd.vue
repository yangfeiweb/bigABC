<template>
  <div class='set-pwd cnfont'>
    <nav-header title='设置密码'></nav-header>
    <div class='box'>
      <div class="content">
      <div class='title-tips'>首次登录，请设置密码</div>
        <x-input :type="showPwd?'text':'password'" v-model="userPwd" :min="6" :max="16" placeholder='输入密码'>
          <i v-if='showPwd' class='iconfont icon-eye' slot='right' @click='showPwd = false'></i>
          <i v-else class='iconfont icon-eyes' slot='right' @click='showPwd = true'></i>
        </x-input>
      <div class='pwd-tips'>
        密码6-16个字符，可由中英文、数字组成
      </div>
    <div>
      <div class="serviceCheck">
        <check-icon class="checkBox" :value.sync="isChecked"></check-icon>
        <span class="userService" @click="showPop">用户注册协议和隐私政策</span>
      </div>
      <servicePopUp :showPopUp.sync="isShowPop"></servicePopUp>
    </div>
      <a v-if="isChecked && userPwd && (userPwd.length>=6 && userPwd.length <=16)" @click='setPass'>确认</a>
      <a v-else class="disabled">确认</a>
      </div>
    </div>
  </div>
</template>
<script>
import { Group, XInput, CheckIcon } from "vux";
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
import servicePopUp from "@/components/servicePopup";
export default {
  data() {
    return {
      userPwd: "",
      showPwd: false,
      isShowPop: false,
      isChecked: false,
      phoneNo: "",
      captcha: ""
    };
  },
  mounted() {
    this.phoneNo = this.$route.params.phoneNo;
    this.captcha = this.$route.params.captcha;
    this.captchaKey = this.$route.params.captchaKey;
  },
  methods: {
    showPop: function() {
      this.isShowPop = true;
      this.$refs.scroll && this.$refs.scroll.forceUpdate(true);
    },
    setPass: function() {
      this.$store.commit("loading", true);

      this.$store
        .dispatch("login", {
          username: this.phoneNo,
          pwd: this.userPwd,
          isTourist: false,
          captcha: this.captcha,
          captchaKey: this.captchaKey
        })
        .then(
          currUnitId => {
            this.$store.commit("loading", false);
            if (currUnitId) {
              this.$router.replace({ name: "home" });
            } else {
              this.$router.replace({ name: "pressList" });
            }
          },
          err => {
            this.$store.commit("loading", false);
            this.showLoading = false;
          }
        );
    }
  },
  components: {
    Group,
    XInput,
    navHeader,
    servicePopUp,
    CheckIcon
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";
.set-pwd {
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
    .content {
      background: #fff;
      border-radius: 50px;
      height: 600px;
    }
    .title-tips {
      font-size: $normal-font-size;
      color: $body-text-color;
      text-align: center;
      padding: 20px 0;
    }
    .weui-cell {
      height: 110px;
      .weui-label {
        font-size: 36px;
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
    .pwd-tips {
      padding-top: 30px;
      text-align: center;
      color: $desc-text-color;
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
      &.disabled {
        background-color: $disable-color;
      }
    }
  }

  .serviceCheck {
    margin: 30px 0;
    .checkBox {
      margin-left: 30px;
    }
    .weui-icon-circle {
      font-size: 40px;
    }
    .weui-icon-success {
      font-size: 40px;
    }
    .userService {
      font-size: $small-font-size;
      color: $main-color;
    }
  }
}
</style>
