<template>
  <div class="shopping-container">
    <div class="scroll-container">
      <vue-better-scroll class="main-content" ref="scroll">
        <ul class="shopping-list">
          <li v-for="item in shoppingData" :key='item.id' class="shopping-content clear">
            <dl>
              <dt class="shopping-img">
                <img :src="item.imgUrl" alt="">
              </dt>
              <dd class="shopping-name">
                <span>{{item.name}}</span>
              </dd>
              <dd class="shopping-price">
                <img v-if="areaType==='gold'" src="static/images/icon-coin.png" alt="">
                <img v-if="areaType==='diamond'" src="static/images/icon-diamond.png" alt="">
                <span>{{item.price}}</span>
              </dd>
              <dd class="shopping-btn">
                <span @click="exchange">兑换</span>
              </dd>
            </dl>
          </li>
        </ul>
      </vue-better-scroll>
    </div>
  </div>
</template>


<script>
import dataService from "@/service/index";
import { resourcePath } from "@/service/urlConfig";
export default {
  props: {
    refresh: {
      type: Boolean,
      default: false
    },
    areaType:{
      type:String,
      default:'gold'
    }
  },
  data: function() {
    return {
      shoppingData:[
        {id:1,imgUrl:'static/images/home-logo.png',name:'可爱抱枕1',price:'20000'},
        {id:2,imgUrl:'static/images/home-logo.png',name:'可爱抱枕2',price:'20000'},
        {id:3,imgUrl:'static/images/home-logo.png',name:'可爱抱枕3',price:'20000'},
        {id:4,imgUrl:'static/images/home-logo.png',name:'可爱抱枕4',price:'20000'},
        {id:5,imgUrl:'static/images/home-logo.png',name:'可爱抱枕5',price:'20000'},
        {id:6,imgUrl:'static/images/home-logo.png',name:'可爱抱枕6',price:'20000'},
        {id:7,imgUrl:'static/images/home-logo.png',name:'可爱抱枕7',price:'20000'},
        {id:8,imgUrl:'static/images/home-logo.png',name:'可爱抱枕8',price:'20000'},
        {id:9,imgUrl:'static/images/home-logo.png',name:'可爱抱枕9',price:'20000'},
        {id:10,imgUrl:'static/images/home-logo.png',name:'可爱抱枕10',price:'20000'},
        {id:11,imgUrl:'static/images/home-logo.png',name:'可爱抱枕11',price:'20000'},
        {id:12,imgUrl:'static/images/home-logo.png',name:'可爱抱枕12',price:'20000'},
        {id:13,imgUrl:'static/images/home-logo.png',name:'可爱抱枕13',price:'20000'},
        {id:14,imgUrl:'static/images/home-logo.png',name:'可爱抱枕14',price:'20000'},
        {id:15,imgUrl:'static/images/home-logo.png',name:'可爱抱枕15',price:'20000'},
      ],
      pullDownRefreshObj: {
        threshold: 20,
        stop: 40
      },
      startY: 0, // 纵轴方向初始化位置
      scroll: null,
    };
  },
  computed: {},
  watch: {
    refresh: function(val) {
      if (val) {
        this.$refs.scroll && this.$refs.scroll.refresh();
      }
    },
  },
  mounted: function() {
    //更新 滚动状态
    this.$refs.scroll && this.$refs.scroll.forceUpdate(true);
  },
  methods: {
    exchange:function(){
      alert("暂未开放，敬请期待");
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../../assets/css/variables.scss";
.clear:after {
  content: "";
  display: block;
  clear: both;
}
.shopping-container {
  width: 100%;
  height: 100%;
  color: $body-text-color;
  // position: relative;
  .scroll-container {
    padding: 10px;
    position: absolute;
    top: 0;
    bottom: 0px;
    left: 0;
    right: 0;
  }
  .main-content {
    height: 100%;
    background:$nav-color;
    border-radius: 30px;
    overflow: hidden;
    .shopping-list {
      list-style: none;
      margin: 0 auto;
      padding: 0 $padding/2;
      display:flex;
      flex-wrap: wrap;
      >li{
        box-sizing:border-box;
        width:48%;
        margin:5px 1%;
        padding:$padding 10px;
        text-align:center;
        background:#fff;
        border-radius:15px;
        .shopping-img{
          >img{
            width:100%; 
          }
        }
        .shopping-name{
          font-size:$normal-font-size;
          color:#0C0C0C;
        }
        .shopping-price{
          font-size:$normal-font-size;
          color:#FCC024;
          >img{
            width:12%;
            vertical-align: middle;
            margin-right:-10px;
          }
        }
        .shopping-btn{
          >span{
            display:inline-block;
            padding:10px $padding*1.5;
            font-size:$small-font-size;
            color:#fff;
            background:$main-color;
            border-top-left-radius:40px;
            border-top-right-radius: 40px;
            border-bottom-left-radius: 40px;
            border-bottom-right-radius: 40px;
          }
        }
      }
    }
  }
}
</style>
