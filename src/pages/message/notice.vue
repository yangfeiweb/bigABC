<template>
  <div class="notice-container" ref='noticeList'>
    <vue-better-scroll class="wrapper" ref="scroll" :pullDownRefresh="pullDownRefreshObj" :pullUpLoad="pullUpLoadObj" :startY="parseInt(startY)" @pullingDown="onPullingDown" @pullingUp="onPullingUp">
      <ul class="notice-content">
        <li v-for="item in noticeList" :key="item.createTime" class="notice-list">
          <p>{{item.createTime}}</p>
          <div class="notice-shows  clear">
            <div class="msg-img">
              <img src="static/images/head.png" alt="">
            </div>
            <p>{{item.content}}</p>
          </div>
        </li>
      </ul>
    </vue-better-scroll>

  </div>
</template>
<script>
import dataService from "@/service/index";

export default {
  name: "noticeBody",
  props: ["refresh"],
  data() {
    return {
      scroll: null,
      // 这个配置用于做下拉刷新功能，默认为 false。当设置为 true 或者是一个 Object 的时候，可以开启下拉刷新，可以配置顶部下拉的距离（threshold） 来决定刷新时机以及回弹停留的距离（stop）
      pullDownRefreshObj: {
        threshold: 20,
        stop: 40
      },
      // 这个配置用于做上拉加载功能，默认为 false。当设置为 true 或者是一个 Object 的时候，可以开启上拉加载，可以配置离底部距离阈值（threshold）来决定开始加载的时机
      pullUpLoadObj: {
        threshold: 0,
        txt: {
          more: "加载更多",
          noMore: "没有更多公告了"
        }
      },
      startY: 0, // 纵轴方向初始化位置
      noticeList: [],
      page: 0,
      size: 10,
      messageType: "BULLETIN",
      totalPages: 0
    };
  },
  mounted: function() {
    this.$refs.scroll && this.$refs.scroll.refresh();
    this.getData();
  },
  watch: {
    refresh: function(val) {
      if (val) {
        this.$refs.scroll && this.$refs.scroll.refresh();
      }
    }
  },
  methods: {
    //请求数据
    getData: function(loadMore) {
      dataService
        .getMessage(this.page, this.szie, this.messageType)
        .then(res => {
          // console.log(res);
          let result = res.data;
          let code = result.code;
          let msg = result.msg;

          if (code == 200) {
            let data = result.data;
            let content = data.content;
            this.totalPages = data.totalPages;
            if (content) {
              if (loadMore) {
                this.noticeList = this.noticeList.concat(content);
              } else {
                this.noticeList = content;
              }
            }
          }
        })
        .then(() => {
          if (this.totalPages == 0 || this.page == this.totalPages - 1) {
            this.$refs.scroll && this.$refs.scroll.forceUpdate(false);
          } else {
            this.$refs.scroll && this.$refs.scroll.forceUpdate(true);
          }
          let pulldown = this.$el.querySelector(".pulldown-wrapper");
          if (pulldown) {
            pulldown.style.top = "-50px";
          }
        });
    },
    onPullingDown() {
      // 下拉刷新
      this.page = 0;
      this.getData();
    },
    onPullingUp() {
      if (this.page < this.totalPages - 1) {
        this.page++;
        this.getData(true);
      }
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
.notice-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #ffffff;
  border-radius: 0.266667rem;
  .wrapper {
    height: 100%;
    .notice-content {
      list-style: none;
      margin: 0 auto;
      padding: 0 $padding;
      .notice-list {
        padding: 15px $padding;
        > p {
          text-align: center;
          font-size: $small-font-size;
          color: $bg-color;
        }
        .notice-shows {
          margin-top: 20px;
          display: flex;
          .msg-img {
            width: 100px;
            margin-right: 10px;
            text-align: center;
            display: inline-block;
            > img {
              width: 80px;
              padding: 10px;
              border-radius: 50%;
              background: $nav-color;
            }
          }
          > p {
            float: right;
            width: 65%;
            padding: 20px;
            font-size: $normal-font-size;
            color: $emphases-text-color;
            background: $nav-color;
            border-radius: 30px;
            position: relative;
          }
          > p::before {
            content: "";
            position: absolute;
            width: 30px;
            height: 30px;
            background: $nav-color;
            border-width: 3px 0 0 3px;
            transform: rotate(315deg);
            top: 30px;
            left: -13px;
          }
        }
      }
    }
  }
}
</style>
