<template>
  <div class="dragon-effects">
    <transition name="canvas-fade" @after-enter="afterEnter" @leave="leaving">
      <div class="canves-box" v-show="showBox" ref="box">

      </div>
    </transition>
    <audio :src="cryAudioPath" preload="auto" ref="cry"></audio>
    <audio :src="victoryAudioPath" preload="auto" ref="victory"></audio>
  </div>
</template>

<script>
  import * as PIXI from "pixi.js";
  export default {
    data() {
      return {
        cryPath: 'static/images/game/cry/',
        victoryPath: 'static/images/game/victory/',
        imgType: '.png',
        showBox: false,
        cryAudioPath: 'static/audio/dragonCry.mp3',
        victoryAudioPath: 'static/audio/dragonLaugh.mp3',
        ticker: null,
        app: null,
        loader: null,
        crySound: null,
        victorySound: null,
        crySprite: null,
        victorySprite: null,
      }
    },
    created() {
      // PIXI.utils.destroyTextureCache()
    },
    mounted() {
      console.log("---------pixi", PIXI);
      this.createSound()
      this.createApp()
      this.loadResource()
    },
    methods: {
      afterEnter() {
        console.log("-----------afterEnter")
      },
      leaving() {
        console.log("-----------leaving")
      },
      createSound() {
        this.crySound = this.$refs.cry;
        this.crySound.loop = true;
        this.crySound.playbackRate = 0.5
        this.crySound.load()
        this.crySound.onpause = () => {
          console.log("--------pause load")
          this.crySound.load()
        }
        this.victorySound = this.$refs.victory;
        this.victorySound.onpause = () => {
          this.victorySound.load()
        }
      },
      createApp() {
        let app = new PIXI.Application({
          width: 272,
          height: 314,
          antialias: true,
          transparent: true,
          clearBeforeRender: true
        })
        app.backgroundColor = 0x222fff;
        app.view.style.width = "100%";
        app.view.style.height = "100%";
        this.app = app;
      },
      loadResource() {
        let loader = new PIXI.loaders.Loader();
        this.loader = loader;

        loader.on('complete', ({ resources }) => {
          this.$refs.box && this.$refs.box.appendChild(this.app.view);
          console.log("-------------加载成功")
          this.createStage();
        })
        for (let i = 1; i <= 30; i++) {
          let name = "s" + i;
          if (!loader.resources[name]) {
            let path = this.victoryPath + name + this.imgType;
            loader.add(name, path)
          }
        }
        for (let i = 1; i <= 20; i++) {
          let name = 'k' + i;
          if (!loader.resources[name]) {
            let path = this.cryPath + name + this.imgType;
            loader.add(name, path)
          }
        }
        loader.load();
      },
      createStage() {
        // let width = this.app.screen.width;
        // let height = this.app.screen.height;
        let res = this.loader.resources;
        let cryTextures = [];
        for (let i = 1; i <= 20; i++) {
          cryTextures.push(res['k' + i].texture)
        }
        cryTextures.push(res['k1'].texture)
        let victoryTextures = [];
        for (let i = 1; i <= 30; i++) {
          victoryTextures.push(res['s' + i].texture)
        }
        victoryTextures.push(res['s1'].texture)
        //哭
        this.crySprite = new PIXI.extras.AnimatedSprite(cryTextures);
        // this.crySprite.anchor.set(0.5);
        this.crySprite.x = 0
        this.crySprite.y = 0
        this.crySprite.loop = false;
        this.crySprite.animationSpeed = 0.2;
        this.app.stage.addChild(this.crySprite)
        this.crySprite.visible = false
        // this.crySprite.onComplete = () => {
        //   this.crySound.pause()
        //   setTimeout(() => {
        //     this.crySprite.visible = false;
        //     // this.crySprite.scale.set();
        //     this.showBox = false;
        //   }, 500)
        // }
        // this.crySprite.onFrameChange = (frame) => {
        //   if (frame > 3) {
        //     this.crySound.paused && this.crySound.play()
        //   }
        // }
        //胜利
        this.victorySprite = new PIXI.extras.AnimatedSprite(victoryTextures);
        // this.victorySprite.anchor.set(0.5);
        this.victorySprite.x = 0
        this.victorySprite.y = 0;
        this.victorySprite.loop = false;
        this.victorySprite.animationSpeed = 0.25;
        this.victorySprite.visible = false
        this.app.stage.addChild(this.victorySprite)
        // this.victorySprite.onComplete = () => {
        //   setTimeout(() => {
        //     this.victorySprite.visible = false;
        //     // this.victorySprite.y = 0;
        //     this.showBox = false;
        //   }, 500);
        // }
        // let end = height / 3;
        // this.ticker = new PIXI.ticker.Ticker();
        // this.ticker.speed = 20;
        // this.ticker.add((deltaTime) => {
        //   this.victorySprite.y += deltaTime
        //   if (this.victorySprite.y >= end) {
        //     this.ticker.stop()
        //     this.victorySprite.y = end
        //     this.victorySprite.gotoAndPlay(0)
        //     this.victorySound.play()
        //   }
        // })
      },
      easeOut: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
      },
      playVictory(callback) {
        this.showBox = true;
        this.victorySprite.visible = true
        this.victorySprite.gotoAndPlay(0)
        this.victorySound.play()
        this.victorySprite.onComplete = () => {
          setTimeout(() => {
            this.victorySprite.visible = false;
            this.showBox = false;
            callback()
          }, 500);
        }
      },
      victoryAnimation() {
        this.ticker && this.ticker.start()
      },
      playCry(callback) {
        this.showBox = true;
        this.crySprite.visible = true;
        this.crySprite.gotoAndPlay(0);
        this.crySound.play()
        this.crySprite.onComplete = () => {
          this.crySound.pause()
          setTimeout(() => {
            this.crySprite.visible = false;
            this.showBox = false;
            callback()
          }, 500)
        }
      },
      cryAnimation() {
        let scale = 0;
        let timer = null;
        let begin = () => {
          if (scale >= 1) {
            cancelAnimationFrame(timer)
            this.crySprite.gotoAndPlay(0);
            this.crySound.play()
          } else {
            timer = requestAnimationFrame(begin)
            scale += 0.05;
            this.crySprite.scale.set(scale)
          }
        }
        begin()
      }
    },
    beforeDestroy() {
      console.log("-----------------beforeDestroy")
      this.loader && this.loader.destroy()
      this.app.destroy(true)
    }
  }
</script>
<style lang="scss" scoped>
  .dragon-effects {
  	margin: 0;
  	padding: 0;
  	.canves-box {
  		position: fixed;
  		top: 50%;
  		left: 50%;
  		transform: translate(-50%, -50%);
  		width: 272px;
  		height: 314px;
  		// z-index: 9000;
  	}
  	.canvas-fade-enter-active {
  		transition-duration: 1s;
  		transform: translate(-50%, -50%);
  		transition-property: transform;
  	}
  	.canvas-fade-leave-active {
  		transition-duration: 1s;
  		transform: translate(-50%, -2000px);
  		transition-property: transform;
  	}
  	.canvas-fade-enter {
  		transform: translate(-50%, -2000px);
  	}
  	.canvas-fade-enter-to {
  		transform: translate(-50%, -50%);
  	}
  }
</style>
