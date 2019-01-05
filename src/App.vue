<template>
  <div class="app">
    <router-view ></router-view>
    <opt-dialog :show.sync="showVipDialog" @update:show="updateVipDialogShow">
      <div class="vip-tip-info">
        <p class="info">您的会员已过期,请开通会员</p>
        <div class="info-btn" @click="goVip">前去开通</div>
      </div>
    </opt-dialog>
    <opt-dialog :show.sync="showTouristDialog" @update:show="updateTouristDialogShow">
      <div class="vip-tip-info">
        <p class="info">游客体验已过期，请注册账号！</p>
        <div class="info-btn" @click="goRegistry">前去注册</div>
      </div>
    </opt-dialog>
    <opt-dialog :show.sync="showTipsDialog" @hide="hideTipsDialog">
      <div class="vip-tip-info">
        <p class="info">{{dialogTips}}</p>
        <div class="info-btn" @click="hideTipsDialog">确定</div>
      </div>
    </opt-dialog>
    <audio src="static/audio/tap.mp3" ref="tapAudio"></audio>
  </div>
</template>
<script>
import optDialog from "@/components/widgets/optDialog";
export default {
  name: "app",
  data() {
    return {
      showVipDialog: false,
      showTipsDialog: false,
      showTouristDialog: false
    };
  },
  mounted() {
    document.addEventListener("plusready", this.plusListener);
  },
  watch: {
    "$store.getters.getCurrUnitId": function(val) {
      if (this.$store.getters.token && val) {
        this.$store.dispatch("getUnitWords", val);
        this.$store.dispatch("getUnitFlowTask", val);
        this.$store.dispatch("getScoreRankings");
      }
    },
    "$store.getters.loading": function(val) {
      if (window.plus) {
        if (val) {
          window.plus.nativeUI.showWaiting();
        } else {
          window.plus.nativeUI.closeWaiting();
          this.$vux.loading.hide();
        }
      } else {
        if (val) {
          this.$vux.loading.show({ text: "loading" });
        } else {
          this.$vux.loading.hide();
        }
      }
    },
    "$store.getters.tipsMsg": function(val) {
      if (val) {
        if (window.plus) {
          window.plus.nativeUI.toast(val, { verticalAlign: "top" });
        } else {
          this.$vux.toast.text(val);
        }
      }
    },
    "$store.getters.vipTipDialog": function(val) {
      this.showVipDialog = val;
    },
    "$store.getters.tipsDialogShowing": function(val) {
      console.log("=====tipsDialogShowing ", val);
      this.showTipsDialog = val;
    },
    "$store.getters.tapAudioPlaying": function(val) {
      if(val){
        this.$refs.tapAudio.play()
      }
    },
    "$store.getters.showTouristTipDialog": function(val) {
      this.showTouristDialog = val;
    }
  },
  computed: {
    dialogTips: function() {
      return this.$store.getters.dialogTips;
    }
  },
  methods: {
    plusListener() {
      console.log("-----plus ready..");
      let quitTimes = 0;
      this.$store.commit("setPlusReady", true);
      let plus = window.plus;
      let deviceId = plus.device.uuid;
      this.$store.commit("setDeviceId", deviceId);
      plus.screen.lockOrientation("portrait-primary");
      plus.navigator.setFullscreen(true);

      document.addEventListener(
        "pause",
        () => {
          console.log("应用从前台切换到后台");
          let isGameing = this.$store.getters.isGameing;
          if (isGameing) {
            this.$store.commit("setSwitchBackground", true);
          }
          // mui.toast("程序在后台运行");
          // this.$store.dispatch('showTipsMsg', '进入后台')
        },
        false
      );
      document.addEventListener(
        "resume",
        () => {
          console.log("应用从后台切换到前台");
          let isGameing = this.$store.getters.isGameing;
          if (isGameing) {
            this.$store.commit("setSwitchBackground", false);
          }
          // this.$store.dispatch('showTipsMsg', '应用从后台切换到前台')
          // mui.toast("程序在前台运行");
        },
        false
      );

      plus.key.addEventListener(
        "backbutton",
        () => {
          // 事件处理
          let isGameing = this.$store.getters.isGameing;
          let dialogShowing = this.$store.getters.dialogShowing;
          if (isGameing) {
            this.$store.commit("setDialogShowing", !dialogShowing);
            return;
          }
          if (dialogShowing) {
            this.$store.commit("setDialogShowing", false);
          } else {
            let backType = this.$route.meta.backType;
            if (backType === -1) {
              window.history.back();
            } else if (backType === 0) {
              quitTimes++;
              plus.nativeUI.toast("再次点击退出");
              setTimeout(() => {
                quitTimes = 0;
              }, 2000);
              if (quitTimes === 2) {
                plus.runtime.quit();
              }
            }
          }
        },
        false
      );

      // openInstall
      const OPENINSTALL_BARCODE = "OpenInstallPlugin";
      let Bridge = window.plus.bridge;
      let openInstall = {
        // 声明异步返回方法
        GetInstallData: function(successCallback, errorCallback) {
          let success =
              typeof successCallback !== "function"
                ? null
                : function(args) {
                    successCallback(args);
                  },
            fail =
              typeof errorCallback !== "function"
                ? null
                : function(code) {
                    errorCallback(code);
                  };
          let callbackID = Bridge.callbackId(success, fail);
          return Bridge.exec(OPENINSTALL_BARCODE, "GetInstallData", [callbackID]);
        }
      };
      window.plus.openInstall = openInstall;

      // // qdreamer
      // const QDREAMER_BARCODE = "QdreamerSpeech";
      // let qdreamerSpeech = {
      //   // 声明异步返回方法
      //   speechStart: function(word, successCallback, errorCallback) {
      //     let success =
      //       typeof successCallback !== "function"
      //         ? null
      //         : function(args) {
      //             successCallback(args);
      //           };
      //     let fail =
      //       typeof errorCallback !== "function"
      //         ? null
      //         : function(code) {
      //             errorCallback(code);
      //           };
      //     let callbackID = Bridge.callbackId(success, fail);
      //     return Bridge.exec(QDREAMER_BARCODE, "speechStart", [callbackID, word]);
      //   },
      //   speechEnd: function(successCallback, errorCallback) {
      //     let success =
      //       typeof successCallback !== "function"
      //         ? null
      //         : function(args) {
      //             successCallback(args);
      //           };
      //     let fail =
      //       typeof errorCallback !== "function"
      //         ? null
      //         : function(code) {
      //             errorCallback(code);
      //           };
      //     let callbackID = Bridge.callbackId(success, fail);
      //     return Bridge.exec(QDREAMER_BARCODE, "speechEnd", [callbackID]);
      //   }
      // };
      // window.plus.qdreamerSpeech = qdreamerSpeech;
    },
    updateVipDialogShow(val) {
      if (!val) {
        this.$store.commit("setVipTipDialog", false);
      }
    },
    updateTouristDialogShow(val) {
      if (!val) {
        this.$store.commit("setTouristTipDialog", false);
      }
    },
    goVip() {
      this.$store.commit("setVipTipDialog", false);
      this.$router.push({ name: "vip" });
    },
    hideTipsDialog() {
      console.log("-----hideTipsDialog");
      this.$store.commit("setTipsDialogShowing", false);
    },
    goRegistry(){
      this.$store.commit("setTouristTipDialog", false);
      this.$store.dispatch('logout')
      this.$router.push({ name: "registry" });
    }
  },
  components: {
    optDialog
  },
  beforeDestroy() {
    console.log("-----remove event listener");
    document.removeEventListener("plusready", this.plusListener);
  }
};
</script>
<style lang="less">
@import "~vux/src/styles/reset.less";
html,
body {
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
input {
  user-select: auto; /*webkit浏览器*/
}
.app {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  .cnfont {
    font-family: "cnfont" !important;
  }
  .weui-icon-clear {
    font-size: 30px !important;
  }
  .weui-icon-warn::before {
    font-size: 30px !important;
  }
  .weui-toast__content {
    font-size: 30px !important;
  }
  .vip-tip-info {
    .info {
      font-size: 36px;
      padding: 20px 0;
      color: #646464;
    }
    .info-btn {
      width: 80%;
      height: 90px;
      line-height: 90px;
      text-align: center;
      font-size: 38px;
      margin: 20px auto;
      background-color: #ff5f5f;
      color: #ffffff;
      border-radius: 90px;
      &:active {
        background-color: #d65050;
      }
    }
  }
}
</style>
