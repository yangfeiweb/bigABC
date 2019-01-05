<template>
  <div class='register cnfont'>
    <nav-header title='注册' :showBack='false'>
        <router-link class="login-title" slot="right" :to="{name:'login'}">登录</router-link>
    </nav-header>
    <group>
      <x-input title="手机号码:" name="mobile" keyboard="number" type='number' class='register-input' v-model="phoneNo" :min="11" :max="11"></x-input>
      <x-input title="密码:" type="password" keyboard="password" class='register-input' v-model='pwd' :min="6" :max="16"></x-input>
      <x-input title="短信验证码:" class="weui-vcode register-input cnfont" v-model="captcha" :min="4" :max="6">
        <div v-show='!startCountdown' slot="right" mini class='captcha-btn' @click='getCaptcha'>{{captchaBtnText}}</div>
        <div v-show='startCountdown' class='countdown-cls' slot="right">
          <countdown v-model="time" :start="startCountdown" @on-finish="countdownFinish"></countdown>s
        </div>
      </x-input>
    </group>
    <div class="serviceCheck">
      <!-- <input class="checkBox" type="checkbox" v-model="isChecked"> -->
      <check-icon class="checkBox" :value.sync="isChecked"></check-icon>
      <span class="userService" @click="showPop">用户注册协议和隐私政策</span>
    </div>
    <div class='btn cnfont' @click='registry' v-bind:class='{"btnActive":isNull}'>注册</div>
    <div v-transfer-dom>
      <servicePopUp :showPopUp.sync="isShowPop"></servicePopUp>
    </div>
  </div>
  
</template>
<script>
import { XInput, Group, Countdown,TransferDom ,Popup,CheckIcon} from "vux";
import dataService from "@/service/index";
import { CAPTCHA_TYPE } from "@/utility/dict";
// import navHeader from "@/components/navHeader";
import servicePopUp from "@/components/servicePopup";
import navHeader from "@/components/navHeader";
export default {
  computed:{
    isNull:function(){
      return this.phoneNo && this.pwd && this.captcha &&this.isChecked
    }
  },
  data() {
    return {
      phoneNo: "",
      pwd: "",
      captcha: "",
      time: 60,
      startCountdown: false,
      captchaKey: "",
      captchaBtnText: "获取验证码",
      showTips: false,
      tips: "",
      isShowPop:false,
      isChecked:false,
      // isNull:true,
    };
  },
  methods: {
    handleClickBack() {
      this.$router.go(-1);
    },
    getCaptcha: function() {
      if (!this.phoneNo) {
        this.$store.dispatch("showTipsMsg", "请输入手机号");
        return;
      }
      dataService.getCaptcha(this.phoneNo, CAPTCHA_TYPE.registry).then(res => {
        let result = res.data;
        let data = result.data;
        let code = result.code;
        if (code == 200) {
          this.startCountdown = true;
          if (data) {
            this.captchaKey = data.captchaKey;
          }
        } else {
          this.$store.dispatch("showTipsMsg", "获取验证码失败");
        }
      });
    },
    registry: function() {
      if(!this.isChecked){
        return
      }
      this.$store.commit("loading", true);
      dataService
        .register(this.phoneNo, this.pwd, this.captcha, this.captchaKey)
        .then(res => {
          let result = res.data;
          let code = result.code;
          let msg = result.msg;
          if (code == 200) {
            this.$store.commit("setUserInfo", this.phoneNo, this.pwd);
            this.$store
              .dispatch("login", { username: this.phoneNo, pwd: this.pwd })
              .then(currUnitId => {
                this.$store.commit("loading", false);
                this.$router.replace({ name: "pressList" });
              });
          } else {
            this.$store.commit("loading", false);
            this.$store.dispatch("showTipsMsg", msg || "注册失败");
          }
        });
    },
    countdownFinish: function() {
      this.startCountdown = false;
      this.captchaBtnText = "重新发送";
      this.time = 60;
    },
    showPop:function(){
      this.isShowPop=true;
      this.$refs.scroll && this.$refs.scroll.forceUpdate(true);
    },
  },
  directives: {
    TransferDom
  },
  components: {
    XInput,
    Group,
    Countdown,
    TransferDom,
    Popup,
    servicePopUp,
    CheckIcon,
    navHeader
  }
};
</script>
<style lang="scss" >
@import "~@/assets/css/variables.scss";
// @import '~vux/src/styles/close.less';

.register {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  .login-title {
    color: #fff;
    margin-right: 20px;
    font-size: $normal-font-size;
  }
  .weui-cells {
    margin-left: 20px;
    margin-right: 20px;
    border-radius: 20px;
    font-size: $normal-font-size;
  }
  .register-input {
    height: 110px;
  }
  .btn {
    display: block;
    width: 80%;
    height: 110px;
    text-align: center;
    line-height: 110px;
    background: $disable-color;
    font-size: $large-font-size;
    color: #fff;
    border-radius: 50px;
    margin: 100px auto 0;
    // &:active {
    //   color: #fff !important;
    //   background-color: $main-dark-color !important;
    // }
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
  .btnActive{
    display: block;
    width: 80%;
    height: 110px;
    text-align: center;
    line-height: 110px;
    background: $main-color;
    font-size: $large-font-size;
    color: #fff;
    border-radius: 50px;
    margin: 100px auto 0;
    &:active{
      color:#fff !important;
      background-color: $main-dark-color !important;
    }  
  }
  .serviceCheck{
    margin-left:40px;
    margin-top:20px;
    .weui-icon-circle{
      font-size:40px;
    }
    .weui-icon-success{
      font-size:40px;
    }
    .userService{
      font-size:$small-font-size;
      color:$main-color;
    } 
  }
  
}
</style>
