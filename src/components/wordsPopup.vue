
<template>
  <div class="words-popup">
    <popup v-model="showPopup" height="100%" @on-hide="hide">
      <div class="words-popup-container">
        <div class="word-popup-header">
          <div class="close" @click="closePopup">
            <!-- 关闭按钮 -->
            <i class="iconfont icon-close"></i>
          </div>
          <div class="popup-title">
            <p>单词列表</p>
          </div>
        </div>
        <div class="popUp-list-box">
          <!-- 单词列表 -->
          <vue-better-scroll ref="scroll" class="popUp-list" listenBeforeScroll @beforeScrollStart="onBeforeScrollStart">
            <group>
              <cell-box v-for="words in lists" :key="words.id" class="clearfix">
                <div slots="child" class="word-list-left clearfix">
                  <h1 class="enWord">
                    <!-- 单词 -->
                    {{words.word}}
                  </h1>
                  <div class="Speech cnfont">
                    <!-- 词性 -->
                    {{words.wordSort}}
                    <!-- 中文意思 -->
                    {{words.chinese}}
                  </div>
                </div>
                <div slots="child" class="pronunciation">
                  <!-- 读音图标 -->
                  <speaker color="yellow" :audioSrc='words.voiceUrl'></speaker>
                </div>
              </cell-box>
            </group>
          </vue-better-scroll>
        </div>
      </div>
    </popup>
  </div>
</template>

<script>
import { Popup, Group, CellBox } from "vux";
import speaker from "@/components/widgets/speaker";
export default {
  props: {
    lists: {
      type: Array,
      default: function() {
        return [];
      },
      required: true
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPopup: false,
      isRefresh: false //是否刷新过
    };
  },
  watch: {
    show: function(nowState, lastState) {
      if (nowState) {
        this.showPopup = nowState;
      }
      this.$store.commit("setDialogShowing", nowState);
      this.$store.dispatch('playTapAudio')
    },
    '$store.getters.dialogShowing': function(val){
      if(val === false && this.showPopup == true){
        this.closePopup()
      }
    }
  },
  mounted() {
    this.showPopup = this.show || false;
  },
  methods: {
    closePopup() {
      this.showPopup = false;
    },
    onBeforeScrollStart() {
      if (!this.isRefresh) {
        this.isRefresh = true;
        this.$refs.scroll.refresh();
      }
    },
    hide() {
      this.showPopup = false;
      this.$emit("update:show", false);
    }
  },
  components: {
    Popup,
    Group,
    CellBox,
    speaker
  }
};
</script>

<style lang="scss">
@import "~@/assets/css/variables";
.clearfix:after {
  content: "";
  display: table;
  clear: both;
  overflow: hidden;
}
.words-popup {
  .vux-popup-dialog {
    overflow: hidden;
    box-sizing: border-box;
    .words-popup-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      .word-popup-header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: $nav-line-height;
        .close,
        .popup-title {
          text-align: center;
          color: #fff;
        }
        .close {
          position: fixed;
          top: 30px;
          right: 10px;
          width: 50px;
          height: 50px;
          line-height: 50px;
          z-index: 1;
        }
        .popup-title {
          width: 100%;
          height: $nav-line-height;
          line-height: $nav-line-height;
          background-color: $main-color;
          font-size: $large-font-size;
        }
      }
      /*课程列表*/
      .popUp-list-box {
        position: absolute;
        top: $nav-line-height;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 10px;
        overflow: hidden;
        box-sizing: border-box;
        .weui-cells::before,
        .weui-cells::after,
        .weui-cell::after {
          height: 0;
          border: none;
        }
        .popUp-list {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          background-color: #fff;
          .weui-cells {
            height: 100%;
            width: 100%;
            background-color: rgba(255, 255, 255, 0);
            margin: 0;
            .weui-cell_access::after {
              display: none;
            }
            & > .weui-cell:before {
              border-color: $gray-border;
              left: 0;
            }
            .weui-cell {
              height: 142px;
              line-height: 142px;
              box-sizing: border-box;
              border: none;
              & > div {
                box-sizing: border-box;
              }
              .word-list-left {
                float: left;
                width: 85%;
                height: 142px;
                display: flex;
                padding-left: 20px;
                overflow: hidden;
                & > h1,
                & > div {
                  display: block;
                  height: 100%;
                  float: left;
                }
                h1 {
                  font-weight: normal;
                  margin-left: 10px;
                  font-size: $normal-font-size;
                }
                div {
                  flex: 1;
                  color: $desc-text-color;
                  font-size: $mini-font-size;
                  margin-left: 20px;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }
              }
              .pronunciation {
                float: right;
                width: auto;
                padding: 20px 0;
                margin-left: 20px;
                img {
                  width: 60px;
                }
              }
            }
          }
          .vux-tap-active:active {
            background-color: $bg-color;
          }
        }
      }
    }
  }
}
</style>
