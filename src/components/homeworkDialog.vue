<template>
  <div class='homework-dialog' :class='[dialogCls]'>
    <transition name='score-info' v-on:after-enter="afterEnter" v-on:leave="leaving">
      <div class='group-container cnfont' :class='{centerCls:centerDialog}' v-show='showInfo'>
        <img class='score-img' src='static/images/homework-dialog.png'></img>
        <img class='score-close' src='static/images/icon-close.png' @click='hide'></img>
        <div class='content'>
          <div class='step'>{{scoreInfo && scoreInfo.stepTitle}}</div>
          <div class='score'>{{scoreInfo && scoreInfo.score}}分</div>
          <div class='btn-container'>
            <span class='btn' @click='replay'>再来一次</span>
            <span class='btn' @click='next'>下一关</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    scoreInfo:{
      type:Object
    }
  },
  components: {},
  data() {
    return {
      dialogShow: false,
      showInfo: false,
      centerDialog:false,
      groupCls: "hide",
      dialogCls: "hide",
      starPath: "static/images/header-star"
    };
  },
  mounted() {
    this.dialogShow = this.show || false;
  },
  computed: {
    starSrc: function() {
      let star = this.scoreInfo && this.scoreInfo.star || 0
      return this.starPath + star + ".png";
    }
  },
  watch: {
    show: function(val) {
      this.dialogShow = val;
      this.showInfo = val;
      if (val) {
        this.dialogCls = "show";
        setTimeout(()=>{
          this.$refs.scoreScroller &&  this.$refs.scoreScroller.forceUpdate(false)
        },1000)
      } else {
        this.dialogCls = "hide";
      }
    }
  },
  methods: {
    hide: function() {
      this.showInfo = false;
      setTimeout(() => {
        this.dialogShow = false;
        this.$emit("update:show", false);
        this.$emit('hide')
      }, 500);
    },
    replay:function(){
      this.$emit('replay')
    },
    next:function(){
      this.$emit('next')
    },
    afterEnter:function(){
      this.centerDialog = true
    },
    leaving:function(){
      this.centerDialog = false
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";
.homework-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: $mask-color;
  display: none;
  overflow: hidden;
  &.show {
    display: block;
  }
  &.hide {
    display: none;
  }
  .score-info-enter-active{
    transition-duration: 0.5s;
    transform: translate(-50%, -50%);
    transition-property: transform;
  }
  .score-info-leave-active{
    transition-duration: 0.5s;
    transform: translate(-50%,-1400px);
    transition-property: transform;
  }
  .score-info-enter {
    transform: translate(-50%,-1400px);
  }
  .score-info-enter-to {
    transform: translate(-50%, -50%);
  }
  // .score-info-leave {
  //   // transform: translate(-50%,-1400px);
  // }
  .group-container {
    width: 545px;
    height: 494px;
    position: absolute;
    left:50%;
    top:50%;
    .score-close {
      width: 60px;
      height: 60px;
      position: absolute;
      right: 0;
      top: -30px;
    }
    .score-img {
      width: 545px;
      height: 494px;
    }

    .content {
      position: absolute;
      top: 150px;
      left: 60px;
      right: 60px;
      height: 320px;
      // background: rgba(0, 0, 0, 0.15);
      text-align: center;
      .step {
        font-size: $normal-font-size;
        height: 60px;
        line-height: 60px;
      }
      .score {
        font-size: $max-font-size;
        color: $main-color;
        font-weight: bold;
        height: 80px;
        line-height: 80px;
        letter-spacing: 10px;
      }
      .coins {
        font-size: $mini-font-size;
        height: 40px;
        line-height: 40px;
        color: $body-text-color;
      }
      .desc {
        font-size: $normal-font-size;
        height: 60px;
        line-height: 60px;
        color: $desc-text-color;
        margin-top: 30px;
      }
      .btn-container {
        font-size: $normal-font-size;
        height: 80px;
        line-height: 80px;
        margin-top: 75px;
        .btn {
          background: $assist-light-color;
          color: $main-color;
          border-radius: 30px;
          padding: 10px 20px;
          &:active {
            background: $assist-dark-color;
          }
        }
      }
      .highlight {
        color: $main-color;
      }
    }
  }
  .group-container.centerCls{
    transform: translate(-50%, -50%);
  }
}
</style>
