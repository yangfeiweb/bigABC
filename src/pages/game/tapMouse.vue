<template>
  <div class="mouse">
    <gameLoading v-if="showProgress" :progress="progress"></gameLoading>
    <audio ref="wordSound" :src="currentWord.voiceUrl" preload="auto"></audio>
    <audio ref="tapRight" :src="sound.tapRight" preload="auto" @ended="playScore" @error="playScore"></audio>
    <audio ref="goMouse" :src="sound.goMouse" preload="auto"></audio>
    <audio ref="readyMouse" :src="sound.readyMouse" preload="auto"></audio>
    <audio ref="answerError" :src="sound.answerError" preload="auto"></audio>
    <audio ref="scoreMouse" :src="sound.scoreMouse" preload="auto"></audio>
  </div>
</template>

<script>
  import * as PIXI from "pixi.js";
  // import sound from "pixi-sound";
  import Howl from "howler";
  import _ from 'lodash'
  import Cloud from "@/game/Cloud";
  import MouseCore from "@/game/mouseCore";
  import utility from "@/utility/utility";
  import { TASK_SCORE_TYPE } from "@/utility/dict";
  // import words from "@/game/testWord"
  import OptBar from "./children/optBar";
  import gameLoading from "@/components/gameLoading";

  import GameOverPopups from "@/game/gameSettlementPopups";

  import GameBack from "@/game/gameBack";

  let tapCount = 0; //打击地鼠的次数
  const TIME_GAME = 120; //游戏计时时长
  const ADD_SOURCE = 10; //加分值
  const SUB_SOURCE = 5; //降分值

  let soundManage = {
    backgroundSound: null, //背景音乐
    tapRight: null, //打击地鼠的声音
    answerError: null, //回答错误的音效
    laugh: null, //敲错地鼠时的笑声
    score: null, //得分是的声音
    go: null,
    ready: null,
    resume: null
  };
  export default {
    props: ["playResult", "isLast"],
    data() {
      return {
        showProgress: true,
        progress: 0,
        firstPlay: true,
        isPause: true, //是否暂停
        allMouse: [], //保存所有地鼠
        currentMouse: [], //保存已经出现的地鼠
        currIndex: 0, //指向当前题目单词的下标
        index: 0, //用于给地鼠上写字的下标
        soundIndex: 0,
        showObj: {},
        clouds: [],
        userScore: 0,
        //用于判断地鼠是否已出现
        wrongWords: new Set(), //用于存放错误的单词
        mouseImg: [
          "static/images/game/mouse/tiankong.png",
          "static/images/game/mouse/beijing.png",
          "static/images/game/mouse/chutuBg.png",
          "static/images/game/mouse/hamsterholeAll.png",
          "static/images/game/mouse/hamsterholeBefore.png",
          "static/images/game/mouse/hamsterhole1.png",
          "static/images/game/mouse/longError1.png",
          "static/images/game/mouse/longError2.png",
          "static/images/game/mouse/longError3.png",
          "static/images/game/mouse/longError4.png",
          "static/images/game/mouse/longRight.png",
          "static/images/game/mouse/long.png",
          "static/images/game/mouse/hammer.png",
          "static/images/game/mouse/yun1.png",
          "static/images/game/mouse/yun2.png",
          "static/images/game/mouse/yun3.png",
          "static/images/game/mouse/yun4.png",
          "static/images/game/mouse/yun5.png",
          "static/images/game/mouse/vertigo1.png",
          "static/images/game/mouse/vertigo2.png",
          "static/images/game/public/go.png",
          "static/images/game/public/ready.png",
          "static/images/game/public/addScore.png",
          "static/images/game/public/subScore.png"
        ],
        sound: {
          //游戏声音
          tapRight: "static/audio/tapMouse.mp3",
          MouseBackSound: "_www/static/audio/gameBackSound.mp3",
          goMouse: "static/audio/go.mp3",
          readyMouse: "static/audio/ready.mp3",
          answerError: "static/audio/arrowError.mp3",
          laughMouse: "static/audio/laugh.mp3",
          scoreMouse: "static/audio/addScore.mp3",
          resumeSound: "static/audio/hi.mp3"
        },
        resumeTimer: null,
        showReturnCfm: false,
        showOverPopups: false,
        isReady: false,
      };
    },
    created() {
      // PIXI.utils.destroyTextureCache()
    },
    computed: {
      unitWords: function () {
        let words = this.$store.getters.currFlowStepWords;
        if (words) {
          let len = words.length;
          if (len < 6) {
            words.forEach((item) => {
              let items = _.cloneDeep(words);
              item.disturb = items
            })
          } else {
            words.forEach(word => {
              let list = utility.sortArrByRandom(words);
              let disturb = list.slice(2, 7);
              let dis = disturb.find(s => s.id === word.id); //查看里面有没有当前的单词 word
              if (dis) {
                disturb = list.slice(2, 8);
              } else {
                disturb.push(word);
              }
              word.disturb = utility.sortArrByRandom(disturb); //干扰项
            });
          }
          return words;
        }
        return [];
      },
      answerList: function () {
        let list = utility.sortArrByRandom(this.unitWords);
        if (list) {
          return list;
        }
        return [];
      },
      currentWord() {
        //保存当前答案的单词
        return this.answerList[this.currIndex] || {};
      },
      currWordSound() {
        let sound = this.$refs.wordSound;
        sound.onpause = ()=>{
          sound.load()
        }
        return sound;
      },
      disturb() {
        //当前单词的干扰项
        return this.currentWord.disturb;
      },
      showReturn() {
        return this.$store.getters.flowType === TASK_SCORE_TYPE.unit;
      }
    },
    watch: {
      playResult(newVal) {
        if (newVal && this.overPopups) {
          this.overPopups.setData(newVal);
        }
      },
      '$store.getters.dialogShowing': function (val) {
        if(this.showOverPopups){
          this.$emit('close')
        }else{
          if (!this.isReady) {
            if (val === false && this.showReturnCfm == true) {
              this.showReturnCfm = false
              this.backBox.hide();
              this.play();
            } else if (val && this.showReturnCfm == false) {
              this.showReturnCfm = true
              this.backBox.show();
              this.pause();
            }
          }else{
            this.$store.commit('setDialogShowing', false);
          }
        }
      },
      '$store.getters.switchBackground': function (val) {
        if (val) {
          this.pause();
        } else {
          this.showOverPopups || this.showReturnCfm || this.play();
        }

      }
    },
    mounted() {
      this.deviceWH = {
        //屏幕的宽高
        width: 1080,
        height: 1920
      };
      this.createSound();
      this.init();
    },
    methods: {
      //创建各种声音对像
      createSound(res) {
        if (window.plus) {
          soundManage.backgroundSound = plus.audio.createPlayer(this.sound.MouseBackSound)
        }
        soundManage.answerError = this.$refs.answerError
        soundManage.answerError.onpause = () => {
          soundManage.answerError.load()
        }
        soundManage.score = this.$refs.scoreMouse;
        soundManage.score.onpause = () => {
          soundManage.score.load()
        }
        soundManage.tapRight = this.$refs.tapRight
        soundManage.tapRight.onpause = () => {
          soundManage.tapRight.load()
        }
        soundManage.go = this.$refs.goMouse
        soundManage.ready = this.$refs.readyMouse;
        soundManage.laugh = new Howl.Howl({
          src: [this.sound.laughMouse],
          volume: 0.3
        })

      },
      init() {
        this.app = new PIXI.Application({
          width: this.deviceWH.width,
          height: this.deviceWH.height,
          antialias: true,
          transparent: false,
          clearBeforeRender: false
          // clearBeforeRender: true
          // forceCanvas: true
        });
        this.app.renderer.autoResize = false;
        this.app.stage.rotation = Math.PI / 2;
        this.app.stage.x = this.deviceWH.width;
        this.app.view.style.width = "100%";
        this.app.view.style.height = "100%";
        this.arWidth = this.deviceWH.width;
        this.arHeight = this.deviceWH.height;

        this.loader = new PIXI.loaders.Loader();

        this.loader.on("progress", ({ progress }) => {
          this.progress = Math.floor(progress);
        });
        this.loader.on("complete", loader => {
          this.$el.appendChild(this.app.view);
          this.showProgress = false;
          // this.createSound(loader.resources)
          this.onComplete(loader, loader.resources);
        });
        this.optBar = new OptBar({
          loader: this.loader,
          duration: 90,
          currStep: 1,
          stepCount: this.answerList.length,
          onPause: this.pause,
          onPlay: this.play,
          onReturn: this.goBackFn,
          onOver: this.end,
          score: this.userScore
        });
        //加载游戏图片
        for (let i = 0; i < this.mouseImg.length; i++) {
          if (!this.loader.resources[this.mouseImg[i]])
            this.loader.add(this.mouseImg[i]);
        }
        for (let val of this.unitWords) {
          //加载英文单词图片  和单词读音
          let imgKey = "word" + val.id
          if (!this.loader.resources[imgKey]) {
            this.loader.add(imgKey, val.imgUrl);
          }
          // let key = "wordSound" + val.id
          // if (!this.loader.resources[key]) {
          //   this.loader.add(key, val.voiceUrl);
          // }
        }

        // for (let key in this.sound) {
        //   if (!this.loader.resources[key]) {
        //     this.loader.add(key, this.sound[key])
        //   }
        // }
        this.loader.load(); //资源加载完毕后的处理函数
        this.$store.commit('setIsGameing', true)
      },
      createBox(x, y, width, height) {
        let Cb = new PIXI.Container();
        Cb.x = x;
        Cb.y = y;
        width && (Cb.width = width);
        height && (Cb.height = height);
        return Cb;
      },
      onComplete(loader, res) {
        //资源加载处理
        this.createSkey(res);
        this.createContext(res);
        this.creatMouse(res);
        this.createBackContainer(res); //自定义游戏结束事件
        this.$on("end", this.end);
        this.createGameOverPopups(res);
        this.gameReady();
      },
      gameReady() {
        if (!this.loader) return;
        let res = this.loader.resources;
        let _self = this;
        if (res && res["static/images/game/public/ready.png"]) {
          this.readySprite = new PIXI.Sprite(
            res["static/images/game/public/ready.png"].texture
          );
          this.readySprite.anchor.set(0.5);
          this.readySprite.x = this.deviceWH.height / 2;
          this.readySprite.y = this.deviceWH.width / 2;
          this.app.stage.addChild(this.readySprite);

          this.readyID = null;
          let scale = 1;
          let readyScale = () => {
            this.readyID = requestAnimationFrame(readyScale);
            scale += 0.02;
            this.readySprite.scale.set(scale);
          };
          readyScale();
          this.isReady = true
          soundManage.ready && soundManage.ready.play();
          setTimeout(() => {
            this.readyNext()
          }, 2000)
        }
      },
      readyNext() {
        if (this.readyID) {
          cancelAnimationFrame(this.readyID);
          this.readyID = null;
        }
        if (!this.readySprite) return;
        this.app.stage.removeChild(this.readySprite);
        this.readySprite = null;
        console.log("--------------ready next")
        this.gameGo();
      },
      gameGo() {
        if (!this.loader) return;
        let res = this.loader.resources;
        let _self = this;
        if (res && res["static/images/game/public/go.png"]) {
          this.goSprite = new PIXI.Sprite(
            res["static/images/game/public/go.png"].texture
          );
          this.goSprite.anchor.set(0.5);
          this.goSprite.x = this.deviceWH.height / 2;
          this.goSprite.y = this.deviceWH.width / 2;
          this.app.stage.addChild(this.goSprite);

          this.goID = null;
          let scale = 1;
          let readyScale = () => {
            this.goID = requestAnimationFrame(readyScale);
            scale += 0.02;
            this.goSprite.scale.set(scale);
          };
          readyScale();
          soundManage.go && soundManage.go.play();
          setTimeout(() => {
            this.goNext()
          }, 800)
        }
      },
      goNext() {
        if (this.goID) {
          cancelAnimationFrame(this.goID);
          this.goID = null;
        }
        if (!this.goSprite) return;
        this.app.stage.removeChild(this.goSprite);
        this.goSprite = null;
        console.log("--------------go next")
        this.begin();
      },
      createGameOverPopups(res) {
        this.overPopups = new GameOverPopups({
          showReturn: this.showReturn,
          examineRank: this.examineCallBack, //查看排行的函数
          nextLevel: this.nextLevel, //下一关的函数
          onceAgain: this.onceAgain, //再来一次的函数
          close: this.close, //关闭游戏和弹窗函数
          isLast: this.isLast
        });
        this.app.stage.addChild(this.overPopups);
        this.overPopups.visible = false;
      },
      close() {
        this.$emit("close");
      },
      onceAgain() {
        this.allMouse.forEach(mouse => {
          mouse.reset();
        });
        this.userScore = 0;
        tapCount = 0;
        this.overPopups.visible = false;
        this.isPause = true; //是否暂停
        this.currentMouse = []; //保存已经出现的地鼠
        this.currIndex = 0; //指向当前题目单词的下标
        this.soundIndex = 0; //指向当前题目单词的下标
        this.index = 0;
        // this.overPopups.reset();
        this.wrongWords = new Set(); //用于存放错误的单词
        this.showObj = {};
        this.firstPlay = false
        this.showOverPopups = false
        this.optBar.reset();
        this.gameReady();
      },
      nextLevel() {
        this.$emit("next");
      },
      examineCallBack() {
        this.$emit("showRanking");
      },
      //创建返回界面
      createBackContainer(res) {
        this.backBox = new GameBack();
        this.backBox.cancelCallback = this.cancelBtn,
          this.backBox.certainCallback = this.certainBtn;
        this.backBox.x = 0;
        this.backBox.y = 0;
        this.app.stage.addChild(this.backBox);
        this.backBox.hide();
      },
      createSkey(res) {
        //添加天空和云彩
        //天空精灵
        let skyBox = this.createBox(0, 0, this.arWidth, this.arHeight);
        let texture = res["static/images/game/mouse/tiankong.png"].texture;
        let skey = new PIXI.extras.TilingSprite(
          texture,
          this.deviceWH.height,
          this.deviceWH.width
        );
        skey.x = 0;
        skey.y = 0;
        skyBox.addChild(skey);
        this.app.stage.addChild(skyBox); //创建云
        let sw = skyBox.width, //天空的宽度
          sh = skyBox.height;
        let cloud,
          cloudCoords = [
            {
              x: 0,
              y: -10
            },
            {
              x: sw * 0.3,
              y: sh * 0.1
            },
            {
              x: sw * 0.5,
              y: 10
            },
            {
              x: sw * 0.8,
              y: sh * 0.1
            },
            {
              x: sw,
              y: 0
            }
          ]; //云的坐标
        for (let i = 0; i < 5; i++) {
          //循环生成五个云
          cloud = new Cloud({
            texture: res[`static/images/game/mouse/yun${i + 1}.png`].texture,
            x: cloudCoords[i].x,
            y: cloudCoords[i].y,
            sw: this.arWidth
          });
          this.clouds.push(cloud);
          skyBox.addChild(cloud);
        }
        cloud = null;
        skyBox = null;
        texture = null;
      },
      /**
          * 创建游戏主体内容 进度条，暂停，返回，地鼠等
          * @methods createContext
          */
      createContext(res) {
        //盛放主体内容的大容器
        this.contextBox = this.createBox(0, 0, this.arWidth, this.arHeight); //添加主题内容
        let texture = res["static/images/game/mouse/beijing.png"].texture;
        let context = new PIXI.Sprite(texture);
        context.position.x = 0;
        context.position.y = 0;
        this.contextBox.addChild(context);
        this.app.stage.addChild(this.contextBox);
        context = null;
        texture = null;

        this.optBar.init(this.app.stage);

        this.addSprite = new PIXI.Sprite(
          res["static/images/game/public/addScore.png"].texture
        );
        this.subSprite = new PIXI.Sprite(
          res["static/images/game/public/subScore.png"].texture
        );
        this.subSprite.x = this.addSprite.x = 1500;
        this.subSprite.y = this.addSprite.y = 40;
        this.app.stage.addChild(this.addSprite);
        this.app.stage.addChild(this.subSprite);
        this.addSprite.visible = this.subSprite.visible = false;
        //图片容器
        let EnglishBox = new PIXI.Container();
        EnglishBox.x = 20;
        EnglishBox.y = 150;
        this.app.stage.addChild(EnglishBox);
        // 出图片的背景
        let cBg = new PIXI.Sprite(
          res["static/images/game/mouse/chutuBg.png"].texture
        );
        cBg.x = 0;
        cBg.y = 0;
        EnglishBox.addChild(cBg);

        this.EnglistImageBox = new PIXI.Container();
        this.EnglistImageBox.x = 0;
        this.EnglistImageBox.y = 0;
        this.EnglistImageBox.width = cBg.width;
        this.EnglistImageBox.height = cBg.height;
        EnglishBox.addChild(this.EnglistImageBox);

        this.app.stage.interactiveChildren = false;
      },
      addEnglishPic() {
        let res = this.loader.resources;
        let word = this.currentWord;
        let timer = setTimeout(() => {
          this.EnglistImageBox.removeChildren();
          let texture = res["word" + word.id].texture
          if (texture) {
            let sprite = new PIXI.Sprite(texture);
            sprite.x = 120;
            sprite.y = 130;
            sprite.width = 150;
            sprite.height = 150;
            this.EnglistImageBox.addChild(sprite);
          }
          clearTimeout(timer);
          timer = null;
          if (this.isPause && this.currWordSound) {
            this.currWordSound.play();
          }
        }, 1000);
      },
      goBackFn() {
        //返回处理函数
        this.pause();
        this.showReturnCfm = true;
        this.$store.commit('setDialogShowing', true);
        this.backBox.show();
        // this.contextBox.interactiveChildren = false;
      }, // 取消退出处理函数
      cancelBtn() {
        this.showReturnCfm = false;
        this.$store.commit('setDialogShowing', false);
        // this.contextBox.interactiveChildren = true;
        this.backBox.hide();
        this.play();
      },
      certainBtn() {
        //确认退出
        this.$router.go(-1);
      },
      //暂停
      pause() {
        this.mouseContainer.interactiveChildren = false;
        this.mousePause();
        this.optBar.pause()
        if (window.plus) {
          soundManage.backgroundSound.stop();
          soundManage.backgroundSound = plus.audio.createPlayer(this.sound.MouseBackSound)
        }
        this.isPause = false;
      },
      //开始
      play(isPlay) {
        this.isPause = true;
        if (window.plus) {
          soundManage.backgroundSound.play(this.player);
        }
        this.mouseContainer.interactiveChildren = true;
        this.mouseStart();
        this.optBar.play()
        if (!isPlay && this.currWordSound) {
          this.currWordSound.play();
        }
      },
      // 创建地鼠
      creatMouse(res) {
        let textures = {
          tapRight: res["static/images/game/mouse/longRight.png"].texture,
          tapError: [],
          normal: res["static/images/game/mouse/long.png"].texture,
          mouseHole: res["static/images/game/mouse/hamsterholeAll.png"].texture,
          mouseHoleBefore:
            res["static/images/game/mouse/hamsterholeBefore.png"].texture,
          mouseHoleColor:
            res["static/images/game/mouse/hamsterhole1.png"].texture,
          hammer: res["static/images/game/mouse/hammer.png"].texture
        };
        /**
          * 容器的左侧右侧距离
          * 老鼠左右，上下间隔
          */
        let mouseDistance = {
          left: this.deviceWH.width * 0.4,
          top: this.deviceWH.height * 0.3,
          width: this.deviceWH.width * 0.4,
          height: this.deviceWH.height * 0.55,
          intervalX: this.deviceWH.width * 0.5 * 0.3,
          intervalY: this.deviceWH.height * 0.55 * 0.15
        },
          mouseCg = {
            //老鼠的宽度和起始位置
            width: (mouseDistance.width - mouseDistance.intervalX * 2) / 3,
            height: null,
            startX: 0,
            startY: 0
          };
        /**
               * 地鼠的容器
               */
        this.mouseContainer = new PIXI.Container();
        this.mouseContainer.x = mouseDistance.left;
        this.mouseContainer.y = mouseDistance.top;

        this.app.stage.addChild(this.mouseContainer);
        for (let i = 1; i < 9; i++) {
          let dev = i < 5 ? i : i - 4;
          textures.tapError.push(
            res[`static/images/game/mouse/longError${dev}.png`].texture
          );
        }
        let vertigoTexture = []; //眩晕纹理
        for (let i = 0; i < 10; i++) {
          if (i % 2 === 0) {
            vertigoTexture.push(
              res["static/images/game/mouse/vertigo1.png"].texture
            );
          } else {
            vertigoTexture.push(
              res["static/images/game/mouse/vertigo2.png"].texture
            );
          }
        }
        // 循环生成地鼠鼠洞
        let y = 0;
        let x = 0;
        for (let i = 1; i < 10; i++) {
          let mouse = new MouseCore(
            textures,
            vertigoTexture,
            this.MouseDownAfter
          );
          mouse.x =
            mouseCg.startX +
            mouseDistance.width / 2 * x +
            mouseDistance.intervalX * x;
          mouse.y =
            mouseCg.startY + mouseDistance.intervalY * y + mouseCg.height * y;
          x++;
          if (i % 3 === 0) {
            //是不是换行 共三行
            x = 0;
            y++;
            mouseCg.startX = 0;
          }
          this.allMouse.push(mouse);
          this.mouseContainer.addChild(mouse);
          // mouse.interactive = true;
          mouse.addListener("tap", this.mouseHandleTap);
          this.mouseHoleWidth = mouse.width;
          this.mouseHoleHeight = mouse.height;
        }
        /**
         * 生成锤子精灵
         */
        this.hammer = new PIXI.Sprite(textures.hammer); //锤子的宽高比
        this.hammer.anchor.set(1);
        this.hammer.rotation = 30 * Math.PI / 340;
        let hThan = this.hammer.width / this.hammer.height;
        this.hammer.visible = false;
        this.mouseContainer.addChild(this.hammer); //加减分的容器
        this.sourceBox = new PIXI.Container();
        this.sourceBox.x = 0;
        this.sourceBox.y = 0;
        this.sourceBox.visible = false;
        this.mouseContainer.addChild(this.sourceBox);
      },
      mouseHandleTap(e) {
        let target = e.target;
        let x = target.x;
        let y = target.y;
        target.interactive = false;
        target.clearTime();
        this.hammer.x = x + this.mouseHoleWidth;
        this.hammer.y = y + -this.mouseHoleHeight;
        this.sourceBox.x = x + this.mouseHoleWidth / 1.5;
        this.sourceBox.y = y - this.mouseHoleHeight * 1.5;
        if (!target.interactive) {
          this.hammerAnimation(target, this.hanmerAnimationAfter);
        }
      },
      //锤子打击地鼠的动画
      hammerAnimation(target, callback) {
        this.hammer.visible = true;
        let rotationDev = 20;
        let _self = this;
        let i = -30; //角度
        let aId = requestAnimationFrame(animation);
        function animation() {
          aId = requestAnimationFrame(animation);
          if (rotationDev <= i) {
            cancelAnimationFrame(aId);
            callback(_self, target);
          }
          _self.hammer.rotation = -i * Math.PI / 180;
          i += 10;
        }
      },
      /**
       * 锤子动画后的处理函数
       * @arguments _self vue实例对像，target当前点击的地鼠对像
       */
      hanmerAnimationAfter(_self, target) {
        let timer = setTimeout(function () {
          clearTimeout(timer);
          timer = null;
          _self.hammer.visible = false;
          _self.mouseHandleAfter(target);
        }, 150);
      },
      /* 地鼠打击后判断对错的处理函数
       * @argument target 当前点击的地鼠对像 
       * 
       */

      mouseHandleAfter(target) {
        if (target.id !== this.currentWord.id) {
          tapCount++;
          target.tapMouseError();
          if (this.currWordSound && this.currWordSound.paused) {
            this.currWordSound.play();
          }
          soundManage.answerError.play();
          soundManage.laugh.play();
          setTimeout(() => {
            target.stopTapError();
          }, 1500);
          if (this.userScore !== 0) {
            this.userScore -= SUB_SOURCE;
            this.scourceAnimation(this.subSprite);
          }
          if (tapCount === 1) {
            let word = this.currentWord;
            word && this.wrongWords.add(word.id);
            if (this.currWordSound && this.currWordSound.paused) {
              this.currWordSound.play();
            }
          } else {
            this.currWordSound.pause()
            this.currIndex++;
            this.optBar.updateCurrStep(this.currIndex);
            this.next();
          }
        } else {
          this.userScore += ADD_SOURCE;
          soundManage.tapRight.play();
          target.change(target.tapRight);
          target.autoDown(1000);
          this.currIndex++;
          this.optBar.updateCurrStep(this.currIndex);
          this.next();
        }
      },
      playScore() {
        soundManage.score.play();
        this.scourceAnimation(this.addSprite);
      },
      next() {
        tapCount = 0;
        if (this.currIndex < this.unitWords.length) {
          this.addEnglishPic();
        } else {
          this.$emit("end");
        }
      },
      scourceAnimation(target) {
        this.optBar.updateScore(this.userScore);
        target.x = 1500;
        target.y = 40;
        target.alpha = 1;
        target.visible = true;
        let id = null;
        let animation = () => {
          if (target.alpha >= 0) {
            id = requestAnimationFrame(animation);
            target.x -= 0.5;
            target.y -= 0.5;
            target.alpha -= 0.02;
          } else {
            cancelAnimationFrame(id);
            target.visible = false;
          }
        };
        animation();
      },
      appearsMouse() {
        //产生新的地鼠
        let len = this.currentMouse.length;
        if (len < 4) {
          // let num = Math.floor(Math.random() * 3 + 1);
          for (let i = 1; i <= 4 && len < 4; i++) {
            this.mouseContr();
            len = this.currentMouse.length;
          }
        }
      }, //控制地鼠出现
      mouseContr() {
        if (this.index >= this.disturb.length) {
          this.index = 0;
        }
        if (this.isPause) {
          let word = this.disturb[this.index++];
          let first = this.randUpMouse();
          this.allMouse[first].setText(word.word, word.id);
          this.allMouse[first].number = first;
          this.allMouse[first].interactive = false;
          this.allMouse[first].up();
          this.currentMouse.push(this.allMouse[first]);
        }
      }, //随机出现地鼠
      randUpMouse() {
        let index = null;
        do {
          index = Math.floor(Math.random() * 9);
          if (!this.showObj[index]) {
            break;
          }
        } while (true);
        this.showObj[index] = true;
        return index;
      }, //地鼠落下之后再出现新的地鼠
      MouseDownAfter(data) {
        this.removeMouse(data.tarMouse);
        this.showObj[data.num] = false;
        this.appearsMouse();
      }, //从currentMouse数组中移除已经下落后的地鼠
      removeMouse(curr) {
        let len = this.currentMouse.length;
        for (let i = 0; i < len; i++) {
          if (curr == this.currentMouse[i]) {
            this.currentMouse.splice(i, 1);
            break;
          }
        }
      }, //游戏暂停后对地鼠的处理
      mousePause() {
        this.currentMouse.forEach(mouse => {
          mouse.interactive = false
          mouse.gamePause();
        });
      },
      //游戏开始对地鼠的处理
      mouseStart() {
        this.currentMouse.forEach(mouse => {
          if (mouse.isMiddle) {
            //中立阶段
            mouse.interactive = true
            mouse.autoDown(1000);
          } else {
            if (mouse.isDown) {
              //正处于下降阶段
              mouse.isDown = false;
              mouse.down();
            } else {
              //上升阶段
              mouse.isUp = false;
              mouse.up();
            }
          }
        });
      },
      /**
       * 游戏结束的处理函数
       */
      end(e) {
        if (window.plus) {
          soundManage.backgroundSound.stop()
          soundManage.backgroundSound = plus.audio.createPlayer(this.sound.MouseBackSound)
        }
        this.pause();
        this.mousePause();
        this.wordSound = null;
        this.currIndex = 0;
        this.contextBox.interactiveChildren = false;
        this.overPopups.visible = true;
        this.showOverPopups = true
        let wrongWords = Array.from(this.wrongWords);
        this.$emit("postResult", wrongWords, this.userScore, true);
      },
      player() {
        soundManage.backgroundSound = plus.audio.createPlayer(this.sound.MouseBackSound);
        this.isPause && soundManage.backgroundSound.play(this.player)
      },
      begin() {
        this.play(true);
        this.app.stage.interactiveChildren = true;
        this.clouds.forEach(cloud => {
          cloud && cloud.play();
        });
        this.currentMouse = []; //保存已经出现的地鼠
        this.showObj = {}; //用于判断地鼠是否已出现
        this.currIndex = 0;
        if (!this.allMouse) {//所有的地鼠
          this.allMouse = this.mouseContainer.children.slice(0, -1);
        }
        this.allMouse.forEach(mouse => {
          mouse.interactive = false;
        })
        this.isReady = false
        this.appearsMouse();
        this.appearsMouse();
        this.next();
      }
    },
    beforeDestroy() {
      //销毁所有资源
      this.$store.commit("setLearningBack", true);
      this.$store.commit('setIsGameing', false)
      this.userScore = 0;
      this.currIndex = 0;
      if (window.plus) {
        soundManage.backgroundSound.stop();
      }
      // if (this.resumeTimer) {
      //   clearInterval(this.resumeTimer)
      //   this.resumeTimer = null;
      // }
      soundManage.laugh.unload()
      soundManage = {};
      this.clouds.forEach(cloud => {
        cloud && cloud.destroy();
      });
      this.allMouse.forEach(mouse => {
        mouse.gamePause();
        mouse.removeAllListeners("tap");
        mouse.destroy();
      });
      this.loader && this.loader.destroy();
      this.optBar.destroy();
      this.backBox.destroy();
      this.overPopups.destroy();
      this.app.destroy(true);
      this.app = null;
    },
    components: {
      gameLoading
    }
  };
</script>
<style scoped>
  .mouse {
  	height: 100vh;
  	width: 100vw;
  }
</style>
