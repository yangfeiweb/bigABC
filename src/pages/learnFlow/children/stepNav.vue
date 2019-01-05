<template>
  <div class='nav-steps'>
    <svg class='step-svg' :height='svgHeight' xmlns="http://www.w3.org/2000/svg">
      <g :transform='`translate(${translateX},0)`' ref='rootG'>
        <path class='stepRoad' :d='stepPath' :stroke-width='stepStrokeW'></path>
        <template v-for="(item, idx) in dots">
          <g :key="'dots_'+idx" :class='{active:stepDotActive(idx)}'>
            <circle v-for="(dot, idx) in item" :key='idx' :cx='dot.x' :cy='dot.y' :r='circleR' class='step-circle'></circle>
          </g>
        </template>
        <template v-for="(item, idx) in imgs">
          <g class="step-group" :key="'step_'+idx" :transform='getStepPosition(idx)'>
            <g @click='stepClick(item, idx)'>
              <image :xlink:href='item.imgUrl' x='0' :y='idx==9?-10:0' :width='item.w' :height='item.h' xmlns:xlink="http://www.w3.org/1999/xlink">
              </image>
              <image v-if="item.statusImg" :class="{shake:shakeIdx === idx, lock: shakeIdx != idx}" :xlink:href='item.statusImg.url' :x='item.statusImg.x' :y='item.statusImg.y' :width='item.statusImg.w' :height='item.statusImg.h' xmlns:xlink="http://www.w3.org/1999/xlink">
              </image>
            </g>
            <text :x='item.title.x' :y='item.title.y' class='step-title cnfont'>{{item.title.title}}</text>
          </g>
        </template>
      </g>
    </svg>
  </div>
</template>
<script>
import { TASK_STEP_TITLE, TASK_REVIEW_STEP_TITLE } from "@/utility/dict";
export default {
  props: {
    stepInfos: {
      type: Array
    },
    stepBegin: {
      type: Boolean,
      default: true
    },
    stepPart: {
      type: Number,
      default: 0
    },
    stepType: {
      type: String,
      default: "learn" // learn, review
    }
  },
  data() {
    return {
      screenScale: 1,
      scaleW: 1,
      scaleH: 1,
      stepH: 110,
      stepLineStart: 200,
      stepLineEnd: 540,
      circleR: 10,
      levelR: 55,
      stepStrokeW: 40,
      dots: [],
      imgs: [],
      stepStatus: [],
      imgPaths: [
        {
          url: "static/images/01-listen",
          w: 110,
          h: 110
        },
        {
          url: "static/images/02-read",
          w: 110,
          h: 110
        },
        {
          url: "static/images/03-pic",
          w: 110,
          h: 110
        },
        {
          url: "static/images/04-word",
          w: 110,
          h: 110
        },
        {
          url: "static/images/05-spell",
          w: 110,
          h: 110
        },
        {
          url: "static/images/06-listen",
          w: 110,
          h: 110
        },
        {
          url: "static/images/07-game01",
          w: 110,
          h: 110
        },
        {
          url: "static/images/08-game02",
          w: 110,
          h: 110
        },
        {
          url: "static/images/09-game03",
          w: 110,
          h: 110
        },
        {
          url: "static/images/10-game04",
          w: 104,
          h: 137
        }
      ],
      statusImgs: {
        locked: {
          url: "static/images/icon-lock.png",
          w: 43,
          h: 42
        },
        star0: {
          url: "static/images/step-star0.png",
          w: 96,
          h: 45
        },
        star1: {
          url: "static/images/step-star1.png",
          w: 96,
          h: 45
        },
        star2: {
          url: "static/images/step-star2.png",
          w: 96,
          h: 45
        },
        star3: {
          url: "static/images/step-star3.png",
          w: 96,
          h: 45
        }
      },
      shakeIdx: -1,
      svgHeight: "",
      translateX: 0
    };
  },
  computed: {
    stepPath: function() {
      return (
        `M${this.stepLineStart} ${this.stepH} H${this.stepLineEnd}` +
        this.getCornerPath(this.stepLineEnd, 1) +
        `H${this.stepLineStart}` +
        this.getCornerPath(this.stepLineStart, 3, true) +
        `H${this.stepLineEnd}` +
        this.getCornerPath(this.stepLineEnd, 5) +
        `H${this.stepLineStart}` +
        this.getCornerPath(this.stepLineStart, 7, true) +
        `H${this.stepLineEnd}`
      );
    },
    unlockingStep: function() {
      let step = 0;
      if (this.stepType === "learn") {
        if (this.isFirstUnit) {
          return this.stepInfos.length;
        }
        for (let i = 0; i < this.stepInfos.length; i++) {
          if (
            i > 0 &&
            this.stepInfos[i].playDays == 0 &&
            this.stepInfos[i - 1].playDays != 0
          ) {
            step = i;
            break;
          }
        }
        if (step == 0 && this.stepInfos[0] && this.stepInfos[0].playDays != 0) {
          step = this.stepInfos.length - 1;
        }
      } else {
        let playedIdx = -1;
        for (let i = 0; i < this.stepInfos.length; i++) {
          if (this.stepInfos[i].played == "N") {
            playedIdx = i;
            break;
          }
        }
        if (playedIdx !== -1) {
          step = playedIdx;
        } else {
          step = this.stepInfos.length - 1;
        }
      }
      return step;
    },
    isFirstUnit: function() {
      return this.$store.getters.isFirstUnit;
    }
  },
  watch: {
    stepInfos: function() {
      this.dots = this.buildStepDots();
      this.imgs = this.buildStepImgs(this.stepInfos.length);
      this.setStepImgInfo();
    }
  },
  mounted: function() {
    PIXI.utils.destroyTextureCache();
    // 获取当前适配比例
    let width = this.$el.clientWidth;
    let height = document.body.clientHeight;
    this.scaleW = width / 750;
    this.scaleH = height / 1334;
    this.screenScale = this.scaleW;
    if (this.scaleH < this.scaleW) {
      this.screenScale = this.scaleH;
    }

    this.stepStrokeW = this.stepStrokeW * this.screenScale;
    this.circleR = this.circleR * this.screenScale;
    this.levelR = this.levelR * this.screenScale;
    this.stepLineStart = this.stepLineStart * this.screenScale;
    this.stepLineEnd = this.stepLineEnd * this.screenScale;
    this.stepH = this.stepH * this.screenScale;
    this.dots = this.buildStepDots();
    this.imgs = this.buildStepImgs(this.stepInfos.length);
    this.setStepImgInfo();
    this.svgHeight = 1150 * this.scaleH + "px";
    let svgW = this.$el.clientWidth;
    let groupW = this.$refs.rootG.getBBox().width;
    let bbox = this.$refs.rootG.getBBox();
    this.translateX = (svgW - (bbox.width + bbox.x * 2) * this.screenScale) / 2;
  },
  methods: {
    scaleVal: function(val) {
      return val * this.screenScale;
    },
    getCornerPath: function(x, unit, isLeft) {
      let startY = unit * this.stepH;
      let endY = (unit + 2) * this.stepH;
      let scale = this.scaleVal;
      let arcW = scale(150);
      let arcY = scale(10);
      if (isLeft) {
        return `C${x - arcW} ${startY + arcY}, ${x - arcW} ${endY -
          arcY}, ${x} ${endY}`;
      } else {
        return `C${x + arcW} ${startY + arcY}, ${x + arcW} ${endY -
          arcY}, ${x} ${endY}`;
      }
    },
    buildStepDots: function() {
      let dots = [];
      let stepLen = this.stepLineEnd - this.stepLineStart;
      let perStep = (stepLen - this.levelR * 2) / 4;
      let hStart = this.stepLineStart + this.levelR + perStep;
      for (let i = 0; i < 9; i++) {
        let y = (i + 1) * this.stepH;
        if (i % 2 == 0) {
          dots[i] = [];
          if (this.stepInfos.length == 9 && i == 8) {
            dots[i] = [
              {
                x: hStart - perStep * 2,
                y: y
              },
              {
                x: hStart - perStep,
                y: y
              }
            ];
          }
          // 横线点
          dots[i] = dots[i].concat([
            {
              x: hStart,
              y: y
            },
            {
              x: hStart + perStep,
              y: y
            },
            {
              x: hStart + perStep * 2,
              y: y
            }
          ]);
        } else {
          // 弧线点
          let offsetY = this.scaleVal(60);
          let offsetX1 = this.scaleVal(95);
          let offsetX2 = this.scaleVal(112);
          let startX = this.stepLineEnd;
          if ((i + 1) % 4 == 0) {
            // left
            startX = this.stepLineStart;
            offsetX1 = offsetX1 * -1;
            offsetX2 = offsetX2 * -1;
          }
          dots[i] = [
            {
              x: startX + offsetX1,
              y: y - offsetY
            },
            {
              x: startX + offsetX2,
              y: y
            },
            {
              x: startX + offsetX1,
              y: y + offsetY
            }
          ];
        }
      }
      return dots;
    },
    buildStepImgs: function(count) {
      let imgs = [];
      let imgR = this.scaleVal(55);
      let leftStart = this.stepLineStart - imgR;
      let endStart = this.stepLineEnd - imgR;
      let stepY = this.stepH;
      for (let i = 0; i < count; i++) {
        if (i == 0 || i == 3 || i == 4 || i == 7 || (count == 10 && i == 8)) {
          // left
          imgs.push({
            x: leftStart,
            y: stepY - imgR
          });
        } else {
          // right
          imgs.push({
            x: endStart,
            y: stepY - imgR
          });
        }
        if (i % 2 != 0) {
          stepY += this.stepH * 2;
        }
      }
      return imgs;
    },
    stepDotActive: function(idx) {
      if (this.stepType === "learn" && this.isFirstUnit) {
        return true;
      }
      let stepCount = this.stepInfos.length;
      if (
        (this.stepBegin && idx < this.unlockingStep) ||
        (stepCount == 9 && idx == stepCount) ||
        this.unlockingStep == stepCount - 1
      ) {
        return true;
      } else {
        return false;
      }
    },
    getStepPosition: function(idx) {
      let item = this.imgs[idx];
      if (item) {
        return `translate(${item.x}, ${item.y})`;
      } else {
        return "translate(0,0)";
      }
    },
    setStepImgInfo: function() {
      if (!this.stepInfos || this.stepInfos.length == 0) {
        return;
      }
      // add step imgs
      this.imgs.forEach((img, idx) => {
        let imgInfo = this.imgPaths[idx];
        let imgUrl = imgInfo.url;
        let stepInfo = this.stepInfos[idx];
        if (this.stepType === "learn" && this.isFirstUnit) {
          // 临时处理---第一单元放开
          imgUrl += ".png";
        } else if (this.stepBegin) {
          if (
            idx > 0 &&
            (stepInfo.playDays == 0 || stepInfo.played == "N") &&
            idx != this.unlockingStep
          ) {
            imgUrl += "-0.png";
          } else {
            imgUrl += ".png";
          }
        } else {
          imgUrl += "-0.png";
        }
        let imgW = this.scaleVal(imgInfo.w);
        let imgH = this.scaleVal(imgInfo.h);
        let imgX = img.x;
        let imgY = img.y;
        if (imgH != this.levelR * 2) {
          imgY -= (imgH - this.levelR * 2) / 2;
        }
        img.imgUrl = imgUrl;
        img.w = imgW;
        img.h = imgH;

        let statusStartX = img.x + this.scaleVal(5);
        let statusStartY = img.y;
        if (this.stepType === "learn") {
          let status = stepInfo.playDays;
          if (
            !this.stepBegin ||
            (status == 0 &&
              idx > 0 &&
              status == 0 &&
              this.stepInfos[idx - 1].playDays == 0)
          ) {
            // lock
            if (!this.isFirstUnit) {
              // 临时处理---不是第一单元才加锁
              let lockedImg = this.statusImgs.locked;
              let lockW = this.scaleVal(lockedImg.w);
              img.isLocked = true;
              img.statusImg = {
                url: lockedImg.url,
                x: (imgW - lockW) / 2,
                y: this.levelR / 2,
                w: lockW,
                h: this.scaleVal(lockedImg.h)
              };
            }
          } else {
            let starUrl = "";
            if (status === 1) {
              starUrl = this.statusImgs.star0.url;
            } else if (status === 2) {
              starUrl = this.statusImgs.star1.url;
            } else if (status === 3) {
              starUrl = this.statusImgs.star2.url;
            } else if (status >= 4) {
              starUrl = this.statusImgs.star3.url;
            }

            let starW = this.scaleVal(this.statusImgs.star0.w);
            let starH = this.scaleVal(this.statusImgs.star0.h);

            img.isLocked = false;
            if (starUrl) {
              img.statusImg = {
                url: starUrl,
                x: (imgW - starW) / 2,
                y: -starH / 2,
                w: starW,
                h: starH
              };
            }
          }
        } else {
          if (stepInfo.played == "N" && idx != this.unlockingStep) {
            // lock
            let lockedImg = this.statusImgs.locked;
            let lockW = this.scaleVal(lockedImg.w);
            img.isLocked = true;
            img.statusImg = {
              url: lockedImg.url,
              x: (imgW - lockW) / 2,
              y: this.levelR / 2,
              w: this.scaleVal(lockedImg.w),
              h: this.scaleVal(lockedImg.h)
            };
          }
        }

        let title = TASK_STEP_TITLE[idx];
        if (this.stepType !== "learn") {
          title = TASK_REVIEW_STEP_TITLE[idx];
        }
        img["title"] = {
          title: title,
          x: this.levelR,
          y: this.levelR * 3
        };
      });
    },
    getStatusImgInfo: function(idx) {
      return (
        this.imgPaths[idx].urlimgH +
        (idx >= this.unlockingStep ? "-0.png" : ".png")
      );
    },
    stepClick: function(item, idx) {
      if (item.isLocked) {
        this.shakeLock(idx);
      } else {
        let stepInfo = this.stepInfos[idx];
        this.$store.commit("setCurrStepPart", this.stepPart);
        setTimeout(() => {
          this.$router.push({
            name: "learning",
            params: { step: idx, taskNo: stepInfo.taskNo }
          });
        }, 200);
      }
    },
    shakeLock: function(idx) {
      this.shakeIdx = idx;
      this.$store.dispatch("showTipsMsg", "请先完成上个关卡！");
      setTimeout(() => {
        this.shakeIdx = -1;
      }, 400);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables";
.nav-steps {
  // height:100%;
  // background:#ff0088;
  //  height: 1500px;
  .step-svg {
    // height: 1100px;
    width: 100%;
  }
  .stepRoad {
    // stroke-width: 40px;
    stroke: $main-color;
    fill: none;
  }
  .step-circle {
    fill: #fff;
  }
  .active {
    .step-circle {
      fill: gold;
    }
  }
  .step-title {
    text-anchor: middle;
    font-size: $small-font-size;
    fill: $main-color;
  }
  .shake {
    animation-name: shakeAnimate;
    animation-duration: 0.1s;
    animation-timing-function: linear;
    animation-iteration-count: 3;
    animation-direction: alternate;
    animation-play-state: running;
  }
  .lock {
    transform: translateX(0);
  }

  @keyframes shakeAnimate {
    0% {
      transform: translateX(-50%);
    }
    50% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(50%);
    }
  }
}
</style>
