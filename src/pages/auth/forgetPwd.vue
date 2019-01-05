<template>
  <div class='cnfont forget'>
    <nav-header title='忘记密码'></nav-header>
    <group>
      <x-input title="手机号:" name="mobile" keyboard="number" type='number' class='input' v-model='phoneNo' :min="11" :max="11"></x-input>
      <x-input title="短信验证码:" class="weui-vcode input" v-model="captcha" :min="4" :max="6">
        <div v-show='!startCountdown' slot="right" class='captcha-btn' @click='getCaptcha'>{{captchaBtnText}}</div>
        <div v-show='startCountdown' class='countdown-cls' slot="right">
          <countdown v-model="time" :start="startCountdown" @on-finish="countdownFinish">{{captchaBtnText}}</countdown>s</div>
      </x-input>
      <x-input title="新密码:" type="password" placeholder="" v-model="password" :min="6" :max="16" @on-change="change" class='input'></x-input>
      <x-input title="请确认新密码:" type="password" placeholder="" :min="6" :max="16" :equal-with="password" class='input' v-model='password1'></x-input>
    </group>
    <div class='btn cnfont' @click='getForgotPass'>保存新密码</div>
  </div>
</template>

<script>
import { XInput, Group, Countdown } from "vux";
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
import { CAPTCHA_TYPE } from "@/utility/dict";
export default {
  components: {
    XInput,
    Group,
    navHeader,
    Countdown
  },
  data() {
    return {
      password: "",
      password1: "",
      phoneNo: "",
      captcha: "",
      time: 60,
      startCountdown: false,
      captchaKey: "",
      captchaBtnText: "获取验证码"
    };
  },
  methods: {
    change(val) {
      console.log("on change", val);
    },
    getCaptcha: function() {
      if (!this.phoneNo) {
        this.$store.dispatch("showTipsMsg", "请输入手机号");
        return;
      }

      dataService.getCaptcha(this.phoneNo, CAPTCHA_TYPE.findPwd).then(res => {
        console.log(111);
        let result = res.data;
        let data = result.data;
        let code = result.code;
        let msg = result.msg;
        if (code == 200) {
          this.startCountdown = true;
          if (data) {
            this.captchaKey = data.captchaKey;
          }
        } else {
          this.$store.dispatch("showTipsMsg", msg || "获取验证码失败");
        }
      });
    },
    getForgotPass: function() {
      if (!this.phoneNo) {
        this.$store.dispatch("showTipsMsg", "请输入手机号");
        return;
      }
      if (!this.captcha) {
        this.$store.dispatch("showTipsMsg", "请输入验证码");
        return;
      }
      if (!this.password) {
        this.$store.dispatch("showTipsMsg", "请输入密码");
        return;
      }
      if (!this.password1) {
        this.$store.dispatch("showTipsMsg", "请确认新密码");
        return;
      }
      if (this.password != this.password1) {
        this.$store.dispatch("showTipsMsg", "两次密码不一致，请重新确认");
        return;
      }
      dataService
        .getForgotPass(
          this.phoneNo,
          this.password,
          this.captcha,
          this.captchaKey
        )
        .then(res => {
          let result = res.data;
          let code = result.code;
          let msg = result.msg;
          if (code == 200) {
            this.$router.replace({ name: "login" });
          } else {
            this.$store.dispatch("showTipsMsg", msg || "修改失败");
          }
        });
    },
    countdownFinish: function() {
      this.startCountdown = false;
      this.captchaBtnText = "重新发送";
      this.time = 60;
    }
  }
};
</script>
<style lang="scss" >
@import "~@/assets/css/variables.scss";
.forget {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  .grade-header {
    position: relative;
    box-sizing: border-box;
    height: $nav-line-height;
    background-color: $main-color;
    .grade-header-left,
    .grade-header-title {
      float: left;
      height: $nav-line-height;
      line-height: $nav-line-height;
      font-size: $large-font-size;
    }
    .grade-header-left {
      .back-arrow {
        position: absolute;
        width: 30px;
        height: 30px;
        top: -5px;
        left: -5px;
      }
      .back-arrow::before {
        content: "";
        position: absolute;
        width: 25px;
        height: 25px;
        border: 3px solid #ffffff;
        border-width: 3px 0 0 3px;
        transform: rotate(315deg);
        top: 45px;
        left: 50px;
      }
    }
    .grade-header-title {
      color: #ffffff;
      margin: 0 auto;
      width: 100%;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .weui-cells {
    margin-left: 20px;
    margin-right: 20px;
    border-radius: 20px;
    font-size: $normal-font-size;
  }
  .input {
    height: 110px;
  }
  .btn {
    display: block;
    width: 560px;
    height: 110px;
    text-align: center;
    line-height: 110px;
    background: #ff6666;
    color: #fff;
    font-size: $large-font-size;
    border-radius: 50px;
    margin: 100px auto 0;
    &:active {
      color: #fff !important;
      background-color: $main-dark-color !important;
    }
  }
  .captcha-btn {
    background-color: $embellish-color;
    border-radius: 10px;
    margin-right: 20px;
    width: 180px;
    height: 60px;
    line-height: 60px;
    padding: 0;
    font-size: 30px;
    color: #fff;
    text-align: center;
    &:active {
      color: #fff !important;
      background-color: $embellish-dark-color !important;
    }
  }
  .countdown-cls {
    background-color: $embellish-color;
    border-radius: 10px;
    margin-right: 20px;
    display: inline-block;
    text-align: center;
    color: #fff;
    font-family: initial;
    width: 180px;
    height: 60px;
    line-height: 60px;
    font-size: 30px;
  }
}
</style>
