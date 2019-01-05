<template>
  <div class="setp-say">
    <learn-header></learn-header>
    <div class="say-box">
      <div class="say-core">
        <div class="english-word">
          <transition name="word-move-animation">
            <div class="move-container" v-for="(word,index) in wordList" :key="index" v-if="index === curr">
              <div class="word-mean">
                <!-- 单词，音标，中文意思 -->
                <div class="word">
                  <span> {{word.word}}</span>
                </div>
                <div class="readStyle" v-if="word.readStyleUsa || word.readStyle">
                  <span v-if="word.readStyleUsa" class="readStyleUsa"> [美] {{word.readStyle}}</span>
                  <span v-if="word.readStyle" class="readStyleUk">[英] {{word.readStyle}}</span>
                </div>
                <div class="mean cnfont">
                  {{word.wordSort}} {{word.chinese}}
                </div>
              </div>
              <div class="lisen-word">
                <speaker color="blue" :audioSrc='word.voiceUrl' autoPlay :delay='audioDelay' @canPlay='audioCanPlay' @onEnd="audioPlayEnd"></speaker>
              </div>
            </div>
          </transition>
          <!-- 画两个小圆 -->
          <div class="draw-circle">
            <i class="circle-small"></i>
            <i class="circle-big"></i>
          </div>
          <transition name="tip-fade">
            <div class="tipInfo" v-show="showTip">
              <p>{{tipText}}</p>
            </div>
          </transition>
          <div class="say-control">
            <!-- 录音图片 -->
            <div v-if="recordable" class="sound-img" @touchstart="recordStart">
            <!-- <div v-if="recordable" class="sound-img" @touchstart="recordStart" @touchend='recordEnd'> -->
              <img src="static/images/btn-record.png">
            </div>
            <div v-else class="sound-img">
              <img src="static/images/btn-record-gray.png">
            </div>
            <!-- //录音动画圆环 -->
            <div class="circleProgress_wrapper" v-show="startAnimation">
              <div class="wrapper right">
                <div ref="rightAnimate" class="circleProgress rightcircle" :class="{rightcircle_animation:startAnimation }">
                </div>
              </div>
              <div class="wrapper left">
                <div ref="leftAnimate" class="circleProgress leftcircle" :class="{leftcircle_animation:startAnimation }">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class=" englishText" v-show="text">
          <span>{{text}}</span>
        </div>
        <!-- 大按钮 -->
        <div class="say-btn cnfont" :class="{'disabled':!nextable}" @click="next">
          <!-- 显示正在进行的是第几个单词 -->
          <div class="number">
           {{curr === wordList.length-1? "完成 ": "下一个 "}}{{complateAndTotal}}
          </div>
        </div>
      </div>
    </div>
    <right-wrong-voice ref="voice"></right-wrong-voice>
  </div>
</template>

<script>
import learnHeader from "@/components/learnHeader";
import speaker from "@/components/widgets/speaker";
import scoreDialog from "@/components/scoreDialog";
import rightWrongVoice from "@/components/rightWrongVoice";
const TIME_OUT = 4000; //语音识别时间限制 4s
export default {
  props: ["reset"],
  data() {
    return {
      nextable: false,
      recordable: false,
      timeLimit: 2000,
      showTip: false, //显示提示信息
      tipText: "", //提示文字
      startAnimation: false, //显示圆环动画
      curr: 0, //当前正在进行的是第几个单词
      options: {
        //语音识别配置信息
        engine: "ifly",
        timeout: TIME_OUT,
        lang: "en-us",
        punctuation: false,
        nbest: 1,
        continue: false
      },
      wrongWords: new Set(), //错误单词
      text: "", //语音识别出来的文字
      userScore: 0, //用户得分
      audioDelay: 500,
      recordingNum: 1 //用户识别的次数
    };
  },
  computed: {
    complateAndTotal: function() {
      return `(${this.curr + 1}/${this.wordList.length})`;
    },
    wordList: function() {
      return this.$store.getters.currFlowStepWords;
    }
  },

  watch: {
    reset: function(val) {
      if (val) {
        this.curr = 0;
        this.wrongWords = new Set();
      }
    }
  },
  methods: {
    audioCanPlay: function(duration) {
      if (duration) {
        this.timeLimit = Math.ceil(duration * 1000);
        console.log("-------timeLimit--" + this.timeLimit);
        if (this.timeLimit < 1200) {
          this.timeLimit = 1500;
        }
      } else {
        this.timeLimit = 1500;
      }
      let animationDuration = this.timeLimit / 1000 + "s";
      this.$refs.leftAnimate.style.animationDuration = animationDuration;
      this.$refs.rightAnimate.style.animationDuration = animationDuration;
    },
    audioPlayEnd: function() {
      this.recordable = true;
    },
    clickShowTip: function(text) {
      this.showTip = true;
      this.tipText = text || "";
      let timer = setTimeout(() => {
        this.showTip = false;
        clearTimeout(timer);
        timer = null;
      }, 1000);
    },
    recordStart: function() {
      //开始识别
      if (window.plus) {
        // 有录音权限
        this.nextable = false
        if (window.plus.navigator.checkPermission("RECORD")) {
          let word = this.wordList[this.curr];
          let wordText = word.word;
          this.text = "";
          let speechText = wordText.replace("/", " ");
          speechText = speechText.replace("-", " ");
          wordText.replace();
          plus.qdreamerSpeech.speechStart(
            speechText,
            success => {
              this.startAnimation = true; //开始动画

              // alert("start..." + success);
            },
            err => {
              alert("start..." + err);
            }
          );
          setTimeout(() => {
            this.recordEnd();
          }, this.timeLimit);
        } else {
          this.text = "开通录音权限后请重试！";
          setTimeout(() => {
            this.text = "";
          }, 3000);
        }
      } else {
        console.log("-----------start");
        //电脑上测试的
        this.startAnimation = true; //开始动画
        this.timerRecord = setTimeout(() => {
          if (this.startAnimation) {
            this.startAnimation = false;
            clearTimeout(this.timerRecord);
            this.timerRecord = null;
            if (Math.random() > 0.5) {
              //假设回答正确
              this.next();
              this.playSuccess();
            } else {
              //假设回答不正确
              this.answerWrong();
              this.playError();
            }
          }
        }, 1500);
      }
    },
    recordEnd: function() {
      if (window.plus) {
        plus.qdreamerSpeech.speechEnd(
          success => {
            this.startAnimation = false;
            let result = JSON.parse(success);
            let total = result.total;
            this.text = total + " 分";
            this.nextable = true
            this.playSuccess();
          },
          err => {
            this.text = "换个姿势再试一次！";
            this.$refs.voice.playFailed();
          }
        );
      }
    },
    playSuccess() {
      this.$refs.voice.playSuccess();
    },
    playError() {
      this.$refs.voice.playFailed();
    },
    discrenResult(englishText) {
      //处理识别后的文字
      //处理语音识别后返回的数据
      if (plus.os.name.toLowerCase() == "ios") {
        if (typeof englishText === "object") {
          let firstItem = englishText[0];
          englishText = firstItem;
        }
      }
      this.text = englishText.toLowerCase();
      let word = this.wordList[this.curr].word;
      if (this.text === word.toLowerCase()) {
        this.userScore += 10;
        this.playSuccess();
        let timer = setTimeout(() => {
          clearTimeout(timer);
          timer = null;
          this.recordingNum = 1;
          this.next();
        }, 1000);
        return;
      }
      let text = this.text;
      text = text.replace(/\s/g, "");
      if (text === word.toLowerCase()) {
        this.userScore += 10;
        this.playSuccess();
        let timer = setTimeout(() => {
          clearTimeout(timer);
          timer = null;
          this.recordingNum = 1;
          this.next();
        }, 1000);
      } else {
        this.playError();
        this.discrenError();
      }
    },
    discrenError() {
      //识别错误之后的处理 最多读错3次
      if (this.recordingNum === 3) {
        //最多可以读3次  错三次才扣分
        // this.answerWrong();
        let timer = setTimeout(() => {
          clearTimeout(timer);
          timer = null;
          this.recordingNum = 1;
          this.next();
        }, 500);
      } else {
        this.clickShowTip("读音不正确，请再试一次");
        this.recordingNum++;
      }
    },
    next() {
      if (this.nextable) {
        this.text = "";
        if (this.curr === this.wordList.length - 1) {
          let wrongWords = Array.from(this.wrongWords);
          this.$emit("postResult", []);
        } else {
          this.curr++;
        }
      }
      this.nextable = false
    },
    answerWrong() {
      let word = this.wordList[this.curr];
      word && this.wrongWords.add(word.id);
      // this.next();
    }
  },
  components: {
    learnHeader,
    speaker,
    scoreDialog,
    rightWrongVoice
  }
};
</script>

<style lang="scss">
@mixin bor-radius($color, $width) {
  width: $width;
  height: $width;
  border-radius: $width;
}
@import "~@/assets/css/variables";
.setp-say {
  position: relative;
  width: 100%;
  height: 100%;
  background: {
    color: $main-color;
  }
  .say-box {
    position: absolute;
    top: 150px;
    left: 0;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    padding: 15px;
    overflow: hidden;
    .say-core {
      width: 100%;
      height: 100%;
      background-color: #fff;
      border-radius: 30px;
      position: relative;

      //下方橘黄色按钮
      .say-btn {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 160px;
        line-height: 160px;
        text-align: center;
        &.disabled {
          .number {
            background: $disable-color;
            color: #fff;
            &:active {
              background: $disable-color;
            }
          }
        }
        .number {
          width: 80%;
          height: 100px;
          line-height: 100px;
          text-align: center;
          background: $assist-light-color;
          margin: 0 auto;
          color: $main-color;
          font-size: $large-font-size;
          border-radius: 100px;
          &:active {
            background: $assist-color;
          }
        }
      }
    }
  }
  //英语单词，读音，音标
  .english-word {
    position: relative;
    width: 100%;
    padding-top: 350px;
    box-sizing: border-box;
    .move-container {
      position: absolute;
      top: 50px;
      left: 0;
      width: 100%;
      height: 270px;
      .word-mean {
        width: 100%;
        // height: 150px;
        margin: 0 auto;
        .word {
          display: flex;
          justify-content: center;
          margin: 0 auto;
          // height: 100px;
          // line-height: 100px;
          font-size: $normal-font-size;
          font-weight: 900;
        }
        .readStyle {
          width: 100%;
          font-size: $mini-font-size;
          font-weight: 500;
          // margin:0 auto;
          text-align: center;
          .readStyleUsa,
          .readStyleUk {
            display: block;
          }
          .readStyleUk {
            color: $desc-text-color;
          }
        }
        .mean {
          width: 100%;
          // height: 50px;
          text-align: center;
          line-height: 50px;
          color: $desc-text-color;
          font-size: $small-font-size;
        }
      }
      .lisen-word {
        width: 80px;
        padding: 45px 0;
        margin: 0 auto;
        box-sizing: border-box;
      }
    }
  }

  //单词和音标和播放按钮动画
  .word-move-animation-enter-active,
  .word-move-animation-leave-active {
    transition: all 1s;
  }
  .word-move-animation-enter,
  .word-move-animation-leave-active {
    opacity: 0;
  }
  .word-move-animation-enter {
    transform: translateX(600px);
  }
  .word-move-animation-leave-active {
    transform: translateX(-600px);
  }
  //俩小圆
  .draw-circle {
    width: 250px;
    // height: 100px;
    margin: 20px auto;
    & > i {
      display: block;
      margin: 0 auto;
    }
    .circle-small {
      @include bor-radius($embellish-color, 10px);
      background-color: rgba(78, 217, 213, 0.5);
    }
    .circle-big {
      @include bor-radius($embellish-color, 20px);
      background-color: rgba(78, 217, 213, 0.8);
      margin-top: 35px;
    }
  }
  .englishText {
    width: 100%;
    height: 50px;
    line-height: 50px;
    font-size: $large-font-size;
    font-weight: 400;
    text-align: center;
  }
  //提示信息
  .tipInfo {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 375px;
    height: 60px;
    line-height: 60px;
    border-radius: 10px;
    background-color: rgba(152, 152, 152, 0.8);
    color: #fff;
    text-align: center;
    transform: translate(-50%, -50%);
    z-index: 100;
    p {
      font-size: $small-font-size;
      font-weight: normal;
    }
  }
  //   提示信息动画
  .tip-fade-enter {
    opacity: 0;
  }
  .tip-fade-leave-active {
    transition: opacity 1s;
  }
  .tip-fade-enter-active {
    transition: opacity 0.5s;
  }
  .tip-fade-enter-to {
    opacity: 1;
  }
  .tip-fade-leave-to {
    opacity: 0;
  }
  // 录音控件
  .say-control {
    position: relative;
    height: 300px;
    padding-top: 30px;
    box-sizing: border-box;
    //圆环动画
    .circleProgress_wrapper {
      position: relative;
      width: 240px;
      height: 240px;
      margin: 0px auto;
    }
    .right {
      right: 2px;
    }
    .left {
      left: 2px;
    }
    .wrapper {
      position: absolute;
      top: 0;
      width: 121px;
      height: 240px;
      margin: 0;
      overflow: hidden;
    }

    .circleProgress {
      position: absolute;
      top: 0;
      width: 220px;
      height: 220px;
      border: 10px solid transparent;
      border-radius: 50%;
      transform: rotate(45deg);
    }
    .rightcircle {
      border-top: 10px solid $embellish-color;
      border-right: 10px solid $embellish-color;
      right: 0;
    }
    .rightcircle_animation {
      animation: circleProgressLoad_right 5s linear;
    }
    .leftcircle {
      border-bottom: 10px solid $embellish-color;
      border-left: 10px solid $embellish-color;
      left: 0;
    }
    .leftcircle_animation {
      animation: circleProgressLoad_left 5s linear;
    }

    @keyframes circleProgressLoad_right {
      0% {
        transform: rotate(-135deg);
      }
      50%,
      100% {
        transform: rotate(44deg);
      }
    }
    @keyframes circleProgressLoad_left {
      0%,
      50% {
        transform: rotate(-136deg);
      }
      100% {
        transform: rotate(45deg);
      }
    }

    //录音图片
    .sound-img {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 260px;
      height: 260px;
      padding: 20px;
      box-sizing: border-box;
      transform: translate(-50%, -50%);
      & > img {
        width: 220px;
        height: 220px;
      }
    }
  }
}
</style>
