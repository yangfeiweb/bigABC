<template>
  <div id="arrowGame">
    <gameLoading v-if='showLoading' :progress='progress'></gameLoading>
    <audio ref="wordSound" :src="currWord.voiceUrl" preload="auto"></audio>
    <audio ref="readySound" :src="sounds.readySound" preload="auto"></audio>
    <audio ref="goSound" :src="sounds.goSound" preload="auto"></audio>
    <audio ref="rightSound" :src="sounds.rightSound" preload="auto"></audio>
    <audio ref="errorSound" :src="sounds.errorSound" preload="auto"></audio>
    <audio ref="boonSound" :src="sounds.boonSound" preload="auto"></audio>
  </div>
</template>

<script >
import * as PIXI from "pixi.js";
import Sound from "pixi-sound";
import _ from "lodash";
import utility from "@/utility/utility";
import { Sprite } from "@/utility/game";
import Container from "@/game/Container";
import gameLoading from "@/components/gameLoading";
import GameOverPopups from "@/game/gameSettlementPopups";
import GameBackCfm from "@/game/gameBack";
import FlyBar from "./children/flyBar";
import Cloud from "@/game/Cloud";
import Letter from "@/game/letter";
import Bird from "@/game/bird";
import testWords from "@/game/testWord";
import Howl from "howler";
import sono from "sono";
import { TASK_SCORE_TYPE } from "@/utility/dict";

let overPage = null; //游戏结束页面

export default {
  props: ["playResult","isLast"],
  data() {
    return {
      imgRoot: "static/images/game/fly/",
      imgPublicRoot: "static/images/game/public/",
      imgType: ".png",
      publicImgs: ["addScore", "subScore", "ready", "go"],
      spriteImgs: [
        "sky",
        "cloud1",
        "cloud2",
        "cloud3",
        "cloud4",
        "frontCloud",
        "heart",
        "heartBg",
        "bird"
      ],
      boonImgsL: [
        //左侧气球爆炸
        "left/1",
        "left/2",
        "left/3",
        "left/4"
      ],
      boonImgsC: [
        //中间气球爆炸
        "center/1",
        "center/2",
        "center/3",
        "center/4"
      ],
      boonImgsR: [
        //右侧气球爆炸
        "right/1",
        "right/2",
        "right/3",
        "right/4"
      ],
      ballImg: [
        //气球图片
        "ball/ball1",
        "ball/ball2",
        "ball/ball3",
        "ball/dragon",
        "ball/basket"
      ],
      popImg: [
        //棒棒糖图片
        "pop/1",
        "pop/2",
        "pop/3",
        "pop/4",
        "pop/5"
      ],
      wordImg: [
        //单词 字母图片
        "word/a",
        "word/b",
        "word/c",
        "word/d",
        "word/e",
        "word/f",
        "word/g",
        "word/h",
        "word/i",
        "word/j",
        "word/k",
        "word/l",
        "word/m",
        "word/n",
        "word/o",
        "word/p",
        "word/q",
        "word/r",
        "word/s",
        "word/t",
        "word/u",
        "word/v",
        "word/w",
        "word/x",
        "word/y",
        "word/z"
      ],
      sounds: {
        bgSound: "_www/static/audio/flyBg.mp3",
        errorSound: "static/audio/flyError.mp3",
        rightSound: "static/audio/addScore.mp3",
        boonSound: "static/audio/tapMouse.mp3",
        readySound: "static/audio/ready.mp3",
        goSound: "static/audio/go.mp3",
      },

      cloudAnimates: [],
      wrongWords: [],
      letterArray: [],
      wordArray: [],
      visibleArray:[],//未点亮的字母
      visibleIndex:0,//已经点亮的字母下标
      wordAnimates: [],
      birdAnimates: [],

      app: null,
      loader: null,
      flyBar: null,
      createLetterTime: null,
      createBirdTime: null,
      cloudContainer: null,
      frontBg: null,
      returnCfm: null,
      basketContainer: null,
      ballL: null,
      ballC: null,
      ballR: null,
      basketDown: null,
      heartContainer: null,
      bigContainer: null,
      imgContainer: null,
      hitIndex: null,
      disturb: null,
      nowWord: null,
      bgSound: null,
      readySound: null,
      goSound: null,
      rightSound: null,
      errorSound: null,
      boonSound: null,
      wordSound: null,

      leftBoonAnimate: null,
      centerBoonAnimate: null,
      rightBoonAnimate: null,
      addScore: null,
      ready: null,
      go: null,
      readyMove: null,
      goMove: null,

      showLoading: true,
      playing: false,

      progress: 0,
      errorTimes: 0,
      errorNumber: 0,
      score: 0,
      currStep: 0,
      showNumber: 0, //撞击字母后  上方字母 显示的数量
      hitBirdTimes: 0, //撞击鸟的次数
      showReturnCfm: false,
      deviceConfig: {
        width: 1080,
        height: 1920
      },
      showScoreDialog: false,
      isReady: false
    };
  },
  created() {
  },
  mounted() {
    this.createAudio();
    // this.createAudio();
    this.createGameApp();
    this.loadResource();
    this.newWord();
  },
  computed: {
    wordList: function() {
      let words = _.cloneDeep(this.$store.getters.currFlowStepWords || []);
      // let words = _.cloneDeep(testWords || []);
      words.forEach(word => {
        let randomWords = utility.sortArrByRandom(words);
        let reg = /[\s|-|… ]/g;
        word.word = word.word.replace(reg, "");

        word.options = [
          {
            id: word.id,
            word: word.word,
            imgUrl: word.imgUrl,
            chinese: word.chinese
          }
        ];
        if(randomWords.length>1){
          for (let i = 0; i < randomWords.length; i++) {
            let randomItem = randomWords[i];
            randomItem.word = randomItem.word.replace(reg, "");
            if (randomItem.id !== word.id) {
              word.options.push({
                id: randomItem.id,
                word: randomItem.word,
                imgUrl: randomItem.imgUrl,
                chinese: randomItem.chinese
              });
              if (word.options.length == 2) {
                break;
              }
            }
          }
          word.options = utility.sortArrByRandom(word.options);
        }else{
            let randomItem = randomWords[0];
            randomItem.word = randomItem.word.replace(reg, "");
            word.options.push({
              id: 0,
              word: 'null',
              imgUrl: null,
              chinese: '干扰'
            });
          word.options = utility.sortArrByRandom(word.options);
        }
      });
      console.log("------words", words);
      return words;
    },
    currWord: function() {
      return (this.wordList && this.wordList[this.currStep]) || {};
    },
    currWordSound() {
      return this.$refs.wordSound
    },
    showReturn() {
      return this.$store.getters.flowType === TASK_SCORE_TYPE.unit;
    }
  },
  watch: {
    playResult: function(val) {
      console.log("---------val", val);
      if (val && this.scoreDialog) {
        this.scoreDialog.setData(val);
      }
    },
    "$store.getters.dialogShowing": function(val) {
      if(this.showScoreDialog){
        this.$emit('close');
      }else{
        if(!this.isReady){
          if (val === false && this.showReturnCfm == true) {
            this.showReturnCfm = false;
            this.returnCfm.hide();
            this.play();
          } else if (val && this.showReturnCfm == false) {
            this.showReturnCfm = true;
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
         this.showScoreDialog || this.showReturnCfm  ||　this.play();
        }
      }
  },
  methods: {
    createAudio: function() {
      if(window.plus){
        this.bgSound = plus.audio.createPlayer(this.sounds.bgSound);
      }
      this.readySound = this.$refs.readySound;
      this.goSound = this.$refs.goSound;
      this.rightSound = this.$refs.rightSound;
      this.rightSound.onpause=()=>{
        this.rightSound.load();
      };
      this.errorSound = this.$refs.errorSound;
      this.errorSound.onpause=()=>{
        this.errorSound.load();
      };
      this.boonSound = this.$refs.boonSound;
      this.boonSound.onpause=()=>{
        this.boonSound.load();
      };
    },
    createGameApp: function() {
      let app = new PIXI.Application({
        width: this.deviceConfig.width,
        height: this.deviceConfig.height,
        antialias: true,
        transparent: true,
        clearBeforeRender: true
        // forceCanvas: true
      });
      app.stage.rotation = Math.PI / 2;
      app.stage.x = this.deviceConfig.width;
      app.backgroundColor = 0x222fff;
      app.view.style.width = "100%";
      app.view.style.height = "100%";
      this.app = app;
    },
    // 加载图片文件、声音文件、引入游戏组件
    loadResource: function() {
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
      //加载棒棒糖图片
      this.popImg.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      //加载气球、篮筐图片
      this.ballImg.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      // 加载左侧爆炸动画图片
      this.boonImgsL.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      // 加载中间爆炸动画图片
      this.boonImgsC.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      // 加载右侧爆炸动画图片
      this.boonImgsR.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      // 加载字母图片
      this.wordImg.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      //加载单词图片
      this.wordList.forEach(word => {
        loader.add(word.imgUrl);
      });
      if(this.wordList.length>1){
        for (let val of this.wordList) {
          //加载英文单词读音
          let key = "wordSound" + val.id
          if (!loader.resources[key]) {
            loader.add(key, val.voiceUrl);
          }
        }
      }else{
        //加载英文单词读音
        let key = "wordSound" + this.wordList[0].id
        if (!loader.resources[key]) {
          loader.add(key, this.wordList[0].voiceUrl);
        }
      }


      loader.on("progress", e => {
        this.progress = Math.floor(e.progress);
      });
      loader.on("complete", e => {
        this.showLoading = false;

        this.createStage();
        // this.begin();
        this.gameReady();
      });

      this.flyBar = new FlyBar({
        loader: this.loader,
        onPause: this.pause,
        onPlay: this.play,
        onReturn: this.quitClick,
        onOver: this.end,
        list: this.wordList,
        currStep: this.currStep,
        wordArray: this.wordArray,
        NowWord: this.NowWord,
        getBigContainer: this.getBigContainer,
      });
      loader.load();
    },
    newWord: function() {
      this.NowWord = this.wordList[this.currStep].word.toLowerCase();
      for (let i = 0; i < this.NowWord.length; i++) {
        this.wordArray.push(this.NowWord.slice(i, i + 1));
      }
      console.log("--------this.wordArray11111", this.wordArray);
      this.visibleArray=_.cloneDeep(this.wordArray);//已经未点亮的字母
    },
    createStage: function() {
      let stage = this.app.stage;

      this.app.view.style.width = "100%";
      this.app.view.style.height = "100%";
      this.$el.appendChild(this.app.view);

      let list = this.wordList;

      // 添加主背景
      let resources = this.loader.resources;
      let skyImage = new PIXI.extras.TilingSprite(
        resources["sky"].texture,
        1920,
        1080
      );
      stage.addChild(skyImage);

      // 添加精灵~云
      let clouds = [
        { name: "cloud1", x: 0, y: 350, speed: 0.6, scale: 1 },
        { name: "cloud2", x: 100, y: 270, speed: 0.8, scale: 1 },
        { name: "cloud3", x: 250, y: 350, speed: 1, scale: 1 },
        { name: "cloud4", x: 900, y: 300, speed: 1.3, scale: 1 },
        { name: "cloud1", x: 1300, y: 310, speed: 1.6, scale: 1 },
        { name: "cloud2", x: 1880, y: 320, speed: 2, scale: 1 }
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

      //添加云层背景
      this.createCloudSprite(0, 720);
      //添加 上部功能条
      this.flyBar.init(stage);
      //添加 下部生命值
      this.createHeart();
      //添加气球篮框
      this.createBasket();
      //添加气球爆炸动画
      this.createAnimateSprite();

      //添加加分 减分图片精灵
      this.addScore = new Sprite({
        texture: resources["addScore"].texture,
        x: 1250,
        y: 30
      });
      this.addScore.visible = false;
      stage.addChild(this.addScore);

      //单词干扰项
      this.disturb = list[this.currStep].options;
      for (let i = 0; i < this.disturb.length; i++) {
        let disturbWord = this.disturb[i].word.toLowerCase();
        console.log("-------------disturbWord"+disturbWord);
        for (let j = 0; j < disturbWord.length; j++) {
          this.letterArray.push(disturbWord.slice(j, j + 1));
        }
      }
      // this.createDisturb();

      //引用组件
      this.returnCfm = new GameBackCfm();
      this.returnCfm.cancelCallback = () => {
        this.showReturnCfm = false;
        this.$store.commit("setDialogShowing", false);
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

      stage.addChild(this.returnCfm);
      stage.addChild(this.scoreDialog);
      // this.readAgin();
      this.$store.commit("setIsGameing", true);
    },
    createDisturb: function() {
      //单词干扰项
      this.disturb = this.wordList[this.currStep].options;
      for (let i = 0; i < this.disturb.length; i++) {
        let disturbWord = this.disturb[i].word.toLowerCase();
        console.log("-------------------------disturbWord"+disturbWord);
        for (let j = 0; j < disturbWord.length; j++) {
          this.letterArray.push(disturbWord.slice(j, j + 1));
        }
      }
      console.log("-----------this.letterArray", this.letterArray);
    },
    createCloudSprite: function(x, y) {
      let resources = this.loader.resources;
      this.cloudContainer = new PIXI.Container();
      this.cloudContainer.x = x;
      this.cloudContainer.y = y;
      let frontCloud1 = new Sprite({
        texture: resources["frontCloud"].texture,
        x: 0,
        y: 0
      });
      this.cloudContainer.addChild(frontCloud1);

      let frontCloud2 = new Sprite({
        texture: resources["frontCloud"].texture,
        x: frontCloud1.width,
        y: 0
      });
      this.cloudContainer.addChild(frontCloud2);
      this.app.stage.addChild(this.cloudContainer);

      // 云层上的棒棒糖精灵
      for (let i = 0; i < 5; i++) {
        let pop = new Sprite({
          texture: resources[`pop/${i + 1}`].texture,
          x: frontCloud1.width * 0.2 + i * (frontCloud1.width * 0.18),
          y: 0
        });
        this.cloudContainer.addChild(pop);
      }
      for (let i = 0; i < 5; i++) {
        let pop = new Sprite({
          texture: resources[`pop/${i + 1}`].texture,
          x: 2150 + frontCloud1.width * 0.2 + i * (frontCloud1.width * 0.18),
          y: 0
        });
        this.cloudContainer.addChild(pop);
      }
      this.cloudContainer.children[3].y = 100;
      this.cloudContainer.children[8].y = 100;
      this.cloudContainer.children[5].y = 80;
      this.cloudContainer.children[10].y = 80;
      // console.log("-------------------this.cloudContainer",this.cloudContainer);
    },
    frontCloudMove: function() {
      let that = this;
      //云在移动
      that.frontBg = requestAnimationFrame(cloudMove);
      function cloudMove() {
        let cloudSpeed = 0.5;
        that.frontBg = requestAnimationFrame(cloudMove);
        that.cloudContainer.x -= cloudSpeed * 2;
        if (that.cloudContainer.x <= -2150) {
          that.cloudContainer.x = 0;
        }
      }
    },
    createHeart: function() {
      let resources = this.loader.resources;
      let heartBg = new Sprite({
        //生命背景
        texture: resources["heartBg"].texture,
        x: 0,
        y: 975
      });
      this.app.stage.addChild(heartBg);
      let heartContainer = new PIXI.Container();
      heartContainer.y = 995;
      heartContainer.x = 10;
      this.app.stage.addChild(heartContainer);

      for (let i = 0; i < 10; i++) {
        let heart = new Sprite({
          //生命精灵
          texture: resources["heart"].texture,
          x: 0,
          y: 0
        });
        heart.x = i * 68 + 13;
        heartContainer.addChild(heart);
      }
      this.heartContainer = heartContainer;
    },
    createBasket: function() {
      // let basketContainer = this.basketContainer;
      let resources = this.loader.resources;
      this.basketContainer = new PIXI.Container(); //篮框容器
      this.basketContainer.x = 280;
      this.basketContainer.y = 400;
      this.app.stage.addChild(this.basketContainer);
      //篮框
      let basket = new Sprite({
        texture: resources["ball/basket"].texture,
        x: 0,
        y: 0
      });
      this.basketContainer.addChild(basket);
      //气球左
      this.ballL = new Sprite({
        texture: resources["ball/ball1"].texture,
        x: 0,
        y: 0
      });
      this.basketContainer.addChild(this.ballL);
      //气球右
      this.ballR = new Sprite({
        texture: resources["ball/ball2"].texture,
        x: 0,
        y: 0
      });
      this.basketContainer.addChild(this.ballR);
      //龙
      let dragon = new Sprite({
        texture: resources["ball/dragon"].texture,
        x: 0,
        y: 0
      });
     this.basketContainer.addChild(dragon);
      //气球中间
      this.ballC = new Sprite({
        texture: resources["ball/ball3"].texture,
        x: 0,
        y: 0
      });
      this.basketContainer.addChild(this.ballC);

      this.app.stage.interactive = true;
      this.app.stage.on("tap", e => {
        this.basketMove();
      });

      // this.basketContainer = basketContainer;
    },

    basketMove: function() {
        if(this.playing){
        let positionY = this.basketContainer.y;
        let currentTime = 0;
        let beginVal = 0;
        let endVal = 250;
        let duration = 500;
        let _self = this;
        let reqID = requestAnimationFrame(step);
        function step() {
          let dis = _self.jumpLine(currentTime, beginVal, endVal, duration);
          if (currentTime <= duration) {
            if(_self.basketContainer.y<=0){
              _self.basketContainer.y = 0;
            }else{
              reqID = requestAnimationFrame(step);
              _self.basketContainer.y = positionY - dis;

            }
          } else {
            cancelAnimationFrame(reqID);
          }
          currentTime += 16.7;
        }
        }
    },
    jumpLine: function(t, b, c, d) {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },

    createAnimateSprite: function() {
      let resources = this.loader.resources;
      let leftImgs = [];
      this.boonImgsL.forEach(item => {
        leftImgs.push(resources[item].texture);
      });
      let centerImgs = [];
      this.boonImgsC.forEach(item => {
        centerImgs.push(resources[item].texture);
      });
      let rightImgs = [];
      this.boonImgsR.forEach(item => {
        rightImgs.push(resources[item].texture);
      });
      this.leftBoonAnimate = new PIXI.extras.AnimatedSprite(leftImgs);
      this.centerBoonAnimate = new PIXI.extras.AnimatedSprite(centerImgs);
      this.rightBoonAnimate = new PIXI.extras.AnimatedSprite(rightImgs);

      this.leftBoonAnimate.loop = false;
      this.leftBoonAnimate.x = 0;
      this.leftBoonAnimate.y = 15;
      this.leftBoonAnimate.animationSpeed = 0.35;
      this.leftBoonAnimate.visible = false;

      this.centerBoonAnimate.loop = false;
      this.centerBoonAnimate.x = 50;
      this.centerBoonAnimate.y = 0;
      this.centerBoonAnimate.animationSpeed = 0.35;
      this.centerBoonAnimate.visible = false;

      this.rightBoonAnimate.loop = false;
      this.rightBoonAnimate.x = 100;
      this.rightBoonAnimate.y = 15;
      this.rightBoonAnimate.animationSpeed = 0.35;
      this.rightBoonAnimate.visible = false;

      this.basketContainer.addChild(
        this.leftBoonAnimate,
        this.centerBoonAnimate,
        this.rightBoonAnimate
      );
    },

    createLetter: function() {
      let resources = this.loader.resources;
      console.log("-------this.letterArray", this.letterArray);
      let optionY = [200, 230, 350, 500, 530, 650, 800, 850];
      let m = Math.floor(Math.random() * optionY.length);
      let n = Math.floor(Math.random() * this.letterArray.length);
      let newLetter = new Letter({
        texture: resources[`word/${this.letterArray[n]}`].texture,
        x: 1910,
        y: optionY[m],
        speed: 25,
        letter: this.letterArray[n],
        stage: this.app.stage,
        wordAnimates: this.wordAnimates,
        basketContainer: this.basketContainer,
        wordArray: this.wordArray,
        checkWord: this.checkWord
      });

      this.wordAnimates.push(newLetter);
      this.app.stage.addChild(newLetter);
      this.app.stage.setChildIndex(newLetter, 16);
      // console.log("---------this.wordAnimates",this.wordAnimates);
      console.log("----------this.app.stage", this.app.stage);
    },

    createBird: function() {
      let resources = this.loader.resources;
      let birdY = [200, 500, 650, 850];
      let m = Math.floor(Math.random() * birdY.length);
      let newBird = new Bird({
        texture: resources["bird"].texture,
        x: 1910,
        y: birdY[m],
        speed: 25,
        stage: this.app.stage,
        birdAnimates: this.birdAnimates,
        basketContainer: this.basketContainer,
        checkHitBird: this.checkHitBird
      });
      this.birdAnimates.push(newBird);
      this.app.stage.addChild(newBird);
      this.app.stage.setChildIndex(newBird, 16);
    },

    checkWord: function(A) {
      let resources = this.loader.resources;
      console.log("-------------------checkWord A",A);
      //判断数组中是否含有所吃到的字母
      let isRight = false;

      for (let i = 0; i < this.wordArray.length; i++) {
        if (this.wordArray[i] === A) {
          this.hitIndex = i;
          isRight = true;
          let hitLetter = this.bigContainer.children[this.hitIndex].children[1];
          if (!hitLetter.visible) {
            hitLetter.visible = true;
            this.showNumber++;

            //当显示的字母数量少于2个时  增加 剩下字母出现概率
            
            if(this.visibleArray.length>3){
              console.log("----------------点亮的删除前",this.visibleArray);
              if(this.visibleArray.find((s,index)=>{
                this.visibleIndex=index;
                return s===A;
              })){
                this.visibleArray.splice(this.visibleIndex,1);
                console.log("-------------------点亮的删除后",this.visibleArray);
              }
            }else{
              this.letterArray=this.letterArray.concat(this.visibleArray);
              console.log("-------------拼接后",this.letterArray);
            }
            break;
          }
        }

      }

      if (isRight) {
        this.rightSound.play();
        this.right();
      } else { 
        this.errorSound.play();

        this.errorNumber++;
        // console.log("---------this.errorNumber",this.errorNumber);
        let x = 10 - this.errorNumber;
        this.heartContainer.children[x].visible = false;
        if (x <= 0) {
          this.end();
        }

        this.errorSound.onpause=()=>{
          this.error();
        }
      }
    },
    getBigContainer: function(A, B) {
      //获取到flyBar.js中的bigContainer
      this.bigContainer = A;
      this.imgContainer = B;
      this.imgContainer.interactive = true;
      this.imgContainer.on("tap", e => {
        e.stopPropagation();
        // this.wordSound.play();
        if (this.currWordSound && this.currWordSound.paused) {
          this.currWordSound.play();
        }
      });
    },
    checkHitBird: function(A) {
      //获取到bird.js中 是否撞击到bird
      let isHitBird = A;
      if (isHitBird) {
        this.hitBirdTimes++;
        this.boonSound.play();
        console.log("------this.hitBirdTimes", this.hitBirdTimes);
        if (this.hitBirdTimes == 1) {
          this.rightBoonAnimate.visible = true;
          this.rightBoonAnimate.gotoAndPlay(0);
          let that = this;
          this.rightBoonAnimate.onComplete = function() {
            that.rightBoonAnimate.visible = false;
          };
          this.basketContainer.removeChild(this.ballR);
        } else if (this.hitBirdTimes == 2) {
          this.centerBoonAnimate.visible = true;
          this.centerBoonAnimate.gotoAndPlay(0);
          let that = this;
          this.centerBoonAnimate.onComplete = function() {
            that.centerBoonAnimate.visible = false;
          };
          this.basketContainer.removeChild(this.ballL);
        } else if (this.hitBirdTimes == 3) {
          this.leftBoonAnimate.visible = true;
          this.leftBoonAnimate.gotoAndPlay(0);
          let that = this;
          this.leftBoonAnimate.onComplete = function() {
            that.leftBoonAnimate.visible = false;
          };
          this.basketContainer.removeChild(this.ballC);

          this.end();
        }
      }
    },

    right: function() {
      console.log("------------------------this.app.stage", this.app.stage);
      // console.log("------------this.bigContainer",this.bigContainer);
      // console.log("------------this.bigContainer.children[this.hitIndex]",this.bigContainer.children[this.hitIndex]);

      if (this.showNumber >= this.wordArray.length) {
        console.log("----------next");
        this.score += 10;
        this.addScore.visible = true;
        let timer = setInterval(() => {
          this.addScore.alpha -= 0.1;
          if (this.addScore.alpha <= 0) {
            this.addScore.visible = false;
            this.addScore.alpha = 1;
            clearInterval(timer);
          }
        }, 100);
        this.next();
      }
      // }
    },
    error: function() {
      console.log("-----错了");

      // this.wordSound.play();
      if (this.currWordSound && this.currWordSound.paused) {
        this.currWordSound.play();
      }
      
    },
    gameReady: function() {
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
        // requestAnimationFrame(scaleMove) && this.readySound.play();
        requestAnimationFrame(scaleMove);
        this.readySound && this.readySound.play();
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
    gameGo: function() {
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

      this.goMove = requestAnimationFrame(scaleMove) ;
      this.goSound&&this.goSound.play();
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

    next: function() {
      this.currStep++;
      this.showNumber = 0;
      this.letterArray = [];
      this.wordArray = [];
      this.bigContainer.removeChildren();
      this.imgContainer.removeChildren();
      if (this.currStep >= this.wordList.length) {
        this.end();
      }else{
        this.newWord();
        this.flyBar.updateCurrStep(this.wordArray, this.currStep);
        this.createDisturb();
  
        console.log("------------------this.currStep", this.currStep);
        console.log("--------game----this.wordArray22222", this.wordArray);
  
        setTimeout(() => {
          // this.playing == true && this.wordSound.play();
          this.playing == true;
          if (this.currWordSound && this.currWordSound.paused) {
            this.currWordSound.play();
          }
  
        }, 1200);
      }
       
    },

    begin: function() {
      console.log(this.loader.resources);
      // this.wordSound = new Howl.Howl({
      //   src: [this.currWord.voiceUrl],
      //   autoplay: true
      // });

      this.flyBar.play();
      this.play();
      this.isReady = false
      // this.$refs.wordAudio.volume = 1;
    },
    end: function() {
      this.pause();
      this.scoreDialog.show();
      this.showScoreDialog = true
      console.log("-----end");
      this.$emit("postResult", this.wrongWords, this.score, true);
      // 提交结果，等待弹框
    },
    player(){
      if(window.plus){
        this.bgSound = plus.audio.createPlayer(this.sounds.bgSound);
        this.bgSound.play(this.player)
      }
    },
    play: function() {
      // if (this.resumeTimer) {
      //   clearInterval(this.resumeTimer);
      // }
      this.playing = true;
      this.flyBar.play();
      //背景音乐
      // this.bgSound.play();
      this.bgSound&&this.bgSound.play(this.player);
      // this.wordSound.play();
      if(this.playing && this.currWordSound){
        let playPromise = this.currWordSound.play();
      }

      this.cloudAnimates.forEach(item => {
        item.play();
      });
      //大云层移动
      this.frontCloudMove();
      //生成字母
      this.createLetterTime = setInterval(() => {
        this.createLetter();
      }, 2000);
      //字母移动
      this.wordAnimates.forEach(item => {
        item.play();
      });
      //生成小鸟
      this.createBirdTime = setInterval(() => {
        this.createBird();
      }, 10000);
      //小鸟移动
      this.birdAnimates.forEach(item => {
        item.play();
      });
      //小龙篮框移动
      this.app.stage.interactive = true;
      let vy = 15;
      let basketDown = requestAnimationFrame(basketMove);
      let that = this;
      function basketMove() {
        basketDown = requestAnimationFrame(basketMove);
        that.basketContainer.y += vy;
        if (that.basketContainer.y >= 1080 - that.basketContainer.height) {
          that.basketContainer.y = 1080 - that.basketContainer.height;
        }
        that.basketDown = basketDown;
      }
    },
    pause: function() {
      console.log("-----pause");

      this.playing = false;
      //字母停止移动
      clearInterval(this.createLetterTime);
      this.wordAnimates.forEach(item => {
        item.stop();
      });
      //小鸟停止
      clearInterval(this.createBirdTime);
      this.birdAnimates.forEach(item => {
        item.stop();
      });
      // 背景音乐停止
      this.bgSound&&this.bgSound.stop();
      if(window.plus){
        this.bgSound = plus.audio.createPlayer(this.sounds.bgSound);
      }
      this.flyBar.pause();
      console.log("-----bgSound pause");
      cancelAnimationFrame(this.frontBg);
      this.cloudAnimates.forEach(item => {
        console.log("-----item ", item);
        item.stop();
      });  
      
      //小龙篮筐停止
      // this.app.stage.interactive = false;
      // console.log("------------this.basketDown",this.basketDown);
      cancelAnimationFrame(this.basketDown);
    },
    quitClick: function() {
      // this.$router.go(-1);
      console.log("---------quitClick", this.returnCfm);
      this.pause();
      this.showReturnCfm = true;
      this.$store.commit("setDialogShowing", true);
      this.returnCfm.show();
    },
    showRanks: function() {},
    goBack: function() {
      this.$router.go(-1);
    },
    playNext: function() {
      this.$emit("next");
    },
    playAgain: function() {
      this.score=0;//分数归零
      this.hitBirdTimes = 0; //撞击鸟的次数 气球数量
      this.errorNumber = 0; //心 显示数量
      this.wrongWords = [];
      //将屏幕上的字母清除掉 同时 将字母运动数组清空
      for (let i = 0; i < this.wordAnimates.length; i++) {
        this.app.stage.removeChild(this.wordAnimates[i]);
      }
      this.wordAnimates = [];
      //将屏幕上的鸟清除掉 同时 将鸟运动数组清空
      if(this.birdAnimates.length>0){
        for (let i = 0; i < this.birdAnimates.length; i++) {
          this.app.stage.removeChild(this.birdAnimates[i]);
        }
        this.wordAnimates = [];
      }
      //将 心 重新显示
      for (let i = 0; i < this.heartContainer.children.length; i++) {
        this.heartContainer.children[i].visible = true;
      }
      this.wordArray = []; //本次所要玩的单词
      //重新生成篮框+动画
      this.app.stage.removeChild(this.basketContainer);
      this.createBasket();
      this.createAnimateSprite();
      //重新生成干扰项
      this.letterArray = []; //干扰项字母
      //重新生成上方显示单词+图片
      this.currStep = 0;
      this.createDisturb();
      this.showNumber = 0; //上方单词显示
      this.bigContainer.removeChildren();
      this.imgContainer.removeChildren();
      this.newWord();
      this.showScoreDialog = false
      this.flyBar.updateCurrStep(this.wordArray, this.currStep);
      this.flyBar.reset();
      // this.scoreDialog.reset();
      // this.begin();
      this.gameReady();
    }
  },

  beforeDestroy() {
    // 释放资源
    console.log("-------arrgame destory start");
    this.wordSound = null;
    this.$store.commit("setLearningBack", true);
    this.$store.commit("setIsGameing", false);
    this.bgSound&&this.bgSound.stop();

    console.log("-----loader destroy");
    this.loader && this.loader.destroy();
    this.cloudAnimates.forEach(item => {
      item && item.destroy();
    });
    this.wordAnimates.forEach(item => {
      item && item.destroy();
    });
    this.birdAnimates.forEach(item => {
      item && item.destroy();
    });
    console.log("-----flyBar destroy");
    this.flyBar.destroy();
    console.log("-----returnCfm destroy");
    this.returnCfm.destroy();
    console.log("-----scoreDialog destroy");
    this.scoreDialog.destroy();
    console.log("-----app destroy");
    this.app.destroy(true);
    console.log("-------arrgame destory end");
  },
  components: {
    gameLoading
  }
};
</script>

<style lang='scss' scoped>
#arrowGame {
  height: 100%;
  width: 100%;
}
</style>
