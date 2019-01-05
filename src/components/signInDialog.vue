<template>
  <div class="sign-dialog cnfont">
    <div class="mask" v-show="showDialog"></div>
    <transition name="sign-fade">
      <div class="sign-container" v-show="showDialog">
        <div class="main-box">
          <img class="floor-plate" src="static/images/signIn/di.png" alt="">
          <div class="item-box">
            <div class="sign-day">
              连续签到{{totalDay}}天
            </div>
            <div class="image-box">
              <div v-for="(item,index) in displayList" :key="index" class="item">
                <img :src="item.imgPath" class="image">
                <i v-if="item.alreadySign" class="iconfont icon-bhjarrival already-sign"></i>
              </div>
            </div>
          </div>
          <div class="sign-btn" @click="signInBtn">
            领取奖励
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import dataService from "@/service/index";
import utility from "@/utility/utility";
import { REWARD_TYPE } from "@/utility/dict";
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showDialog: false,
      imgPaths: [
        "static/images/signIn/1.png",
        "static/images/signIn/2.png",
        "static/images/signIn/3.png",
        "static/images/signIn/4.png",
        "static/images/signIn/5.png",
        "static/images/signIn/6.png",
        "static/images/signIn/7.png"
      ],
      totalDay: 0,
      currWeekInfo: []
    };
  },
  watch: {
    show(val) {
      this.showDialog = val;
    }
  },
  computed: {
    displayList() {
      return this.currWeekInfo.map((item, index) => {
        if (item) {
          let obj = {};
          obj.imgPath = this.imgPaths[index];
          obj.alreadySign = false;
          obj.time = item;
          // let data = this.list.find(sign => {
          //   let time = sign.signTime.substr(0, 8);
          //   return time === item;
          // });
          let data = this.list[index]
          if (data) {
            obj.alreadySign = true;
          }
          return obj;
        }
        return {};
      });
    }
  },
  mounted() {
    this.showDialog = this.show;
    this.getSignTotal();
    this.getCurrWeekInfo();
  },
  methods: {
    getSignTotal() {
      dataService.getSignedTotal().then(res => {
        let result = res.data;
        let code = result.code;
        if (code === 200) {
          let data = result.data;
          this.totalDay = data.total;
        }
      });
    },
    signInBtn() {
      this.$store.commit("loading", true);
      dataService.signSerialIn().then(
        res => {
          let result = res.data;
          let code = result.code;
          if (code === 200) {
            let data = result.data;
            let reward = data.reward;
            let tipText = REWARD_TYPE[data.rewardType];
            if (data.rewardType === "DIAMOND") {
              tipText = reward + "颗" + tipText;
              let num = this.$store.getters.diamonds;
              this.$store.commit("updateDiamonds", num + reward);
            } else if (data.rewardType === "DRAGON_COIN") {
              tipText = reward + "枚" + tipText;
              let num = this.$store.getters.coins;
              this.$store.commit("updateCoin", num + reward);
            }
            this.$store.dispatch("showTipsMsg", `签到成功,获得 ${tipText}`);
            this.$store.commit("loading", false);
          }
          this.$emit("update:show", false);
        },
        err => {
          this.$emit("update:show", false);
        }
      );
    },
    getCurrWeekInfo() {
      // 得到当前的一周日期信息 格式 yyyyMMdd
      let week = [];
      let now = new Date();
      let date = now.getDate(); // 当前时间是这个月第几天
      let day = now.getDay();
      let currMonth = now.getMonth() + 1;
      if (day === 0) {
        day = 7;
      }
      let num = date - day;
      for (let i = 1; i <= 7; i++) {
        now.setDate(++num);
        let month = now.getMonth() + 1;
        if (currMonth < month) {
          currMonth = month;
          num = 1;
        }
        week.push(utility.parseDate(now));
      }
      this.currWeekInfo = week;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/css/variables";
.sign-dialog {
  margin: 0;
  padding: 0;
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: $mask-color;
    z-index: 500;
  }
  .sign-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    z-index: 500;
    .main-box {
      position: relative;
      width: 90%;
      height: 80%;
      margin: 100px auto;
    }
    .floor-plate {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .item-box {
      position: absolute;
      top: 34%;
      left: 5%;
      width: 90%;
      height: 500px;
      box-sizing: border-box;
      padding: 0 20px;
      .sign-day {
        width: 100%;
        height: 50px;
        line-height: 50px;
        text-align: center;
        margin-bottom: 20px;
        font-size: $small-font-size;
        color: #666666;
      }
      .image-box {
        width: 100%;
        height: 430px;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        .item {
          position: relative;
          width: 23%;
          height: 40%;
          padding: 5px;
          .image {
            width: 100%;
            height: 100%;
          }
          .already-sign {
            position: absolute;
            top: 0;
            right: 0;
            font-size: $max-font-size;
            color: #000000;
          }
        }
      }
    }
    .sign-btn {
      position: absolute;
      bottom: 3%;
      left: 50%;
      width: 60%;
      height: 100px;
      line-height: 100px;
      border-radius: 100px;
      text-align: center;
      transform: translateX(-50%);
      font-size: $large-font-size;
      background-color: #ffd700;
      color: $main-color;
      box-shadow: 0 10px 2px $assist-dark-color;
    }
  }
  .sign-fade-enter-active {
    transition-duration: 0.5s;
    transform: translate(-50%, -50%);
    transition-property: transform;
  }
  .sign-fade-leave-active {
    transition-duration: 0.5s;
    opacity: 0.1;
    transform: translate(-50%, -50%);
    transition-property: opacity, transform;
  }
  .sign-fade-enter {
    transform: translate(-50%, -2000px);
  }
  .sign-fade-enter-to {
    transform: translate(-50%, -50%);
  }
}
</style>
