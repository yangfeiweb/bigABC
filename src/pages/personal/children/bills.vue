<template>
  <div class='bills cnfont'>
    <nav-header title='订单记录'></nav-header>
    <div class='bills-box'>
      <vue-better-scroll v-if="orderList && orderList.length" ref='billScoller' class="scroller" :pullUpLoad="pullUpLoadObj" @pullingUp="onPullingUp">
        <ul class="bill-container">
          <li class="bill-item" v-for="(item, idx) in orderList" :key="idx">
            <div class="img" v-if="osName !== 'ios'">
              <img v-if="item.chargeStyle === 'WECHAT'" class="wechat-img" src='static/images/weixin.png' />
              <img v-else-if="item.chargeStyle === 'ALIPAY'" class="ali-img" src='static/images/zhifubao.png' />
            </div>
            <div class="info">
              <p class='time'>
                {{item.createTime}}
              </p>
              <p class='desc'>
                {{item.goodsName}}
              </p>
            </div>
            <div class="money">
              <p class='fee'>
                ¥ {{(item.money/100).toFixed(2)}}
              </p>
              <p class='status' :class="getStatusCls(item.status)">
                {{orderStatus[item.status]}}
              </p>
            </div>
          </li>
        </ul>
      </vue-better-scroll>
      <div v-else class='no-bill-tips'>
        暂无订单记录
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
      orderList: [],
      pageIdx: 0,
      pageSize: 20,
      isLast: false,
      scrollOptions: {},
      pullUpLoadObj: {
        threshold: 50,
        txt: {
          more: "加载更多",
          noMore: "没有更多记录了"
        }
      },
      orderStatus: {
        SUCCESS: "支付成功",
        WAIT_PAY: "待支付",
        FAIL: "支付失败",
        ING: "支付中",
        CLOSED: "订单关闭"
      },
      osName:''
    };
  },
  created() {
    this.osName = window.plus && window.plus.os.name;
    if (this.osName) {
      this.osName = this.osName.toLowerCase();
    }
    this.getOrderList();
  },
  methods: {
    getOrderList: function() {
      dataService
        .getOrderList(this.pageIdx, this.pageSize)
        .then(res => {
          let result = res.data;
          let code = result.code;
          if (code === 200) {
            let resultData = result.data;
            this.orderList = this.orderList.concat(resultData.content);
            this.isLast = resultData.last;
          }
        })
        .then(() => {
          this.$nextTick(() => {
            console.log(this.$refs.billScoller);
            if (this.isLast) {
              this.$refs.billScoller &&
                this.$refs.billScoller.forceUpdate(false);
            } else {
              this.$refs.billScoller &&
                this.$refs.billScoller.forceUpdate(true);
            }
          });
        });
    },
    onPullingUp: function() {
      if (!this.isLast) {
        this.pageIdx++;
        this.getOrderList();
      }
    },
    getStatusCls: function(status) {
      switch (status) {
        case ORDER_STATUS.waiting:
          return "waiting";
          break;
        case ORDER_STATUS.paying:
          return "paying";
          break;
        case ORDER_STATUS.success:
          return "success";
          break;
        case ORDER_STATUS.fail:
          return "fail";
          break;
        case ORDER_STATUS.closed:
          return "closed";
          break;
        default:
          return "colsed";
          break;
      }
    }
  }
};
</script>
<style lang='scss' scoped>
@import "~@/assets/css/variables.scss";
.bills {
  width: 100%;
  height: 100%;
  position: relative;

  .bills-box {
    position: absolute;
    top: $nav-line-height;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 30px;
    overflow: hidden;
    .no-bill-tips {
      font-size: $normal-font-size;
      text-align: center;
    }
    .scroller {
      height: 100%;
    }
    .bill-item {
      height: 160px;
      background: #fff;
      margin-top: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      display: flex;
      .img {
        width: 120px;
        height: 100%;
        text-align: center;
        // background: lightblue;
        .wechat-img {
          width: 80px;
          height: 80px;
          margin-top: 40px;
        }
        .ali-img {
          width: 80px;
          height: 80px;
          margin-top: 40px;
        }
      }
      .info {
        height: 100%;
        flex: 1;
        line-height: 80px;
        padding-left: 10px;
        .time {
          font-size: $small-font-size;
          color: $desc-text-color;
        }
        .desc {
          font-size: $small-font-size;
          color: $body-text-color;
        }
      }
      .money {
        width: 200px;
        height: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        line-height: 80px;
        .fee {
          font-size: $normal-font-size;
        }
        .status {
          font-size: $small-font-size;
          &.waiting {
            color: $assist-color;
          }
          &.paying {
            color: $assist-color;
          }
          &.success {
            color: green;
          }
          &.fail {
            color: $main-color;
          }
          &.closed {
            color: $desc-text-color;
          }
        }
      }
    }
  }
}
</style>

