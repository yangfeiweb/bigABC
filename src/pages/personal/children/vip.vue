<template>
  <div class='vip cnfont'>
    <nav-header title='会员管理'>
      <div class="bills" slot='right' @click="gotoBills">
        <i class='iconfont icon-zaixianzhifujilu'></i>
      </div>
    </nav-header>
    <div class="vip-box">
      <div class='content'>
        <div v-if='deadline' class='box-top'>
          <template v-if='dayRemaind != -1'>
            <span class='span1'> {{deadline}} 会员到期 </span>
            <span class='span2'>剩余
              <b>{{dayRemaind}}</b>天</span>
          </template>
          <template v-else>
            <span>{{deadline}} 会员已到期</span>
          </template>
        </div>
        <div v-if='!deadline' class='box-top'>
          <span>快去开通会员吧！</span>
        </div>
        <div class='vip-in'>
          <div class='card'>
            <div class='title'>VIP 会员</div>
            <checker v-model="productNo" class='vip-checker' radio-required default-item-class="vip-item" selected-item-class="vip-item-selected">
              <checker-item v-for="item in productList" :key="item.id" :value='item.productNo'>
                <span class='checker-title'>{{item.name}}</span>
                <div class='checker-value'>
                  <span>￥{{(item.money/100).toFixed(2)}}</span>
                  <icon class='check-icon' type="success"></icon>
                  <icon class='check-icon' type="circle"></icon>
                </div>
              </checker-item>
            </checker>
          </div>
          <div v-if="osName === 'android'" class='card payType'>
            <div class='title'>支付方式</div>
            <checker v-model="payType" class='vip-checker' radio-required default-item-class="vip-item" selected-item-class="vip-item-selected">
              <checker-item v-for="item in payTypes" :key="item.key" :value='item'>
                <span class='checker-title'>
                  <img class='pay-icon' :src='item.icon' /> {{item.name}}
                </span>
                <div class='checker-value'>
                  <icon class='check-icon' type="success"></icon>
                  <icon class='check-icon' type="circle"></icon>
                </div>
              </checker-item>
            </checker>
          </div>
        </div>
        <div class='btn cnfont' :class='{disabled:!canPay}' @click='postPaymentOrder'>立即支付</div>
      </div>
    </div>
  </div>
</template>
<script>
import { Group, Checker, Cell, Radio, CheckerItem, Icon } from "vux";
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
import { CHARGE_TYPE, PAYMENT_TYPE } from "@/utility/dict";
import { setIapOrderInfo, updateIapOrderStatus } from "@/utility/iap";
export default {
  data() {
    return {
      productList: [],
      payTypes: [
        {
          id: "wxpay",
          name: "微信支付",
          key: "WECHAT",
          icon: "static/images/weixin.png"
        },
        {
          id: "alipay",
          name: "支付宝支付",
          key: "ALIPAY",
          icon: "static/images/zhifubao.png"
        }
      ],
      curr: 0,
      productNo: null,
      payType: null,
      osName: "",
      payChannels: {},
      iapChannel: null,
      iapReady: false,
      iapResultPostTimes: 0
    };
  },
  computed: {
    deadline: function() {
      return this.$store.getters.vipDeadline;
    },
    dayRemaind: function() {
      let remainder = -1;
      if (this.deadline) {
        let deadtime = new Date(this.deadline);
        deadtime.setHours(23);
        deadtime.setMinutes(59);
        deadtime.setSeconds(59);
        let now = new Date();
        let days = (deadtime - now) / 86400000;
        if (days > 0) {
          remainder = Math.floor(days);
        }
      }
      return remainder;
    },
    canPay: function() {
      if (this.osName && this.osName === "ios") {
        return this.iapReady;
      } else {
        return this.productNo !== null && this.payType !== null;
      }
    }
  },
  created() {
    this.$store.dispatch("getAccountInfo");
    this.osName = window.plus && window.plus.os.name;
    if (this.osName) {
      this.osName = this.osName.toLowerCase();
    }
    if (this.osName === "android") {
      this.payType = this.payTypes[0];
    }
    this.checkChannels();
    this.getVipProductList();
  },
  methods: {
    // 获取支付产品列表
    getVipProductList() {
      let publishType = "ANDROID";
      if (this.osName === "ios") {
        publishType = "IOS";
      }
      let plus = window.plus;
      plus && plus.nativeUI.showWaiting("获取支付信息...");
      dataService.getVipProductList(publishType).then(
        res => {
          plus && plus.nativeUI.closeWaiting();
          let resultData = res.data;
          let code = resultData.code;
          let data = resultData.data;
          if (data && data.length > 0) {
            this.productList = data;
            this.productNo = this.productList[0].productNo;
          }
          if (this.osName === "ios") {
            this.requestIapOrder();
          }
        },
        err => {
          plus && plus.nativeUI.closeWaiting();
        }
      );
    },
    postPaymentOrder() {
      if (this.canPay) {
        let productNo = this.productNo;
        let payKey = "APPLE";
        if (this.osName === "android") {
          payKey = this.payType.key;
        }
        window.plus.nativeUI.showWaiting("提交订单中...");
        console.log("=============postPaymentOrder");
        console.log("productNo： " + productNo);
        console.log("payKey： " + payKey);
        dataService.postPaymentOrder(productNo, payKey).then(
          res => {
            window.plus.nativeUI.closeWaiting();
            let result = res.data;
            let code = result.code;
            if (code == 200) {
              let resultData = result.data;
              let body = resultData.body;
              let orderNo = resultData.orderNo;
              console.log("================pay body...");
              console.log(JSON.stringify(body));
              if (this.osName === "ios") {
                this.requestIapPay(orderNo);
              } else {
                this.requestThirdPay(body, orderNo);
              }
            }
          },
          err => {
            window.plus.nativeUI.closeWaiting();
          }
        );
      }
    },
    requestIapPay(orderNo) {
      let productNo = this.productNo;
      let me = this;
      window.plus.nativeUI.showWaiting("正在支付中...");
      window.plus.payment.request(
        this.iapChannel,
        {
          productid: productNo,
          username: orderNo
        },
        function(result) {
          window.plus.nativeUI.closeWaiting();
          let order = result.payment.username;
          let transactionDate = result.transactionDate;
          let transactionIdentifier = result.transactionIdentifier;
          let transactionReceipt = result.transactionReceipt;

          setIapOrderInfo(
            order,
            transactionDate,
            transactionIdentifier,
            transactionReceipt
          );
          // checkIapOrderStatus()
          me.postIapResult(
            order,
            transactionDate,
            transactionIdentifier,
            transactionReceipt
          );
        },
        function(e) {
          window.plus.nativeUI.closeWaiting();
          window.plus.nativeUI.alert("购买VIP会员失败", null, "消息提示");
        }
      );
    },
    requestThirdPay(body, orderNo) {
      let me = this;
      let payChannelId = this.payType.id;
      window.plus &&
        window.plus.payment.request(
          this.payChannels[payChannelId],
          body,
          function(result) {
            me.$router.push({
              name: "payResult",
              params: { orderNo: orderNo }
            });
          },
          function(e) {
            me.$router.push({
              name: "payResult",
              params: { orderNo: orderNo }
            });
          }
        );
    },

    // 获取IAP商品列表
    requestIapOrder() {
      if (this.productList.length == 0 || this.iapChannel == null) {
        return;
      }
      window.plus.nativeUI.showWaiting("查询商品信息中...");
      let ids = [];
      this.productList.forEach(item => {
        ids.push(item.productNo);
      });
      this.iapChannel.requestOrder(
        ids,
        e => {
          this.iapReady = true;
          window.plus.nativeUI.closeWaiting();
          this.productNo = this.productList[0].productNo;
        },
        e => {
          window.plus.nativeUI.closeWaiting();
          window.plus.nativeUI.confirm(
            "错误信息：" + JSON.stringify(e),
            function(e) {
              if (e.index == 0) {
                requestOrder();
              } else {
                back();
              }
            },
            "重新请求商品信息",
            ["确定", "取消"]
          );
        }
      );
    },
    checkChannels() {
      if (!window.plus) {
        return;
      }
      let me = this;
      window.plus.payment.getChannels(
        function(channels) {
          for (var i in channels) {
            var channel = channels[i];
            if (channel.id == "qhpay" || channel.id == "qihoo") {
              // 过滤掉不支持的支付通道：暂不支持360相关支付
              continue;
            }
            if (me.osName === "android") {
              me.payChannels[channel.id] = channel;
              checkServices(channel);
            } else {
              if (channel.id === "appleiap") {
                me.iapChannel = channel;
                me.requestIapOrder();
                break;
              }
            }
          }
        },
        function(e) {
          window.plus.nativeUI.toast("获取支付通道失败：" + e.message);
        }
      );

      function checkServices(channel) {
        if (!channel.serviceReady) {
          var txt = null;
          switch (channel.id) {
            case "alipay":
              txt =
                "检测到系统未安装“支付宝快捷支付服务”，无法完成支付操作，是否立即安装？";
              break;
            default:
              txt =
                "系统未安装“" +
                channel.description +
                "”服务，无法完成支付，是否立即安装？";
              break;
          }
          window.plus.nativeUI.confirm(
            txt,
            function(e) {
              if (e.index == 0) {
                channel.installService();
              }
            },
            channel.description
          );
        }
      }
    },
    postIapResult(
      orderNo,
      transactionDate,
      transactionIdentifier,
      transactionReceipt
    ) {
      window.plus && window.plus.nativeUI.showWaiting("验正支付结果中...");
      this.iapResultPostTimes++;
      if (this.iapResultPostTimes > 2) {
        window.plus && window.plus.nativeUI.closeWaiting();
        return;
      }
      dataService
        .postIapResult(
          orderNo,
          transactionDate,
          transactionIdentifier,
          transactionReceipt
        )
        .then(
          res => {
            let result = res.data;
            let code = result.code;
            let msg = result.msg;
            window.plus && window.plus.nativeUI.closeWaiting();
            updateIapOrderStatus(orderNo, code, 0);
            if (code === 201 || code === 200) {
              this.$router.push({
                name: "payResult",
                params: { orderNo: orderNo }
              });
            }
          },
          err => {
            window.plus && window.plus.nativeUI.closeWaiting();
            window.plus &&
              window.plus.nativeUI.alert(
                "提交支付结果验证失败",
                null,
                "消息提示"
              );
            this.postIapResult(
              orderNo,
              transactionDate,
              transactionIdentifier,
              transactionReceipt
            );
          }
        );
    },
    gotoBills: function() {
      this.$router.push({ name: "bills" });
    }
  },
  components: {
    Group,
    Checker,
    navHeader,
    Cell,
    Radio,
    CheckerItem,
    Icon
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";
.vip {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .bills {
    color: #fff;
    padding: 0 30px;
    height: 100%;
    display: inline-block;
    line-height: $nav-line-height;
    > i {
      font-size: $big-font-size;
    }
  }
  .vip-box {
    flex: 1;
    .box-top {
      width: 100%;
      height: 110px;
      padding: 0 20px;
      box-sizing: border-box;
      line-height: 110px;
      text-align: center;
      background: #fff;
      font-size: $normal-font-size;
      .span1 {
        float: left;
      }
      .span2 {
        float: right;
        & > b {
          color: $main-color;
          padding: 0 10px;
        }
      }
    }
    .card {
      padding: 0 20px;
      border-radius: 50px;
      background: #fff;
      overflow: hidden;
      .title {
        height: 100px;
        line-height: 100px;
        padding-left: 20px;
        font-size: $large-font-size;
      }
      .vip-checker {
        .weui-icon {
          font-size: $large-font-size;
        }
        .vip-item {
          display: flex;
          height: 100px;
          line-height: 100px;
          font-size: $normal-font-size;
          border-top: 2px solid lightgrey;
          box-sizing: border-box;
          width: 100%;

          .weui-icon-success {
            display: none;
          }
          .weui-icon-circle {
            display: inline-block;
          }
          .checker-title {
            flex: 1;
            padding-left: 20px;
          }
          .checker-value {
            width: 300px;
            position: relative;
            text-align: right;
            padding-right: 80px;
            .check-icon {
              position: absolute;
              right: 10px;
              top: 30px;
            }
          }
        }
        .vip-item-selected {
          .weui-icon-circle {
            display: none;
          }
          .weui-icon-success {
            display: inline-block;
            color: $main-color;
          }
        }
      }
    }
    .payType {
      margin-top: 30px;
      .pay-icon {
        display: inline-block;
        vertical-align: middle;
        width: 45px;
        height: 45px;
      }
    }
    .vip-pay {
      width: 100%;
      height: 100%;
    }

    .weui-check__label {
      border: none;
      height: 80px;
      font-size: $normal-font-size;
    }
    .weui-cells_radio .weui-check:checked + .weui-icon-checked:before {
      border: 2px solid #ff6666;
      background: $main-color;
      border-radius: 50%;
      color: #fff;
    }
    .radio {
      float: right;
      position: absolute;
      top: 50px;
      right: 0;
    }
    .radio-list {
      width: 100%;
      height: 100px;
      line-height: 100px;
      padding-left: 30px;
      border-radius: 30px;
      font-size: $normal-font-size;
    }
  }
  .vux-label {
    font-size: $normal-font-size;
  }
  .btn {
    display: block;
    width: 70%;
    height: 110px;
    line-height: 110px;
    background: $main-color;
    border-radius: 30px;
    margin: 40px auto;
    text-align: center;
    color: #fff;
    font-size: $large-font-size;
    &.disabled {
      background: $disable-color;
    }
    &:active {
      background: $main-dark-color;
    }
  }
  .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .vip-in {
      flex: 1;
      padding: 30px;
    }
  }
  .vux-radio-icon {
    width: 50px;
    height: 50px;
  }
}
</style>
