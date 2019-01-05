<template>
  <div class='speaker' :class='[color]'>
    <img :src='imgPath' @click.stop="play"></img>
    <audio ref="audio" v-if="audioSrc" :src='audioSrc' :preload="preloadValue" @canplay='audioCanPlay' @pause="resetAudio" @ended='playEnd' @error='playError'></audio>
  </div>
</template>
<script>
export default {
  props: {
    color: {
      type: String,
      default: "red"
    },
    audioSrc: {
      type: String
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    delay: {
      type: Number,
      default: 0
    },
    preload: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      imgIdx: 3,
      picPath: "static/images/icon-speaker-",
      playing: null,
      loadError: false,
      preloadValue: "auto"
    };
  },
  mounted() {
    this.preloadValue = this.preload ? "auto" : "none";
    if (this.autoPlay) {
      this.$nextTick(() => {
        setTimeout(() => {
          this && this.play && this.play();
        }, this.delay);
      });
    }
  },
  computed: {
    imgPath: function() {
      return this.picPath + this.color + "-" + this.imgIdx + ".png";
    }
  },
  watch: {
    audioSrc: function(val) {
      if (val) {
        this.loadError = false;
        if (this.autoPlay) {
          this.$nextTick(() => {
            setTimeout(() => {
              this && this.play && this.play();
            }, this.delay);
          });
        }
      } else {
        this.playEnd(false);
      }
    }
  },
  methods: {
    play: function() {
      if (this.playing) {
        clearInterval(this.playing);
      }
      if (this.loadError) {
        this.$store.dispatch("showTipsMsg", "加载音频失败！");
        return;
      }
      this.playing = setInterval(() => {
        if (this.imgIdx == 3) {
          this.imgIdx = 1;
        } else {
          this.imgIdx += 1;
        }
      }, 500);
      this.$emit("onStart");
      this.$refs.audio && this.$refs.audio.play();
    },
    audioCanPlay:function(){
      this.$emit("canPlay", this.$refs.audio && this.$refs.audio.duration|| 0);
    },
    playEnd: function(emitEnd= true) {
      if (this.playing) {
        clearInterval(this.playing);
      }
      this.initStatus(this.imgIdx);
      emitEnd && this.$emit("onEnd", this.$refs.audio);
    },
    playError: function() {
      this.loadError = true;
      if (this.playing) {
        clearInterval(this.playing);
      }
      this.$emit("onError");
    },
    initStatus: function(currStatus) {
      if (currStatus == 2) {
        setTimeout(() => {
          this.imgIdx = 3;
        }, 500);
      } else if (currStatus == 1) {
        setTimeout(() => {
          this.imgIdx = 2;
          this.initStatus(2);
        }, 500);
      }
    },
    resetAudio: function() {
      this.$refs.audio && this.$refs.audio.load();
      this.playEnd(false)
    }
  },
  beforeDestroy() {
    if (this.playing) {
      clearInterval(this.playing);
    }
    // this.playEnd();
  }
};
</script>
<style lang='scss' scoped>
.speaker {
  display: inline-block;
}
.speaker.red,
.speaker.blue {
  width: 70px;
  height: 70px;
  img {
    width: 70px;
    height: 70px;
  }
}

.speaker.yellow {
  width: 60px;
  height: 60px;
  img {
    width: 60px;
    height: 60px;
  }
}
</style>
