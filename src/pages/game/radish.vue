<template>
  <div class="radish">
    <gameLoading v-if="showLoading" :progress="progress"></gameLoading>
    <audio ref="wordSound" :src="currWord.voiceUrl" preload="load"></audio>
    <audio ref="goSound" :src="allSound.goSound" preload="load"></audio>
    <audio ref="readySound" :src="allSound.readySound" preload="load"></audio>
    <audio ref="hitSound" :src="allSound.hitSound" preload="load"></audio>
    <audio ref="anwserError" :src="allSound.anwserError" preload="load"></audio>
    <audio ref="addScore" :src="allSound.addScore" preload="load"></audio>
  </div>
</template>

<script>
import * as PIXI from "pixi.js";
// import sound from 'pixi-sound'
import Howl from "howler";
import Monster from "@/game/radish";
import _ from "lodash";
import GameOverPopups from "@/game/gameSettlementPopups";
import GameLoading from "@/components/gameLoading";
import GameBack from "@/game/gameBack";
import { TASK_SCORE_TYPE } from "@/utility/dict";

let MovingMonster = []; //保存正在移动的怪物

const TIME_GAME = 120; //游戏计时时长
const ADD_SOURCE = 10; //加分值
const SUB_SOURCE = 5; //降分值

let userScore = 0; //用户得分

let userTapCount = 0;
//声音管理
let soundManage = {
  backroundSound: null,
  addScore: null,
  anwserError: null,
  goSound: null,
  readySound: null,
  hitSound: null //击中怪物时 的声音
};
export default {
  props: ["playResult", "isLast"],
  data() {
    return {
      progress: 0,
      showLoading: true,
      isPause: true, //是否暂停
      allCard: [],
      currIndex: 0,
      wrongWords: new Set(),
      SpriteAssets: [
        { url: "static/images/game/radish/bg.png" },
        { url: "static/images/game/radish/track.png" },
        { url: "static/images/game/radish/answerBoard.png" },
        { url: "static/images/game/radish/puzzleBoard.png" },
        { url: "static/images/game/radish/select.png" },
        { url: "static/images/game/radish/glitter.png" },
        { url: "static/images/game/radish/eyes1.png" },
        { url: "static/images/game/radish/eyes2.png" },
        { url: "static/images/game/radish/eyes3.png" },
        { url: "static/images/game/radish/action1.png" },
        { url: "static/images/game/radish/action2.png" },
        { url: "static/images/game/radish/monster1.png" },
        { url: "static/images/game/radish/monster2.png" },
        { url: "static/images/game/radish/monster3.png" },
        { url: "static/images/game/radish/monster4.png" },
        { url: "static/images/game/radish/monster5.png" },
        { url: "static/images/game/radish/monster6.png" },
        { url: "static/images/game/radish/monster7.png" },
        { url: "static/images/game/radish/wing1.png" },
        { url: "static/images/game/radish/wing2.png" },
        { url: "static/images/game/radish/wing3.png" },
        { url: "static/images/game/radish/wing4.png" },
        { url: "static/images/game/radish/wing5.png" },
        { url: "static/images/game/radish/wing6.png" },
        { url: "static/images/game/radish/wing7.png" },
        { url: "static/images/game/radish/wing8.png" },
        { url: "static/images/game/radish/DeathEffects/1.png" },
        { url: "static/images/game/radish/DeathEffects/2.png" },
        { url: "static/images/game/radish/DeathEffects/3.png" },
        { url: "static/images/game/radish/DeathEffects/4.png" },
        { url: "static/images/game/radish/DeathEffects/5.png" },
        { url: "static/images/game/radish/DeathEffects/6.png" },
        { url: "static/images/game/radish/DeathEffects/7.png" },
        { url: "static/images/game/radish/DeathEffects/8.png" },
        { url: "static/images/game/radish/DeathEffects/9.png" },
        { url: "static/images/game/radish/actionDie2.png" },
        { url: "static/images/game/radish/actionDie1.png" },
        { url: "static/images/game/radish/shadow.png" },
        { url: "static/images/game/radish/monsterOut.png" },
        { url: "static/images/game/radish/ghost1.png" },
        { url: "static/images/game/radish/ghost2.png" },
        { url: "static/images/game/radish/ghost3.png" },
        { url: "static/images/game/radish/ghost4.png" },
        { url: "static/images/game/public/answerError.png" },
        { url: "static/images/game/public/answerRight.png" },
        { url: "static/images/game/public/pause.png" },
        { url: "static/images/game/public/pause2.png" },
        { url: "static/images/game/public/return.png" },
        { url: "static/images/game/public/coin.png" },
        { url: "static/images/game/public/target.png" },
        { url: "static/images/game/radish/star.png" },
        { url: "static/images/game/public/addScore.png" },
        { url: "static/images/game/public/subScore.png" },
        //下面是各种弹框的图片
        { url: "static/images/game/public/go.png" },
        { url: "static/images/game/public/ready.png" }
      ],
      allSound: {
        backgroundSound: "_www/static/audio/radishBackgroundSound.mp3",
        addScore: "static/audio/addScore.mp3",
        goSound: "static/audio/go.mp3",
        readySound: "static/audio/ready.mp3",
        hitSound: "static/audio/hit.mp3",
        anwserError: "static/audio/ohNo.mp3",
        resume: "static/audio/hi.mp3"
      },
      resumeTimer: null,
      showReturnCfm: false,
      showOverPopups: false,
      isReady: false
    };
  },
  computed: {
    words() {
      let words = _.cloneDeep(this.$store.getters.currFlowStepWords || []);
      //  words = words.filter(item=> item.word.length>1)
      words = words.map(word => {
        //为每个单词，生成干扰项
        if (!word) return {};
        let left = "";
        let anwser = "";
        let right = "";
        let distracter = [];
        if (word.word.length === 1) {
          anwser = word.word;
        } else if (word.phonics && word.phonics.indexOf("_") === -1) {
          //有word.phonics的单词
          let phonics = word.phonics.split("=")[0].split("+");
          let len = phonics.length - 1;
          if (phonics.length === 2) {
            left = phonics[0];
            anwser = phonics[1];
            right = "";
          } else {
            let index = 0;
            left = phonics[index++];
            anwser = phonics[index++];
            right = phonics[index] || "";
          }
        } else {
          let english = word.word;
          let reg = /[\s|-|…]/g;
          if (english.search(reg) !== -1) {
            let arr = english.split(reg);
            left = arr[0];
            anwser = arr[1];
            right = "";
            for (let i = 2; i < arr.length; i++) {
              if (arr[i]) {
                right = right + arr[i] + " ";
              }
            }
            right = right.trim();
          } else {
            let len = english.length;
            if (len <= 3) {
              left = english.charAt(0);
              anwser = english.slice(1);
            } else {
              let index = Math.floor(_.random(len - 2, 2));
              left = english.slice(0, index);
              anwser = english.slice(index);
            }
            right = "";
          }
        }
        //干扰项和正确答案
        distracter = [{ id: word.id, text: anwser }].concat(
          this.createDistracter(anwser)
        );
        return {
          id: word.id,
          word: word.word,
          left: left,
          voiceUrl: word.voiceUrl,
          anwser: anwser,
          right: right,
          distracter: _.shuffle(distracter)
        };
      });
      return _.shuffle(words);
    },
    currWord() {
      // let len = this.words.length;
      // if(this.currIndex>=len) this.currIndex = 0
      return this.words[this.currIndex] || {};
    },
    currWordSound() {
      return this.$refs.wordSound;
    },
    showReturn() {
      let type = this.$store.getters.flowType;
      return type === TASK_SCORE_TYPE.unit;
    }
  },
  watch: {
    playResult: function(newVal) {
      if (newVal && this.overPopups) {
        this.overPopups.setData(newVal);
      }
    },
    "$store.getters.dialogShowing": function(val) {
      if (this.showOverPopups) {
        this.$emit("close");
      } else {
        if (!this.isReady) {
          if (val === false && this.showReturnCfm == true) {
            this.showReturnCfm = false;
            this.backBox.hide();
            this.pauseBox.interactive = true;
            this.goBack.interactive = true;
            this.play();
          } else if (val && this.showReturnCfm == false) {
            this.showReturnCfm = true;
            this.pauseBox.interactive = false;
            this.goBack.interactive = false;
            this.backBox.show();
            this.pause();
          }
        } else {
          this.$store.commit("setDialogShowing", false);
        }
      }
    },
    "$store.getters.switchBackground": function(val) {
      if (val) {
        this.pause();
      } else {
        this.showOverPopups || this.showReturnCfm || this.play();
      }
    }
  },
  mounted() {
    this.deviceWH = {
      width: 1080,
      height: 1920
    };
    this.createSound();
    this.init();
  },
  methods: {
    //生成干扰项
    createDistracter(anwser) {
      let letters = [
        "q",
        "w",
        "e",
        "r",
        "t",
        "y",
        "u",
        "i",
        "o",
        "p",
        "a",
        "s",
        "d",
        "f",
        "g",
        "h",
        "j",
        "k",
        "l",
        "z",
        "x",
        "c",
        "v",
        "b",
        "n",
        "m"
      ];
      let len = anwser.length - 1;
      let check = {};
      let arr = [];
      let idx;
      let index;
      for (let i = 0; i < 3; i++) {
        index = Math.floor(_.random(0, len));
        let letter = anwser.charAt(index); //从正确答案中选取一个单词
        do {
          idx = Math.floor(_.random(0, 25)); //从26个字母中选出一个单词
        } while (
          check[idx] ||
          letter.toLowerCase() === letters[idx].toLowerCase()
        ); //为了防止两个字母出现多次或者 与要替换的字母相同
        check[idx] = true;
        let str = anwser.replace(letter, letters[idx]);
        arr.push({
          id: null,
          text: str
        });
      }
      check = null;
      return arr;
    },
    createSound() {
      if (window.plus) {
        soundManage.backgroundSound = plus.audio.createPlayer(
          this.allSound.backgroundSound
        );
      }

      soundManage.addScore = this.$refs.addScore;
      soundManage.addScore.onpause = () => {
        soundManage.addScore.load();
      };
      soundManage.anwserError = this.$refs.anwserError;
      soundManage.anwserError.onpause = () => {
        soundManage.anwserError.load();
      };
      soundManage.goSound = this.$refs.goSound;

      soundManage.readySound = this.$refs.readySound;

      soundManage.hitSound = this.$refs.hitSound;

      soundManage.hitSound.onpause = () => {
        soundManage.hitSound.load();
      };
      // soundManage.resume  = new Howl.Howl({
      //     src:[this.allSound.resume],
      //     volume:0.15
      // })
    },
    init() {
      //创建舞台，画布,
      this.app = new PIXI.Application({
        width: this.deviceWH.width,
        height: this.deviceWH.height,
        antialias: true,
        clearBeforeRender: true
        // forceCanvas: true
      });

      this.app.renderer.autoResize = false;
      this.app.stage.rotation = Math.PI / 2;
      this.app.stage.x = this.deviceWH.width;
      this.app.view.id = "radish";
      this.app.view.style.width = "100%";
      this.app.view.style.height = "100%";

      this.loader = new PIXI.loaders.Loader();

      this.loader.on("complete", (loader, res) => {
        this.showLoading = false;
        this.$el.appendChild(this.app.view);
        this.onLoadCompleted(loader, res);
      });
      this.loader.on("progress", ({ progress }, res) => {
        this.progress = Math.floor(progress);
      });
      for (let i = 0; i < this.SpriteAssets.length; i++) {
        if (!this.loader.resources[this.SpriteAssets[i].url]) {
          this.loader.add(this.SpriteAssets[i].url);
        }
      }
      // for(let key in this.allSound){
      //     if(!this.loader.resources[key]){
      //       this.loader.add(key,this.allSound[key]);
      //     }
      // }
      // this.words.forEach((word)=>{
      //   let voiceUrl = word.voiceUrl;
      //   let id = word.id;
      //   let key = "word_"+id;
      //   if(!this.loader.resources[key]){
      //     this.loader.add(key,voiceUrl)
      //   }
      // })
      this.loader.load();
      this.$store.commit("setIsGameing", true);
    },
    onLoadCompleted(loader, res) {
      this.drawBackground(res);
      this.drawAssistFunction(res);
      this.drawContext(res);
      this.createBackContainer(res);
      this.createOverPopup(res);
      this.gameReady(); //开始
    },
    gameReady() {
      if (!this.loader) return;
      let res = this.loader.resources;
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
        this.isReady = true;
        soundManage.readySound && soundManage.readySound.play();
        setTimeout(() => {
          this.readyNext();
        }, 2000);
      }
    },
    readyNext(e) {
      console.log("-----------next", e);
      if (this.readyID) {
        cancelAnimationFrame(this.readyID);
        this.readyID = null;
      }
      if (!this.readySprite) return;
      this.app.stage.removeChild(this.readySprite);
      this.readySprite = null;
      this.gameGo();
    },
    gameGo() {
      if (!this.loader) return;
      let res = this.loader.resources;
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
        let goScale = () => {
          this.goID = requestAnimationFrame(goScale);
          scale += 0.02;
          this.goSprite.scale.set(scale);
        };
        goScale();
        soundManage.goSound && soundManage.goSound.play();
        setTimeout(() => {
          this.goNext();
        }, 800);
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
      this.begin();
    },
    createOverPopup(res) {
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
      this.currIndex = 0;
      MovingMonster.forEach(monster => {
        if (monster) {
          monster.stopMove();
          monster.destroy();
        }
      });
      this.allCard.forEach(card => {
        card.setText(" ", -1);
      });
      MovingMonster = [];
      this.ToppicBox.removeChildren();
      userTapCount = 0;
      userScore = 0;
      this.showOverPopups = false;
      this.wrongWords = new Set();
      this.glodText.text = userScore;
      this.targetText.text = `${this.currIndex + 1} / ${this.words.length}`;
      this.storeNormal.visible = true;
      this.storeDie.visible = false;
      this.normalBox.visible = true;
      this.dragonDie2.x = 45;
      this.dragonDie2.y = 50;
      this.dragonDie2.alpha = 1;
      // this.overPopups.reset();
      this.gameReady();
    },
    nextLevel() {
      this.$emit("next");
    },
    examineCallBack() {
      this.$emit("showRanking");
    },
    createBackContainer(res) {
      this.backBox = new GameBack();
      this.backBox.x = 0;
      this.backBox.y = 0;
      (this.backBox.cancelCallback = this.cancelBtn),
        (this.backBox.certainCallback = this.certainBtn);
      this.backBox.y = 0;
      this.app.stage.addChild(this.backBox);
      this.backBox.visible = false; //提示底板
    },
    /**
     * 绘制游戏背景
     *
     */
    drawBackground(res) {
      //加载背景
      this.backgroundImage = new PIXI.Sprite(
        res["static/images/game/radish/bg.png"].texture
      );
      this.backgroundImage.x = 0;
      this.backgroundImage.y = 0;

      this.app.stage.addChild(this.backgroundImage);
    },
    /**
        绘制辅助功能
       */
    drawAssistFunction(res) {
      //开始暂停容器
      this.pauseBox = new PIXI.Container();
      this.pauseBox.x = 15;
      this.pauseBox.y = 15;
      this.app.stage.addChild(this.pauseBox);

      //创建开始暂停精灵
      this.pauseRadio = new PIXI.Sprite(
        res["static/images/game/public/pause.png"].texture
      );
      this.startRadio = new PIXI.Sprite(
        res["static/images/game/public/pause2.png"].texture
      );
      this.pauseRadio.x = this.startRadio.x = 0;
      this.pauseRadio.y = this.startRadio.y = 0;
      this.startRadio.visible = false;
      this.pauseBox.addChild(this.pauseRadio);
      this.pauseBox.addChild(this.startRadio);

      //给暂停容器绑定事件
      // this.pauseBox.interactive = true;
      this.pauseBox.on("tap", this.onPauseTap);

      //返回按钮
      this.goBack = new PIXI.Sprite(
        res["static/images/game/public/return.png"].texture
      );
      this.goBack.x = this.deviceWH.height - this.goBack.width - 10;
      this.goBack.y = 30;
      this.app.stage.addChild(this.goBack);
      // this.goBack.interactive = true;
      //返回按钮绑定事件
      this.goBack.on("tap", this.quitClick);
      //33.8%   29.5%
      //创建龙币和目标数量的容器
      let textAndGlodBox = new PIXI.Container();
      textAndGlodBox.x = 600;
      textAndGlodBox.y = 0;
      this.app.stage.addChild(textAndGlodBox);

      this.glodSprite = new PIXI.Sprite(
        res["static/images/game/public/coin.png"].texture
      );
      this.targetSprite = new PIXI.Sprite(
        res["static/images/game/public/target.png"].texture
      );

      this.glodSprite.y = this.targetSprite.y = 30;
      this.glodSprite.x = 0;
      this.targetSprite.x = 500;
      textAndGlodBox.addChild(this.glodSprite);
      textAndGlodBox.addChild(this.targetSprite);
      //绘制文字
      //金币文字
      this.glodText = this.createText(userScore + "");
      //目标文字
      this.targetText = this.createText(`1 / ${this.words.length}`);

      this.targetText.x = this.glodText.x = 200;
      this.targetText.y = this.glodText.y = 45;

      this.glodSprite.addChild(this.glodText);
      this.targetSprite.addChild(this.targetText);
    },
    //暂停容器的事件处理函数
    onPauseTap(e) {
      if (this.isPause) {
        // 开始
        this.play();
      } else {
        //暂停
        this.pause();
      }
    },
    // 游戏暂停
    pause() {
      // this.resumeTimer = setInterval(()=>{
      //   if(soundManage.resume){
      //      soundManage.resume.play()
      //   }else{
      //     this.resumeTimer && clearInterval(this.resumeTimer)
      //   }
      // },10000)
      this.startRadio.visible = true;
      this.pauseRadio.visible = false;
      this.pauseAllMonster(); //暂停所有怪物
      if (window.plus) {
        soundManage.backgroundSound.stop();
        soundManage.backgroundSound = plus.audio.createPlayer(
          this.allSound.backgroundSound
        );
      }
      this.answerBoardBox.interactiveChildren = false;
      this.isPause = true;
    },
    //暂停后的开始
    play() {
      // if(this.resumeTimer){
      //   clearInterval(this.resumeTimer)
      //   this.resumeTimer = null;
      // }
      this.startRadio.visible = false;
      this.pauseRadio.visible = true;
      this.isPause = false;
      if (window.plus) {
        soundManage.backgroundSound.play(this.player);
      }
      this.answerBoardBox.interactiveChildren = true;
      this.startAllMonster(); //开始所有怪物
      if (this.currWordSound) {
        this.currWordSound.play();
      }
      if (MovingMonster.length < 3) {
        this.randAppearMonter();
      }
    },
    //返回按钮的处理函数
    quitClick(e) {
      this.showReturnCfm = true;
      this.$store.commit("setDialogShowing", true);
      this.pauseBox.interactive = false;
      this.goBack.interactive = false;
      this.backBox.show();
      this.pause();
    },
    // 取消退出处理函数
    cancelBtn() {
      this.showReturnCfm = false;
      this.$store.commit("setDialogShowing", false);
      this.pauseBox.interactive = true;
      this.goBack.interactive = true;
      this.backBox.hide();
      this.play();
    },
    certainBtn() {
      //确认退出
      this.$router.go(-1);
    },

    //绘制文字
    createText(text) {
      text = text || "";
      let txt = new PIXI.Text(text, {
        fontSize: 34,
        fill: 0xffffff,
        fontWeight: 900,
        letterSpacing: 3
      });
      return txt;
    },
    /**
        绘制游戏主功能去的视图
       */
    drawContext(res) {
      let mainConfig = {
        //主区域的基本配置
        width: this.deviceWH.width * 0.723
      };
      //主功能区的容器
      this.mainFuntionContainer = new PIXI.Container();
      this.mainFuntionContainer.x = 250;
      this.mainFuntionContainer.y = 170;
      this.app.stage.addChild(this.mainFuntionContainer);

      //绘制轨道
      let track = new PIXI.Sprite(
        res["static/images/game/radish/track.png"].texture
      );
      track.x = 0;
      track.y = 0;
      this.mainFuntionContainer.addChild(track);

      //绘制答题区域容器
      this.selectBox = new PIXI.Container();
      this.selectBox.x = 450;
      this.selectBox.y = -15;
      this.mainFuntionContainer.addChild(this.selectBox);

      //绘制答题区域
      let select = new PIXI.Sprite(
        res["static/images/game/radish/select.png"].texture
      );
      select.x = 0;
      select.y = 0;

      this.selectBox.addChild(select);
      //绘制题板
      let puzzleBoardBox = new PIXI.Container();
      puzzleBoardBox.x = 0;
      puzzleBoardBox.y = 0;
      this.selectBox.addChild(puzzleBoardBox);
      this.puzzleBoard = new PIXI.Sprite(
        res["static/images/game/radish/puzzleBoard.png"].texture
      );
      this.puzzleBoard.x = 10;
      this.puzzleBoard.y = 10;

      puzzleBoardBox.addChild(this.puzzleBoard);

      this.ToppicBox = new PIXI.Container();
      this.ToppicBox.x = 0;
      this.ToppicBox.y = 0;
      puzzleBoardBox.addChild(this.ToppicBox);
      //绘制答案版
      this.answerBoardBox = new PIXI.Container();
      this.answerBoardBox.x = 0;
      this.answerBoardBox.y = 0;
      this.selectBox.addChild(this.answerBoardBox);
      this.drawMonsterOut(res, mainConfig);
      this.drawAnwser(res);
    },
    //绘制怪物出口和龙
    drawMonsterOut(res, mainConfig) {
      //创建星星

      this.star = new PIXI.Sprite(
        res["static/images/game/radish/star.png"].texture
      );
      this.star.anchor.set(0.5);
      /**
       * 保存星星的起始位置
       */

      this.starSiteX = this.mainFuntionContainer.width - 220;
      this.starSiteY = 105;
      this.star.x = this.starSiteX;
      this.star.y = this.starSiteY;
      this.star.visible = false;
      this.mainFuntionContainer.addChildAt(this.star, 2);

      //绘制小人
      //用于存放小龙，正常和死亡的动作
      this.dragonBox = new PIXI.Container();
      this.dragonBox.x = this.mainFuntionContainer.width - 130;
      this.dragonBox.y = 0;

      this.mainFuntionContainer.addChild(this.dragonBox);
      //绘制阴影

      this.dragonShadow = new PIXI.Sprite(
        res["static/images/game/radish/shadow.png"].texture
      );
      this.dragonShadow.anchor.set(0.5);
      this.dragonShadow.x = 50;
      this.dragonShadow.y = 180;
      this.dragonBox.addChild(this.dragonShadow);
      //用于存放正常的小龙
      this.storeNormal = new PIXI.Container();
      //存放死亡小龙
      this.storeDie = new PIXI.Container();
      this.storeNormal.x = this.storeDie.x = 0;
      this.storeNormal.y = this.storeDie.y = 0;

      this.dragonBox.addChild(this.storeNormal);
      this.dragonBox.addChild(this.storeDie);
      this.storeDie.visible = false;
      //绘制放置平时小龙的容器
      this.normalBox = new PIXI.Container();
      //绘制放置小龙发射时的容器
      this.luanchBox = new PIXI.Container();
      this.normalBox.x = this.luanchBox.x = 0;
      this.normalBox.y = this.luanchBox.y = 0;

      this.storeNormal.addChild(this.normalBox);
      this.storeNormal.addChild(this.luanchBox);
      this.luanchBox.visible = false;
      // this.normalBox.visible = false;
      //小龙手杖发光
      const glitter = new PIXI.Sprite(
        res["static/images/game/radish/glitter.png"].texture
      );
      glitter.anchor.set(0.5);
      glitter.x = -65;
      glitter.y = 25;

      this.normalBox.addChild(glitter);
      let deg = 0;
      requestAnimationFrame(glitterRotate);
      function glitterRotate() {
        requestAnimationFrame(glitterRotate);
        glitter.rotation = deg * Math.PI / 180;
        deg += 3;
      }
      //绘制正常显示的精灵
      this.drognNormal = new PIXI.Sprite(
        res["static/images/game/radish/action1.png"].texture
      );
      //绘制发射星星时的小龙
      this.drognlaunch = new PIXI.Sprite(
        res["static/images/game/radish/action2.png"].texture
      );
      this.drognNormal.anchor.set(0.5);
      this.drognlaunch.anchor.set(0.5);
      this.drognNormal.x = this.drognlaunch.x =
        mainConfig.width * 0.2 * 0.8 / 5;
      this.drognNormal.y = this.drognlaunch.y =
        mainConfig.width * 0.2 * 0.8 / 4;

      this.normalBox.addChild(this.drognNormal);
      this.luanchBox.addChild(this.drognlaunch);
      //绘制死亡时的精灵
      this.dragonDie = new PIXI.Sprite(
        res["static/images/game/radish/actionDie1.png"].texture
      );
      this.dragonDie2 = new PIXI.Sprite(
        res["static/images/game/radish/actionDie2.png"].texture
      );
      this.dragonDie.anchor.set(0.5);
      this.dragonDie2.anchor.set(0.5);
      this.dragonDie.x = this.dragonDie2.x = 45;
      this.dragonDie.y = this.dragonDie2.y = 50;

      this.storeDie.addChild(this.dragonDie);
      this.storeDie.addChild(this.dragonDie2);

      //出口容器
      this.monsterOutContainer = new PIXI.Container();

      //宽高
      let mWidth = mainConfig.width * 0.22,
        mHeight = mainConfig.width * 0.22 * 0.72;
      //选出容器的x,y值
      this.monsterOutContainer.x = -50;
      this.monsterOutContainer.y = 340;
      this.mainFuntionContainer.addChild(this.monsterOutContainer);

      //出口精灵
      this.outSprite = new PIXI.Sprite(
        res["static/images/game/radish/monsterOut.png"].texture
      );
      this.outSprite.anchor.set(0.5);
      this.outSprite.x = mWidth * 0.588;
      this.outSprite.y = mHeight / 2;
      this.monsterOutContainer.addChild(this.outSprite);

      //眼睛动画
      let eyeArray = [
        res["static/images/game/radish/eyes1.png"].texture,
        res["static/images/game/radish/eyes2.png"].texture,
        res["static/images/game/radish/eyes3.png"].texture
      ];
      this.eyeAnimation = new PIXI.extras.AnimatedSprite(eyeArray);
      this.eyeAnimation.anchor.set(0.5);
      this.eyeAnimation.x = mWidth * 0.588;
      this.eyeAnimation.y = mHeight / 2;
      this.monsterOutContainer.addChild(this.eyeAnimation);

      this.eyeAnimation.animationSpeed = 0.05;
      this.eyeAnimation.play();
      this.drawMonsterConfig(res);
    },
    //绘制怪物
    drawMonsterConfig(res) {
      /**
       * 怪物移动的界限
       */
      let mainWidth = this.mainFuntionContainer.width;
      let mainHeight = this.mainFuntionContainer.height;
      let rules = [
        { y: 0 },
        { x: mainWidth * 0.14 },
        { y: mainHeight * 0.8 },
        { x: mainWidth * 0.63 },
        { y: mainHeight },
        { x: mainWidth },
        { y: mainHeight * 0.15 }
      ];
      let dragonBox = this.dragonBox;
      this.option = {
        wings: [],
        diesAfft: [], //
        monsoterTexture: res["static/images/game/radish/monster1.png"].texture,
        shadowTexture: res["static/images/game/radish/shadow.png"].texture,
        ghostTexture: [],
        rules: rules,
        dragonBox: dragonBox //存放小龙的容器
      };
      for (let i = 1; i < 9; i++) {
        this.option.wings.push(
          res[`static/images/game/radish/wing${i}.png`].texture
        );
      }
      for (let i = 1; i < 10; i++) {
        this.option.diesAfft.push(
          res[`static/images/game/radish/DeathEffects/${i}.png`].texture
        );
      }
      for (let i = 1; i < 5; i++) {
        this.option.ghostTexture.push(
          res[`static/images/game/radish/ghost${i}.png`].texture
        );
      }
      //怪物的起始位置 和大小
      this.monStartX = 0;
      this.monStartY = 340;
    },
    //绘制答题区域的答题板
    drawAnwser(res) {
      let _self = this;
      let cardBox = this.answerBoardBox;
      //答题卡类
      class AnswerCard extends PIXI.Container {
        constructor() {
          super();
          this.id = null;
          this.onComplete = null;
          this.init();
        }
        init() {
          this.frame = new PIXI.Sprite(
            res["static/images/game/radish/answerBoard.png"].texture
          );
          this.frame.x = 0;
          this.frame.y = 0;
          this.addChild(this.frame);
          this.error = new PIXI.Sprite(
            res["static/images/game/public/answerError.png"].texture
          );
          this.right = new PIXI.Sprite(
            res["static/images/game/public/answerRight.png"].texture
          );
          this.error.anchor.set(0.5);
          this.right.anchor.set(0.5);
          this.error.x = this.right.x = this.width / 2;
          this.error.y = this.right.y = this.height / 2;

          this.anwserText = new PIXI.Text("", {
            fontSize: 44,
            fill: 0x7c88ff,
            fontWeight: 700,
            align: "center",
            wordWrap: true,
            wordWrapWidth: this.frame.width
          });
          this.anwserText.anchor.set(0.5);
          this.anwserText.x = this.frame.width / 2;
          this.anwserText.y = this.frame.height / 2;
          this.addChild(this.anwserText);

          this.addChild(this.error);
          this.addChild(this.right);
          this.error.visible = false;
          this.right.visible = false;

          this.addSprite = new PIXI.Sprite(
            res["static/images/game/public/addScore.png"].texture
          );
          this.subSprite = new PIXI.Sprite(
            res["static/images/game/public/subScore.png"].texture
          );
          this.addSprite.x = this.frame.width - this.addSprite.width;
          this.subSprite.x = this.frame.width - this.subSprite.width;
          this.addSprite.y = this.subSprite.y = 10;
          this.addSprite.visible = this.subSprite.visible = false;
          this.addChild(this.addSprite);
          this.addChild(this.subSprite);
        }
        scourceAnimation(target) {
          target.x = this.frame.width - this.addSprite.width;
          target.y = 10;
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
              target = null;
            }
          };
          animation();
        }
        answerRight() {
          this.right.visible = true;
          this.scourceAnimation(this.addSprite);
          this.remove();
        }
        answerError() {
          this.error.visible = true;
          this.scourceAnimation(this.subSprite);
          this.remove();
        }
        setText(text, id) {
          (text = text || ""), (id = id || -100);
          this.anwserText.text = text;
          this.id = id;
        }
        resver() {
          if (this.right.visible) this.right.visible = false;
          if (this.error.visible) this.error.visible = false;
        }
        remove() {
          let timer = setTimeout(() => {
            this.resver();
            if (!_self.isPause) {
              cardBox.interactiveChildren = true;
            }
            clearTimeout(timer);
            timer = null;
          }, 1000);
        }
      }
      //生成所有答题卡
      let warpValue = 0; //  换行中间值
      let that = this;
      for (let i = 0; i < 4; i++) {
        let anCard = new AnswerCard();
        warpValue = warpValue % 2 === 0 ? 0 : warpValue;
        anCard.x = 20 + warpValue * 308 + warpValue * 30;
        anCard.y = i < 2 ? 145 : 145 + 164;
        warpValue++;
        this.answerBoardBox.addChild(anCard);
        this.allCard.push(anCard);
        // anCard.onComplete = this.anwserComplete;
        anCard.interactive = true;
        anCard.on("tap", this.handAnswerTap);
        anCard = null;
      }
      this.answerBoardBox.interactiveChildren = false;
    },
    //创建题目
    createTopic(left, right, answer) {
      //left和right 分别是答案左侧文字，答案右侧文字 和正确答案的文字
      left = left || "";
      right = right || "";
      answer = answer || "";
      let puzzleWidth = this.puzzleBoard.width;
      let puzzleHeight = this.puzzleBoard.height;
      if (this.ToppicBox.children.length !== 0) {
        //如果有子元素，则清空
        this.ToppicBox.removeChildren();
      }

      let textStyle = {
        //文本样式
        fontSize: 48,
        fill: 0x7c88ff,
        fontWeight: 700,
        align: "center"
      };
      let leftTextBox = new PIXI.Container();

      let rightTextBox = new PIXI.Container();
      leftTextBox.height = rightTextBox.height = puzzleHeight;
      leftTextBox.y = rightTextBox.y = 0;
      let leftText = new PIXI.Text(left, textStyle);
      let rightText = new PIXI.Text(right, textStyle);
      //设置左右两边文字的位置
      leftText.x = 0;
      leftText.y = puzzleHeight / 2.5;
      rightText.x = 0;
      rightText.y = puzzleHeight / 2.5;
      this.ToppicBox.addChild(leftTextBox);
      this.ToppicBox.addChild(rightTextBox);
      leftTextBox.addChild(leftText);
      rightTextBox.addChild(rightText);

      this.answerText = new PIXI.Text(answer, {
        fontSize: 48,
        fill: 0xff0000,
        fontWeight: 700
      });
      this.answerText.visible = false;
      let height = this.answerText.height,
        width = this.answerText.width;
      this.answerText.anchor.set(0.5);
      this.answerText.x = width * 0.75;
      this.answerText.y = puzzleHeight / 2 + height / 4;
      let container = new PIXI.Container();
      container.width = width * 1.5;
      container.height = puzzleHeight;
      container.x = puzzleWidth / 2 - width * 1.5 / 2;
      container.y = 0;
      this.ToppicBox.addChild(container);

      container.addChild(this.answerText);

      let graphics = new PIXI.Graphics();
      graphics.x = 0;
      graphics.y = 55;
      graphics.beginFill(0x7c88ff);
      graphics.lineStyle(2, 0x7c88ff, 1);
      graphics.moveTo(0, height);
      graphics.lineTo(width * 1.5, height);
      graphics.endFill();
      container.addChild(graphics);

      //设置左右两边文字的位置
      leftTextBox.x = puzzleWidth / 2 - width * 0.8 - leftText.width;

      rightTextBox.x = puzzleWidth / 2 + width * 0.8;
    },
    //答题卡的点击事件处理函数
    handAnswerTap(e) {
      if (!this.currWord) return;
      let word = this.currWord;
      this.answerBoardBox.interactiveChildren = false;
      let card = e.currentTarget;
      if (card.id === word.id) {
        this.currWordSound.pause();
        card.answerRight();
        this.normalBox.visible = false;
        this.luanchBox.visible = true;
        this.star.visible = true;
        this.currIndex++;
        soundManage.addScore.play();
        this.combatMonster();
        this.answerText.visible = true;
        userScore += ADD_SOURCE;
        userTapCount = 0;
      } else {
        if (userScore <= 0) {
          userScore = 0;
        } else {
          userScore -= SUB_SOURCE;
        }
        card.answerError();
        soundManage.anwserError.play();

        userTapCount++;
        if (userTapCount === 2) {
          this.currIndex++;
          setTimeout(() => {
            this.next();
          }, 500);
          userTapCount = 0;
        } else {
          setTimeout(() => {
            if (this.currWordSound && this.currWordSound.paused) {
              this.currWordSound.play();
            }
          }, 800);
        }
        this.wrongWords.add(word.id);
      }
      this.glodText.text = userScore;
    },
    next() {
      //下一题
      if (this.currIndex < this.words.length) {
        let word = this.currWord;
        let distracter = word.distracter;
        this.targetText.text = `${this.currIndex + 1} / ${this.words.length}`;
        this.createTopic(word.left, word.right, word.anwser); //绘制题目
        this.allCard.forEach((card, index) => {
          //绘制答案
          let dis = distracter[index];
          card.setText(dis.text, dis.id);
        });
        this.currWordSound.play();
        if (!this.isPause) {
          this.answerBoardBox.interactiveChildren = true;
        }
      } else {
        this.gameOver();
      }
    },
    //让怪物出现
    appearMonater() {
      let monsterA = this.randMonster();
      monsterA && monsterA.startMove();
    },
    //产生随机怪物
    randMonster() {
      let res = this.loader.resources;
      let index = Math.floor(Math.random() * 7 + 1);
      if (!res) return;
      let monTexture = res[`static/images/game/radish/monster${index}.png`];
      if (!monTexture) return;
      this.option.monsoterTexture = monTexture.texture;
      let monsterA = new Monster(this.option);
      // monsterA.mID = count++;
      monsterA.x = this.monStartX;
      monsterA.y = this.monStartY;
      monsterA.moveComplete = this.moveComplete;
      monsterA.init();
      MovingMonster.push(monsterA);
      this.mainFuntionContainer.addChildAt(monsterA, 3);
      return monsterA;
    },
    //怪物移动完毕.即游戏结束
    moveComplete() {
      this.storeNormal.visible = false;
      this.storeDie.visible = true;
      this.dieTween();
      userScore = 0;
      this.gameOver();
    },

    //暂停所有正在移动的怪物
    pauseAllMonster() {
      if (MovingMonster.length !== 0) {
        for (let monster of MovingMonster) {
          monster.stopMove();
        }
      }
    },
    //开始所有正在移动的怪物
    startAllMonster() {
      if (MovingMonster && MovingMonster.length > 0) {
        for (let monster of MovingMonster) {
          monster.startMove();
        }
      }
    },
    //计算两个精灵的坐标差距
    calcDis(p1, p2) {
      let x = p1.x - (p2.x + p2.width / 2), //x的差值
        y = p1.y - p2.y, //y的差值
        directionX = x > 0 ? -1 : 1, //x的方向
        directionY = y > 0 ? -1 : 1; //y的方向
      return {
        x: Math.abs(x),
        y: Math.abs(y),
        dirX: directionX,
        dirY: directionY
      };
    },
    //打击怪物动画
    combatMonster() {
      let currMonster; //存储即将要打击的怪物
      let point;
      let _self = this;
      if (MovingMonster.length !== 0) {
        currMonster = MovingMonster.shift(); //如果有怪物正在移动就大怪物
      } else {
        //否则打击老巢
        currMonster = this.monsterOutContainer;
      }
      point = this.calcDis(this.star, currMonster);
      let speed = this.disPerMove(point); //确定星星的速度
      this.comID = requestAnimationFrame(combat);
      function combat() {
        _self.comID = requestAnimationFrame(combat);
        point = _self.calcDis(_self.star, currMonster);
        if (!_self.judgeStar(_self.star, currMonster)) {
          _self.star.x += speed.vx * point.dirX;
          _self.star.y += speed.vy * point.dirY;
        } else {
          cancelAnimationFrame(_self.comID);
          _self.tapMonAfter(currMonster);
          soundManage.hitSound.play();
          let timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            _self.next();
          }, 900);
        }
      }
    },
    //击中怪物后的处理函数
    tapMonAfter(monster) {
      this.normalBox.visible = true;
      this.luanchBox.visible = false;
      if (monster !== this.monsterOutContainer) {
        monster.curr = 0;
        monster.borderMove = 0;
        monster.stopMove();
        monster.handleAfteEffect(); //死亡特效
      }
      this.appearMonater();

      this.star.visible = false;
      this.star.x = this.starSiteX;
      this.star.y = this.starSiteY;
    },
    //计算每次运动的距离
    disPerMove(point) {
      //point是应该移动的距离和方向
      const perSpeedX = point.x / (400 / 16.7),
        perSpeedY = point.y / (400 / 16.7); //每帧应该移动的距离

      return {
        vx: perSpeedX * 5,
        vy: perSpeedY * 5
      };
    },
    //判断星星是否和怪物相撞
    judgeStar(star, p) {
      if (p !== this.monsterOutContainer) {
        //判断是不是打击的老巢
        if (star.x < p.x + p.width / 2 && star.y < p.y + p.height / 2) {
          return true; //碰撞
        }
        return false;
      } else {
        if (star.x < p.x + p.width / 2) {
          return true;
        }
        return false;
      }
    },
    //游戏结束，小龙死亡动画,小魂上升
    dieTween() {
      let _self = this;
      let speedX = -0.02;
      let speedY = -0.1;
      let alpha = -0.01;
      this.drgonDieID = requestAnimationFrame(tween);
      function tween() {
        _self.drgonDieID = requestAnimationFrame(tween);
        _self.dragonDie2.x += speedX;
        _self.dragonDie2.y += speedY;
        _self.dragonDie2.alpha += alpha;
        if (_self.dragonDie2.alpha <= 0) {
          cancelAnimationFrame(_self.drgonDieID);
        }
      }
    },
    gameOver() {
      if (window.plus) {
        soundManage.backgroundSound.stop();
        soundManage.backgroundSound = plus.audio.createPlayer(
          this.allSound.backgroundSound
        );
      }
      this.pauseBox.interactive = false;
      this.goBack.interactive = false;
      this.wordSound = null;
      this.answerBoardBox.interactiveChildren = false;
      this.pauseAllMonster();
      this.pause();
      this.overPopups.show();
      this.showOverPopups = true;
      let wrongWords = Array.from(this.wrongWords);
      this.$emit("postResult", wrongWords, userScore, true);
    },
    //随机出现几个怪物
    randAppearMonter() {
      if (this.isPause) {
        return;
      }
      for (let index = 0; index < 5; index++) {
        let timer = setTimeout(() => {
          if (!this.isPause && MovingMonster.length < 3) {
            this.appearMonater();
          }
          clearTimeout(timer);
          timer = null;
        }, 1000 * index);
      }
    },
    player() {
      soundManage.backgroundSound = plus.audio.createPlayer(
        this.allSound.backgroundSound
      );
      soundManage.backgroundSound.play(this.player);
    },
    begin() {
      if (window.plus) {
        soundManage.backgroundSound.play(this.player);
      }
      this.pauseBox.interactive = true;
      this.goBack.interactive = true;
      this.isReady = false;
      MovingMonster = [];
      this.randAppearMonter();
      this.next();
      this.play();
    }
  },
  beforeDestroy() {
    this.isPause = true;
    this.$store.commit("setLearningBack", true);
    this.$store.commit("setIsGameing", false);
    if (window.plus) {
      soundManage.backgroundSound.stop();
    }
    // for(let key in soundManage){
    //   if(soundManage[key]){
    //     soundManage[key].unload()
    //   }
    // }
    soundManage = {};
    // if(this.resumeTimer){
    //   console.log("-----------------定时器已清除")
    //   clearInterval(this.resumeTimer)
    //   this.resumeTimer = null;
    // }
    MovingMonster.forEach(monster => {
      if (monster) {
        console.log("-----------------清除了怪物");
        monster.stopMove();
        monster.destroy();
      }
    });
    MovingMonster = [];
    userScore = 0;
    this.loader && this.loader.destroy();
    this.overPopups && this.overPopups.destroy();
    this.backBox && this.backBox.destroy();
    this.app && this.app.destroy(true);
  },
  components: {
    GameLoading
  }
};
</script>

<style scoped>
.radish {
  height: 100vh;
  width: 100vw;
}
</style>
