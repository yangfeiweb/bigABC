<template>
  <div class='login cnfont'>
    <template v-if="!showLoading">
      <nav-header title='登录' :showBack='false'>
          <!-- <router-link class="registry-title" slot="right" :to="{name:'registry'}">注册</router-link> -->
      </nav-header>
      <div class='tbody'>
        <img class="logo-img" src="static/images/logo.png">
        <div class='tbody-input'>
          <span class="label">手机号</span>
          <span class="input-container">
            <x-input keyboard="number" type="text" class='login-input' v-model="phoneNo" :min="11" :max="11"></x-input>
          </span>
          <span class='tail-span'></span>
        </div>
        <div class='tbody-input'>
          <span class="label">密码</span>
          <span class="input-container">
            <x-input v-show='showPwd' type="text" keyboard="password" class='login-input' v-model='pwd' :min="6" :max="16"></x-input>
            <x-input v-show='!showPwd' type="password" keyboard="password" class='login-input' v-model='pwd' :min="6" :max="16"></x-input>
          </span>
          <i v-show='showPwd' class="iconfont icon-eye" @click='showPwd = false'></i>
          <i v-show='!showPwd' class="iconfont icon-eyes" @click='showPwd = true'></i>
        </div>
        <span class='btn' @click='doLogin'>立即登录</span>
        <div class='login-footer'>
          <router-link to='/auth/forgetPwd' class='foot-lf'>忘记密码</router-link>
          <router-link class="foot-rt" :to="{name:'registry'}">注册</router-link>
          <!-- <span class='foot-rt' @click='touristLogin'>游客登录</span> -->
        </div>
      </div>
    </template>
    <div v-else class='login-loading'>
      <div>
        <div><img class="logo-dragon" src='static/images/logo-dragon.png' /></div>
        <div><img class="logo-text" src="static/images/logo2.png"></div>
      </div>
    </div>
    <setPwd :showPopup.sync="showSetPwd" :loginInfo='loginInfo'></setPwd>
  </div>
</template>

<script>
import { XInput, Group, Countdown } from "vux";
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
import utility from "@/utility/utility";
import { CAPTCHA_TYPE } from "@/utility/dict";
import setPwd from "@/components/setPwdPopup";

export default {
  components: {
    XInput,
    Group,
    Countdown,
    setPwd,
    navHeader
  },
  data() {
    return {
      phoneNo: "",
      pwd: "",
      errTips: "",
      showPwd: false,
      showLoading: true,
      startCountdown: false,
      captchaBtnText: "获取动态码",
      captcha: "",
      captchaKey: "",
      time: 60,
      phoneChecked: false,
      firstLogin: false,
      showSetPwd: false,
      loginInfo: {}
    };
  },
  computed: {
    userInfo: function() {
      return this.$store.getters.userInfo;
    },
    plusReady: function() {
      return this.$store.getters.plusReady;
    }
  },
  watch: {
    plusReady: function(val) {
      console.log("------plus ready..." + val);
      if (val) {
        this.checkUserInfo();
      }
    }
  },
  created() {
    console.log("------login created..." + this.plusReady);
    if (process.env.NODE_ENV === "development") {
      this.checkUserInfo();
    }
    if (this.plusReady) {
      console.log("------login created...ready");
      this.checkUserInfo();
    }
  },
  methods: {
    checkUserInfo: function() {
      this.$store.dispatch("checkVersion").then(
        success => {
          let isTourist = this.$store.getters.isTourist;
          console.log("tourist....", isTourist);
          if (isTourist) {
            this.login("", "", true);
          } else if (this.userInfo && this.userInfo.userName) {
            console.log("login....", this.userInfo);
            let userName = this.userInfo.userName;
            let pwd = this.userInfo.pwd;
            if (userName && pwd) {
              this.login(userName, pwd, false);
            } else {
              this.showLoading = false;
            }
          } else {
            this.showLoading = false;
            console.log("set phone....");
            let userName = utility.getStorage().getItem("userName");
            if (userName) {
              this.phoneNo = userName;
            }
          }
        },
        err => {
          this.showLoading = false;
          console.log("set phone....");
          let userName = utility.getStorage().getItem("userName");
          if (userName) {
            this.phoneNo = userName;
          }
        }
      );
    },
    doLogin: function() {
      if (
        this.phoneNo.length == 11 &&
        /^1[0-9][0-9]\d{4,8}$/.test(this.phoneNo)
      ) {
        if (!this.pwd) {
          this.errTips = "请输入密码";
          this.$store.dispatch("showTipsMsg", this.errTips);
          return;
        }
        this.login(this.phoneNo, this.pwd);
      } else {
        this.errTips = "请输入正确的手机号";
        this.$store.dispatch("showTipsMsg", this.errTips);
      }
    },
    touristLogin: function() {
      console.log("----tourist login");
      this.$store.commit("loading", true);
      this.login("", "", true);
    },
    login: function(username, pwd, isTourist = false) {
      this.$store.commit("loading", true);
      this.$store
        .dispatch("login", {
          username: username,
          pwd: pwd,
          isTourist: isTourist
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
            console.log("----login err");
            this.showLoading = false;
          }
        );
    }
  }
};
</script>
<style lang="scss" scoped >
@import "~@/assets/css/variables.scss";
.login {
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  // .registry-title {
  //   color: #fff;
  //   margin-right: 20px;
  //   font-size: $normal-font-size;
  // }
  .logo-img {
    // width: 477px;
    // height: 146px;
    width: 274px;
    height: 388px;
  }
  .logo-text {
    width: 477px;
    height: 146px;
  }
  .logo-dragon {
    width: 287px;
    height: 350px;
    margin-top: 200px;
    margin-bottom: 50px;
  }
  .tbody {
    width: 100%;
    // height: 100%;
    flex: 1;
    text-align: center;
    img {
      margin: 40px auto;
    }
    .tbody-input {
      width: 560px;
      height: 110px;
      margin: 0 auto;
      padding-top: 20px;
      .label {
        font-size: $normal-font-size;
        display: inline-block;
        width: 120px;
        text-align: right;
        // color:$body-text-color;
      }
      .tail-span {
        display: inline-block;
        width: 40px;
        line-height: 70px;
        height: 70px;
        vertical-align: bottom;
      }
      .captcha-container {
        display: inline-block;
        width: 150px;
        line-height: 70px;
        height: 70px;
        vertical-align: bottom;
      }
      .iconfont {
        display: inline-block;
        vertical-align: bottom;
        font-size: 40px;
        line-height: 70px;
        height: 70px;
      }
      .captcha-input {
        display: inline-block;
        width: 260px;
        height: 70px;
        vertical-align: bottom;
      }
      .input-container {
        display: inline-block;
        width: 360px;
        height: 70px;
        vertical-align: bottom;
      }
      .login-input {
        border: none;
        border-bottom: 2px solid #ddd;
        outline: none;
        font-size: $small-font-size;
        &::before {
          border: none;
        }
      }

      .captcha-btn {
        background-color: $embellish-color;
        border-radius: 10px;
        // margin-right: 20px;
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

    .btn {
      display: block;
      width: 70%;
      height: 110px;
      line-height: 110px;
      background: $main-color;
      border-radius: 30px;
      margin: 40px auto;
      color: #fff;
      font-size: $large-font-size;
      &:active {
        color: #fff !important;
        background-color: $main-dark-color !important;
      }
    }

    .login-footer {
      width: 100%;
      // border-top: 2px solid #f0f0f0;
      //  position: absolute;
      // bottom: 40px;
      // left: 0;
      .foot-lf {
        display: inline-block;
        width: 200px;
        height: 1.466667rem;
        line-height: 1.466667rem;
        color: #323232;
        font-size: $small-font-size;
        margin: 0 auto;
        border-right: 2px solid #f0f0f0;
        margin-top: 15px;
      }
      .foot-rt {
        display: inline-block;
        width: 200px;
        height: 1.466667rem;
        line-height: 1.466667rem;
        color: #323232;
        font-size: $small-font-size;
        margin: 0 auto;
        margin-top: 15px;
      }
    }
  }

  .login-loading {
    height: 100%;
    width: 100%;
    text-align: center;
  }
}
</style>
