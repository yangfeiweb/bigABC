<template>
  <div id="arrowGame">
    <gameLoading v-if='showLoading' :progress='progress'></gameLoading>
    <!-- <audio ref="bgSound" :src='sounds.bgSound' preload="load"></audio> -->
    <audio ref="wordsSound" :src="currWord.voiceUrl" preload="auto"></audio>
    <audio ref="readySound" :src='sounds.readySound' preload="load"></audio>
    <audio ref="goSound" :src='sounds.goSound' preload="load"></audio>
    <audio ref="rightSound" :src="sounds.rightSound" preload="auto"></audio>
    <audio ref="errorSound" :src="sounds.errorSound" preload="auto"></audio>
    <audio ref="shootSound" :src="sounds.shootSound" preload="auto"></audio>
  </div>
</template>

<script >
  import * as PIXI from "pixi.js";
  import _ from "lodash";
  import utility from "@/utility/utility";
  import { Sprite } from "@/utility/game";
  import Container from "@/game/Container";
  import gameLoading from "@/components/gameLoading";
  import GameOverPopups from "@/game/gameSettlementPopups";
  import GameBackCfm from "@/game/gameBack";
  import OptBar from "./children/optBar";
  import Cloud from "@/game/Cloud";
  import Howl from "howler";
  import { TASK_SCORE_TYPE } from "@/utility/dict";
  let overPage = null; //游戏结束页面
  export default {
    props: ["playResult","isLast"],
    data() {
      return {
        progress: 0,
        showLoading: true,
        errorTimes: 0,
        wrongWords: [],
        imgRoot: "static/images/game/arrow/",
        imgPublicRoot: "static/images/game/public/",
        imgType: ".png",
        publicImgs: [
          "answerRight",
          "answerError",
          "addScore",
          "subScore",
          "ready",
          "go"
        ],
        spriteImgs: [
          "biscuit",
          "circle",
          "bar",
          "sky",
          "bgmiddle",
          "cloud1",
          "cloud2",
          "shoot",
          "shootOver",
          "shootWait",
          "bgfront"
        ],
        sounds: {
          bgSound: "_www/static/audio/arrowBg.mp3",
          shootSound: "static/audio/shoot.mp3",
          errorSound: "static/audio/arrowError.mp3",
          rightSound: "static/audio/addScore.mp3",
          readySound: "static/audio/ready.mp3",
          goSound: "static/audio/go.mp3",
        },
        arrowImgsL: [
          //射箭左侧动画图片
          "left/l1",
          "left/l2",
          "left/l3",
          "left/l4",
          "left/l5",
          "left/l6",
          "left/l7",
          "left/l8",
          "left/l9",
          "left/l10"
        ],
        arrowImgsC: [
          //射箭中间动画图片
          "center/c1",
          "center/c2",
          "center/c3",
          "center/c4",
          "center/c5",
          "center/c6",
          "center/c7",
          "center/c8",
          "center/c9"
        ],
        arrowImgsR: [
          //射箭右侧动画图片
          "right/r1",
          "right/r2",
          "right/r3",
          "right/r4",
          "right/r5",
          "right/r6",
          "right/r7",
          "right/r8"
        ],
        cloudAnimates: [],
        loader: null,
        optBar: null,
        app: null,
        playArrow: "left",
        leftTarget: null,
        centerTarget: null,
        rightTarget: null,
        currWordIdx: 0,
        playing: false,
        eventLocking: false,
        bgSound: null,
        readySound: null,
        goSound: null,
        shootSound: null,
        rightSound: null,
        errorSound: null,
        wordSound: null,
        score: 0,
        wordNumber:0,//本单元单词数

        returnCfm: null,
        scoreDialog: null,
        ready: null,
        go: null,
        readyMove: null,
        goMove: null,
        deviceConfig: {
          width: 1080,
          height: 1920
        },
        showReturnCfm: false,
        wordsSound: null,
        showScoreDialog: false,
        isReady:false,
      };
    },
    created() {

    },
    mounted() {
      this.createAudio();
      this.createGameApp();
      this.loadResource();
    },
    computed: {
      wordList: function () {
        // let words = _.cloneDeep(testWords);
        let words = _.cloneDeep(this.$store.getters.currFlowStepWords || []);
        words.forEach(word => {
          let randomWords = utility.sortArrByRandom(words);
          word.options = [
            {
              id: word.id,
              word: word.word,
              imgUrl: word.imgUrl,
              chinese: word.chinese
            }
          ];
          console.log("-------computed.. randomWords", randomWords);
          for (let i = 0; i < randomWords.length; i++) {
            let randomItem = randomWords[i];
            if (randomItem.id !== word.id) {
              word.options.push({
                id: randomItem.id,
                word: randomItem.word,
                imgUrl: randomItem.imgUrl,
                chinese: randomItem.chinese
              });
              if (word.options.length == 3) {
                break;
              }
            }
          }
          word.options = utility.sortArrByRandom(word.options);
        });
        return words;
      },
      currWord: function () {
        return this.wordList && this.wordList[this.currWordIdx];
      },
      currWordSound() {
        return this.$refs.wordsSound
      },
      showReturn() {
        return this.$store.getters.flowType === TASK_SCORE_TYPE.unit;
      }
    },
    watch: {
      playResult: function (val) {
        if (val && this.scoreDialog) {
          this.scoreDialog.setData(val);
        }
      },
      '$store.getters.dialogShowing': function (val) {
        if(this.showScoreDialog){
          this.$emit('close');
        }else{
          if(!this.isReady){
            if (val === false && this.showReturnCfm == true) {
              this.showReturnCfm = false
              this.returnCfm.hide();
              this.play();
            } else if (val && this.showReturnCfm == false) {
              this.showReturnCfm = true
              this.returnCfm.show();
              this.pause();
            }
          }else{
            this.$store.commit('setDialogShowing',false);
          }
        }
      },
      '$store.getters.switchBackground': function (val) {
        if (val) {
          this.pause();
        } else {
          this.showScoreDialog || this.showReturnCfm || this.play();
        }
      }
    },
    methods: {
      createAudio: function () {
       
        if(window.plus){
          this.bgSound = plus.audio.createPlayer(this.sounds.bgSound);
        }
        this.goSound = this.$refs.goSound;
        this.readySound = this.$refs.readySound;
        this.shootSound = this.$refs.shootSound;
        this.shootSound.onpause=()=>{
          this.shootSound.load();
        };
        this.rightSound = this.$refs.rightSound;
        this.rightSound.onpause=()=>{
          this.rightSound.load();
        };
        this.errorSound = this.$refs.errorSound;
        this.errorSound.onpause=()=>{
          this.errorSound.load();
        };

      },
      createGameApp: function () {
        let app = new PIXI.Application({
          width: this.deviceConfig.width,
          height: this.deviceConfig.height,
          antialias: true,
          transparent: true,
          clearBeforeRender: true
        });
        app.stage.rotation = Math.PI / 2;
        app.stage.x = this.deviceConfig.width;
        app.backgroundColor = 0x222fff;
        app.view.style.width = "100%";
        app.view.style.height = "100%";
        this.app = app;
      },
      // 加载图片文件、声音文件、引入游戏组件
      loadResource: function () {
        let loader = new PIXI.loaders.Loader();
        this.loader = loader;

        // 加载游戏公共图片
        this.publicImgs.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgPublicRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        // 加载游戏图片
        this.spriteImgs.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        // 加载左侧射箭动画图片
        this.arrowImgsL.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        // 加载中间射箭动画图片
        this.arrowImgsC.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        // 加载右侧射箭动画图片
        this.arrowImgsR.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        for (let val of this.wordList) {
          //加载英文单词读音
          let key = "wordsSound" + val.id
          if (!loader.resources[key]) {
            loader.add(key, val.voiceUrl);
          }
        }
        loader.on("progress", e => {
          this.progress = Math.floor(e.progress);
        });
        loader.on("complete", e => {
          this.showLoading = false;
          this.$el.appendChild(this.app.view);
          this.createStage();
          this.setWordText();
        });
        this.optBar = new OptBar({
          loader: this.loader,
          duration: 60,
          currStep: 1,
          stepCount: this.wordList.length,
          onPause: this.pause,
          onPlay: this.play,
          onReturn: this.quitClick,
          onOver: this.end,
          score: this.score,
          
        });

        loader.load();
      },
      createStage: function () {
        let stage = this.app.stage;
        // 添加主背景
        let resources = this.loader.resources;
        let skyImage = new PIXI.extras.TilingSprite(
          resources["sky"].texture,
          this.deviceConfig.height,
          this.deviceConfig.width
        );
        skyImage.x = 0;
        skyImage.y = 0;
        stage.addChild(skyImage);

        // 添加精灵~云
        let clouds = [
          { name: "cloud1", x: 50, y: 30, speed: 0.6, scale: 0.5 },
          { name: "cloud2", x: 300, y: 60, speed: 2, scale: 0.6 },
          { name: "cloud2", x: 550, y: 20, speed: 1, scale: 1 },
          { name: "cloud2", x: 900, y: 140, speed: 2, scale: 1 },
          { name: "cloud1", x: 1300, y: 0, speed: 3, scale: 0.7 },
          { name: "cloud1", x: 1880, y: 180, speed: 3, scale: 1 }
        ];
        clouds.forEach(cloud => {
          this.cloudAnimates.push(
            new Cloud({
              texture: resources[cloud.name].texture,
              x: cloud.x,
              y: cloud.y,
              speed: cloud.speed,
              scale: cloud.scale,
              stage: stage
            })
          );
        });

        // 添加树背景
        let treeImage = new Sprite({
          texture: resources["bgmiddle"].texture,
          x: 0,
          y: 0
        });
        stage.addChild(treeImage);

        // 添加操作条
        this.optBar.init(stage);


        //创建显示出箭靶
        // 当单元单词>=3时正常显示3个
        // 当单元单词=2时显示2个
        // 当单元单词=1时显示1个
        this.wordNumber=this.wordList.length;
        console.log("--------------wordNumber",this.wordNumber);
        
        switch (this.wordNumber){
          case 1:
             this.leftTarget = this.createTargetSprite(388, 140, () => {
              if (this.playing && !this.eventLocking) {
                this.eventLocking = true;
                this.playArrow = "left";

                this.shootSound && this.shootSound.play();
                this.shooter.gotoAndPlay(0);
              }
            });
            break;
          case 2:
            this.leftTarget = this.createTargetSprite(388, 140, () => {
              if (this.playing && !this.eventLocking) {
                this.eventLocking = true;
                this.playArrow = "left";
 
                this.shootSound && this.shootSound.play();
                this.shooter.gotoAndPlay(0);
              }
            });
            this.centerTarget = this.createTargetSprite(785, 140, () => {
              if (this.playing && !this.eventLocking) {
                this.eventLocking = true;
                this.playArrow = "center";

                this.shootSound && this.shootSound.play();
                this.shooter.gotoAndPlay(0);
              }
            });
          break;
          default:
             this.leftTarget = this.createTargetSprite(388, 140, () => {
              if (this.playing && !this.eventLocking) {
                this.eventLocking = true;
                this.playArrow = "left";

                this.shootSound && this.shootSound.play();
                this.shooter.gotoAndPlay(0);
              }
            });
            this.centerTarget = this.createTargetSprite(785, 140, () => {
              if (this.playing && !this.eventLocking) {
                this.eventLocking = true;
                this.playArrow = "center";

                this.shootSound && this.shootSound.play();
                this.shooter.gotoAndPlay(0);
              }
            });
            this.rightTarget = this.createTargetSprite(1180, 140, () => {
              if (this.playing && !this.eventLocking) {
                this.eventLocking = true;
                this.playArrow = "right";

                this.shootSound && this.shootSound.play();
                this.shooter.gotoAndPlay(0);
              }
            });
        }

        // 添加大陆背景
        let landImage = new Sprite({
          texture: resources["bgfront"].texture,
          x: 0,
          y: 0
        });
        stage.addChild(landImage);

        // 引用组件
        this.returnCfm = new GameBackCfm();
        this.returnCfm.cancelCallback = () => {
          this.showReturnCfm = false;
          this.$store.commit('setDialogShowing', false);
          this.play();
        };
        this.returnCfm.certainCallback = () => {
          this.goBack();
        };
        this.scoreDialog = new GameOverPopups({
          examineRank: this.showRanks,
          nextLevel: this.playNext,
          onceAgain: this.playAgain,
          close: this.goBack,
          showReturn: this.showReturn,
          isLast:this.isLast,
        });

        this.createAnimateSprite();
        stage.addChild(this.returnCfm);
        stage.addChild(this.scoreDialog);
        this.gameReady();
        this.$store.commit('setIsGameing', true)
      },

      createTargetSprite: function (x, y, clickCb) {
        let resources = this.loader.resources;
        let targetContainer = new PIXI.Container();
        targetContainer.x = x;
        targetContainer.y = y;
        targetContainer.width = 250;
        targetContainer.height = 635;
        let mainContainer = new PIXI.Container();
        mainContainer.x = 0;
        mainContainer.y = 0;
        let biscuitContainer = new PIXI.Container();
        biscuitContainer.x = 0;
        biscuitContainer.y = 0;
        // 饼干
        let biscuitSprite = new Sprite({
          texture: resources["biscuit"].texture,
          x: 0,
          y: 0
        });
        biscuitSprite.anchor.x = 0.5;
        // 靶心
        let circleSprite = new Sprite({
          texture: resources["circle"].texture,
          x: 0,
          y: 198
        });
        circleSprite.anchor.x = 0.5;
        biscuitContainer.addChild(biscuitSprite);
        mainContainer.addChild(biscuitContainer);
        mainContainer.addChild(circleSprite);
        // 添加单词 TEXT

        //创建目标文字
        let wordsText = new PIXI.Text("10 / 10", {
          fontFamily: "Arial",
          fontSize: 42,
          fontWeight: "bold",
          align: "center",
          fill: ["#840E20"],
          wordWrap: true,
          breakWords: true,
          wordWrapWidth: 210
        });
        wordsText.anchor.y = 0.5;
        wordsText.anchor.x = 0.5;
        wordsText.y = biscuitContainer.height * 0.5;

        biscuitContainer.addChild(wordsText);

        //创建对号 跟错号 精灵
        let rightSprite = new Sprite({
          texture: resources["answerRight"].texture,
          x: 0,
          y: 0
        });
        rightSprite.x = 20;
        rightSprite.y = 10;
        rightSprite.visible = false;
        biscuitContainer.addChild(rightSprite);

        let errSpirte = new Sprite({
          texture: resources["answerError"].texture,
          x: 0,
          y: 0
        });
        errSpirte.x = 20;
        errSpirte.y = 10;
        errSpirte.visible = false;
        biscuitContainer.addChild(errSpirte);

        mainContainer.interactive = true;
        mainContainer.on("tap", e => {
          clickCb && clickCb();
        });

        //创建 加分  减分  精灵
        let addText = new Sprite({
          texture: resources["addScore"].texture,
          x: 110,
          y: 0
        });
        addText.visible = false;
        addText.alpha = 1;
        biscuitContainer.addChild(addText);

        let delText = new Sprite({
          texture: resources["subScore"].texture,
          x: 110,
          y: 0
        });
        delText.alpha = 1;
        delText.visible = false;
        biscuitContainer.addChild(delText);

        // 靶杆
        let barSprite = new Sprite({
          texture: resources["bar"].texture,
          x: 0,
          y: 390
        });
        barSprite.anchor.x = 0.5;

        targetContainer.addChild(barSprite);
        targetContainer.addChild(mainContainer);

        this.app.stage.addChild(targetContainer);
        let me = this;
        function setWord(word) {
          wordsText.text = word;
        }
        function checkWord() {
          let word = me.currWord.word;
          if (word === wordsText.text) {
            setTimeout(() => {
              rightSprite.visible = true;
              addText.visible = true;
              setTimeout(() => {
                rightSprite.visible = false;
                addText.visible = false;
              }, 1000);
            }, 200);
            return true;
          } else {
            setTimeout(() => {
              errSpirte.visible = true;
              delText.visible = true;
              setTimeout(() => {
                errSpirte.visible = false;
                delText.visible = false;
              }, 1000);
            }, 200);
            return false;
          }
        }
        return {
          setWord,
          checkWord
        };
      },

      createAnimateSprite: function () {
        let stage = this.app.stage;
        let resources = this.loader.resources;

        // 添加shooter
        this.shooter = new PIXI.extras.AnimatedSprite([
          resources["shootWait"].texture,
          resources["shoot"].texture,
          resources["shootOver"].texture
        ]);
        this.shooter.x = 1520;
        this.shooter.y = 650;
        this.shooter.animationSpeed = 0.1;

        this.shooter.loop = false;
        // this.shooter.gotoAndStop(0)
        stage.addChild(this.shooter);

        this.shooter.onComplete = e => {
          this.shooter.gotoAndStop(0);
          if (this.playArrow === "left") {
            leftShootAnimate.visible = true;
            leftShootAnimate.gotoAndPlay(0);
          } else if (this.playArrow === "center") {
            centerShootAnimate.gotoAndPlay(0);
            centerShootAnimate.visible = true;
          } else if (this.playArrow === "right") {
            rightShootAnimate.gotoAndPlay(0);
            rightShootAnimate.visible = true;
          }
        };

        // 添加射箭动画
        let leftImgs = [];
        this.arrowImgsL.forEach(item => {
          leftImgs.push(resources[item].texture);
        });
        let centerImgs = [];
        this.arrowImgsC.forEach(item => {
          centerImgs.push(resources[item].texture);
        });
        let rightImgs = [];
        this.arrowImgsR.forEach(item => {
          rightImgs.push(resources[item].texture);
        });
        let leftShootAnimate = new PIXI.extras.AnimatedSprite(leftImgs);
        let centerShootAnimate = new PIXI.extras.AnimatedSprite(centerImgs);
        let rightShootAnimate = new PIXI.extras.AnimatedSprite(rightImgs);

        leftShootAnimate.loop = false;
        leftShootAnimate.x = 0;
        leftShootAnimate.y = 20;

        centerShootAnimate.loop = false;
        centerShootAnimate.x = 0;
        centerShootAnimate.y = 15;

        rightShootAnimate.loop = false;
        rightShootAnimate.x = 0;
        rightShootAnimate.y = 10;

        leftShootAnimate.onComplete = e => {
          checkCorrect(this.leftTarget, leftShootAnimate);
        };
        centerShootAnimate.onComplete = e => {
          checkCorrect(this.centerTarget, centerShootAnimate);
        };
        rightShootAnimate.onComplete = e => {
          checkCorrect(this.rightTarget, rightShootAnimate);
        };

        let checkCorrect = (target, animate) => {
          let passed = target.checkWord();
          setTimeout(() => {
            if (passed) {
              this.score += 10;

              this.rightSound && this.rightSound.play();
              this.next();
            } else {
              if (this.score > 0) {
                this.score -= 5;
                let id = this.currWord.id;
                if (
                  !this.wrongWords.find(item => {
                    return item === id;
                  })
                ) {
                  this.wrongWords.push(id);
                }
              }

              this.errorSound && this.errorSound.play();
              this.errorTimes++;
              if (this.errorTimes === 2) {
                this.next();
              } else {
                this.eventLocking = false;
                setTimeout(() => {

                  if (this.currWordSound && this.currWordSound.paused) {
                    this.currWordSound.play();
                  }
                }, 800)
              }
            }
            this.optBar.updateScore(this.score);
          }, 200);
          setTimeout(() => {
            animate.visible = false;
          }, 1000);
        };

        leftShootAnimate.visible = false;
        centerShootAnimate.visible = false;
        rightShootAnimate.visible = false;

        stage.addChild(leftShootAnimate);
        stage.addChild(centerShootAnimate);
        stage.addChild(rightShootAnimate);
      },

      gameReady: function () {
        let stage = this.app.stage;
        let resources = this.loader.resources;
        let ready = new Sprite({
          texture: resources["ready"].texture,
          x: 900,
          y: 600
        });
        ready.anchor.set(0.5);
        stage.addChild(ready);

        let scale = 1;
        this.readyMove =
          requestAnimationFrame(scaleMove) && this.readySound.play();
        let that = this;
        function scaleMove() {
          that.readyMove = requestAnimationFrame(scaleMove);
          scale += 0.02;
          ready.scale.set(scale);
        }
        this.isReady = true
        let onceTimer = setTimeout(() => {
          this.gameGo();
          clearTimeout(onceTimer);
          onceTimer = null;
        }, 2000);

        this.ready = ready;
      },
      gameGo: function () {
        let stage = this.app.stage;
        let resources = this.loader.resources;
        if (this.readyMove) {
          cancelAnimationFrame(this.readyMove);
          this.readyMove = null;
          stage.removeChild(this.ready);
        }
        let go = new Sprite({
          texture: resources["go"].texture,
          x: 900,
          y: 600
        });
        go.anchor.set(0.5);
        stage.addChild(go);

        let scale = 1;

        this.goMove = requestAnimationFrame(scaleMove) && this.goSound.play();
        let that = this;
        function scaleMove() {
          that.goMove = requestAnimationFrame(scaleMove);
          scale += 0.02;
          go.scale.set(scale);
        }

        let onceTimer = setTimeout(() => {
          cancelAnimationFrame(this.goMove);
          stage.removeChild(go);
          this.begin();
          clearTimeout(onceTimer);
          onceTimer = null;
        }, 800);
      },

      begin: function () {
        console.log(this.loader.resources);
        this.eventLocking = false;

        this.play();
        this.optBar.play();
        this.isReady = false;

      },
      setWordText: function () {
        let options = this.currWord.options;
        switch(this.wordNumber){
          case 1:
            this.leftTarget.setWord(options[0].word); 
            break;
          case 2:
            this.leftTarget.setWord(options[0].word); 
            this.centerTarget.setWord(options[1].word);
            break;
          default:
            this.leftTarget.setWord(options[0].word); 
            this.centerTarget.setWord(options[1].word);
            this.rightTarget.setWord(options[2].word);
        }
      },
      next: function () {
        this.errorTimes = 0;
        this.optBar.updateCurrStep(this.currWordIdx + 1);
        if (this.currWordIdx === this.wordList.length - 1) {
          this.end();
        } else {
          this.currWordIdx++;

          setTimeout(() => {
            this.setWordText();

            if (this.currWordSound && this.currWordSound.paused) {
              this.currWordSound.play();
            }
            this.eventLocking = false;
          }, 1200);
        }
      },
      end: function () {
        this.pause();
        this.scoreDialog.show();
        this.showScoreDialog = true
        this.$emit("postResult", this.wrongWords, this.score, true);
        // 提交结果，等待弹框
      },
      player(){
        if(window.plus){
          this.bgSound = plus.audio.createPlayer(this.sounds.bgSound);
          this.bgSound.play(this.player)
        }
      },
      play: function () {
        console.log("-----play");
        this.playing = true;

        this.optBar.play();
 
        this.bgSound&&this.bgSound.play(this.player);

        if (this.currWordSound && this.currWordSound.paused) {
          this.currWordSound.play();
        }
        this.cloudAnimates.forEach(item => {
          item.play();
        });
      },
      pause: function () {
        console.log("-----pause");

        this.playing = false;
        this.bgSound&&this.bgSound.stop();
        if(window.plus){
          this.bgSound = plus.audio.createPlayer(this.sounds.bgSound);
        }
        this.optBar.pause();
        console.log("-----bgSound pause");
        this.cloudAnimates.forEach(item => {
          item.stop();
        });
      },
      quitClick: function () {

        this.pause();
        this.showReturnCfm = true;
        this.$store.commit('setDialogShowing', true);
        this.returnCfm.show();
      },
      showRanks: function () { },
      goBack: function () {
        this.$router.go(-1);
      },
      playNext: function () {
        this.$emit("next");
      },
      playAgain: function () {
        this.score = 0;
        this.currWordIdx = 0;
        this.errorTimes = 0;
        this.wrongWords = [];
        this.showScoreDialog = false

        console.log('------this.currWord', this.currWord)
        this.setWordText();
        this.optBar.reset();

        this.gameReady();   
      }
    },
    beforeDestroy() {
      // 释放资源
      this.$store.commit("setLearningBack", true);
      console.log("-------arrgame destory start");
      this.$store.commit('setIsGameing', false)
      this.bgSound&&this.bgSound.stop();
      
      console.log("-----loader destroy");
      this.loader && this.loader.destroy();
      this.cloudAnimates.forEach(item => {
        item && item.destroy();
      });
      console.log("-----optBar destroy");
      this.optBar.destroy();
      console.log("-----returnCfm destroy");
      this.returnCfm.destroy();
      console.log("-----scoreDialog destroy");
      this.scoreDialog.destroy();
      console.log("-----app destroy");
      this.app.destroy(true);
      console.log("-------arrgame destory end");
    },
    components: {
      gameLoading,
      
    }
  };
</script>

<style lang='scss' scoped>
  #arrowGame {
  	height: 100%;
  	width: 100%;
  }
</style>
