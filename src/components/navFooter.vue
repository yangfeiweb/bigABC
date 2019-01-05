<template>
  <div class="footers cnfont">
    <div class='selected-bg' :class="{nav0:currNav == 0, nav1:currNav == 1, nav2:currNav == 2, nav3:currNav == 3, nav4:currNav == 4 }"></div>
    <tabbar class='nav-bar'>
      <template v-for="(item, idx) in navs">
        <tabbar-item v-if="item.showBadge" :selected='idx == currNav' :class="{selected:idx == currNav}" :key="idx" :link='item.url' :badge='unreadMsgs' @on-item-click='navClick'>
          <img slot="icon" :src="imgRoot+item.iconName+'-'+item.direction+'.png'">
          <span slot="label">{{item.label}}</span>
        </tabbar-item>
        <tabbar-item v-else :key="idx" :link='item.url' :selected='idx == currNav' :class="{selected:idx == currNav}" @on-item-click='navClick'>
          <img slot="icon" :src="imgRoot+item.iconName+'-'+item.direction+'.png'">
          <span slot="label">{{item.label}}</span>
        </tabbar-item>
      </template>
    </tabbar>
  </div>
</template>
<script>
import { Tabbar, TabbarItem } from "vux";
export default {
  name: "footers",
  data() {
    return {
      currNav: 0,
      imgRoot: "static/images/",
      navs: [
        {
          url: "/main/home",
          label: "首页",
          direction: "yes",
          iconName: "nav-home"
        },
        {
          url: "/main/msg",
          label: "信息",
          direction: "left",
          iconName: "nav-msg",
          showBadge: true
        },
        {
          url: "/main/ranking",
          label: "排行",
          direction: "left",
          iconName: "nav-ranking"
        },
        // {
        //   url: "/main/shopping",
        //   label: "商城",
        //   direction: "left",
        //   iconName: "nav-store"
        // },
        {
          url: "/main/personal",
          label: "我的",
          direction: "left",
          iconName: "nav-personal"
        }
      ]
    };
  },
  computed: {
    perWidth: function() {
      return 750 / this.navs.length;
    },
    unreadMsgs: function() {
      return this.$store.getters.unreadMsgs;
    }
  },
  watch: {
    currNav: function(val) {
      let navsCount = this.navs.length;
      this.navs.forEach((item, idx) => {
        if (val == 0 && idx != 0) {
          item.direction = "left";
        } else if (val == navsCount - 1 && idx != navsCount - 1) {
          item.direction = "right";
        } else if (val > 0 && val < navsCount - 1) {
          if (val < idx) {
            item.direction = "left";
          } else {
            item.direction = "right";
          }
        }
        if (val == idx) {
          item.direction = "yes";
        }
      });
    },
    "$route.path": function(val) {
      let currIdx = 0;
      let currItem = this.navs.find((item, idx) => {
        currIdx = idx;
        return item.url === val;
      });
      if (currItem) {
        this.currNav = currIdx;
      }
    }
  },
  components: {
    Tabbar,
    TabbarItem
  },
  mounted() {
    let currPath = this.$route.path;
    for (let i = 0; i < this.navs.length; i++) {
      let path = this.navs[i].url;
      if (path == currPath) {
        this.currNav = i;
        break;
      }
    }
  },
  methods: {
    navClick: function(idx) {
      this.currNav = idx;
    },
    getUnReadMsgCount: function() {}
  }
};
</script>

<style lang="scss">
@import "~@/assets/css/variables.scss";
.footers {
  width: 100%;
  height: 100%;
  background: #fff;
  position: relative;
  overflow: hidden;
  .weui-tabbar__label{
    font-size: 20px;
  }
  .selected-bg {
    position: absolute;
    top: -20px;
    background: $main-color;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    transform: translateX(-50%);
  }
  .selected-bg.nav0 {
    transition: left 0.25s;
    left: 12.5%;
  }
  .selected-bg.nav1 {
    transition: left 0.25s;
    left: 37.5%;
  }
  .selected-bg.nav2 {
    transition: left 0.25s;
    left: 62.5%;
  }
  .selected-bg.nav3 {
    transition: left 0.25s;
    left: 87.5%;
  }
  
  .selected {
    .weui-tabbar__label {
      color: #fff !important;
    }
  }
  .nav-bar {
    background: rgba(255, 255, 255, 0);
    height: 100%;
    .weui-tabbar__icon {
      margin-top: 5px;
      width: 50px;
      height: 50px;
    }
    .weui-tabbar__icon sup {
      top: - 5px;
      left: 130%;
      span {
        line-height: 20px;
      }
    }
    .selected {
      .weui-tabbar__icon sup {
        span {
          background: $assist-color;
          color: $main-color;
        }
      }
    }
  }
}
</style>
