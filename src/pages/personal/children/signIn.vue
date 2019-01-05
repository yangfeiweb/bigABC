<template>
  <div class='sign-in cnfont'>
    <navHeader title='签到'></navHeader>
    <div class='container'>
      <div class='info-header'>
        <div class='info-card'></div>
        <div class='info-circle left'></div>
        <div class='info-circle right'></div>
        <div class='info-bar left'></div>
        <div class='info-bar right'></div>
        <div class='title'>本月已累计签到{{signedDays.length}}天</div>
      </div>
      <div class="calendar-card">
        <inline-calendar :show-last-month="false" :show-next-month="false" :render-function='renderSignIn' hide-header highlight-weekend disable-past disable-future>
        </inline-calendar>
      </div>
      <div class='desc'>当月连续签到的第1、7、15天和最后一天都将获得额外礼物哦~</div>
      <div class='btn-container'>
        <div v-if="!signIned" class='sign-btn' @click='signIn'>签到</div>
        <div v-else class='sign-btn disabled'>已签到</div>
      </div>
    </div>
  </div>
</template>
<script>
import navHeader from "@/components/navHeader";
import { InlineCalendar } from "vux";
import dataService from "@/service/index";
import utility from "@/utility/utility";
import { REWARD_TYPE } from "@/utility/dict";

export default {
  data() {
    let now = new Date();
    let currMonth = now.getMonth();
    let currDay = now.getDate();
    let lastDay = utility.getMonthLastDay(currMonth);
    return {
      // signedDays: [],
      futureGiftDays: [],
      monthLastDay: lastDay,
      currDay: currDay,
      currMonth: currMonth
    };
  },
  computed: {
    signIned: function() {
      let signedItem = this.signedDays.find(item => {
        return item.signDate.getDate() == this.currDay;
      });
      if (signedItem) {
        return true;
      }
      return false;
    },
    signedDays: function() {
      let infos = this.$store.getters.signedInfos || [];
      let todySigned = false;
      infos.forEach(item => {
        if (item.signDate && this.currDay === item.signDate.getDate()) {
          todySigned = true;
        }
      });
      let signedCount = infos.length;
      this.getGiftDays(signedCount, todySigned);
      return infos;
    }
  },
  created() {
    // this.getSignInfos();
  },
  methods: {
    renderSignIn: function(rowIdx, colIdx, dateItem) {
      let itemIdx = -1;
      let signedItem = this.signedDays.find((item, idx) => {
        let matched =
          item.signDate.getMonth() == dateItem.month &&
          item.signDate.getDate() == dateItem.day;
        if (matched) {
          itemIdx = idx;
        }
        return matched;
      });
      let itemHtml = "";
      let day = dateItem.day;
      let month = dateItem.month;
      if (signedItem) {
        itemHtml = `<div class="mark-container"><i class="iconfont icon-right signed-icon"></i></div>`;
      }
      if (
        itemIdx === 0 ||
        itemIdx === 6 ||
        itemIdx === 14 ||
        itemIdx === this.monthLastDay - 1 ||
        this.futureGiftDays.indexOf(day) != -1
      ) {
        itemHtml += `<div class="gift-container">
                <img class='gift-icon' src='static/images/icon-gift.png'></img>
                </div>`;
      }
      return itemHtml;
    },
    // getSignInfos: function() {
    //   dataService.getSignInfos().then(res => {
    //     let result = res.data;
    //     if (result.code == 200) {
    //       let data = result.data;
    //       let todySigned = false;
    //       data &&
    //         data.forEach(item => {
    //           item.signDate = utility.timeStrToObj(item.signTime);
    //           if (item.signDate && this.currDay === item.signDate.getDate()) {
    //             todySigned = true;
    //           }
    //         });
    //       this.signedDays = data;
    //       let signedCount = data.length;
    //       this.getGiftDays(signedCount, todySigned);
    //     }
    //   });
    // },
    signIn: function() {
      dataService.postSignData().then(res => {
        let result = res.data;
        if (result.code == 200) {
          let resultData = result.data;
          let reward = resultData.reward;
          let rewardType = resultData.rewardType;
          let tips = "签到成功！";
          if (reward) {
            tips += ` 获得${REWARD_TYPE[rewardType] || "龙币"} ${reward} 个`;
          }
          this.$store.dispatch("showTipsMsg", tips);
          // this.getSignInfos();
          this.$store.dispatch("getSignedInfos");
          this.$store.dispatch("getSignedTotal");
        }
      });
    },
    getGiftDays: function(signedDay, todySigned) {
      let start = signedDay;
      let giftDays = [];
      let dayStart = this.currDay;
      if (todySigned) {
        dayStart = this.currDay + 1;
      }
      for (let i = dayStart; i <= this.monthLastDay; i++) {
        start++;
        if (
          start == 1 ||
          start == 7 ||
          start == 15 ||
          start == this.monthLastDay
        ) {
          giftDays.push(i);
        }
      }
      this.futureGiftDays = giftDays;
    }
  },
  components: {
    navHeader,
    InlineCalendar
  }
};
</script>
<style lang="scss" >
@import "~@/assets/css/variables";
.sign-in {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $bg-color;
  .container {
    flex: 1;
    padding: 0 45px;
    position: relative;
    .info-header {
      position: relative;
      width: 100%;
      height: 160px;
      .info-card {
        position: absolute;
        height: 100px;
        left: 0px;
        right: 0px;
        top: 45px;
        border-radius: 20px;
        background: #fff;
      }
      .info-circle {
        width: 25px;
        height: 25px;
        background: $bg-color;
        position: absolute;
        top: 60px;
        border-radius: 50%;
      }
      .info-bar {
        width: 25px;
        height: 45px;
        background: #fff;
        position: absolute;
        top: 0px;
      }
      .left {
        left: 45px;
      }
      .right {
        right: 45px;
      }
      .title {
        position: absolute;
        top: 65px;
        text-align: center;
        font-size: $large-font-size;
        width: 100%;
        color: $main-color;
      }
    }
    .calendar-card {
      background: #fff;
      height: 650px;
      padding: 10px;
      border-radius: 20px;
      margin-top: 20px;
      .inline-calendar {
        td,
        th {
          height: 80px;
          width: 80px;
          font-size: $small-font-size;
        }
        th {
          color: $desc-text-color;
        }
        td {
          border: 2px solid $gray-border;
          position: relative;
          span {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            transform: translate(-50%, -50%);
            z-index: 3;
          }
        }
        td.is-today {
          background: $main-color;
          color: #fff;
          .signed-icon {
            color: $assist-light-color;
            // color: #fff;
          }
        }
        .current {
          background: $main-color;
          color: #fff;
        }
        .current span {
          background: $main-color;
          color: #fff;
        }
        .is-disabled {
          color: $body-text-color;
        }
        .mark-container {
          position: absolute;
          right: 5px;
          bottom: -5px;
          z-index: 2;
        }
        .gift-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }
        .gift-icon {
          width: 56px;
          height: 55px;
        }
        .signed-icon {
          color: $main-color;
          font-size: $mini-font-size;
        }
      }
    }
    .desc {
      // height: 80px;
      margin-top: 10px;
      line-height: 40px;
      // text-align: center;
      color: $desc-text-color;
      font-size: $mini-font-size;
    }
    .btn-container {
      // text-align: center;
      .sign-btn {
        margin: 0 auto;
        width: 100%;
        height: 100px;
        margin-top: 30px;
        border-radius: 50px;
        background: $main-color;
        color: #fff;
        text-align: center;
        line-height: 100px;
        font-size: $normal-font-size;
      }
      .disabled {
        background: $disable-color;
        color: $desc-text-color;
      }
    }
  }
}
</style>
