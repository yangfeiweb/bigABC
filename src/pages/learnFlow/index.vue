<template>
  <div class='learn-flow'>
    <learnHeader v-if="!showForgetDialog"></learnHeader>
    <learnHeader v-else :callback="showTipDialog"></learnHeader>
    <!-- <div class='transition-tips cnfont'>努力加载中...</div> -->
    <div class='flow-container' v-if='loadProgress >=98'>
      <singleFlow v-if='single'></singleFlow>
      <multiFlow v-else></multiFlow>
    </div>
    <div class='loading' v-show='loadProgress < 98'>
      <div class='img-container' v-show='loadProgress < 98'>
        <img class='learn-loading-img' src='static/images/flowLoading.png' />
      </div>
      <div class='progress-bar' v-show='loadProgress < 98'>
        <div class='progress-inner' :style='{width:loadProgress+"%"}'></div>
        <div class='progress-info cnfont'>
          加载资源中... {{loadProgress}} %
        </div>
      </div>
    </div>
    <div v-show='!isTourist && stepType === "learn" && loadProgress >=98' class='change-unit-container' @click='showChangeDialog=true'>
      <span class='change-text-first cnfont'>切换</span>
      <span class='change-text-second cnfont'>单元</span>
    </div>
    <unit-dialog :show.sync="showChangeDialog"></unit-dialog>
    <!-- 生词本任务返回时的提示 -->
    <opt-dialog :show.sync="showTaskTip">
      <div class="tip-body">
        <div class="tip-info">
          <span>退出后本次成绩将无效,下次将重新开始</span>
        </div>
        <div class="btn-group">
          <div class="calcelBtn btn" @click="calcelBtn">
            取消
          </div>
          <div class="confirmBtn btn" @click="confirmBtn">
            确认
          </div>
        </div>
      </div>
    </opt-dialog>
    <opt-dialog :show.sync="showResult" @hide="hideResultDialog">
      <div class="dialog-tips">
        <p class="info">{{resultDialogTips}}</p>
        <div class="info-btn" @click="hideResultDialog">确定</div>
      </div>
    </opt-dialog>
  </div>
</template>
<script>
import learnHeader from "@/components/learnHeader";
import singleFlow from "./children/singleFlow";
import multiFlow from "./children/multiFlow";
import utility from "@/utility/utility";
import unitDialog from "@/components/unitDialog";
import optDialog from "@/components/widgets/optDialog";
// import flowLoading from "@/components/flowLoading";
import { TASK_SCORE_TYPE } from "@/utility/dict";
import { downloadResource, clearCache } from "@/utility/io";
import dataService from "@/service/index";
export default {
  data() {
    return {
      showTaskTip: false,
      showChangeDialog: false,
      showResult: false,
      resultDialogTips: "",
      loadProgress: 0
    };
  },
  computed: {
    single: function() {
      let isSingle = true;
      let currFlows = this.$store.getters.flowTask;
      if (currFlows.length > 10) {
        isSingle = false;
      }
      return isSingle;
    },
    isTourist: function() {
      return this.$store.getters.isTourist;
    },
    flowId: function() {
      return this.$store.getters.flowId;
    },
    stepType: function() {
      let flowType = this.$store.getters.flowType;
      let type = "";
      if (flowType === TASK_SCORE_TYPE.unit) {
        type = "learn";
      } else {
        type = "review";
      }
      return type;
    },
    isBack: function() {
      return this.$store.getters.learningBack;
    },
    showForgetDialog: function() {
      let flowType = this.$store.getters.flowType;
      return flowType === TASK_SCORE_TYPE.forgetWords;
    }
  },
  watch: {
    flowId: function(val) {
      this.checkResource();
    },
    "$store.getters.dialogShowing": function(val) {
      if (this.showForgetDialog) {
        if (val) {
          this.showTaskTip = true;
        } else {
          this.showTaskTip = false;
        }
      }
    }
  },
  created: function() {
    if (!this.isBack) {
      this.checkResource();
    } else {
      this.loadProgress = 100;
    }
    if (this.showForgetDialog) {
      this.$store.commit("setIsGameing", true);
    }
    let title = this.$store.getters.flowTitle;
    this.resultDialogTips = title + "已完成！";
    console.log("-----------flowTitle1 " + title);
    if (this.stepType === "review") {
      let flows = this.$store.getters.flowTask;
      let len = flows.length;
      let lastTask = flows[len - 1];
      this.showResult = lastTask["played"] === "Y";
      if (this.showResult) {
        let type = this.$store.getters.flowType;
        if (type === TASK_SCORE_TYPE.forgetWords) {
          // 调用移除生词本接口
          let passedWords = [];
          let totalWords = this.$store.getters.flowWords;
          let forgetWrongWrods = this.$store.getters.forgetWrongWords;
          totalWords.forEach(word => {
            let wordId = word.id;
            let idx = forgetWrongWrods.findIndex(item => {
              return item === wordId;
            });
            if (idx === -1) {
              passedWords.push(wordId);
            }
          });
          dataService.markForgetPassedWords(passedWords.join(","));
        }
      }
    }
  },
  methods: {
    checkResource: function() {
      this.loadProgress = 0;
      let cachedId = this.$store.getters.cachedId;
      let flowId = this.flowId;
      let flowType = this.$store.getters.flowType;
      let plus = window.plus;
      if (plus) {
        if (flowType === TASK_SCORE_TYPE.forgetWords) {
          console.log("------forget words...");
          console.log(JSON.stringify(this.$store.getters.flowWords));
          this.cacheResource();
        } else if (cachedId != flowId) {
          // 清除之前的资源
          // clearCache().then(res => {
          //   console.log("-----begin cache resource...");
          this.$store.commit("setCachedId", flowId);
          this.cacheResource();
          // });
        } else {
          this.loadProgress = 100;
        }
      } else {
        this.loadProgress = 100;
      }
    },
    cacheResource: function() {
      console.log("----cacheResource...");
      setTimeout(() => {
        // 缓存资源
        // 1. 单词图片、声音资源， 2. 例句声音图片资源
        let resourceCount = 0;
        let completeCount = 0;
        let resultArr = [];
        let words = this.$store.getters.flowWords;
        resourceCount = words.length * 2;
        words &&
          words.forEach(word => {
            let statements = word.statements;
            if (statements) {
              statements &&
                statements.forEach(item => {
                  let img = item.imgName;
                  let voice = item.voiceName;
                  if (img) {
                    resourceCount++;
                  }
                  if (voice) {
                    resourceCount++;
                  }
                });
            }
          });
        words &&
          words.forEach(word => {
            let imgName = word.imgName;
            let voiceName = word.voiceName;
            let statements = word.statements;
            statements &&
              statements.forEach(statementItem => {
                let img = statementItem.imgName;
                let voice = statementItem.voiceName;
                img &&
                  downloadResource(img).then(
                    data => {
                      updateProgress(data);
                      statementItem.imgUrl = data;
                    },
                    err => {
                      updateProgress(err);
                      statementItem.imgUrl = err;
                    }
                  );
                voice &&
                  downloadResource(voice).then(
                    data => {
                      updateProgress(data);
                      statementItem.voiceUrl = data;
                    },
                    err => {
                      updateProgress(err);
                      statementItem.voiceUrl = err;
                    }
                  );
              });
            downloadResource(imgName).then(
              data => {
                updateProgress(data);
                word.imgUrl = data;
              },
              err => {
                updateProgress(err);
                word.imgUrl = err;
              }
            );
            downloadResource(voiceName).then(
              data => {
                updateProgress(data);
                word.voiceUrl = data;
              },
              err => {
                updateProgress(err);
                word.voiceUrl = err;
              }
            );
          });
        let me = this;
        function updateProgress(url) {
          resultArr.push(url);
          completeCount = resultArr.length;
          me.loadProgress = Math.ceil(completeCount / resourceCount * 100);
          console.log("----------load progress..." + me.loadProgress);
          console.log("----------completeCount " + completeCount);
          console.log("----------resourceCount " + resourceCount);
          if (me.loadProgress === 100) {
            console.log("----completed..");
            // console.log(JSON.stringify(words))
          }
        }
      }, 200);
    },
    calcelBtn() {
      this.showTaskTip = false;
    },
    showTipDialog: function() {
      this.showTaskTip = true;
    },
    confirmBtn() {
      this.$router.go(-1);
    },
    hideResultDialog() {
      // this.$store.commit("showFlowResult", false);
      this.showResult = false;
      this.$router.go(-1);
    }
  },
  beforeDestroy() {
    if (this.showForgetDialog) {
      this.$store.commit("setIsGameing", false);
    }
    console.log("------flow destroy");
    this.$store.dispatch("getScoreRankings");
    let buttons = document.querySelectorAll('[title="HOOK DIV"]');

    if (buttons && buttons.length) {
      for (let i = 0; i < buttons.length; i++) {
        let item = buttons[i];
        item.remove();
      }
    }
  },
  components: {
    learnHeader,
    singleFlow,
    multiFlow,
    unitDialog,
    optDialog
    // flowLoading
  }
};
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables";
.learn-flow {
  height: 100%;
  width: 100%;
  background: $main-color;
  // display:flex;
  // flex-direction:column;
  .transition-tips {
    position: absolute;
    font-size: $large-font-size;
    color: #fff;
    top: 50%;
    text-align: center;
    width: 100%;
  }
  position: relative;
  .flow-container {
    // flex:1;
    position: absolute;
    top: 150px;
    bottom: 0;
    left: 0;
    right: 0;
    // padding:20px;
    padding: 0 20px 20px 20px;
  }
  .loading {
    position: absolute;
    top: 150px;
    bottom: 0;
    left: 0;
    right: 0;
    .img-container {
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: $bg-color-warm;
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      overflow: hidden;

      .learn-loading-img {
        position: absolute;
        width: 415px;
        height: 320px;
        top: 20%;
        animation-name: flowLoadingAnimate;
        animation-duration: 1s;
        animation-timing-function: linear;
        animation-iteration-count: 100;
        animation-play-state: running;
      }
    }

    .progress-bar {
      width: 500px;
      height: 20px;
      bottom: 25%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      // top: 50%;
      // left: 80px;
      // transform: translateY(-50%);
      background: lightgray;
      // background: #89ced0;
      border: 6px solid #fff;
      border-radius: 20px;
      position: absolute;
      .progress-inner {
        background: $assist-light-color;
        border-radius: 10px;
        height: 100%;
      }
      .progress-info {
        // position: absolute;
        font-size: $normal-font-size;
        color: #fff;
        margin-top: 20px;
      }
    }
  }

  .change-unit-container {
    position: fixed;
    right: 10px;
    bottom: 120px;
    width: 140px;
    height: 140px;
    background-image: url("~@/assets/images/btn-change-course.png");
    background-size: 139px;
    text-align: center;
    color: $main-color;
    .change-text-first {
      display: block;
      margin-top: 20px;
    }
    .change-text-second {
      display: block;
    }
  }
  @keyframes flowLoadingAnimate {
    0% {
      transform: translateX(-20%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  .tip-body {
    .tip-info {
      width: 80%;
      font-size: $normal-font-size;
      color: $body-text-color;
      margin: 20px auto;
    }
    .btn-group {
      margin: 20px auto;
      .btn {
        display: inline-block;
        width: 250px;
        height: 70px;
        line-height: 70px;
        text-align: center;
        font-size: $normal-font-size;
        border: 4px solid $main-color;
        border-radius: 70px;
        color: $main-color;
      }
      .confirmBtn {
        background-color: $main-color;
        color: #ffffff;
      }
    }
  }
  .dialog-tips {
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
