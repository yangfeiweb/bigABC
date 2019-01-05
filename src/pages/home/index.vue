<template>
  <div class='home'>
    <div class='top-nav'>
      <div class='header-info'>
        <div class='col1'>
          <img src="static/images/icon-diamond.png">
          <span>{{diamonds}}</span>
        </div>
        <div class='col2 ' @click='unitClick()'>
          {{currUnitName}}
          <i class='iconfont icon-xiala-sanjiaoxing'></i>
        </div>
        <div class='col3'>
          <img src="static/images/icon-coin.png">
          <span>{{coins}}</span>
        </div>
      </div>
      <ul class='grid cnfont'>
        <li class='grid-li' @click='wordClick()'>
          <img src="static/images/home-words.png">
          <div>单词表</div>
        </li>
        <li class='grid-li' @click='noteClick()'>
          <img src="static/images/home-notebook.png">
          <div>生词本</div>
        </li>
        <li class='grid-li ' @click='workClick()'>
          <img src="static/images/homework.png">
          <div>任务</div>
        </li>
        <li class='grid-li ' @click='recordClick()'>
          <img src="static/images/home-record.png">
          <div>记录</div>
        </li>
      </ul>
    </div>
    <div class='box cnfont'>
      <div class='box-out'>
        <div class='box-in '>
          <div class='logo-container'>
            <div>
              <img class="dragon-logo" src='static/images/home-logo.png '>
              <div class='btn' @click='checkReview'>开始背单词</div>
            </div>
          </div>
          <div class='ranking-container'>
            <div class='score-ranking'>
              <ul>
                <li v-for="(item, idx) in scoreRankings" :key='idx' v-if='!((userRankIdx == -1 || userRankIdx>4) && idx>2)' @click='rankClick'>
                  <div class="img-up-container">
                    <img v-if="idx ===0" src="static/images/crown-first.png" class='img-up'></img>
                    <img v-else-if="idx ===1" src="static/images/crown-second.png" class='img-up'></img>
                    <img v-else-if="idx ===2" src="static/images/crown-third.png" class='img-up'></img>
                    <img v-else-if='idx ===scoreRankings' src="static/images/icon-arrow-red.png" class='img-up-arrow'></img>
                  </div>
                  <div class='head-img-container'>
                    <img class='head-img' :src='item.icon'></img>
                  </div>
                  <div class='raningLabel' :class='{currRanking: idx === userRankIdx}'>No.{{idx+1}}</div>
                </li>
              </ul>
              <div v-if="scoreRankings&& scoreRankings.length>0 && (userRankIdx == -1 || userRankIdx>4 )" class='outer-rank'>
                <span class='ellipsis'>. . .</span>
                <span @click='rankClick' class='user-rank'>
                  <div class="img-up-container">
                    <img src="static/images/icon-arrow-red.png" class='img-up-arrow'>
                  </div>
                  <div class='head-img-container'>
                    <img class='head-img' :src='userInfo.icon'></img>
                  </div>
                  <div v-if="userRankIdx!=-1" class='raningLabel currRanking'>No.{{userRankIdx+1}}</div>
                  <div v-else class='raningLabel currRanking'>未进榜</div>
                </span>
                <span class='ellipsis'>. . .</span>
              </div>
              <div v-if="!scoreRankings || scoreRankings.length ==0" class='ranking-tips cnfont'>
                快去闯关，刷新日排行吧！
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="home-school" :class="[schoolClass]" v-if="showAddSchool">
      <div class="home-school-left" @click='schoolClick()'>
        <div>加</div>
        <div>入</div>
        <div>校</div>
        <div>区</div>
      </div>
      <div class="home-school-right" v-show='expandAddSchool'>
        <div @click='scanCode'>
          <i class='iconfont icon-saoma'></i>扫码加入
        </div
        <div @click='idClick'>
          <i class='iconfont icon-lock'></i>ID码加入
        </div>
      </div>
    </div>
    <div class="mask" @click='maskClick()' v-show='expandAddSchool'></div> -->

    <unit-dialog :show.sync="showUnitDialog"></unit-dialog>
    <opt-dialog :show.sync="showIdDailog" title='加入学校' class='cnfont'>
      <div class='school-input'>
        <input type="text" placeholder="请在此输入你的学校编号" class='cnfont' v-model='schoolNo'>
        <br>
        <a @click='joinSchoolClick'>确定加入</a>
      </div>
    </opt-dialog>
    <opt-dialog :show.sync="showReviewDailog" title='复习提示' class='cnfont'>
      <div class='review-tips'>
        <div class='tips'>
          <span v-if='reviewState==="INIT"'>你已经有{{reviewDate}}天没复习
            <span class='mark'>{{ reviewUnitName }}</span> 的单词了，别忘记了哦~
          </span>
          <span v-else-if='reviewState==="ING"'>
            你正在复习
            <span class='mark'>{{ reviewUnitName }}</span> 的单词
          </span>
        </div>
        <div class='btn'>
          <div class='btnReviewOK' @click='goReview'>去复习</div>
          <div class='btnReviewSkip' @click='skipReview'>跳过</div>
        </div>
      </div>
    </opt-dialog>
    <sign-in-dialog :show.sync="showSignInDialog" :list="signList"></sign-in-dialog>
  </div>
</template>
<script>
import optDialog from "@/components/widgets/optDialog";
import unitDialog from "@/components/unitDialog";
import signInDialog from "@/components/signInDialog";
import dataService from "@/service/index";
import { NOT_JOINED_SCHOOL } from "@/utility/dict";
import utility from "@/utility/utility";
import _ from "lodash";
export default {
  data() {
    return {
      expandAddSchool: false,
      userRankIdx: -1,
      showIdDailog: false,
      showReviewDailog: false,
      showUnitDialog: false,
      showSignInDialog: false,
      schoolNo: "",
      errTips: "",
      reviewId: null,
      reviewState: null,
      reviewDate: null,
      reviewUnitId: null,
      reviewUnitName: "",
      signList: []
    };
  },
  computed: {
    schoolClass: function() {
      let name = "hide";
      this.expandAddSchool && (name = "show");
      return name;
    },
    currUnitName: function() {
      let currUnitInfo = this.$store.getters.currUnitInfo;
      return (currUnitInfo && currUnitInfo.name) || "请选择单元";
    },
    notPromotion: function() {
      let isTourist = this.$store.getters.isTourist;
      if (isTourist) {
        return false;
      } else {
        let promotionType = this.userInfo.promotionType;
        if (!promotionType || promotionType === "AUTO") {
          return true;
        } else {
          return false;
        }
      }
      return false;
    },
    coins: function() {
      return this.$store.getters.coins || 0;
    },
    diamonds: function() {
      return this.$store.getters.diamonds || 0;
    },
    userInfo: function() {
      return this.$store.getters.userInfo;
    },
    scoreRankings: function() {
      let scoreRankings = this.$store.getters.scoreRankings;
      let userName = this.$store.getters.userName;
      this.userRankIdx = -1;
      let list = [];
      scoreRankings.forEach((item, idx) => {
        if (item.username === userName) {
          this.userRankIdx = idx;
        }
        if (idx < 5) {
          list.push(item);
        }
      });
      return list;
    }
  },
  mounted() {
    this.getSerialInfos();
    PIXI.utils.destroyTextureCache();
    this.$store.dispatch("getUnreadMsgs");
    let greateList = this.$store.getters.getGradeList;
    if (greateList.length === 0) {
      this.$store.dispatch("getGradeList");
    }
    if (window.plus && this.notPromotion) {
      let openInstall = window.plus.openInstall;
      if (openInstall) {
        openInstall.GetInstallData(
          success => {
            let result = JSON.parse(success);
            let uid = result.uid;
            if (uid) {
              dataService.buildPromotion(uid).then(res => {
                let result = res.data;
                if (result.code === 200) {
                  let resultData = result.data;
                  let promotionType = resultData.promotionType;
                  if (promotionType) {
                    this.$store.commit("setUserInfo", {
                      promotionType: promotionType
                    });
                  }
                }
              });
            } else {
            }
          },
          err => {
            // let schoolName = this.$store.getters.schoolName;
            // if (schoolName === NOT_JOINED_SCHOOL) {
            //   }
            // this.showAddSchool = true;
          }
        );
      }
    }
  },
  methods: {
    wordClick: function() {
      this.$router.push({ name: "wordList" });
    },
    noteClick: function() {
      this.$router.push({ name: "forgetList" });
    },
    workClick: function() {
      this.$router.push({ name: "homework" });
    },
    recordClick: function() {
      this.$router.push({ name: "learnRecord" });
    },
    rankClick: function() {
      this.$router.push({ name: "scoreRanking" });
    },
    schoolClick: function() {
      this.expandAddSchool = true;
    },
    maskClick: function() {
      this.expandAddSchool = false;
    },
    idClick: function() {
      this.showIdDailog = true;
      this.expandAddSchool = false;
    },
    unitClick: function() {
      let isTourist = this.$store.getters.isTourist;
      if (!isTourist) {
        this.showUnitDialog = true;
      } else {
        this.$store.dispatch("showTipsMsg", "游客只能体验第1单元！");
      }
    },
    checkReview: function() {
      this.$store.commit("loading", true);
      dataService.getReviewUint().then(
        res => {
          let result = res.data;
          let code = result.code;
          if (code === 200) {
            let resultData = result.data;
            let needReview = resultData.needReview;
            this.$store.commit("loading", false);
            if (needReview === "Y") {
              this.reviewUnitName = resultData.unitName || "";
              this.reviewId = resultData.reviewId;
              this.reviewUnitId = resultData.unitId;
              this.reviewState = resultData.status;
              let reviewDate = resultData.minutes;
              if (reviewDate) {
                this.reviewDate = Math.floor(reviewDate / 1440);
              }
              if (this.reviewId !== null && this.reviewUnitId !== null) {
                this.showReviewDailog = true;
              }
            } else {
              this.goLearning();
            }
          }
        },
        err => {
          let result = err.data;
          console.log("-----err", err);
          this.$store.commit("loading", false);
          this.$store.dispatch("showTipsMsg", result.msg || "请求错误！");
          this.goLearning();
        }
      );
    },
    goReview: function() {
      this.$store.commit("loading", true);
      this.$store
        .dispatch("goReviewTask", {
          reviewId: this.reviewId,
          reviewUnitId: this.reviewUnitId
        })
        .then(resolve => {
          this.$store.commit("setLearningBack", false);
          this.$store.commit("setFlowTitle", `复习：[${this.reviewUnitName}]`);
          this.$router.push({ name: "learnFlow" });
          this.$store.commit("loading", false);
        });
    },
    skipReview: function() {
      this.showReviewDailog = false;
      this.goLearning();
    },
    goLearning: function() {
      this.$store.commit("loading", true);
      this.$store.dispatch("goUnitTask").then(resolve => {
        this.$store.commit("setFlowTitle", "");
        this.$store.commit("setLearningBack", false);
        this.$router.push({ name: "learnFlow" });
        this.$store.commit("loading", false);
      });
    },
    joinSchoolClick: function() {
      if (!this.schoolNo) {
        this.errTips = "请输入学校编号";
        this.$store.dispatch("showTipsMsg", this.errTips);
        return;
      }
      this.joinSchool(this.schoolNo);
    },
    joinSchool: function(schoolNo) {
      dataService.joinSchool(schoolNo).then(res => {
        let result = res.data;
        let code = result.code;
        let msg = result.msg;
        if (code === 200) {
          let resultData = result.data;
          if (resultData) {
            let schoolName = resultData.schoolName;
            this.$store.commit("setSchoolName", schoolName);
            this.$store.dispatch("showTipsMsg", `已成功加入${schoolName}`);
          }
          this.expandAddSchool = false;
          this.showIdDailog = false;
        }
      });
    },
    scanCode: function() {
      this.$router.push({ name: "scan" });
    },
    getSerialInfos() {
      dataService.getSerialInfos().then(res => {
        let result = res.data;
        let code = result.code;
        let msg = result.msg;
        if (code === 200) {
          let data = result.data;
          this.signList = data;
          this.showSignInDialog = this.checkSignTime(data);
        }
      });
    },
    checkSignTime(data) {
      let time = utility.parseDate(new Date());
      let signData = _.cloneDeep(data);
      for (let item of signData) {
        let signTime = item.signTime.substr(0, 8);
        if (signTime === time) {
          return false;
        }
      }
      return true;
    }
  },
  components: {
    optDialog,
    unitDialog,
    signInDialog
  }
};
</script>

<style  lang='scss' scoped>
@import "~@/assets/css/variables.scss";
.home {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  // display: flex;
  // flex-direction: column;
  position: relative;
  .top-nav {
    width: 100%;
    height: 440px;
    background-image: url("~@/assets/images/home-bg.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    color: #fff;
    .header-info {
      width: 100%;
      height: 110px;
      overflow: hidden;
      padding-top: 30px;
      .col1 {
        float: left;
        width: 25%;
        height: 60px;
        line-height: 60px;
        background: #ff7777;
        margin-left: 20px;
        border-radius: 20px;
        font-size: $small-font-size;
        display: flex;
        img {
          width: 40px;
          height: 40px;
          margin-top: 10px;
          margin-left: 15px;
        }
        span {
          flex: 1;
          text-align: right;
          padding-right: 10px;
          // float: right;
          // margin-right: 10px;
        }
      }
      .col2 {
        float: left;
        width: 40%;
        height: 60px;
        line-height: 60px;
        text-align: center;
        padding: 0;
        margin-left: 20px;
        border-radius: 20px;
        font-size: $small-font-size;
        a {
          color: #fff;
          margin: 0;
          padding: 0;
        }
      }
      .col3 {
        float: left;
        width: 25%;
        height: 60px;
        line-height: 60px;
        background: #ff7777;
        border-radius: 20px;
        margin-left: 20px;
        font-size: $small-font-size;
        display: flex;
        img {
          width: 40px;
          height: 40px;
          margin-top: 10px;
          margin-left: 15px;
        }
        span {
          flex: 1;
          text-align: right;
          padding-right: 10px;
          // float: right;
          // margin-right: 10px;
        }
      }
    }
    .grid {
      width: 100%;
      height: 150px;
      display: block;
      list-style-type: none;
      overflow: hidden;
      text-align: center;
      .grid-li {
        width: 25%;
        height: 150px;
        float: left;
        margin: 0 auto;
        box-sizing: border-box;
        img {
          width: 90px;
          height: 90px;
        }
        div {
          font-size: $small-font-size;
        }
      }
    }
  }
  .box {
    // flex: 1;
    position: absolute;
    top: 340px;
    bottom: 50px;
    padding-left: 50px;
    padding-right: 50px;
    // position: relative;
    left: 0px;
    right: 0px;
    .box-out {
      width: 100%;
      height: 100%;
      border: 10px solid rgba(255, 255, 255, 0.6);
      // margin-top: -100px;
      border-radius: 50px;
      box-sizing: border-box;
      .box-in {
        width: 100%;
        height: 100%;
        background: #fff;
        text-align: center;
        border-radius: 40px;
        position: relative;
        .logo-container {
          position: absolute;
          top: 0;
          bottom: 200px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .dragon-logo {
            width: 306px;
            height: 411px;
            margin: 0 auto;
            // padding-top: 30px;
          }
        }
        .btn {
          display: block;
          width: 365px;
          height: 90px;
          line-height: 90px;
          text-align: center;
          background-color: $assist-light-color;
          border-radius: 30px;
          margin: 0 auto;
          color: $main-color;
          font-size: $large-font-size;
          margin-bottom: 20px;
          &:active {
            background-color: $assist-color;
          }
        }
        .ranking-container {
          width: 100%;
          height: 200px;
          position: absolute;
          bottom: 10px;
          .score-ranking {
            width: 600px;
            height: 200px;
            margin: 0 auto;
            border-top: 2px solid #e4e4e4;
            ul {
              display: inline-block;
              li {
                list-style: none;
                position: relative;
                display: inline-block;
                width: 100px;
                padding-top: 10px;
                text-align: center;
                .person-item {
                  width: 100px;
                  height: 200px;
                }
              }
            }

            .outer-rank {
              display: inline-block;
              vertical-align: bottom;
              .user-rank {
                display: inline-block;
                width: 100px;
                padding-top: 10px;
                vertical-align: middle;
              }
              .ellipsis {
                display: inline-block;
                vertical-align: middle;
                color: $desc-text-color;
              }
            }

            .ranking-tips {
              color: $desc-text-color;
              font-size: $normal-font-size;
            }
            .img-up-container {
              width: 100%;
              text-align: center;
              display: inline-block;
              .img-up {
                width: 60px;
                height: 60px;
                vertical-align: middle;
                display: inline-block;
              }
              .img-up-arrow {
                width: 30px;
                height: 30px;
                vertical-align: middle;
                display: inline-block;
              }
            }
            .head-img-container {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              overflow: hidden;
              display: inline-block;
              position: relative;
              background: $bg-color-warm;
              .head-img {
                width: 130%;
                left: 50%;
                top: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
              }
            }
            .raningLabel {
              color: $desc-text-color;
            }
            .currRanking {
              color: $main-color;
            }
          }
        }
      }
    }
  }
  .home-school {
    width: 270px;
    height: 180px;
    position: absolute;
    right: 0;
    // top: 20px;
    top: 50%;
    z-index: 99;
    .home-school-left {
      width: 60px;
      height: 200px;
      background: $main-color;
      color: #fff;
      font-size: 20px;
      float: left;
      text-align: center;
      border-radius: 30px 0 0 30px;
      padding-top: 20px;
      box-sizing: border-box;
      &:active {
        background-color: $main-dark-color;
      }
    }
    .home-school-right {
      width: 210px;
      height: 200px;
      line-height: 200px;
      color: $main-color;
      font-size: $small-font-size;
      float: right;
      background: #fff;
      border-top: 2px solid $main-color;
      border-bottom: 2px solid $main-color;
      box-sizing: border-box;
      > div {
        width: 100%;
        height: 100px;
        // line-height: 90px;
        text-align: center;
      }
    }
  }
  .home-school.show {
    transition: 0.5s;
    right: 0px;
    z-index: 99;
  }
  .home-school.hide {
    transition: 0.1s;
    right: -210px;
  }
  .mask {
    // display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 10;
  }
  .mask.display {
    display: block;
  }
  .school-input {
    width: 100%;
    height: 420px;
    padding-top: 50px;
    text-align: center;

    > input {
      width: 60%;
      height: 100px;
      border: 2px solid #ddd;
      outline: none;
      background: #fff4ea;
      border-radius: 50px;
      padding-left: 30px;
      color: #969696;
    }
    > a {
      display: block;
      width: 60%;
      height: 90px;
      line-height: 90px;
      text-align: center;
      background: $main-color;
      border-radius: 30px;
      margin: 0 auto;
      color: #fff;
      margin-top: 70px;
      font-size: $large-font-size;
    }
  }
  .review-tips {
    padding: 20px;
    text-align: center;
    font-size: $normal-font-size;
    .tips {
      color: $body-text-color;
      .mark {
        color: $main-color;
      }
    }
    .btn {
      margin: 40px 0 10px 0;
      height: 100px;
      line-height: 100px;
      .btnReviewOK {
        display: inline-block;
        height: 80px;
        line-height: 80px;
        width: 230px;
        border-radius: 30px;
        background: $main-color;
        color: #fff;
        vertical-align: middle;
        text-align: center;
        &:active {
          background: $main-dark-color;
        }
      }
      .btnReviewSkip {
        display: inline-block;
        height: 80px;
        line-height: 80px;
        width: 230px;
        border-radius: 30px;
        color: $main-color;
        background: #fff;
        border: 4px solid $main-color;
        box-sizing: border-box;
        vertical-align: middle;
        text-align: center;
        &:active {
          background: $bg-color-warm;
        }
      }
    }
  }
}
</style>
