<template>
  <div class='help-center cnfont'>
    <div class="header">
      <nav-header title="帮助中心"></nav-header>
    </div>

    <div class='help-container'>
      <vue-better-scroll class="help-content" ref="scroll" :startY="parseInt(startY)">
        <ul class="help-list">
          <li v-for="(item, idx) in videoList" :key="item.title">
            <p class='help-title'>{{item.title}}</p>
            <div class="video-container" @click="play(idx)">
              <video class="help-video" preload="none" :poster='item.poster' :ref="'video'+idx">
                <source :src="item.url" type="video/mp4"> 您的浏览器不支持Video标签。
              </video>
              <div class="mask" :class='{active:pauseIdx===idx}'></div>
              <i id="play" class="iconfont icon-bofang" :class='{active:playIdx===idx && showPlayIcon}'></i>
              <i id="pause" class="iconfont icon-zanting" :class='{active:pauseIdx===idx}'></i>
            </div>
          </li>
        </ul>
      </vue-better-scroll>
    </div>
  </div>
</template>
<script>
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
export default {
  data() {
    return {
      videoList: [
        {
          title: "常见问题1：如何充值大嘴龙",
          poster: "static/images/videoImg/7.jpg",
          url: "http://res.bigabc.cn/video/charge.mp4"
        },
        {
          title: "常见问题2：单元如何通关",
          poster: "static/images/videoImg/3.jpg",
          url: "http://res.bigabc.cn/video/unit.mp4"
        },
        {
          title: "常见问题3：关卡如何得星",
          poster: "static/images/videoImg/6.jpg",
          url: "http://res.bigabc.cn/video/star.mp4"
        },
        {
          title: "常见问题4：如何进行复习",
          poster: "static/images/videoImg/8.jpg",
          url: "http://res.bigabc.cn/video/review.mp4"
        },
        {
          title: "常见问题5：如何选择匹配的教材版本",
          poster: "static/images/videoImg/4.jpg",
          url: "http://res.bigabc.cn/video/book.mp4"
        },
        {
          title: "常见问题6：如何获得龙币",
          poster: "static/images/videoImg/9.jpg",
          url: "http://res.bigabc.cn/video/dragon.mp4"
        },
        {
          title: "常见问题7：如何绑定校区",
          poster: "static/images/videoImg/2.jpg",
          url: "http://res.bigabc.cn/video/school.mp4"
        },
        {
          title: "常见问题8：使用大嘴龙注意事项",
          poster: "static/images/videoImg/5.jpg",
          url: "http://res.bigabc.cn/video/attention.mp4"
        },
        {
          title: "常见问题9：作业分类和怎么做作业",
          poster: "static/images/videoImg/1.jpg",
          url: "http://res.bigabc.cn/video/homework.mp4"
        }
      ],
      startY: 0, // 纵轴方向初始化位置
      scroll: null,
      playIdx: -1,
      showPlayIcon: false,
      pauseIdx: -1
    };
  },
  mounted() {
    // this.getData();
    this.$nextTick(() => {
      this.$refs.scroll && this.$refs.scroll.forceUpdate(true);
    });
    // this.$refs.scroll && this.$refs.scroll.refresh();
  },
  created(){
    let osName = window.plus && window.plus.os.name;
    if(osName && osName.toLowerCase() === 'ios'){
      this.videoList[0].url = 'http://res.bigabc.cn/video/app/appleCharge.mp4'
    }
  },
  methods: {
    play: function(idx) {
      let videoItem = this.$refs["video" + idx][0];
      if (this.playIdx === idx) {
        // pause
        this.playIdx = -1;
        this.pauseIdx = idx;
        videoItem.pause();
      } else {
        // play
        this.videoList.forEach((item, idx) => {
          let vItem = this.$refs["video" + idx][0];
          vItem.pause();
        });
        this.playIdx = idx;
        this.pauseIdx = -1;
        this.showPlayIcon = true;
        setTimeout(() => {
          this.showPlayIcon = false;
        }, 800);
        videoItem.play();
      }
    }
  },
  components: {
    navHeader
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";
.help-center {
  width: 100%;
  height: 100%;
  .clear {
    content: "";
    display: block;
    clear: both;
  }
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }
  .help-container {
    position: fixed;
    top: 110px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    .help-content {
      height: 100%;
      .help-list {
        list-style: none;
        padding: $padding 0;
        > li {
          background: $nav-color;
          border-radius: 30px;
          padding: 0 $padding;
          margin-bottom: $padding;
          .help-title {
            height: $title-line-height;
            line-height: $title-line-height;
            border-bottom: 2px solid $stroke-color;
            font-size: $small-font-size;
            color: $emphases-text-color;
          }
          .video-container {
            width: 100%;
            position: relative; //配合播放 暂停按钮做绝对定位
            .help-video {
              width: 100%;
            }
            > i {
              position: absolute;
              top: 43%;
              left: 43%;
              font-size: 100px;
              display: none;
            }
            .mask {
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              bottom: 0;
              right: 0;
              background: $bg-color;
              opacity: 0.5;
              display: none;
            }
            .active {
              display: block;
            }
          }
        }
      }
    }
  }
}
</style>