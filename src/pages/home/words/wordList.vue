<template>
  <div class="word-list">
    <div class="word-list-header">
      <nav-header title="单词列表"></nav-header>
    </div>
    <div class="list-box">
      <!-- 单词列表 -->
      <vue-better-scroll class="list" ref="wordsScroll" listenBeforeScroll @beforeScrollStart="onBeforeScrollStart">
        <group>
          <cell-box v-for="words in unitWords" :key="words.id" class="clearfix" @click.native="clickTheWord(words.id)">
            <div slots="child" class="word-list-left clearfix">
              <h1 class="enWord">
                <!-- 单词 -->
                {{words.word}}
              </h1>
              <div class="Speech cnfont">
                <!-- 词性 -->
                {{words.wordSort !== undefined ? words.wordSort : ''}}
                <!-- 中文意思 -->
                {{words.chinese !== undefined ? words.chinese : ''}}
              </div>
            </div>
            <div slots="child" class="pronunciation">
              <!-- 读音图标 -->
              <speaker color="yellow" :audioSrc="words.voiceUrl" :preload="false"></speaker>
            </div>
          </cell-box>
        </group>
      </vue-better-scroll>
      <!-- 单词详情 -->
      <words-detail-popup :showPopup.sync= "showPopup" :word="word"></words-detail-popup>
    </div>
  </div>
</template>
<script>
import { Group, CellBox } from "vux";
import navHeader from "@/components/navHeader";
import wordsPopup from "@/components/wordsPopup";
import wordsDetailPopup from "@/components/wordDetailPopup";
import speaker from "@/components/widgets/speaker";
import { mapGetters } from "vuex";

export default {
  name: "word-list",
  data() {
    return {
      showPopup: false,
      word:{},
      isRefresh: false //是否已经重新计算滚动
    };
  },
  computed: {
    ...mapGetters(["unitWords"])
  },
  mounted(){
    console.log("------------ wordList",this);
  },
  methods: {
    onBeforeScrollStart() {
      if (!this.isRefresh) {
        this.isRefresh = true;
        this.$refs.wordsScroll.refresh();
      }
    },
    clickTheWord(wordId) {
      //跳转查看单词详情
     let word = this.unitWords.find((word)=>word.id=== wordId);
     console.log("-----------------unitWords",this.unitWords);
     console.log("-----------------word",word);
     if(word){
       this.word = word;
       this.showPopup = true;
     }
    }
  },
  components: {
    Group,
    CellBox,
    navHeader,
    wordsPopup,
    speaker,
    wordsDetailPopup
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
.word-list {
  width: 100%;
  height: 100%;
  position: relative;
  padding-top: $nav-line-height;
  box-sizing: border-box;
  .word-list-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
  }
  /*课程列表*/
  .list-box {
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
    .weui-cell:after {
      height: 0;
      border: none;
    }
    .list {
      height: 100%;
      width: 100%;
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
          border-width:2px;
          border-color: $gray-border;
          left: 0;
        }
        .weui-cell {
          height: 142px;
          line-height: 142px;
          box-sizing: border-box;
          border: none;
          & > div {
            height:142px;
            box-sizing: border-box;
          }
          .word-list-left {
            float: left;
            width: 85%;
            display: flex;
            align-items: center;
            padding-left: 20px;
            overflow: hidden;
            & > h1,
            & > div {
              height: 100%;
              box-sizing: border-box;
            }
            h1 {
              font-weight: normal;
              font-size: $normal-font-size;
            }
            div {
              flex: 1;
              color: $desc-text-color;
              font-size: $mini-font-size;
              overflow: hidden;
              padding-left: 20px;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
          .pronunciation {
            float: right;
            width: auto;
            padding: 20px 0;
            img {
              width: 60px;
              height: 60px;
            }
          }
        }
      }
      .vux-tap-active:active {
        background-color: $bg-color;
      }
    }
  }
  .go-top {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background-color: #009a61;
    border-radius: 5px;
    border: 2px solid #fff;
    color: #fff;
    padding: 10px 15px;
  }
}
</style>
