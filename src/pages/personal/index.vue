<template>
  <div class='per-container cnfont'>
    <div class='images'>
      <div class='my-title'>个人中心</div>
      <div class='img-container'>
        <img :src='userInfo && userInfo.icon'>
      </div>
      <div class='name-container'>
        <span class='nickname'>{{userInfo && userInfo.nickName||'匿名用户'}}</span>
      </div>
    </div>
    <grid>
      <grid-item>
        <img slot="icon" src="static/images/icon-coin-big.png">
        <div slot="label">龙币</div>
        <div slot="label" class='size'>{{coins}}个</div>
      </grid-item>
      <grid-item>
        <img slot="icon" src="static/images/icon-diamond-big.png">
        <div slot="label">钻石</div>
        <div slot="label" class='size'>{{diamonds}}个</div>
      </grid-item>
      <grid-item>
        <router-link to='/personInfos/signIn' slot="icon">
          <img src="static/images/icon-signin.png">
        </router-link>
        <div slot="label">签到</div>
        <div slot="label" class='size'>{{signedTotal}}天</div>
      </grid-item>
    </grid>
    <div class='infos'>
      <group>
        <cell link='/personInfos/materials'>
          <span slot="title" class='size'>
            <span>我的资料</span>
          </span>
          <span slot="title">
            <span class='font'>资料，年级，老师</span>
          </span>
          <img slot="icon" src="static/images/icon-info.png" class='img'>
        </cell>
        <cell link='/personInfos/vip' v-show='!isTourist'>
          <span slot="title" class='size'>
            <span>会员管理</span>
          </span>
          <span slot="title">
            <span class='font'>账户充值</span>
          </span>
          <img slot="icon" src="static/images/icon-vip.png" class='img'>
        </cell>
        <cell link="/personInfos/help">
          <span slot="title" class='size'>
            <span>帮助中心</span>
          </span>
          <span slot="title">
            <span class='font'>常见问题解答</span>
          </span>
          <img slot="icon" src="static/images/help.png" class='img'>
        </cell>
        <cell link="/personInfos/vesion">
          <span slot="title" class='size'>
            <span>版本信息</span>
          </span>
          <span slot="title">
            <span class='font'>V{{version}}</span>
          </span>
          <img slot="icon" src="static/images/icon-setting.png" class='img'>
        </cell>
      </group>
      <div class='btn' @click='logout'>退出登录</div>

      <router-view></router-view>
    </div>
  </div>
</template>
<script>
import { Grid, GridItem, Group, Cell } from "vux";
import dataService from "@/service/index";
import {VERSION} from '@/utility/dict'

export default {
  components: {
    Grid,
    GridItem,
    Group,
    Cell
  },
  data() {
    return {
      localVersion:VERSION
    };
  },
  computed: {
    coins: function() {
      return this.$store.getters.coins || 0;
    },
    diamonds: function() {
      return this.$store.getters.diamonds || 0;
    },
    userInfo: function() {
      return this.$store.getters.userInfo;
    },
    signedTotal: function() {
      return this.$store.getters.signedTotal;
    },
    isTourist: function() {
      return this.$store.getters.isTourist;
    },
    version: function() {
      return this.$store.getters.version || this.localVersion;
    }
  },
  created() {
    this.$store.dispatch("getAccountInfo");
    this.$store.dispatch("getPersonalInfo");
    if(!this.$store.getters.signedInfos){
      this.$store.dispatch('getSignedInfos')
    }
  },
  methods: {
    logout: function() {
      this.$store.dispatch("logout").then(success => {
        this.$router.replace({ name: "login" });
      });
    }
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";
.per-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .images {
    width: 100%;
    height: 350px;
    background-image: url("~@/assets/images/bg-pic.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    text-align: center;
    .my-title {
      width: 100%;
      height: 110px;
      line-height: 110px;
      font-size: $normal-font-size;
    }
    .img-container {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
      position: relative;
      img {
        width: 130%;
        left: 50%;
        top: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
      }
    }
    .name-container {
      text-align: center;
      .nickname {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 30px;
        min-width: 100px;
        background: rgba(232, 247, 239, 0.8);
        font-size: $small-font-size;
      }
    }
  }
  .weui-grids {
    width: 100%;
    height: 200px;
    padding: 0;
    margin: 0;
    background: #fff;
    .weui-grid {
      height: 170px;
      .weui-grid__icon {
        width: 80px;
        height: 80px;
      }
    }
    .weui-grid:after {
      border-bottom: none;
    }
    .weui-grid:before {
      border-right: none;
    }
    .weui-grids:before {
      border-top: none;
    }
  }
  .infos {
    flex: 1;
    background: #f0f0f0;
    padding-left: 20px;
    padding-right: 20px;
    position: relative;
    margin: 0;
    .weui-cells {
      width: 100%;
      // height: 400px;
      border-radius: 50px;
    }
    .weui-cell {
      height: 100px;
      padding: 0;
      .img {
        margin-left: 40px;
        width: 60px;
        height: 60px;
      }
    }
    .vux-label {
      margin-left: 50px;
    }
    .weui-cell__ft:after {
      height: 20px;
      width: 20px;
      border-color: black;
      margin-right: 40px;
    }
  }
  .size {
    font-size: 32px;
  }
  .font {
    font-size: 22px;
    padding-left: 40px;
    color: gray;
  }
  .btn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 30px;
    width: 600px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border-radius: 50px;
    background-color: $main-color;
    color: #fff;
    font-size: $large-font-size;
    &:active{
      background-color:$main-dark-color;
    }
  }
}
</style>
