<template>
  <div class='pay cnfont'>
    <nav-header title='支付结果页'></nav-header>
    <div class='pay-box'>
      <div class='pay-up'>
        <template v-if='orderStatus === STATUS.success'>
          <img src="static/images/icon-pay-success.png" alt="">
          <div class='status'>支付成功</div>
          <p>您已成功开通会员</p>
        </template>
        <template v-else-if='orderStatus === STATUS.fail'>
          <img src="static/images/icon-pay-err.png" alt="">
          <div class='status'>支付失败</div>
          <p>{{msg || '出错了，请再试一次'}}</p>
        </template>
        <template v-else-if='orderStatus === STATUS.waiting'>
          <img src="static/images/icon-pay-wait.png" alt="">
          <div class='status'>会员待支付</div>
        </template>
        <template v-else-if='orderStatus === STATUS.paying'>
          <img src="static/images/icon-paying.png" alt="">
          <div class='status'>支付中</div>
          <p>正在支付中，请稍后...</p>
        </template>
        <template v-else>
          <img src="static/images/icon-paying.png" alt="">
          <div class='status'>加载中</div>
          <p>正在加载中，请稍后...</p>
        </template>
        <ul class='order-info'>
          <li>
            <span class="key">
              订单单号：
            </span>
            <span class="val">
              {{orderInfo&&orderInfo.orderNo}}
            </span>
          </li>
          <li>
            <span class="key">
              金额：
            </span>
            <span class="val">
              {{orderInfo&& ('¥' + (orderInfo.money/100).toFixed(2))}}
            </span>
          </li>
          <li v-if="osName !== 'ios'">
            <span class="key">
              支付方式：
            </span>
            <span class="val">
              {{getPayType(orderInfo&&orderInfo.chargeStyle)}}
            </span>
          </li>
          <li>
            <span class="key">
              购买服务：
            </span>
            <span class="val">
              {{orderInfo && orderInfo.goodsName}}
            </span>
          </li>
          <li>
            <span class="key">
              交易时间：
            </span>
            <span class="val">
              {{orderInfo&&orderInfo.createTime}}
            </span>
          </li>
        </ul>
        <div class='btn-container'>
          <span v-if='orderStatus === STATUS.success' class='btn' @click="goHome">我知道了</span>
          <span v-else-if='orderStatus === STATUS.fail' class='btn' @click="goBack">返回会员支付页</span>
          <span v-else-if='orderStatus === STATUS.waiting' class='btn' @click="goBack">去支付</span>
          <span v-else-if='orderStatus === STATUS.paying' class='btn' @click="goBack">返回会员支付页</span>
          <span v-else class='btn' @click="goBack">返回会员支付页</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
import { ORDER_STATUS } from "@/utility/dict";
export default {
  components: {
    navHeader
  },
  data() {
    return {
      orderStatus: "",
      orderNo: "",
      STATUS: ORDER_STATUS,
      checkedTimes: 0,
      msg: "",
      orderInfo: null,
      osName: ""
    };
  },
  created() {
    this.osName = window.plus && window.plus.os.name;
    if (this.osName) {
      this.osName = this.osName.toLowerCase();
    }
    this.orderNo = this.$route.params.orderNo;
    this.queryOrderInfo();
  },
  methods: {
    queryOrderInfo: function() {
      this.msg = "";
      dataService.queryPaymentOrder(this.orderNo).then(res => {
        let result = res.data;
        let code = result.code;
        if (code === 200) {
          let resultData = result.data;
          this.orderStatus = resultData.status;
          this.orderInfo = resultData;
          if (this.orderStatus === ORDER_STATUS.waiting) {
            if (this.checkedTimes < 3) {
              this.checkOrderStatus();
            } 
          }
        } else {
          this.msg = result.msg;
          this.orderStatus = ORDER_STATUS.fail;
        }
      });
    },
    checkOrderStatus: function() {
      setTimeout(() => {
        this.checkedTimes++;
        this.queryOrderInfo();
      }, 3000);
    },
    getPayType: function(key) {
      switch (key) {
        case "WECHAT":
          return "微信支付";
          break;
        case "ALIPAY":
          return "支付宝支付";
          break;
        default:
          return "";
          break;
      }
    },
    getVipUnit: function(key) {
      switch (key) {
        case "YEAR":
          return "年";
          break;
        case "MONTH":
          return "月";
          break;
        default:
          return "";
          break;
      }
    },
    goBack: function() {
      this.$router.go(-1);
    },
    goHome: function() {
      this.$router.replace({ name: "home" });
    }
  }
};
</script>
<style lang='scss' scoped>
@import "~@/assets/css/variables.scss";
.pay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .pay-box {
    flex: 1;

    height: 100%;
    padding: 30px;
    .pay-up {
      width: 100%;
      height: 900px;
      background: #fff;
      border-radius: 45px;
      text-align: center;
      position: relative;
      > img {
        margin-top: 70px;
      }
      .status {
        width: 100%;
        height: 50px;
        line-height: 50px;
        font-size: $normal-font-size;
      }
      > p {
        width: 100%;
        height: 50px;
        line-height: 50px;
        font-size: $small-font-size;
        color: $desc-text-color;
      }

      .order-info {
        list-style: none;
        margin-top: 40px;
        li {
          height: 65px;
          line-height: 65px;
          font-size: $mini-font-size;
          padding: 0 30px;
          .key {
            text-align: right;
            width: 30%;
            display: inline-block;
            color: $body-text-color;
          }
          .val {
            width: 60%;
            display: inline-block;
            text-align: right;
            color: $emphases-text-color;
            padding-right: 30px;
          }
        }
      }
      .btn-container {
        position: absolute;
        bottom: 30px;
        height: 100px;
        width: 100%;
        text-align: center;
        .btn {
          display: inline-block;
          width: 500px;
          height: 100px;
          line-height: 100px;
          background: #ff6666;
          border-radius: 50px;
          text-align: center;
          color: #fff;
          font-size: $large-font-size;
        }
      }
    }
    .down {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  }
}
</style>

