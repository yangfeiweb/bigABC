<template>
  <div class="container cnfont">
    <div class="msg-header">
      <p class="title">活动详情页</p>
      <div class="share" @click="shareHandle">
        <b class="iconfont icon-fenxiang-copy"></b>
        <p class="share-text">分享</p>
        <div class="share-tap" v-show="isShow">
          <div @click="weiHandle">
            <img src="../../../static/images/weixin.png" alt="">
            <p class="weixin">微信分享</p>
          </div>
          <div  @click="boHandle">
            <img src="../../../static/images/weibo.png" alt="">
            <p class="weibo">微博分享</p>
          </div>
        </div>
      </div>   
    </div>
    <div class="detail-container" @click="containerHandle">
      <div class="detail-content">
        <img src="../../../static/images/activity2.png" alt="">
        <div class="detail-main">
          <p class="detail-title">双十一购物狂欢节</p>
          <p class="detail-time">2017.11.09-2017.11.12</p>
          <div class="detail-text">
            活动内容：双十一购物狂欢节是指每年11月11日的网络促销日源于淘宝商城（天猫）2009年11月11日举办的促销活动，当时参与的商家数量和促销力度有限，但营业额远超预想的效果，于是11月11日成为天猫举办大规模促销活动的固定日期。双十一已成为中国电子商务行业的年度盛事，并且逐渐影响到国际电子商务行业。<br>
            2014年11月11日，阿里巴巴双十一全天交易额571亿元。2015年11月11日，天猫双十一全天交易额912.17亿元。2016年11日24时，天猫双十一全天交易额超1207亿。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      isShow:false
    };
  },
  methods: {
    shareHandle:function(){
      if(!this.isShow){
        this.isShow=true;
      }else{
        this.isShow=false;
      }
    },

    containerHandle:function(){
      if(this.isShow){
        this.isShow=false;
      }
    },

    weiHandle:function(){
      console.log("微信分享");
    },

    boHandle:function(){
      console.log("微博分享");
    }


  }
};
</script>


<style lang="scss" scoped>
@import "../../assets/css/variables.scss";
.clear:after {
  content: "";
  display: block;
  clear: both;
}
.container {
  width: 100%;
  padding: 0;
  margin: 0;
}
.msg-header {
  width: 100%;
  line-height: $title-line-height;
  text-align: center;
  color: $nav-color;
  background: $main-color;
  .title {
    margin: 0 auto;
    font-size: $large-font-size;
  }
  .share{
    position: absolute;
    top: 0;
    right: 30px;
    font-size: $small-font-size;
    .share-text{
      display: inline-block;
    }
    .share-tap{
      position: absolute;
      top:105px;
      right:0;
      width:240px;
      background:$nav-color;
      color:$body-text-color;
      border-radius: 20px;
      font-size: $normal-font-size;
      >div{
        >img{
          width:50px;
          vertical-align: middle;
        }
        >p{
          display: inline-block;
        }
      }
    }
    .share-tap::before{
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      transform: rotate(315deg);
      background:$nav-color;
      top: -10px;
      right: 30px;
    }
  }
  
}
.msg-header::before {
  content: "";
  position: absolute;
  width: 25px;
  height: 25px;
  border: 3px solid $nav-color;
  border-width: 3px 0 0 3px;
  transform: rotate(315deg);
  top: 26px;
  left: 50px;
}
.detail-container{
  padding:$padding;
  background:$bg-color;
  min-height:1185px;
  .detail-content{
    border-radius: 30px;
    padding:$padding;
    background:#E5E5E5;
    >img{
      width:100%;
      background: $assist-color;
      border-radius: 30px;
    }
  }
  .detail-main{
    margin:50px 0;
    text-align: center;
    .detail-title{
      font-size: $large-font-size;
    }
    .detail-time{
      font-size:$mini-font-size;
      color:$desc-text-color;
      padding-bottom: $padding;
      border-bottom:2px solid $desc-text-color;
    }
    .detail-text{
      font-size: $normal-font-size;
      padding:$padding 0;
      color:$body-text-color;
    }
  }
}


</style>
