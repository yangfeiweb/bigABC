<template>
  <div class='nav-steps'>
  </div>
</template>
<script>
import * as PIXI from "pixi.js";
import { Sprite } from "@/utility/game";
import { TASK_STEP_TITLE } from "@/utility/dict";
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
    },
    loader: {
      type: Object
    }
  },
  data() {
    return {
      screenScale: 1,
      screenW: 750,
      screenH: 1100,
      stepH: 105,
      stepLineW: 45,
      stepLineStart: 200,
      stepLineEnd: 540,
      dotCircleR: 10,
      levelR: 55,
      // stepImgW: 110,
      dots: [],
      imgs: [],
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
        goldStar: {
          url: "static/images/icon-star-gold.png",
          w: 31,
          h: 33
        },
        grayStar: {
          url: "static/images/icon-star-gray.png",
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
      stepCount: 9,
      // currStep: 0, // 只记录当前布与下一步
      navApp: null,
      // loader: null,
      graphics: null,
      lockSprites: {}
    };
  },
  mounted: function() {
    // 获取当前适配比例
    let width = this.$el.clientWidth;
    let height = this.$el.clientHeight;
    // this.screenScale = 0.5;
    this.screenScale = 2;
    // this.screenScale = width / 750;
    // alert(this.screenScale)
    this.screenW = this.scaleVal(this.screenW);
    this.screenH = this.scaleVal(this.screenH);
    this.dotCircleR = this.scaleVal(this.dotCircleR);
    this.stepLineW = this.scaleVal(this.stepLineW);
    this.levelR = this.scaleVal(this.levelR);
    this.stepLineStart = this.scaleVal(this.stepLineStart);
    this.stepLineEnd = this.scaleVal(this.stepLineEnd);
    this.stepH = this.scaleVal(this.stepH);
    this.init();
    if (this.stepInfos) {
      if (this.stepInfos.length == 10) {
        this.stepCount = 10;
      }
      this.dots = this.buildStepDots();
      this.imgs = this.buildStepImgs(this.stepCount);
      this.addGraphicsElement(this.graphics);
      this.addImgElement();
    }
  },
  computed: {
    unlockingStep: function() {
      let step = 0;
      if (this.stepType === "learn") {
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
        if (step == 0 && this.stepInfos[0].playDays != 0) {
          step = this.stepCount - 1;
        }
      } else {
        for (let i = 0; i < this.stepInfos.length; i++) {
          if (this.stepInfos[i].played == "N") {
            step = i;
            break;
          }
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
      if (this.stepInfos.length == 10) {
        this.stepCount = 10;
      }
      this.dots = this.buildStepDots();
      this.imgs = this.buildStepImgs(this.stepCount);
      if (this.navApp) {
        this.navApp.destroy(true);
      }
      this.init();
      this.addGraphicsElement(this.graphics);
      this.addImgElement();
    }
  },
  methods: {
    init: function() {
      this.navApp = new PIXI.Application(this.screenW, this.screenH, {
        antialias: true,
        transparent: true,
        clearBeforeRender: true,
        forceCanvas: true
      });
      if (!this.loader) {
        this.loader = new PIXI.loaders.Loader();
        this.loader.on("complete", () => {
          this.addImgElement();
        });
        this.loaderImgResource();
      }
      this.navApp.view.style.width = "100%";
      this.navApp.view.style.height = "100%";
      this.$el.appendChild(this.navApp.view);
      this.graphics = new PIXI.Graphics();
      this.navApp.stage.addChild(this.graphics);
    },
    loaderImgResource: function() {
      this.imgPaths.forEach((img, idx) => {
        if (!this.loader.resources[img.url + ".png"]) {
          this.loader.add(img.url + ".png");
        }
        if (!this.loader.resources[img.url + "-0.png"]) {
          this.loader.add(img.url + "-0.png");
        }
      });

      for (let key in this.statusImgs) {
        if (!this.loader.resources[this.statusImgs[key].url]) {
          console.log("-----load", this.statusImgs[key].url);
          this.loader.add(this.statusImgs[key].url);
        }
      }
      this.loader.load();
    },
    addGraphicsElement: function(graphics) {
      if (graphics) {
        graphics.clear();
        graphics.lineStyle(this.stepLineW, 0xff5f5f, 1);

        // draw a shape
        graphics.moveTo(this.stepLineStart, this.stepH);
        graphics.lineTo(this.stepLineEnd, this.stepH);

        let cornor1 = this.getCornerPoints(this.stepLineEnd, 1);
        graphics.bezierCurveTo(
          cornor1.x1,
          cornor1.y1,
          cornor1.x2,
          cornor1.y2,
          cornor1.endX,
          cornor1.endY
        );
        graphics.lineTo(this.stepLineStart, cornor1.endY);

        let cornor2 = this.getCornerPoints(this.stepLineStart, 3, true);
        graphics.bezierCurveTo(
          cornor2.x1,
          cornor2.y1,
          cornor2.x2,
          cornor2.y2,
          cornor2.endX,
          cornor2.endY
        );
        graphics.lineTo(this.stepLineEnd, cornor2.endY);

        let cornor3 = this.getCornerPoints(this.stepLineEnd, 5);
        graphics.bezierCurveTo(
          cornor3.x1,
          cornor3.y1,
          cornor3.x2,
          cornor3.y2,
          cornor3.endX,
          cornor3.endY
        );
        graphics.lineTo(this.stepLineStart, cornor3.endY);

        let cornor4 = this.getCornerPoints(this.stepLineStart, 7, true);
        graphics.bezierCurveTo(
          cornor4.x1,
          cornor4.y1,
          cornor4.x2,
          cornor4.y2,
          cornor4.endX,
          cornor4.endY
        );
        graphics.lineTo(this.stepLineEnd, cornor4.endY);

        this.dotGraphics = [];
        graphics.lineStyle(0);
        this.dots.forEach((group, idx) => {
          if (
            (this.stepBegin && idx < this.unlockingStep) ||
            (this.stepCount == 9 &&
              idx == this.unlockingStep &&
              this.unlockingStep == this.stepCount - 1)
          ) {
            graphics.beginFill(0xffd700, 1);
          } else {
            graphics.beginFill(0xffffff, 1);
          }
          let groupGraphics = [];
          group.forEach(dot => {
            groupGraphics.push(
              graphics.drawCircle(dot.x, dot.y, this.dotCircleR)
            );
          });
          this.dotGraphics.push(groupGraphics);
          graphics.endFill();
        });
      }
    },
    addImgElement: function() {
      if (!this.stepInfos || this.stepInfos.length == 0) {
        return;
      }
      let resources = this.loader.resources;
      this.lockSprites = {};
      // add step imgs
      this.imgs.forEach((img, idx) => {
        let imgInfo = this.imgPaths[idx];
        let imgUrl = imgInfo.url;
        let stepInfo = this.stepInfos[idx];
        if (this.stepBegin) {
          if (
            idx > 0 &&
            (stepInfo.playDays == 0 || stepInfo.played == "N") &&
            idx != this.unlockingStep
          ) {
            if (this.isFirstUnit && this.stepType === "learn") {
              imgUrl += ".png";
            } else {
              // 临时处理---不是第一单元才置灰
              imgUrl += "-0.png";
            }
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
        let texture = resources[imgUrl].texture;
        let stepImg = new Sprite({
          texture: resources[imgUrl].texture,
          x: imgX,
          y: imgY,
          width: imgW,
          height: imgH
        });
        stepImg.interactive = true;
        stepImg.idx = idx;
        stepImg.on("tap", this.stepClick);
        this.navApp.stage.addChild(stepImg);
        let statusStartX = img.x + this.scaleVal(5);
        let statusStartY = img.y;
        // let statusStartY = img.y + this.stepH + this.levelR / 2;
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
              let locked = new Sprite({
                texture: resources[lockedImg.url].texture,
                x: statusStartX + this.levelR / 2,
                y: statusStartY + this.levelR / 2,
                width: this.scaleVal(lockedImg.w),
                height: this.scaleVal(lockedImg.h)
              });
              this.navApp.stage.addChild(locked);
              this.lockSprites[idx] = locked;
            }
          } else {
            this.addStepStarSprite(statusStartX, statusStartY, status);
          }
          //  else if (status == 1) {
          //   // 三颗灰星
          //   // this.buildStarSprite(statusStartX, statusStartY);
          // } else if (status == 2) {
          //   // 一颗金星
          //   this.buildStarSprite(statusStartX, statusStartY, 1);
          // } else if (status == 3) {
          //   // 两颗金星
          //   this.buildStarSprite(statusStartX, statusStartY, 1, 1);
          // } else if (status >= 4) {
          //   // 三颗金星
          //   this.buildStarSprite(statusStartX, statusStartY, 1, 1, 1);
          // }
        } else {
          if (stepInfo.played == "N" && idx != this.unlockingStep) {
            // lock
            let lockedImg = this.statusImgs.locked;
            let locked = new Sprite({
              texture: resources[lockedImg.url].texture,
              x: statusStartX + this.levelR / 2,
              y: statusStartY + this.levelR / 2,
              width: this.scaleVal(lockedImg.w),
              height: this.scaleVal(lockedImg.h)
            });
            this.navApp.stage.addChild(locked);
            this.lockSprites[idx] = locked;
          }
        }
        let title = TASK_STEP_TITLE[idx];
        this.addStepTitle(
          title,
          img.x + this.levelR,
          statusStartY + this.levelR * 2.5
        );
      });
    },
    addStepStarSprite: function(x, y, status) {
      let resources = this.loader.resources;
      let starUrl = '';
      if (status === 1) {
        starUrl = this.statusImgs.star0.url;
      } else if (status === 2) {
        starUrl = this.statusImgs.star1.url;
      } else if (status === 3) {
        starUrl = this.statusImgs.star2.url;
      } else if (status === 4) {
        starUrl = this.statusImgs.star3.url;
      }

      let starW = this.scaleVal(this.statusImgs.star0.w);
      let starH = this.scaleVal(this.statusImgs.star0.h);
  
      if(starUrl){
        let starSprite = new Sprite({
          texture: resources[starUrl].texture,
        x: x,
        y: y - starH / 2,
        width: starW,
        height: starH
      });
      this.navApp.stage.addChild(starSprite);
      }
    },
    addStepTitle: function(text, x, y) {
      let style = new PIXI.TextStyle({
        fontFamily: "cnfont",
        fontSize: 60,
        // fontWeight: "bold",
        fill: ["#ff5f5f"]
        // stroke: "#658019",
        // strokeThickness: 2
      });
      let stepText = new PIXI.Text(text, style);
      // stepText.anchor.y = 0.5;
      stepText.anchor.x = 0.5;
      stepText.x = x;
      stepText.y = y;
      this.navApp.stage.addChild(stepText);
    },
    buildStarSprite: function(x, y, star1, star2, star3) {
      let resources = this.loader.resources;
      let grayStarImg = this.statusImgs.grayStar;
      let goldStarImg = this.statusImgs.goldStar;
      let startOffsetX = this.scaleVal(20);
      let starW = this.scaleVal(grayStarImg.w);
      let starH = this.scaleVal(grayStarImg.h);
      let star1Url = grayStarImg.url;
      let star2Url = grayStarImg.url;
      let star3Url = grayStarImg.url;
      if (star1) {
        star1Url = goldStarImg.url;
      }
      if (star2) {
        star2Url = goldStarImg.url;
      }
      if (star3) {
        star3Url = goldStarImg.url;
      }
      let starLeft = new Sprite({
        texture: resources[star1Url].texture,
        x: x - startOffsetX,
        y: y,
        width: starW,
        height: starH
      });
      let starCenter = new Sprite({
        texture: resources[star2Url].texture,
        x: x + this.levelR / 2,
        y: y,
        width: starW,
        height: starH
      });
      let starRight = new Sprite({
        texture: resources[star3Url].texture,
        x: x + this.levelR + startOffsetX,
        y: y,
        width: starW,
        height: starH
      });
      this.navApp.stage.addChild(starLeft);
      this.navApp.stage.addChild(starCenter);
      this.navApp.stage.addChild(starRight);
    },
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
    getCornerPoints: function(x, unit, isLeft) {
      let startY = unit * this.stepH;
      let endY = (unit + 2) * this.stepH;
      let scale = this.scaleVal;
      let arcW = scale(150);
      let arcY = scale(10);
      if (isLeft) {
        return {
          x1: x - arcW,
          y1: startY + arcY,
          x2: x - arcW,
          y2: endY - arcY,
          endX: x,
          endY: endY
        };
      } else {
        return {
          x1: x + arcW,
          y1: startY + arcY,
          x2: x + arcW,
          y2: endY - arcY,
          endX: x,
          endY: endY
        };
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
          if (this.stepCount == 9 && i == 8) {
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
    stepClick: function(e) {
      let idx = e.target.idx;
      let stepInfo = this.stepInfos[idx];
      let playDays = stepInfo.playDays;
      let played = stepInfo.played;
      let lockedSprite = this.lockSprites[idx];
      if (
        !this.stepBegin ||
        (idx != 0 && lockedSprite && (playDays == 0 || played === "N"))
      ) {
        if (this.isFirstUnit && this.stepType === "learn") {
          // 临时处理---第一单元可点击
          this.$store.commit("setCurrStepPart", this.stepPart);
          setTimeout(() => {
            this.$router.push({
              name: "learning",
              params: { step: idx, taskNo: stepInfo.taskNo }
            });
          }, 200);
        } else {
          // 临时处理---不是第一单元不可点击
          this.shakeLock(lockedSprite);
        }
      } else {
        // this.$nextTick(() => {
        this.$store.commit("setCurrStepPart", this.stepPart);
        setTimeout(() => {
          this.$router.push({
            name: "learning",
            params: { step: idx, taskNo: stepInfo.taskNo }
          });
        }, 200);
        // });
      }
    },
    shakeLock: function(sprite) {
      if (sprite.shaking) {
        return;
      }
      const ticker = new PIXI.ticker.Ticker();
      let offset = 0;
      let dx = 5;
      let times = 0;
      let origanlX = sprite.x;
      ticker.add(deltaTime => {
        offset += dx * deltaTime;
        sprite.x += dx * deltaTime;
        if (offset >= 15 || offset <= -15) {
          dx *= -1;
          times += 1;
        }
        if (times == 5) {
          sprite.x = origanlX;
          sprite.shaking = false;
          ticker.stop();
        }
      });
      sprite.shaking = true;
      ticker.start();
    }
  },
  beforeDestroy() {
    this.navApp && this.navApp.destroy(true);
  }
};
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables";
.nav-steps {
  // width:100%;
  // height:100%;
  background: rgba(0, 0, 0, 0);
  .stepRoad {
    stroke-width: 40px;
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
  .stepImg {
    width: 110px;
    height: 110px;
  }
}
</style>
