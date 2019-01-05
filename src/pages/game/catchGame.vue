<template>
  <div id="catchGame">
    <gameLoading v-if='showLoading' :progress='progress'></gameLoading>
    <audio ref="readySound" :src="sounds.readySound" preload="auto"></audio>
    <audio ref="goSound" :src="sounds.goSound" preload="auto"></audio>
    <audio ref="addScore" :src="sounds.addScore" preload="auto"></audio>
    <audio ref="delScore" :src="sounds.delScore" preload="auto"></audio>
  </div>
</template>

<script >
import * as PIXI from "pixi.js";
import "pixi-sound";
import _ from "lodash";
import utility from "@/utility/utility";
import { TASK_SCORE_TYPE } from "@/utility/dict";
import { Sprite } from "@/utility/game";
import Container from "@/game/Container";
import gameLoading from "@/components/gameLoading";
import GameOverPopups from "@/game/gameSettlementPopups";
import GameBackCfm from "@/game/gameBack";
import OptBar from "./children/optBar";
import Cloud from "@/game/Cloud";
import Catch from "@/game/catch";
import testWords from "@/game/testWord";
import Howl from "howler";
import sono from "sono";

let overPage = null; //游戏结束页面

export default {
  props: ["playResult","isLast"],
  data() {
    return {
      progress: 0,
      showLoading: true,
      wrongWords: [],
      imgRoot: "static/images/game/catch/",
      imgBooRoot:"static/images/game/catch/boo/",
      imgHiRoot:"static/images/game/catch/hi/",
      flashRoot:"static/images/game/catch/effects/",
      imgPublicRoot: "static/images/game/public/",
      imgType: ".png",
      publicImgs: [
        "addScore", 
        "subScore",
        "ready",
        "go"
        ],
      spriteImgs: [
        "bg",
        "1",
        "2",
        "3",
        "4",
        "5",
        "cloud1",
        "cloud2",
        "cloud3",
        "cloud4",
        "cloud5",
        "z1",
        "z2",
        "z3",
        "z4",
        "z5",
        "z11",
        "z22",
        "z33",
        "z44",
        "z55",
      ],
      booImages:[
        "b1",
        "b2",
        "b3",
        "b4",
        "b5",
        "b6",
        "b7",
        "b8",
        "b9",
        "b10",
        "b11",
        "b12",
        "b13",
        "b14",
        "b15",
      ],
      hiImages:[
        "d1",
        "d2",
        "d3",
        "d4",
        "d5",
        "d6",
        "d7",
        "d8",
        "d9",
      ],
      flashImgs:[
        "11",
        "22",
        "33",
        "44",
        "55",
        "66",
        "77",
      ],
      redImgs:[
        "red/hong1",
        "red/hong2",
        "red/hong3",
        "red/hong4",
        "red/hong5",
        "red/hong6",
        "red/hong7",
        "red/hong8",
      ],
      yellowImgs:[
        "yellow/h1",
        "yellow/h2",
        "yellow/h3",
        "yellow/h4",
        "yellow/h5",
        "yellow/h6",
        "yellow/h7",
        "yellow/h8",
      ],
      blueImgs:[
        "blue/lan1",
        "blue/lan2",
        "blue/lan3",
        "blue/lan4",
        "blue/lan5",
        "blue/lan6",
        "blue/lan7",
        "blue/lan8",
      ],
      greenImgs:[
        "green/lv1",
        "green/lv2",
        "green/lv3",
        "green/lv4",
        "green/lv5",
        "green/lv6",
        "green/lv7",
        "green/lv8",
      ],
      purpleImgs:[
        "purple/zi1",
        "purple/zi2",
        "purple/zi3",
        "purple/zi4",
        "purple/zi5",
        "purple/zi6",
        "purple/zi7",
        "purple/zi8",
      ],
      sounds: {
        bgSound:"_www/static/audio/catchBgMusic.mp3",
        addScore:"static/audio/addScore.mp3",
        delScore:"static/audio/picError.mp3",
        readySound:"static/audio/ready.mp3",
        goSound:"static/audio/go.mp3",
      },
      wordList:[],//本单元单词数组
      cloudAnimates: [],
      ballAnimates:[],//气球运动数组
      loader: null,
      optBar: null,
      app: null,
      bgSound: null,
      readySound:null,
      goSound:null,
      rightSound:null,
      errorSound: null,

      addScore:null,//加分精灵
      delScore:null,//减分精灵
      returnCfm: null,
      scoreDialog: null,
      flashAnimate:null,
      createBallTime:null,
      basket1:null,
      basket2:null,
      basket3:null,
      basket4:null,
      basket5:null,
      basketContainer1:null,//篮框前遮罩容器
      basketContainer2:null,
      basketContainer3:null,
      basketContainer4:null,
      basketContainer5:null,
      BooAnimate1:null,//爆炸动画
      BooAnimate2:null,
      BooAnimate3:null,
      BooAnimate4:null,
      BooAnimate5:null,
      hiAnimate:null,
      redAnimate:null,
      yellowAnimate:null,
      greenAnimate:null,
      blueAnimate:null,
      purpleAnimate:null,
      ready:null,
      go:null,
      readyMove:null,
      goMove:null,


      score: 0,
      currStep:0,
      allStep:0,
      playing: false,
      showReturnCfm:false,

      deviceConfig: {
        width: 1080,
        height: 1920
      },
      showScoreDialog: false,
      isReady:false,
      };
    },
    mounted() {
      this.createAudio();
      this.createGameApp();
      this.loadResource();
    },
    computed: {
      wordsList: function () {
        // let words = _.cloneDeep(testWords || []);
        let words = _.cloneDeep(this.$store.getters.flowWords || []);
        let wordsArray = [];
        for (let i = 0; i < words.length; i++) {//去除短语
          let wordSort = [];//单词 词性
          if (words[i].wordSort !== "") {
            wordSort = words[i].wordSort.split(",");//将词性 字符串拆分为数组
            words[i].wordSort = wordSort;
            wordsArray.push(words[i]);
          }
        }
        console.log("---------------去除短语后的单词", wordsArray);
        return wordsArray;
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
          this.showReturnCfm || this.play();
        }
    }
  },
  methods:{
    createAudio: function() {

      if(window.plus){
        this.bgSound = plus.audio.createPlayer(this.sounds.bgSound);
      }
      this.readySound = this.$refs.readySound;
      this.goSound = this.$refs.goSound;
      this.rightSound = this.$refs.addScore;
      this.rightSound.onpause=()=>{
        this.rightSound.load();
      };
      this.errorSound = this.$refs.delScore;
      this.errorSound.onpause=()=>{
        this.errorSound.load();
      }
    },
    createGameApp: function() {
      let app = new PIXI.Application({
        width: this.deviceConfig.width,
        height: this.deviceConfig.height,
        antialias: true,
        transparent: true,
        clearBeforeRender: true,
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
      this.allStep=this.wordsList.length;
      this.wordList=_.cloneDeep(this.wordsList);

      
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
      // 加载闪电柱动画图片
      this.flashImgs.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.flashRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      // 加载小龙 hi 动画图片
      this.hiImages.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgHiRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      // 加载气球爆炸动画图片
      this.booImages.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgBooRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      // 加载气球飞走动画图片 红
      this.redImgs.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      // 加载气球飞走动画图片 黄
      this.yellowImgs.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
       // 加载气球飞走动画图片 蓝
      this.blueImgs.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
       // 加载气球飞走动画图片 绿
      this.greenImgs.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
       // 加载气球飞走动画图片 紫
      this.purpleImgs.forEach(item => {
        if (!loader.resources[item]) {
          let itemPath = this.imgRoot + item + this.imgType;
          loader.add(item, itemPath);
        }
      });
      loader.on("progress", e => {
        this.progress = Math.floor(e.progress);
      });
      loader.on("complete", e => {
        this.$el.appendChild(this.app.view);
        this.showLoading = false;

        this.createStage();
        this.gameReady();
      });
      this.optBar = new OptBar({
        loader: this.loader,
        duration: 180,
        currStep: this.currStep,
        stepCount: this.allStep,
        onPause: this.pause,
        onPlay: this.play,
        onReturn: this.quitClick,
        onOver: this.end,
        score: this.score
      });

      loader.load();
    },
    createStage: function() {
      let stage = this.app.stage;
      // 添加主背景
      let resources = this.loader.resources;
      let backgroundImage = new Sprite({
        texture: resources["bg"].texture,
        x: 0,
        y: 0
      });
      stage.addChild(backgroundImage);

      // 添加精灵~云
      let clouds = [
        { name: "cloud1", x: 300, y: 30, speed: 0.6, scale: 1 },
        { name: "cloud2", x: 600, y: 60, speed: 0.8, scale: 1 },
        { name: "cloud3", x: 1000, y: 180, speed: 1, scale: 1 },
        { name: "cloud4", x: 1500, y: 140, speed: 1.2, scale: 1 },
        { name: "cloud5", x: 1600, y: 200, speed: 0.9, scale: 1 }
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

      //添加闪电柱动画
      let flashImg = [];
      this.flashImgs.forEach(item => {
        flashImg.push(resources[item].texture);
      });
      this.flashAnimate = new PIXI.extras.AnimatedSprite(flashImg);
      this.flashAnimate.loop=true;
      this.flashAnimate.animationSpeed = 0.35;
      stage.addChild(this.flashAnimate);
      
      // 添加操作条
      this.optBar.init(stage);
      //添加篮筐
      this.createBasket();

      //添加遮蔽层及词性
      this.createHidden();
      this.createAnimateSprite();
      //添加加分 减分图片精灵
      this.addScore = new Sprite({
        texture: resources["addScore"].texture,
        x: 500,
        y: 850
      });
      this.addScore.visible=false;
      stage.addChild(this.addScore);

      //添加加分 减分图片精灵
      this.delScore = new Sprite({
        texture: resources["subScore"].texture,
        x: 500,
        y: 850
      });
      this.delScore.visible=false;
      stage.addChild(this.delScore);
      // console.log("---------------this.app.stage",this.app.stage.children);
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

      stage.addChild(this.returnCfm);
      stage.addChild(this.scoreDialog);
      this.$store.commit('setIsGameing', true);
    },

    createBasket:function(){
      let stage = this.app.stage;
      let resources = this.loader.resources;
      this.basket1 = new Sprite({
        texture: resources["z1"].texture,
        x: 0,
        y: 0
      });
      this.basket1.anchor.x=0.5;
      this.basket2 = new Sprite({
        texture: resources["z2"].texture,
        x: 0,
        y: 0
      });
      this.basket2.anchor.x=0.5;
      this.basket3 = new Sprite({
        texture: resources["z3"].texture,
        x: 0,
        y: 0
      });
      this.basket3.anchor.x=0.5;
      this.basket4 = new Sprite({
        texture: resources["z4"].texture,
        x: 0,
        y: 0
      });
      this.basket4.anchor.x=0.5;
      this.basket5 = new Sprite({
        texture: resources["z5"].texture,
        x: 0,
        y: 0
      });
      this.basket5.anchor.x=0.5;
      stage.addChild(this.basket1, this.basket2, this.basket3, this.basket5, this.basket4);
      this.basket1.position.set(520, 1080 - this.basket1.height);
      this.basket2.position.set(770, 1080 - this.basket2.height);
      this.basket3.position.set(970, 1080 - this.basket3.height);
      this.basket4.position.set(1180, 1080 - this.basket4.height);
      this.basket5.position.set(1410, 1080 - this.basket5.height);
    },

    createHidden:function(){
      let stage = this.app.stage;
      let resources = this.loader.resources;
      //创建接球框遮罩容器
      let basketContainer1=new PIXI.Container();
      let basketContainer2=new PIXI.Container();
      let basketContainer3=new PIXI.Container();
      let basketContainer4=new PIXI.Container();
      let basketContainer5=new PIXI.Container();

      //创建 接球框1  遮挡面
      let basket11 = new Sprite({
        texture: resources["z11"].texture,
        x:0,
        y:0
      });
      //创建 接球框2  遮挡面
      let basket22 = new Sprite({
        texture: resources["z22"].texture,
        x:0,
        y:0
      });
      //创建 接球框3  遮挡面
      let basket33 = new Sprite({
        texture: resources["z33"].texture,
        x:0,
        y:0
      });
      //创建 接球框4  遮挡面
      let basket44 = new Sprite({
        texture: resources["z44"].texture,
        x:0,
        y:0
      });
      //创建 接球框5  遮挡面
      let basket55 = new Sprite({
        texture: resources["z55"].texture,
        x:0,
        y:0
      });

      basketContainer1.addChild(basket11);
      basketContainer2.addChild(basket22);
      basketContainer3.addChild(basket33);
      basketContainer4.addChild(basket44);
      basketContainer5.addChild(basket55);

      basketContainer1.position.set(350, 1080 - basket11.height);
      basketContainer2.position.set(650, 1080 - basket22.height);
      basketContainer3.position.set(865, 1080 - basket33.height);
      basketContainer4.position.set(1065, 1080 - basket44.height);
      basketContainer5.position.set(1255, 1080 - basket55.height);
      //定义词性文字样式
      let style = new PIXI.TextStyle({
        fontFamily: "Microsoft YaHei",
        fontSize: 52,
        fontWeight: "bold",
        fill: ["#FFFFFF"],
        stroke: "#D93C05",
        strokeThickness: 4
      });
      // 名词
      let noun = new PIXI.Text("名词", style);
      noun.anchor.x=0.5;
      noun.x=basket11.width/2;
      noun.y=basket11.height/2; 
      // 动词
      let verb = new PIXI.Text("动词", style);
      verb.anchor.x=0.5;
      verb.x=basket22.width/2;
      verb.y=basket22.height/2;
      // 形容词
      let adjectives = new PIXI.Text("形容词", style);
      adjectives.anchor.x=0.5;
      adjectives.x=basket33.width/2;
      adjectives.y=basket33.height/2;
      // 副词
      let adverbs = new PIXI.Text("副词", style);
      adverbs.anchor.x=0.5;
      adverbs.x=basket44.width/2;
      adverbs.y=basket44.height/2;
      // 其他
      let others = new PIXI.Text("其他", style);
      others.anchor.x=0.5;
      others.x=basket55.width/2;
      others.y=basket55.height/2;

      basketContainer1.addChild(noun);
      basketContainer2.addChild(verb);
      basketContainer3.addChild(adjectives);
      basketContainer4.addChild(adverbs);
      basketContainer5.addChild(others);
      

      this.basketContainer1=basketContainer1;
      this.basketContainer2=basketContainer2;
      this.basketContainer3=basketContainer3;
      this.basketContainer4=basketContainer4;
      this.basketContainer5=basketContainer5;
      stage.addChild(this.basketContainer1,this.basketContainer2,this.basketContainer3,this.basketContainer5,this.basketContainer4);
    },
    createBall:function(){
      let stage = this.app.stage;
      let resources = this.loader.resources;
      let optionX=[520,770,970,1180,1410];
      let m=Math.floor(Math.random()*optionX.length);
      let ballContainer=new Catch({
        loader:this.loader,
        x: optionX[m],
        y: 0,
        speed: 2,
        stage: this.app.stage,
        list:this.wordList,
        ballAnimates:this.ballAnimates,
        basket1:this.basket1,
        basket2:this.basket2,
        basket3:this.basket3,
        basket4:this.basket4,
        basket5:this.basket5,
        
        checkHit1:this.checkHit1,
        checkHit2:this.checkHit2,
        checkHit3:this.checkHit3,
        checkHit4:this.checkHit4,
        checkHit5:this.checkHit5,

        redAnimate:this.redAnimate,
        yellowAnimate:this.yellowAnimate,
        greenAnimate:this.greenAnimate,
        blueAnimate:this.blueAnimate,
        purpleAnimate:this.purpleAnimate,
      })
      this.ballAnimates.push(ballContainer);
      this.app.stage.setChildIndex(ballContainer,22) 
    },

    addScorePlay:function(){
      this.addScore.visible=true;
      let timer=setInterval(()=>{
        this.addScore.alpha-=0.1;
        if(this.addScore.alpha<=0){
          this.addScore.visible=false;
          this.addScore.alpha=1;
          clearInterval(timer);
        }
      },100);
    },
    delScorePlay:function(){
      this.delScore.visible=true;
      let timer=setInterval(()=>{
        this.delScore.alpha-=0.1;
        if(this.delScore.alpha<=0){
          this.delScore.visible=false;
          this.delScore.alpha=1;
          clearInterval(timer);
        }
      },100);
    },
    checkHit1:function(A){
      // console.log("---------------checkHit1",A);
      if(A){
        
        this.score+=10;
        this.currStep++;
        this.rightSound&&this.rightSound.play();
        this.hiAnimate.gotoAndPlay(0);
        this.BooAnimate1.visible=true;
        this.BooAnimate1.gotoAndPlay(0);
        let that=this;
        this.BooAnimate1.onComplete=function(){
          that.BooAnimate1.visible=false;
        }
        this.addScore.x=500;
        this.addScorePlay();
      }else{
        this.errorSound&&this.errorSound.play();
        this.redAnimate.play();
        this.delScore.x=500;
        this.delScorePlay();
        if(this.score>=5){
          this.score-=5;
        }else{
          this.score=0;
        }
      }
      this.optBar.updateScore(this.score);
      this.optBar.updateCurrStep(this.currStep);
      if(this.currStep>=this.allStep){
        this.end();
      }
    },
    checkHit2:function(B){
      // console.log("---------------checkHit2",B);
      if(B){
        this.score+=10;
        this.currStep++;
        this.rightSound&&this.rightSound.play();
        this.hiAnimate.gotoAndPlay(0);
        this.BooAnimate2.visible=true;
        this.BooAnimate2.gotoAndPlay(0);
        let that=this;
        this.BooAnimate2.onComplete=function(){
          that.BooAnimate2.visible=false;
        }
        this.addScore.x=700;
        this.addScorePlay();
      }else{
        this.delScore.x=700;
        this.delScorePlay();
        this.errorSound&&this.errorSound.play();
        if(this.score>=5){
          this.score-=5;
        }else{
          this.score=0;
        }
      }
      this.optBar.updateScore(this.score);
      this.optBar.updateCurrStep(this.currStep);
      if(this.currStep>=this.allStep){
        this.end();
      }
    },
    checkHit3:function(C){
      // console.log("---------------checkHit3",C);
      if(C){
        this.score+=10;
        this.currStep++;
        this.rightSound&&this.rightSound.play();
        this.hiAnimate.gotoAndPlay(0);
        this.BooAnimate3.visible=true;
        this.BooAnimate3.gotoAndPlay(0);
        let that=this;
        this.BooAnimate3.onComplete=function(){
          that.BooAnimate3.visible=false;
        }
        this.addScore.x=900;
        this.addScorePlay();
      }else{
        this.delScore.x=900;
        this.delScorePlay();
        this.errorSound&&this.errorSound.play();
        if(this.score>=5){
          this.score-=5;
        }else{
          this.score=0;
        }
      }
      this.optBar.updateScore(this.score);
      this.optBar.updateCurrStep(this.currStep);
      if(this.currStep>=this.allStep){
        this.end();
      }
    },
    checkHit4:function(D){
      // console.log("---------------checkHit4",D);
      if(D){
        this.score+=10;
        this.currStep++;
        this.rightSound&&this.rightSound.play();
        this.hiAnimate.gotoAndPlay(0);
        this.BooAnimate4.visible=true;
        this.BooAnimate4.gotoAndPlay(0);
        let that=this;
        this.BooAnimate4.onComplete=function(){
          that.BooAnimate4.visible=false;
        }
        this.addScore.x=1100;
        this.addScorePlay();
      }else{
        this.delScore.x=1100;
        this.delScorePlay();
        this.errorSound&&this.errorSound.play();
        if(this.score>=5){
          this.score-=5;
        }else{
          this.score=0;
        }
      }
      this.optBar.updateScore(this.score);
      this.optBar.updateCurrStep(this.currStep);
      if(this.currStep>=this.allStep){
        this.end();
      }
    },
    checkHit5:function(E){
      // console.log("---------------checkHit5",E);
      if(E){
        this.score+=10;
        this.currStep++;
        this.rightSound&&this.rightSound.play();
        this.hiAnimate.gotoAndPlay(0);
        this.BooAnimate5.visible=true;
        this.BooAnimate5.gotoAndPlay(0);
        let that=this;
        this.BooAnimate5.onComplete=function(){
          that.BooAnimate5.visible=false;
        }
        this.addScore.x=1340;
        this.addScorePlay();
      }else{
        this.delScore.x=1340;
        this.delScorePlay();
        this.errorSound&&this.errorSound.play();
        if(this.score>=5){
          this.score-=5;
        }else{
          this.score=0;
        }
      }
      this.optBar.updateScore(this.score);
      this.optBar.updateCurrStep(this.currStep);
      if(this.currStep>=this.allStep){
        this.end();
      }
    },
    createAnimateSprite:function(){
      let resources = this.loader.resources;
      let hiImg=[];
      this.hiImages.forEach(item => {
        hiImg.push(resources[item].texture);
      });
      this.hiAnimate = new PIXI.extras.AnimatedSprite(hiImg);
      this.hiAnimate.loop = false;
      this.hiAnimate.x = 680;
      this.hiAnimate.y = 350;
      this.hiAnimate.animationSpeed = 0.13;
      this.hiAnimate.visible=true;
      this.app.stage.addChild(this.hiAnimate);
      this.app.stage.setChildIndex(this.hiAnimate,5);

      let redImg=[];
      this.redImgs.forEach(item => {
        redImg.push(resources[item].texture);
      });
      this.redAnimate = new PIXI.extras.AnimatedSprite(redImg);
      this.redAnimate.loop = false;
      this.redAnimate.x = -300;
      this.redAnimate.y = 700;
      this.redAnimate.animationSpeed = 0.13;
      this.redAnimate.visible=false;
      this.app.stage.addChild(this.redAnimate);


      let yellowImg=[];
      this.yellowImgs.forEach(item => {
        yellowImg.push(resources[item].texture);
      });
      this.yellowAnimate = new PIXI.extras.AnimatedSprite(yellowImg);
      this.yellowAnimate.loop = false;
      this.yellowAnimate.x = -70;
      this.yellowAnimate.y = 700;
      this.yellowAnimate.animationSpeed = 0.13;
      this.yellowAnimate.visible=false;
      this.app.stage.addChild(this.yellowAnimate);

      let blueImg=[];
      this.blueImgs.forEach(item => {
        blueImg.push(resources[item].texture);
      });
      this.blueAnimate = new PIXI.extras.AnimatedSprite(blueImg);
      this.blueAnimate.loop = false;
      this.blueAnimate.x = 150;
      this.blueAnimate.y = 700;
      this.blueAnimate.animationSpeed = 0.13;
      this.blueAnimate.visible=false;
      this.app.stage.addChild(this.blueAnimate);

      let greenImg=[];
      this.greenImgs.forEach(item => {
        greenImg.push(resources[item].texture);
      });
      this.greenAnimate = new PIXI.extras.AnimatedSprite(greenImg);
      this.greenAnimate.loop = false;
      this.greenAnimate.x = 350;
      this.greenAnimate.y = 700;
      this.greenAnimate.animationSpeed = 0.13;
      this.greenAnimate.visible=false;
      this.app.stage.addChild(this.greenAnimate);

      let purpleImg=[];
      this.purpleImgs.forEach(item => {
        purpleImg.push(resources[item].texture);
      });
      this.purpleAnimate = new PIXI.extras.AnimatedSprite(purpleImg);
      this.purpleAnimate.loop = false;
      this.purpleAnimate.x = 600;
      this.purpleAnimate.y = 700;
      this.purpleAnimate.animationSpeed = 0.13;
      this.purpleAnimate.visible=false;
      this.app.stage.addChild(this.purpleAnimate);
      

      let Imgs1 = [];
      this.booImages.forEach(item => {
        Imgs1.push(resources[item].texture);
      });
      let Imgs2 = [];
      this.booImages.forEach(item => {
        Imgs2.push(resources[item].texture);
      });
      let Imgs3 = [];
      this.booImages.forEach(item => {
        Imgs3.push(resources[item].texture);
      });
      let Imgs4 = [];
      this.booImages.forEach(item => {
        Imgs4.push(resources[item].texture);
      });
      let Imgs5 = [];
      this.booImages.forEach(item => {
        Imgs5.push(resources[item].texture);
      });


      this.BooAnimate1 = new PIXI.extras.AnimatedSprite(Imgs1);
      this.BooAnimate2 = new PIXI.extras.AnimatedSprite(Imgs2);
      this.BooAnimate3 = new PIXI.extras.AnimatedSprite(Imgs3);
      this.BooAnimate4 = new PIXI.extras.AnimatedSprite(Imgs4);
      this.BooAnimate5 = new PIXI.extras.AnimatedSprite(Imgs5);

      this.BooAnimate1.loop = false;
      this.BooAnimate1.x = 0;
      this.BooAnimate1.y = -150;
      this.BooAnimate1.animationSpeed = 0.35;
      this.BooAnimate1.visible=false;

      this.BooAnimate2.loop = false;
      this.BooAnimate2.x = -50;
      this.BooAnimate2.y = -150;
      this.BooAnimate2.animationSpeed = 0.35;
      this.BooAnimate2.visible=false;

      this.BooAnimate3.loop = false;
      this.BooAnimate3.x = -50;
      this.BooAnimate3.y = -150;
      this.BooAnimate3.animationSpeed = 0.35;
      this.BooAnimate3.visible=false;

      this.BooAnimate4.loop = false;
      this.BooAnimate4.x = -50;
      this.BooAnimate4.y = -150;
      this.BooAnimate4.animationSpeed = 0.35;
      this.BooAnimate4.visible=false;

      this.BooAnimate5.loop = false;
      this.BooAnimate5.x = -10;
      this.BooAnimate5.y = -150;
      this.BooAnimate5.animationSpeed = 0.35;
      this.BooAnimate5.visible=false;

      this.basketContainer1.addChild(this.BooAnimate1);
      this.basketContainer2.addChild(this.BooAnimate2);
      this.basketContainer3.addChild(this.BooAnimate3);
      this.basketContainer4.addChild(this.BooAnimate4);
      this.basketContainer5.addChild(this.BooAnimate5);
    },
    
    gameReady:function(){
      let stage = this.app.stage;
      let resources = this.loader.resources;
      let ready = new Sprite({
        texture: resources["ready"].texture,
        x:900,
        y:600
      });
      ready.anchor.set(0.5);
      stage.addChild(ready);

      let scale = 1;   
      // this.readyMove=requestAnimationFrame(scaleMove) && this.readySound.play();
      this.readyMove=requestAnimationFrame(scaleMove);
      this.readySound && this.readySound.play();
      let that=this;
      function scaleMove() {
        that.readyMove=requestAnimationFrame(scaleMove);
        scale+=0.02;
        ready.scale.set(scale);
      }
      this.isReady = true;
      let onceTimer = setTimeout(() => {
        this.gameGo();
        clearTimeout(onceTimer);
        onceTimer=null;
      },2000)

      this.ready=ready;
      console.log("--------------this.stage",this.app.stage);
    },
    gameGo:function(){
      let stage = this.app.stage;
      let resources = this.loader.resources;
      if(this.readyMove){
        cancelAnimationFrame(this.readyMove);
        this.readyMove = null;
        stage.removeChild(this.ready);
      }
      let go = new Sprite({
        texture: resources["go"].texture,
        x:900,
        y: 600
      });
      go.anchor.set(0.5);
      stage.addChild(go);

      let scale = 1;
      
      // this.goMove=requestAnimationFrame(scaleMove) && this.goSound.play();;
      this.goMove = requestAnimationFrame(scaleMove) ;
      this.goSound&&this.goSound.play();
      let that=this;
      function scaleMove() {
        that.goMove=requestAnimationFrame(scaleMove);
        scale+=0.02;
        go.scale.set(scale);
      }

      let onceTimer=setTimeout(()=>{
        cancelAnimationFrame(this.goMove);
        stage.removeChild(go);  
        this.begin();
        clearTimeout(onceTimer);
        onceTimer=null;
      },800)
    },  

    begin: function () {
      console.log(this.loader.resources);
      this.optBar.play();
      this.isReady = false;
      this.play();
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
    play: function() {
      console.log("-----play");
      if(this.resumeTimer){
        clearInterval(this.resumeTimer);
      }
      this.playing = true;
      this.flashAnimate.play();
      this.optBar.play();
      // this.bgSound.play();
    
      this.bgSound&&this.bgSound.play(this.player);
      // console.log(this.bgSound);
      this.cloudAnimates.forEach(item => {
        item.play();
      });
      //生成气球
      let createBallTime=setInterval(()=>{
        this.createBall();
      },4000);
      this.createBallTime=createBallTime;
      //气球移动
      this.ballAnimates.forEach(item => {
        item.play();
      });
    },
    pause: function() {
      console.log("-----pause");
      // this.resumeTimer = setInterval(()=>{
      //   this.resumeSound.play()
      // }, 10000);
      this.playing = false;
      this.bgSound&&this.bgSound.stop();
      if(window.plus){
        this.bgSound = plus.audio.createPlayer(this.sounds.bgSound);
      }
      this.optBar.pause();
      // console.log("-----bgSound pause");
      this.cloudAnimates.forEach(item => {
        item.stop();
      });
      //气球停止
      clearInterval(this.createBallTime);
      this.ballAnimates.forEach(item=>{
        item.stop();
      });
    },
    quitClick: function() {
      // this.$router.go(-1);
      this.pause();
      this.showReturnCfm = true;
      this.$store.commit('setDialogShowing', true);
      this.returnCfm.show();
    },
    showRanks: function() {},
    goBack: function() {
      this.$router.go(-1);
    },
    playAgain: function() {
      this.currStep = 0;
      this.score = 0;
      this.wrongWords = [];
      //将屏幕上的气球清除掉 同时 将气球运动数组清空
      for (let i = 0; i < this.ballAnimates.length; i++) {
        this.app.stage.removeChild(this.ballAnimates[i]);
      }
      this.ballAnimates = [];
      this.optBar.reset();
      this.showScoreDialog = false;
      this.wordList=_.cloneDeep(this.wordsList);
      
      // this.scoreDialog.reset();
      // this.begin();
      this.gameReady();
    },
    playNext:function(){
      this.$emit("next");
    }
  },
  beforeDestroy() {
    // 释放资源
    console.log("-------arrgame destory start");
    this.$store.commit("setLearningBack", true);
    this.$store.commit('setIsGameing', false);
    // if(this.resumeTimer){
    //   clearInterval(this.resumeTimer);
    // }
    this.bgSound&&this.bgSound.stop();
    // this.bgSound.pause();
    // this.bgSound.unload();
    // this.rightSound.unload();
    // this.errorSound.unload();
    console.log("-----loader destroy");
    this.loader && this.loader.destroy();
    this.cloudAnimates.forEach(item => {
      item && item.destroy();
    });
    this.ballAnimates.forEach(item => {
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
    gameLoading
  }
};
</script>

<style lang='scss' scoped>
#catchGame {
  height: 100%;
  width: 100%;
}
</style>
