<template>
  <div class='learning-box'>
    <step-word v-if="currStep == 0" :reset='currStep == 0?resetStep:false' @postResult='postResult'></step-word>
    <!-- <step-speech v-else-if="currStep == 1" :reset='currStep == 1?resetStep:false' @postResult='postResult'></step-speech> -->
    <step-speak v-else-if="currStep == 1" :reset='currStep == 1?resetStep:false' @postResult='postResult'></step-speak>
    <step-pick-pic v-else-if="currStep == 2" :reset='currStep == 2?resetStep:false' @postResult='postResult' @right="answerRight" @error="answerError"></step-pick-pic>
    <step-pick-word v-else-if="currStep == 3" :reset='currStep == 3?resetStep:false' @postResult='postResult' @right="answerRight" @error="answerError"></step-pick-word>
    <step-spell-drag v-else-if="currStep == 4" :reset='currStep == 4?resetStep:false' @postResult='postResult' @right="answerRight" @error="answerError"></step-spell-drag>
    <step-sentence v-else-if="currStep == 5" :reset='currStep == 5?resetStep:false' @postResult='postResult'></step-sentence>

    <step-arrow-game v-if="currStep == 6 &&stepType== 'learn'" :playResult='stepScoreInfo' @postResult='postResult' @next='next' @close='closeResult' @showRanking='showGameRanking' :isLast="isLast"></step-arrow-game>
    <step-card-game v-if="currStep == 6 &&stepType != 'learn'" :playResult='stepScoreInfo' @postResult='postResult' @next='next' @close='closeResult' @showRanking='showGameRanking' :isLast="isLast"></step-card-game>
    <step-tap-mouse v-if="currStep == 7 &&stepType == 'learn'" :playResult='stepScoreInfo' @postResult='postResult' @next='next' @close='closeResult' @showRanking='showGameRanking' :isLast="isLast"></step-tap-mouse>
    <step-erasing-game v-if="currStep == 7 &&stepType != 'learn'" :playResult='stepScoreInfo' @postResult='postResult' @next='next' @close='closeResult' @showRanking='showGameRanking' :isLast="isLast"></step-erasing-game>
    <step-radish v-if="currStep == 8 &&stepType== 'learn'" :playResult='stepScoreInfo' @postResult='postResult' @next='next' @close='closeResult' @showRanking='showGameRanking' :isLast="isLast"></step-radish>
    <step-fly-game v-if="currStep == 8 &&stepType != 'learn'" :playResult='stepScoreInfo' @postResult='postResult' @next='next' @close='closeResult' @showRanking='showGameRanking' :isLast="isLast"></step-fly-game>
    <!-- <step-fly-game v-if="currStep == 8" :playResult='stepScoreInfo' @postResult='postResult' @next='next' @close='closeResult' @showRanking='showGameRanking' :isLast="isLast"></step-fly-game> -->
    <step-catch-game v-if="currStep == 9" :playResult='stepScoreInfo' @postResult='postResult' @next='next' @close='closeResult' @showRanking='showGameRanking' :isLast="isLast"></step-catch-game>

    <!-- <score-dialog v-if='stepType === "learn"' :show.sync='showResult' :scoreInfo='stepScoreInfo' @replay='replay' @next='next' @hide='closeResult'></score-dialog> -->
    <score-dialog v-if='stepType === "learn"' :show.sync='showResult' :scoreInfo='stepScoreInfo' :isFail='isFail' @replay='replay' @next='next' @hide='closeResult'></score-dialog>

    <homework-dialog v-if='stepType === "review"' :show.sync='showResult' :scoreInfo='stepScoreInfo' @replay='replay' @next='next' @hide='closeResult'></homework-dialog>
    <!-- <dragon-effects ref="dragon"></dragon-effects> -->
    <ranking-dialog :show.sync="showRankingDialog" :rankingList="rankingList"></ranking-dialog>
  </div>
</template>
<script>
  import stepWord from "./steps/stepWord";
  // import stepSpeech from "./steps/stepSpeech";
  import stepSpeak from "./steps/stepSpeak";
  import stepPickPic from "./steps/stepPickPic";
  import stepPickWord from "./steps/stepPickWord";
  import stepSpellDrag from "./steps/stepSpellDrag";
  import stepSentence from "./steps/stepSentence";

  import stepArrowGame from "@/pages/game/arrowGame";
  import stepTapMouse from "@/pages/game/tapMouse";
  import stepRadish from "@/pages/game/radish";

  import stepCardGame from "@/pages/game/cardGame";
  import stepErasingGame from "@/pages/game/erasingGame";
  import stepFlyGame from "@/pages/game/flyGame";

  import stepCatchGame from "@/pages/game/catchGame";

  import scoreDialog from "@/components/scoreDialog";
  import homeworkDialog from "@/components/homeworkDialog";
  import rankingDialog from "@/components/widgets/rankingDialog";
  import dataService from "@/service/index";
  import {
    TASK_STEP_TITLE,
    TASK_SCORE_TYPE,
    TASK_REVIEW_STEP_TITLE
  } from "@/utility/dict";
  import { resourcePath } from "@/service/urlConfig";
  import learnHeader from "@/components/learnHeader";
  import dragonEffects from './children/dragonEffects'
  export default {
    data() {
      return {
        currStep: -1,
        currTaskNo: "",
        showResult: false,
        timerStart: null,
        showRankingDialog:false,
        stepScoreInfo: null,
        resetStep: false,
        stepTitle: {},
        isLast: false,
        forgetWrongWords: [],
        // 以下为闯关失败弹框所添加
        isFail:false,//是否闯关失败
      };
    },
    computed: {
      rankingList:function(){
        if(this.stepScoreInfo){
          return this.stepScoreInfo.rankList
        }else{
          return []
        }
      },
      wordCount: function () {
        return this.$store.getters.currFlowStepWords.length;
      },
      currFlows: function () {
        return this.$store.getters.flowTask;
      },
      currStepPart: function () {
        return this.$store.getters.currStepPart || 0;
      },
      stepType: function () {
        let type = this.$store.getters.flowType;
        if (type === TASK_SCORE_TYPE.unit) {
          this.stepTitle = TASK_STEP_TITLE;
          return "learn";
        } else {
          this.stepTitle = TASK_REVIEW_STEP_TITLE;
          return "review";
        }
      },
      userInfo: function () {
        return this.$store.getters.userInfo;
      },
      pressCode: function () {
        return this.$store.getters.getPressCode;
      }
    },
    mounted() {
      let step = this.$route.params.step;
      let taskNo = this.$route.params.taskNo;
      if (step != null) {
        let currIdx = this.currFlows.findIndex((flow, idx) => {
          return flow.taskNo === taskNo;
        });
        let stepsCount = this.currFlows.length;
        if (currIdx === stepsCount - 1) {
          this.isLast = true;
        }

        this.currStep = step;
        this.currTaskNo = taskNo;
      }
      this.timerStart = new Date();
    },
    methods: {
      postResult: function (wrongWords = [], score, isGame = false) {
        console.log("------post result", wrongWords, score, isGame);
        if (!isGame) {
          this.$store.commit("loading", true);
        }
        let timerEnd = new Date();
        let time = Math.ceil((timerEnd - this.timerStart) / 1000);
        if (score == null) {
          score = (this.wordCount - wrongWords.length) * 10;
        }
        if(score == 0){
          this.isFail=true;//为闯关失败弹窗所添加
        }else{
          this.isFail=false;
        }
        let flowType = this.$store.getters.flowType;
        let flowId = this.$store.getters.flowId;
        let wrongWordIds = wrongWords.join(",");
        console.log("------currStep", this.currStep);
        if (flowType === TASK_SCORE_TYPE.forgetWords) {
          // 生词本任务不提交结果，在最后的时候，一次性标记生词
          this.stepScoreInfo = {
            stepTitle: this.stepTitle[this.currStep],
            score: score,
            rankList: [
              {
                nickname: this.userInfo.nickName,
                gender: this.userInfo.gender,
                score: score,
                icon: this.userInfo.inco
              }
            ]
          };
          this.$store.commit("updateFlowStepTask", {
            taskNo: this.currTaskNo,
            played: "Y"
          });
          this.$store.commit("loading", false);
          if (!isGame) {
            this.showResult = true;
          }
          wrongWords.forEach(item => {
            if (this.forgetWrongWords.indexOf(item) === -1) {
              this.forgetWrongWords.push(item)
            }
          })
          this.$store.commit('setForgetWrongWords', wrongWords)
        } else {
          dataService
            .sendTaskScore(
            this.currTaskNo,
            wrongWordIds,
            time,
            flowType,
            score,
            flowId,
            this.pressCode
            )
            .then(
            res => {
              let resultData = res.data;
              this.$store.commit("loading", false);
              if (resultData.code == 200) {
                let data = resultData.data;
                let reward = data.reward;
                let rankList = data.top;
                let myLocation = data.myLocation;
                let resultScore = data.score;
                let taskInfo = data.taskInfo;
                if (rankList) {
                  rankList.forEach(item => {
                    let icon = item.icon;
                    if (icon) {
                      item.icon = resourcePath + item.icon;
                    }
                  });
                } else {
                  rankList = [
                    {
                      nickname: this.userInfo.nickName,
                      gender: this.userInfo.gender,
                      score: score,
                      icon: this.userInfo.inco
                    }
                  ];
                }
                let wrongCount = wrongWords.length;
                let scoreInfo = {
                  stepTitle: this.stepTitle[this.currStep],
                  reward: reward,
                  score: resultScore,
                  location: myLocation,
                  rankList: rankList,
                  star: taskInfo.playDays && taskInfo.playDays - 1,
                  desc:
                    this.randomPercentage(resultScore / this.wordCount * 10) +
                    " %"
                };
                this.$store.commit("updateFlowStepTask", taskInfo);
                this.stepScoreInfo = scoreInfo;
                if (!isGame) {
                  this.showResult = true;
                }

                this.$store.dispatch("getAccountInfo");
              } else {
                this.$store.dispatch("showTipsMsg", "分数无效");
                let scoreInfo = {
                  stepTitle: this.stepTitle[this.currStep],
                  reward: 0,
                  score: 0,
                  location: 0,
                  rankList: [],
                  star: 0,
                  desc: "0%",
                  invaild: true
                };
                this.stepScoreInfo = scoreInfo;
                if (!isGame) {
                  this.showResult = true;
                }
              }
            },
            err => {
              this.$store.dispatch("showTipsMsg", "分数无效");
              let scoreInfo = {
                stepTitle: this.stepTitle[this.currStep],
                reward: 0,
                score: 0,
                location: 0,
                rankList: [],
                star: 0,
                desc: "0%",
                invaild: true
              };
              this.stepScoreInfo = scoreInfo;
              if (!isGame) {
                this.showResult = true;
              }
            }
            );
        }
      },
      replay: function () {
        this.showResult = false;
        this.resetStep = true;
        this.$nextTick(() => {
          this.resetStep = false;
        });
      },
      next: function () {
        let nextIdx = 0;
        let stepsCount = this.currFlows.length;
        let nextFlow = null;
        this.stepScoreInfo = null;
        if (this.stepType === "learn") {
          nextFlow = this.currFlows.find((flow, idx) => {
            nextIdx = idx;
            return flow.parentTaskNo == this.currTaskNo;
          });
        } else {
          let currIdx = this.currFlows.findIndex((flow, idx) => {
            return flow.taskNo === this.currTaskNo;
          });
          nextIdx = currIdx + 1;
          nextFlow = this.currFlows[nextIdx];
        }

        if (nextFlow) {
          this.currTaskNo = nextFlow.taskNo;
          if (nextIdx === stepsCount - 1) {
            this.isLast = true;
          }
          if (nextIdx === 9) {
            this.$store.commit("setCurrStepPart", 1);
          } else if (stepsCount === 28 && nextIdx === 18) {
            this.$store.commit("setCurrStepPart", 2);
          }
          if (this.currStepPart == 0) {
            this.currStep = nextIdx;
          } else if (this.currStepPart == 1) {
            this.currStep = nextIdx - 9;
          } else {
            this.currStep = nextIdx - 18;
          }
        } else {

          // 学习结束
          this.$store.commit("setLearningBack", true);
          this.$router.go(-1);
        }
        this.showResult = false;
      },
      showGameRanking: function () {
        this.showRankingDialog = true
        console.log("-----show ranking");
      },
      closeResult: function () {
        this.$store.commit("setLearningBack", true);
        this.$router.go(-1);
      },
      randomPercentage: function (percent) {
        if (percent >= 90) {
          return this.getRandomInt(90, 100);
        } else if (percent > 80) {
          return this.getRandomInt(80, 90);
        } else if (percent > 70) {
          return this.getRandomInt(70, 80);
        } else if (percent > 60) {
          return this.getRandomInt(50, 70);
        } else if (percent > 30) {
          return this.getRandomInt(30, 50);
        } else {
          return this.getRandomInt(5, 30);
        }
      },
      getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
      },
      answerRight(){//答对的时候乐
        // this.$refs.dragon && this.$refs.dragon.playVictory()
      },
      answerError(){ //答错的时候哭
        // this.$refs.dragon && this.$refs.dragon.playCry()
      }
    },
    components: {
      stepWord,
      // stepSpeech,
      stepSpeak,
      stepPickPic,
      stepPickWord,
      stepSpellDrag,
      stepSentence,
      stepArrowGame,
      stepTapMouse,
      stepRadish,
      stepCatchGame,
      scoreDialog,
      learnHeader,
      homeworkDialog,
      stepCardGame,
      stepErasingGame,
      stepFlyGame,
      dragonEffects,
      rankingDialog
    }
  };
</script>
<style lang="scss" scoped>
  @import '~@/assets/css/variables';
  .learning-box {
  	width: 100%;
  	height: 100%;
  	// position:relative;
  	// .step-item{
  	//   position:absolute;
  	//   z-index:5;
  	// }
  	// .step-fade-enter-active,
  	// .step-fade-leave-active {
  	//   transition: all 0.8s;
  	// }
  	// .step-fade-enter,
  	// .step-fade-leave-active {
  	//   opacity: 0;
  	// }
  	// .step-fade-enter {
  	//   transform: translateX(680px);
  	// }
  	// .step-fade-leave-active {
  	//   transform: translateX(-680px);
  	// }
  }
</style>
