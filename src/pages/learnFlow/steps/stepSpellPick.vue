<template>
  <div class='spell-easy-container'>
    <learn-header></learn-header>
    <div class='spell-body'>
      <div class='content'>
        <div class='words-container'>
          <transition name='fade'>
            <div class='word-item' v-for="(word, idx) in words" :key='idx' v-if="curr == (idx+1)">
              <div class='img-container'>
                <img :src='word.imgUrl' class='word-img'></img>
              </div>
              <speaker class='word-speaker' :audioSrc='word.voiceUrl'></speaker>
              <div class='result'>
                <!-- {{word.word}} -->
                <span class='combined'>{{selectedSegments.join('')}}</span>
                <span class='check-icon'>
                  <!-- <img ></img> -->
                </span>
              </div>
              <div class='phonics'>
                <checker v-model="selectedSegments" type='checkbox' default-item-class="segment-item" selected-item-class="segment-item-selected">
                  <checker-item v-for='(segment,idx) in word.segments' :key="idx" :value="segment">{{segment}}</checker-item>
                </checker>
              </div>
            </div>
          </transition>
        </div>
        <div class='btn-container'>
          <span class='btn' @click='checkResult'>检测一下（{{curr}}/{{words.length}}）</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import learnHeader from "@/components/learnHeader";
  import speaker from "@/components/widgets/speaker";
  import { Checker, CheckerItem } from "vux";
  import utility from "@/utility/utility";
  export default {
    components: { learnHeader, speaker, Checker, CheckerItem },
    data() {
      return {
        curr: 1,
        selectedSegments: [],
        multi: false
      };
    },
    computed: {
      words: function() {
        let words = this.$store.getters.currFlowStepWords;
        words &&
          words.forEach(item => {
            !item.segments && this.buildSegments(item);
          });
        return words;
      }
    },
    methods: {
      checkResult: function() {
        this.selectedSegments = [];
        if (this.curr == this.words.length) {
          this.curr = 1;
        } else {
          this.curr++;
        }
      },
      buildSegments: function(wordItem) {
        let segments = [];
        let type = wordItem.wordStyle;
        let word = wordItem.word;
        if (type == "WORD") {
          let phonics = wordItem.phonics;
          if (phonics) {
            let arr = phonics.split("-");
            if (arr.length == 2) {
              segments = arr[0].split("+");
            }
          } else if (word.indexOf("-") != -1) {
            segments = word.split("-");
            segments.push("-");
          } else {
            segments = word.split("");
          }
        } else {
          segments = word.split(" ");
        }
        wordItem["segments"] = utility.sortArrByRandom(segments);
      }
    }
  };
</script>

<style lang='scss' scoped>
@import "~@/assets/css/variables.scss";
.spell-easy-container {
  background: $main-color;
  height: 100%;
  width: 100%;
  position: relative;
  .spell-body {
    position: absolute;
    top: $learn-line-height;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    .content {
      height: 100%;
      width: 100%;
      border-radius: 30px;
      background: #fff;
      overflow: hidden;
      position: relative;
      .words-container {
        position: absolute;
        top: 30px;
        left: 30px;
        right: 30px;
        bottom: 200px;
        .word-item {
          height: 100%;
          width: 100%;
          text-align: center;
          // background:#fff;
          position: absolute;
          .img-container {
            width: 400px;
            height: 400px;
            padding: 10%;
            margin: 0 auto;
            box-sizing: border-box;
            background: $bg-color;
            border-radius: 30px;
            .word-img {
              width: 100%;
              height: 100%;
            }
          }
          .word-speaker {
            margin: 40px 0;
          }
          .result {
            height: 80px;
            // background: greenyellow;
            line-height: 80px;
            margin-bottom: 20px;
            font-size: $large-font-size;
            // position
            // .per-fix{
            //   display:inline-block;
            //   margin-right:5px;
            //   height: 80%;
            //   line-height:80%;
            //   vertical-align: middle;
            // }
            .combined {
              display: inline-block;
              border-bottom: 2px solid $stroke-color;
              min-width: 200px;
              height: 80%;
              line-height: 80%;
              vertical-align: middle;
              text-align: center;
            }
          }
          .phonics {
            height: 150px;
            line-height: 75px;
            .segment-item {
              height: 60px;
              line-height: 60px;
              // width:150px;
              font-size: $normal-font-size;
              min-width: 60px;
              padding: 0 15px;
              background: $embellish-color;
              color: #fff;
              border-radius: 20px;
              margin: 0 10px;
            }
            .segment-item-selected {
              background: $embellish-dark-color;
            }
          }
        }
      }
      .btn-container {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 160px;
        line-height: 160px;
        // background:lightsalmon;
        text-align: center;
        .btn {
          font-size: $big-font-size;
          // width:500px;
          // height:120px;
          border-radius: 50px;
          color: $main-color;
          background: $assist-light-color;
          padding: 20px 100px;
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
