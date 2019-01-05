<template>
  <div class='step6'>
    <learn-header></learn-header>
    <div class='step6-box'>
      <div class='example-sentence'>
        <div class='example-container'>
          <transition name='fade'>
            <div class='word-item' v-for="(word, idx) in words" :key='idx' v-if="curr == (idx+1)">
              <div class='picture-box'>
                <bg-img cls='words-img' :src='word.imgUrl'></bg-img>
              </div>
              <vue-better-scroll class="statements-container">
                <div class='statement-item' v-for="(item, idx) in word.statements" :key='item.id'>
                  <p class="english">{{item.statements}}</p>
                  <p class='chinese'>{{item.chinese}}</p>
                  <div class='word-listen'>
                    <speaker v-if="idx===0" :audioSrc='item.voiceUrl'  autoPlay :delay='audioDelay' @onStart="startPlay" @onEnd="wordVoiceEnd" @onError="wordVoiceEnd"></speaker>
                    <speaker v-else :audioSrc='item.voiceUrl' @onStart="startPlay" @onEnd="wordVoiceEnd" @onError="wordVoiceEnd"></speaker>
                  </div>
                </div>
              </vue-better-scroll>
            </div>
          </transition>
        </div>
        <div class='word-next cnfont'>
          <div class='word-btn' :class="{active:!locking,disable:locking}"  @click='next'>
            {{curr===words.length? '完成': '下一个'}}（{{curr}}/{{words.length}}） </div>
          </div>
        </div>
      </div>
    </div>
</template>
 <script>
import learnHeader from "@/components/learnHeader";
import speaker from "@/components/widgets/speaker";
import bgImg from "@/components/widgets/bgImg";
export default {
  props: ["reset"],
  data() {
    return {
      curr: 1,
      audioDelay: 500,
      locking: true
    };
  },
  computed: {
    words: function() {
      let words = this.$store.getters.currFlowStepWords;
      return words;
    }
  },
  watch: {
    reset: function(val) {
      if (val) {
        this.curr = 1;
      }
    },
    curr:function(val){
      if(val){  //检查这个单词有没有例句
        let word = this.words[val-1];
        if(word && Array.isArray(word.statements)){
          if(word.statements.length===0){
            this.locking = false
          }
        }
      }
    }
  },
  methods: {
    next: function() {
      if (this.locking) {
        return;
      }
      this.$store.dispatch("playTapAudio");
      this.locking = true;
      // setTimeout(() => {
      //   this.locking = false;
      // }, 1000);
      if (this.curr == this.words.length) {
        this.curr = this.words.length;
        this.$emit("postResult");
      } else {
        this.curr++;
      }
    },
    startPlay(){
      this.locking = true;
    },
    wordVoiceEnd(){
      this.locking = false;
    },
    // wordVoiceError(){
    //   this.locking = false;
    // }
  },
  components: {
    learnHeader,
    speaker,
    bgImg
  }
};
</script>

<style lang='scss' scoped>
@import "~@/assets/css/variables";
.step6 {
  width: 100%;
  height: 100%;
  background: $main-color;
  position: relative;
  .step6-box {
    position: absolute;
    top: $learn-line-height;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px;
    .example-sentence {
      width: 100%;
      height: 100%;
      background: #fff;
      border-radius: 30px;
      position: relative;
      .example-container {
        position: absolute;
        top: 40px;
        width: 100%;
        bottom: 160px;
        overflow: hidden;
        .word-item {
          height: 100%;
          width: 100%;
          position: absolute;
          .picture-box {
            width: 360px;
            height: 360px;
            margin: 0 auto;
            .words-img {
              height: 95%;
              width: 95%;
            }
          }
          .statements-container {
            position: absolute;
            top: 360px;
            width: 100%;
            bottom: 0;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
            .statement-item {
              line-height: 70px;
              .english {
                font-size: $large-font-size;
              }
              .chinese {
                font-size: $normal-font-size;
                color: $desc-text-color;
              }
              margin-bottom: 20px;
              // border: 2px solid $assist-light-color;
              // border-radius: 20px;
            }
          }
        }
      }
      .word-next {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 160px;
        line-height: 160px;
        text-align: center;
        .word-btn {
          width: 80%;
          height: 100px;
          line-height: 100px;
          text-align: center;
          // background: $assist-light-color;
          margin: 0 auto;
          // color: $main-color;
          font-size: $large-font-size;
          border-radius: 100px;
        }
          .active {
  					background-color: $assist-light-color;
  					color: $main-color;
  					&:active {
  						background-color: $assist-color;
  					}
  				}
  				.disable {
  					background-color: $disable-color;
  					color: #ffffff;
  				}
      }
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: all 1s;
  }
  .fade-enter,
  .fade-leave-active {
    opacity: 0;
  }
  .fade-enter {
    transform: translateX(680px);
  }
  .fade-leave-active {
    transform: translateX(-680px);
  }
}
</style>





