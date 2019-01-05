<template>
  <div class="forget-list">
    <div class="forget-header">
      <nav-header title="生词本">
      </nav-header>
    </div>
    <div class="list-box" v-if="hasForgetWord">
      <!-- 单词列表 -->
      <vue-better-scroll ref="wordsScroll" class="list" listenBeforeScroll @beforeScrollStart="onBeforeScrollStart" :pullUpLoad="pullUpLoadObj" @pullingUp="onPullingUp">
        <group>
          <cell-box v-for="(forget,index) in forgetList" :key="forget.id" class="clearfix" @click.native="clickTheWord(forget.id)">
            <div slots="child" class="forget-list-left clearfix">
              <div class="enforget">
                <!-- 单词 -->
                {{forget.word.word}}
              </div>
              <div class=" chinese cnfont">
                {{forget.word.wordSort}}
                <!-- 词性 -->
                <!-- {{forget.word.wordSort}} -->
                <!-- 中文意思 -->
                {{forget.word.chinese}}
              </div>
            </div>
            <div slots="child" class="pronunciation">
              <!-- 读音图标 -->
              <speaker color='yellow' :audioSrc='forget.word.voiceUrl' :preload="false"></speaker>
            </div>
            <!-- pass按钮 或待掌握 -->
            <div slots="child" class="word-control">
              <div v-if="forget.canPass !== 'N' " @click.stop="passBtn(forget.word.word,forget.id,index)">
                <div class="pass">PASS</div>
              </div>
              <div v-else class="notMaster">未掌握</div>
            </div>
          </cell-box>
        </group>
      </vue-better-scroll>
      <!-- 单词详情 -->
      <words-detail-popup :showPopup.sync="showPopup" :word="word"></words-detail-popup>
    </div>
    <!-- 开始学习按钮 -->
    <div class="begin-learn-box cnfont" v-if="hasForgetWord">
      <div v-if='forgetWords.length >5' @click="beginLearn" class="begin-learn">
        <span>开始学习</span>
      </div>
      <div v-else class="begin-learn-disabled">
        <span>开始学习</span>
      </div>
    </div>
    <div class="forget-tip cnfont" v-if="!hasForgetWord">
      <p>暂无生词</p>
    </div>
    <!-- 没有生词时的提示 -->
    <!-- 弹窗 -->
    <opt-dialog :show.sync="isShow">
      <div class="tipInfo">
        <p class="normal-family">{{currWord || ''}}</p>
        <p>将被移除生词本</p>
      </div>
      <div class="tipBtn">
        <div @click="removeWordBtn" class="abc-btn yes-btn">
          是的,已掌握
        </div>
        <div class="abc-btn no-btn" @click="temporaryRemove">
          暂时不移除
        </div>
      </div>
    </opt-dialog>

  </div>
</template>
<script>
import { Group, CellBox } from "vux";
import navHeader from "@/components/navHeader";
import optDialog from "@/components/widgets/optDialog";
import speaker from "@/components/widgets/speaker";
import wordsDetailPopup from "@/components/wordDetailPopup";

import dataService from "@/service/index";
import { resourcePath } from "@/service/urlConfig";

export default {
  name: "forget-list",
  data() {
    return {
      isShow: false,
      showPopup: false,
      word: {}, //某个具体的单词
      isRefresh: false, //是否已经重新计算过滚动
      currWord: null, // pass时点击的target单词
      currWordID: null, // pass时点击的target单词id
      currWordIndex: null, //pass时点击的target单词在数组中的下标
      page: 0, //去生词本的页数
      size: 20, //一次取20条
      totalPage: 0, //去生词本的总页数
      isLast: false, //是不是最后一页
      forgetList: [], //记录生词
      // 这个配置用于做上拉加载功能，默认为 false。当设置为 true 或者是一个 Object 的时候，可以开启上拉加载，可以配置离底部距离阈值（threshold）来决定开始加载的时机
      pullUpLoadObj: {
        threshold: 90,
        txt: {
          more: "加载更多",
          noMore: "你的生词只有这么多了"
        }
      }
    };
  },
  computed: {
    hasForgetWord: function() {
      return this.forgetList.length !== 0;
    },
    forgetWords: function() {
      let words = [];
      this.forgetList.forEach(item => {
        if (item.canPass === "N") {
          if (words.length < 15) {
            words.push(item.word);
          }
        }
      });
      return words;
    }
  },
  watch: {
    // isShow: function(bool) {
    //   if (!bool) {
    //     if (this.wordIndex) {
    //       this.currWordIndex = null;
    //       this.currWord = null;
    //       this.currWordID = null;
    //     }
    //   }
    // }
  },
  mounted() {
    this.getforgetWord();
  },
  methods: {
    getforgetWord() {
      //获取生词本单词
      this.$store.commit("loading", true);
      dataService
        .getForgetList(this.page, this.size)
        .then(
          res => {
            let result = res.data;
            let data = result.data;
            let code = result.code;
            this.$store.commit("loading", false);
            if (code === 200) {
              let words = data.content;
              this.isLast = data.last;
              this.totalPage = data.totalPages;

              words.forEach(item => {
                let word = item.word;
                word.imgName = word.imgUrl;
                word.voiceName = word.voiceUrl;
                word.imgUrl = resourcePath + word.imgUrl;
                word.voiceUrl = resourcePath + word.voiceUrl;
                let statements = word.statements;
                if (statements) {
                  statements.forEach(item => {
                    item.imgName = item.imgUrl;
                    item.voiceName = item.voiceUrl;
                    item.imgUrl = resourcePath + item.imgUrl;
                    item.voiceUrl = resourcePath + item.voiceUrl;
                  });
                }
              });

              // list.forEach(forget => {
              //   forget.word.imgUrl = resourcePath + forget.word.imgUrl;
              //   forget.word.voiceUrl = resourcePath + forget.word.voiceUrl;
              // });
              this.forgetList = this.forgetList.concat(words);
              return data.last;
            }
          },
          err => {
            this.$store.commit("loading", false);
            this.$store.dispatch("showTipsMsg", "获取生词本错误，请重试！");
          }
        )
        .then(islast => {
          setTimeout(() => {
            if (islast) {
              this.$refs.wordsScroll &&
                this.$refs.wordsScroll.forceUpdate(false);
            } else {
              this.$refs.wordsScroll &&
                this.$refs.wordsScroll.forceUpdate(true);
            }
          }, 1000);
        });
    },
    onBeforeScrollStart() {
      //重新计算滚动
      if (!this.isRefresh) {
        this.isRefresh = true;
        this.$refs.wordsScroll.refresh();
      }
    },
    clickTheWord(wordId) {
      //点击跳转到详情
      let word = this.forgetList.find(word => word.id === wordId);
      if (word) {
        this.word = word.word;
        this.showPopup = true;
      }
    },
    //pass按钮  word为单词名,id 是单词的id属性, index是这个单词在数组中的下标
    passBtn(word, id, index) {
      this.currWord = word;
      this.currWordID = id;
      this.currWordIndex = index;
      this.isShow = true;
    },
    beginLearn() {
      //开始学习按钮
      console.log("开始学习");
      this.$store.commit("setLearningBack", false);
      this.$store.dispatch("goForgetTask", this.forgetWords);
      this.$router.push({ name: "learnFlow" });
    },
    removeWordBtn() {
      //移除单词
      this.isShow = false;
      this.removeWord(this.currWordID);
    },
    removeWord(wordId) {
      //向服务器发请求移除单词
      dataService.delForgetWord(wordId).then(res => {
        let result = res.data;
        let code = result.code;
        if (code === 200) {
          this.forgetList.splice(this.currWordIndex, 1);
          this.$store.dispatch("showTipsMsg", `${this.currWord} 已移除生词本！`);
          this.currWordIndex = null;
          this.currWord = null;
          this.currWordID = null;
        }
      });
    },
    temporaryRemove() {
      //暂不移除 关闭弹窗
      this.isShow = false;
    },
    onPullingUp() {
      //上拉 加载更多数据
      if (this.page < this.totalPage - 1) {
        this.page++;
        this.getforgetWord();
      }
    }
  },
  components: {
    Group,
    CellBox,
    optDialog,
    navHeader,
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
.forget-list {
  width: 100%;
  height: 100%;
  padding: $nav-line-height 0;
  box-sizing: border-box;
  position: relative;
  .forget-header {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
  }
  /*课程列表*/
  .list-box {
    position: absolute;
    top: $nav-line-height;
    left: 0;
    right: 0;
    bottom: $nav-line-height;
    padding: 10px;
    overflow: hidden;
    box-sizing: border-box;
    .list {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #fff;
      border-radius: 20px;
      .weui-cells::before,
      .weui-cells::after,
      .weui-cell::after {
        height: 0;
        border: none;
      }
      .weui-cells {
        height: 100%;
        width: 100%;
        background-color: rgba(255, 255, 255, 0);
        margin: 0;
        .weui-cell {
          height: 142px;
          line-height: 142px;
          box-sizing: border-box;
          & > div {
            float: left;
            height: 142px;
            box-sizing: border-box;
          }
          .forget-list-left {
            width: 80%;
            display: flex;
            align-items: center;
            padding-left: 20px;
            overflow: hidden;
            & > div {
              display: inline-block;
            }
            .enforget {
              float: left;
              height: 100%;
              font-size: $normal-font-size;
            }
            .chinese {
              flex: 1;
              height: 100%;
              color: $desc-text-color;
              font-size: $mini-font-size;
              // padding-top: 10px;
              margin-left: 20px;
              overflow: hidden;
              white-space: nowrap;
              box-sizing: border-box;
              text-overflow: ellipsis;
            }
          }
          //读音图标
          .pronunciation {
            margin-right: 30px;
            img {
              width: 60px;
              height: 60px;
              vertical-align: middle;
            }
          }
          //pass按钮 或 为掌握
          .word-control {
            float: right;
            height: 142px;
            line-height: 142px;
            & > div {
              width: 125px;
              height: 100%;
              text-align: center;
              box-sizing: border-box;
              padding-top: 40px;
            }
            .pass {
              height: 59px;
              line-height: 59px;
              color: #ffffff;
              font-size: 28px;
              box-sizing: border-box;
              border-radius: 31px;
              background-color: #ff5f5f;
            }
            .notMaster {
              padding-top: 0;
              color: #4ed9d5;
              font-size: 28px;
            }
          }
        }
        .weui-cell:before {
          border-color: $gray-border;
          left: 0;
        }
        .weui-cell_access.vux-cell-box::after {
          display: none;
        }
      }
      .vux-tap-active:active {
        background-color: $bg-color;
      }
    }
  }
  // 没有生词时的提示
  .forget-tip {
    position: absolute;
    top: $nav-line-height;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    font-size: $max-font-size;
    color: $desc-text-color;
    padding: 10px;
    overflow: hidden;
    box-sizing: border-box;
    background-image: url("~@/assets/images/homework-bg.png");
    background-position: center center;
    background-size: 100%;
    background-repeat: no-repeat;
  }
  //开始学习
  .begin-learn-box {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: $nav-line-height;
    padding: 15px 0;
    box-sizing: border-box;
    background-color: #fff;
    .begin-learn {
      width: 480px;
      height: 80px;
      line-height: 80px;
      font-size: $large-font-size;
      background-color: $main-color;
      text-align: center;
      margin: 0 auto;
      border-radius: 80px;
      color: #ffffff;
      &:active {
        background-color: $main-dark-color;
      }
    }
    .begin-learn-disabled {
      width: 480px;
      height: 80px;
      line-height: 80px;
      font-size: $large-font-size;
      background-color: $disable-color;
      text-align: center;
      margin: 0 auto;
      border-radius: 80px;
      color: #ffffff;
    }
  }
  //弹窗样式
  //弹窗信息
  .tipInfo {
    height: 205px;
    padding: 40px 0;
    box-sizing: border-box;
    p {
      height: 30px;
      line-height: 30px;
      padding: 10px 0;
      margin: 0 auto;
      font-size: $normal-font-size;
    }
    p.normal-family {
      font-family: "Microsoft YaHei";
    }
  }
  .tipBtn {
    height: 250px;
    .abc-btn {
      width: 404px;
      height: 74px;
      line-height: 74px;
      margin: 0 auto;
      margin-bottom: 30px;
      border: 3px solid $main-color;
      border-radius: 74px;
      font-size: $normal-font-size;
      letter-spacing: 10px;
    }
    .yes-btn {
      background-color: $main-color;
      color: #fff;
      &:active {
        background-color: $main-dark-color;
      }
    }
    .no-btn {
      color: $main-color;
      &:active {
        background-color: $bg-color-warm;
      }
    }
  }
}
</style>
