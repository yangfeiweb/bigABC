<template>
  <div class='about-box cnfont'>
    <nav-header title='版本信息'></nav-header>
    <div class='edition'>
      <div class='vesion-space'>
        <img src="static/images/logo.png" alt="">
      </div>
      <group>
        <cell title="微信公众号">
          <div>
            <span>大嘴龙英语</span>
          </div>
        </cell>
        <cell title="客服电话">
          <div @click="callHelp">
            <span>400-800-9196</span>
            <i class="iconfont icon-phone call-icon" @click="callHelp"></i>
          </div>
        </cell>
        <cell title="当前版本">
          <span>V{{version}}</span>
          <!-- <span v-if="showUpdate" class="version-icon" :class="{checking:versionChecking}">
            <i class="iconfont icon-rotate call-icon" @click="checkVersion"></i>
          </span> -->
        </cell>
      </group>
      <div class='btn' @click='goSuggestion'>意见反馈</div>
    </div>
  </div>
</template>
<script>
import { Cell, Group } from "vux";
import navHeader from "@/components/navHeader";
import { VERSION } from "@/utility/dict";
import dataService from "@/service/index";
export default {
  data() {
    return {
      version: VERSION,
      versionChecking: false,
      showUpdate: true
    };
  },
  computed: {},
  created() {
    if (window.plus && window.plus.os.name.toLowerCase() === "ios") {
      this.showUpdate = false;
    }
  },
  methods: {
    checkVersion: function() {
      this.versionChecking = true;
      dataService.checkVersion("ANDROID").then(
        res => {
          let result = res.data;
          if (result.code === 200) {
            let data = result.data;
            if (data && data.needUpdate === "N") {
              this.$store.dispatch("showTipsMsg", "已是最新版本！");
            }
          }
          setTimeout(() => {
            this.versionChecking = false;
          }, 1000);
        },
        err => {
          setTimeout(() => {
            this.versionChecking = false;
            this.$store.dispatch("showTipsMsg", "版本更新错误！");
          }, 1000);
        }
      );
    },
    goSuggestion: function() {
      this.$router.push({ name: "suggestion" });
    },
    callHelp: function() {
      window.plus && window.plus.device.dial("4008009196", true);
    }
  },
  components: {
    Cell,
    Group,
    navHeader
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";
.about-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  .edition {
    flex: 1;
    height: 100%;
    padding: 50px;
    .vesion-space {
      width: 100%;
      text-align: center;
      background: #fff;
      padding-top: 50px;
      border-radius: 30px;

      img {
        width: 274px;
        height: 388px;
      }
    }
    .step {
      padding-left: 250px;
      font-size: 28px;
    }
    .weui-cells {
      border-radius: 30px;
    }
    .weui-cell {
      height: 110px;
      .vux-label {
        font-size: 36px;
      }
      .weui-cell__ft {
        font-size: 30px;
        .weui-loading {
          display: inline-block;
        }
      }
    }
    .call-icon {
      font-size: 80px;
      display: inline-block;
      vertical-align: middle;
      color: $main-color;
    }
    .version-icon {
      display: inline-block;
      line-height: 84px;
      height: 80px;
    }
    .checking {
      animation-name: rotateAnimate;
      animation-duration: 1s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  }

  @keyframes rotateAnimate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .btn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 80px;
    width: 600px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border-radius: 50px;
    background: #ff6666;
    color: #fff;
    font-size: $large-font-size;
  }
}
</style>
