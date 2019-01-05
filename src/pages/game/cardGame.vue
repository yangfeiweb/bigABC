<template>
    <div class="card">
        <!-- <flowLoading  v-if="showProgress" :progress="progress"></flowLoading> -->
        <gameLoading v-if="showProgress" :progress="progress"></gameLoading>
        <audio ref="addScore" :src="sound.addScore" preload="auto"></audio>
        <audio ref="go" :src="sound.go" preload="auto"></audio>
        <audio ref="ready" :src="sound.ready" preload="auto"></audio>
    </div>
</template>

<script>
    import * as PIXI from "pixi.js"
    // import pixi_projection from "pixi-projection"
    import Card from '@/game/CardGame'
    import _ from 'lodash'
    import Howl from "howler";
    import words from "@/game/testWord"
    import gameLoading from '@/components/gameLoading'
    import flowLoading from '@/components/flowLoading'
    import GameOverPopups from '@/game/gameSettlementPopups'
    import GameBack from '@/game/gameBack'
    import OptBar from "./children/optBar";
    import { TASK_SCORE_TYPE } from "@/utility/dict"



    let GAME_TIME = 0; //游戏时长
    let allObject = {}; //保存游戏所有的对像
    let FirstTapTarget, SecondTapTarget; //保存两次点击的对象
    let userAnswerRight = 0  //用户翻对的卡牌数
    let userScore = 0;
    let soundManage = {};

    export default {
        props: ['playResult',"isLast"],
        data() {
            return {
                animationTexture: [], //卡牌特效
                revTextures: [],// 卡牌翻转动效
                showProgress: true,
                progress: 0,
                isPause: false,
                isFirst: true,
                currWordsIndex: 0,
                currInning: 0, //当前的局数
                sound: {
                    bgSound: "_www/static/audio/cardBgSound.mp3",
                    addScore: "static/audio/addScore.mp3",
                    go: "static/audio/go.mp3",
                    ready: "static/audio/ready.mp3",
                    resume: "static/audio/hi.mp3"
                },
                resumeTimer: null,
                showReturnCfm: false,
                showOverPopups: false,
                isReady:false
            }
        },
        computed: {
            words: function () {  //获取单词
                let words = _.cloneDeep(this.$store.getters.currFlowStepWords || []);
                return _.shuffle(words);
            },
            list: function () { //讲单词拆分成二维数组
                let len = this.words.length; //单词的长度
                let newWordsArr = []; //新的单词数组
                let num = Math.ceil(len / 5);
                for (let i = 0; i < num; i++) {
                    let arr = this.words.slice(i * 5, i * 5 + 5)
                    newWordsArr.push(arr);
                    arr = null;
                }
                return newWordsArr;
            },
            currWordsList: function () { //从二维数组中取出一组，生成当前游戏的卡牌
                let wordList = this.list[this.currInning];
                let list = [];
                if (wordList) {
                    wordList.forEach((word) => {
                        list.push({
                            id: word.id,
                            text: word.word,
                            isText: true
                        })
                        list.push({
                            id: word.id,
                            imgUrl: word.imgUrl,
                            isText: false
                        })
                    })
                    wordList = null;
                }

                return _.shuffle(list);
            },
            totalInnings: function () {  //总局数
                return this.list.length || 0;
            },
            totalCards: function () { //总卡牌数
                return this.list.length * 10 || 0
            },
            showReturn() {
                let type = this.$store.getters.flowType;
                return type === TASK_SCORE_TYPE.unit
            }
        },
        watch: {
            playResult: function (val) {
                if (val && allObject.overPopups) {
                    allObject.overPopups.setData(val);
                }
            },
            '$store.getters.dialogShowing': function (val) {
                if(this.showOverPopups){
                    this.$emit("close")
                }else{
                    if(!this.isReady){
                        if (val === false && this.showReturnCfm == true) {
                            this.showReturnCfm = false
                            allObject.backTipBox && allObject.backTipBox.hide();
                            this.play();
                        } else if (val && this.showReturnCfm == false) {
                            this.showReturnCfm = true
                            allObject.backTipBox && allObject.backTipBox.show();
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
            GAME_TIME = this.list.length * 50;
            this.deviceWh = {
                width: 1080, height: 1920,
            }
            this.createSound()
            this.createApp();
            this.loadResource();

            console.log("------------------------list", this.list)
        },
        methods: {
            createSound() {
                if (window.plus) {
                    soundManage.cardBgSound = plus.audio.createPlayer(this.sound.bgSound)

                }

                soundManage.addScore = this.$refs.addScore
                soundManage.addScore.onpause = ()=>{
                    soundManage.addScore.load() 
                }
                soundManage.go = this.$refs.go

                soundManage.ready = this.$refs.ready

                // soundManage.resume = new Howl.Howl({
                //     src:[this.sound.resume],
                //     volume:0.2
                // });

            },
            createApp() {
                this.app = new PIXI.Application({
                    width: this.deviceWh.width,
                    height: this.deviceWh.height,
                    antialias: true,
                    transparent: true,
                    clearBeforeRender: true,
                    // forceCanvas: true
                });
                this.app.stage.rotation = Math.PI / 2;
                this.app.backgroundColor = 0x222fff;
                this.app.stage.x = this.deviceWh.width;
                this.app.view.style.width = "100%";
                this.app.view.style.height = "100%";
            },
            loadResource() {
                let baseUrl = "static/images/game/card/";
                let type = ".png"
                let analogData = [
                    "background",
                    "cardFrame1",
                    "cardFrame2",
                    "cardFrame3",
                    "cardFrame4",
                    "cardFrame5",
                    "cardFrame6",
                    "cardFrame7",
                    "cardFrame8",
                    "cardFrame9",
                    "effects1",
                    "effects2",
                    "effects3",
                    "effects4",
                    "effects5",
                    "effects6",
                    "effects7",
                    "effects8",
                    "effects9",
                    "effects10",
                ]
                let publicUrl = "static/images/game/public/";
                let publicImg = [
                    "addScore",
                    "go",
                    "ready",
                ]

                this.loader = new PIXI.loaders.Loader();  //资源加载器
                this.loader.on("progress", ({ progress }) => {
                    this.progress = Math.floor(progress);
                });
                this.loader.on("complete", (loader, res) => {
                    this.$el.appendChild(this.app.view);
                    this.showProgress = false;
                    this.createStage(loader, res)
                    this.gameReady()
                });
                this.optBar = new OptBar({
                    loader: this.loader,
                    duration: GAME_TIME,
                    currStep: 1,
                    stepCount: this.words.length,
                    onPause: this.pause,
                    onPlay: this.play,
                    onReturn: this.goBack,
                    onOver: this.gameOver,
                    score: userScore
                });
                analogData.forEach((name) => {
                    if (!this.loader.resources[name]) {
                        let path = baseUrl + name + type
                        this.loader.add(name, path);
                    }
                })
                publicImg.forEach((name) => {
                    let key = "game_" + name
                    if (!this.loader.resources[key]) {
                        let path = publicUrl + name + type;
                        this.loader.add(key, path);
                    }
                })
                //加载单词的图片
                if (this.words.length !== 0) {
                    this.words.forEach(word => {
                        if (!this.loader.resources[word.imgUrl]) {
                            this.loader.add(word.imgUrl);
                        }
                    })
                }
                this.loader.load();

                analogData = null;
            },
            gameReady() {
                if (!this.loader) return;
                let res = this.loader.resources;
                let _self = this;
                if (res && res["game_ready"]) {
                    this.readySprite = new PIXI.Sprite(res["game_ready"].texture);
                    this.readySprite.anchor.set(0.5);
                    this.readySprite.x = this.app.screen.height / 2;
                    this.readySprite.y = this.app.screen.width / 2;
                    this.app.stage.addChild(this.readySprite);

                    this.readyID = null;
                    let scale = 1;
                    let readyScale = () => {
                        this.readyID = requestAnimationFrame(readyScale);
                        scale += 0.02
                        this.readySprite.scale.set(scale);
                    }
                    readyScale();
                    this.isReady = true
                    soundManage.ready && soundManage.ready.play()
                    setTimeout(()=>{
                        this.readyNext()
                    },2000)
                }
            },
            readyNext() {
                if (this.readyID) {
                    cancelAnimationFrame(this.readyID)
                    this.readyID = null;
                }
                if (!this.readySprite) return
                this.app.stage.removeChild(this.readySprite)
                this.readySprite = null;
                this.gameGo()
            },
            gameGo() {
                if (!this.loader) return;
                let res = this.loader.resources;
                let _self = this;
                if (res && res["game_go"]) {
                    this.goSprite = new PIXI.Sprite(res["game_go"].texture);
                    this.goSprite.anchor.set(0.5);
                    this.goSprite.x = this.app.screen.height / 2;
                    this.goSprite.y = this.app.screen.width / 2;
                    this.app.stage.addChild(this.goSprite);

                    this.goID = null;
                    let scale = 1;
                    let readyScale = () => {
                        this.goID = requestAnimationFrame(readyScale);
                        scale += 0.02;
                        this.goSprite.scale.set(scale);
                    }
                    readyScale();
                    soundManage.go && soundManage.go.play()
                    setTimeout(()=>{
                        this.goNext()
                    },800)
                }
            },
            goNext() {
                if (this.goID) {
                    cancelAnimationFrame(this.goID);
                    this.goID = null;
                }
                if (!this.goSprite) return
                this.app.stage.removeChild(this.goSprite)
                this.goSprite = null;
                this.begin();
            },
            createStage(loader, res) {

                for (let i = 1; i <= 10; i++) {
                    this.animationTexture.push(res[`effects${i}`].texture);
                }
                for (let i = 1; i < 10; i++) {
                    this.revTextures.push(res[`cardFrame${i}`].texture)
                }
                //创建背景
                this.loadbackground(res);
                this.createMainContainer();
                //加载进度条，暂停，和返回按钮 辅助的功能
                this.loadAuxiliary(res);
                this.createBackContainer(res);
                this.createGameOverPopups(res);
                this.$store.commit('setIsGameing', true)
            },
            createGameOverPopups(res) {
                allObject.overPopups = new GameOverPopups({
                    showReturn: this.showReturn,
                    examineRank: this.examineCallBack,  //查看排行的函数
                    nextLevel: this.nextLevel,  //下一关的函数
                    onceAgain: this.onceAgain,  //再来一次的函数
                    close: this.close,  //关闭游戏和弹窗函数
                    isLast:this.isLast
                })
                this.app.stage.addChild(allObject.overPopups);
                allObject.overPopups.hide();
            },
            close() {
                this.$emit("close")
            },
            onceAgain() {
                console.log("------------------------再来一次", this)
                allObject.cardbox.removeChildren()
                userAnswerRight = 0
                this.currWordsIndex = 0
                this.currInning = 0;
                allObject.textTotal.text = `共${this.totalInnings}局 第${this.currInning + 1}局`
                // allObject.overPopups.reset();
                this.optBar.reset()
                this.showOverPopups = false
                this.gameReady();
            },
            nextLevel() {
                this.$emit("next")
            },
            examineCallBack() {
                console.log("------------------------查看排行", this)
                this.$emit("showRanking")
            },
            createBackContainer(res) {
                allObject.backTipBox = new GameBack();
                allObject.backTipBox.x = 0;
                allObject.backTipBox.y = 0;
                allObject.backTipBox.cancelCallback = this.cancelBtn,
                    allObject.backTipBox.certainCallback = this.certainBtn
                this.app.stage.addChild(allObject.backTipBox);
                allObject.backTipBox.hide(); //提示底板
            }
            ,
            cancelBtn() {
                this.showReturnCfm = true;
                this.$store.commit('setDialogShowing', true);
                allObject.backTipBox.hide();
                this.play()
                this.optBar.play();
            },
            certainBtn() {
                this.$router.go(-1);
            },
            loadbackground(res) {
                let texture = res["background"].texture;
                allObject.backgroundPic = new PIXI.Sprite(texture);
                allObject.backgroundPic.x = 0;
                allObject.backgroundPic.y = 0;
                this.app.stage.addChild(allObject.backgroundPic);
                texture = null;
                this.optBar.init(this.app.stage);
            },
            createMainContainer() {
                //创建主容器  盛放游戏的主功能区域
                allObject.mainGameBox = new PIXI.Container();
                allObject.mainGameBox.x = allObject.mainGameBox.y = 0;
                allObject.mainGameBox.width = this.deviceWh.width;
                allObject.mainGameBox.height = this.deviceWh.height;
                this.app.stage.addChild(allObject.mainGameBox);
            },
            loadAuxiliary(res) {
                //总局数
                let textTotalBox = new PIXI.Container();
                textTotalBox.x = 0;
                textTotalBox.y = 200;
                textTotalBox.width = 100;
                textTotalBox.height = this.deviceWh.height;
                allObject.mainGameBox.addChild(textTotalBox);
                //添加总局数的文字
                allObject.textTotal = new PIXI.Text(`共${this.totalInnings}局 第${this.currInning + 1}局`, {
                    fontFamily: "Microsoft YaHei",
                    fontSize: 38,
                    fill: 0xffffff,
                    algin: "center"
                });
                allObject.textTotal.anchor.set(0.5);
                allObject.textTotal.x = this.deviceWh.height / 2;
                allObject.textTotal.y = 0;
                textTotalBox.addChild(allObject.textTotal);
                textTotalBox = null;

                allObject.addScore = new PIXI.Sprite(res['game_addScore'].texture);
                allObject.addScore.x = 1500;
                allObject.addScore.y = 40;
                allObject.mainGameBox.addChild(allObject.addScore);
                allObject.addScore.visible = false;

                //盛放卡牌的容器
                allObject.cardbox = new PIXI.Container();
                allObject.cardbox.x = 150;
                allObject.cardbox.y = 250;
                allObject.cardbox.width = this.deviceWh - 250;
                allObject.cardbox.height = this.deviceWh.height - 300;
                allObject.mainGameBox.addChild(allObject.cardbox);

            },
            addScoreAnimation() {
                allObject.addScore.visible = true;
                // soundManage.addScore && soundManage.addScore.fastSeek(0);
                soundManage.addScore && soundManage.addScore.play();
                let tiemrId = requestAnimationFrame(animation)
                function animation() {
                    if (allObject.addScore.alpha >= 0) {
                        tiemrId = requestAnimationFrame(animation)
                        allObject.addScore.alpha -= 0.05;
                        allObject.addScore.y -= 1;
                        allObject.addScore.x -= 0.05;
                    } else {
                        cancelAnimationFrame(tiemrId);
                        allObject.addScore.visible = false;
                        allObject.addScore.alpha = 1;
                        allObject.addScore.y = 40;
                        allObject.addScore.x = 1500;
                    }
                }
            },

            createCard() {
                let words = this.currWordsList;
                let serialX = 60;  //横轴间隔
                let res = this.loader.resources;
                let tureTexture = res['cardFrame1'].texture;
                let width = tureTexture.width;
                let height = tureTexture.height;
                let x = 0; //第几个卡牌，用来确定卡牌x轴的位置
                let isChnage = true;  //是否换行
                for (let i = 0; i < words.length; i++) {
                    let container = new Card();
                    if (i >= 5) {
                        if (isChnage) {
                            x = 0;
                            isChnage = false;
                        }
                        container.y = height - 100;
                    } else {
                        container.y = -50;
                    }
                    container.x = width * x + serialX * x;
                    x++;
                    allObject.cardbox.addChild(container);
                    container.init(this.animationTexture, _.cloneDeep(this.revTextures));
                    let word = words[i];
                    if (!word.isText) {
                        word.texture = res[word.imgUrl].texture;
                    }
                    container.interactive = true;
                    container.drawInfo(word);
                    container.addListener("tap", this.hanldleCardTap)
                    container = null;
                    word = null;
                }
            },
            pause() {
                // this.resumeTimer = setInterval(()=>{
                //     if(soundManage.resume){
                //         soundManage.resume.play();
                //     }else{
                //        this.resumeTimer &&  clearInterval(this.resumeTimer);
                //     }
                // },10000)
                this.isPause = true;
                this.optBar.pause();
                allObject.cardbox.interactiveChildren = false;
                // if(soundManage.cardBgSound.playing()){
                if (window.plus) {
                    soundManage.cardBgSound.stop();
                    soundManage.cardBgSound = plus.audio.createPlayer(this.sound.bgSound)
                }

                // }
            },
            play() {
                // if(this.resumeTimer){
                //     clearInterval(this.resumeTimer);
                //     this.resumeTimer = null;
                // }
                this.isPause = false;
                this.optBar.play();
                allObject.cardbox.interactiveChildren = true;
                // if(!soundManage.cardBgSound.playing()){
                if (window.plus) {
                    soundManage.cardBgSound.play(this.player);
                }
                // }
            },
            //返回处理函数
            goBack() {
                this.optBar.pause();
                this.pause()
                this.showReturnCfm = false;
                this.$store.commit('setDialogShowing', false);
                allObject.backTipBox.show();
            },
            /**
             * 卡牌点击处理函数
             */
            hanldleCardTap(e) {
                let target = e.target
                allObject.cardbox.interactiveChildren = false;
                if (!FirstTapTarget) { //第一次点击
                    FirstTapTarget = target;
                    FirstTapTarget.resversal(() => {
                        allObject.cardbox.interactiveChildren = true;
                    });
                    target = null;
                } else {  //第二次点击
                    SecondTapTarget = target;
                    target = null;
                    SecondTapTarget.resversal(() => {
                        let timer = setTimeout(() => {
                            clearTimeout(timer);
                            timer = null;
                            if (SecondTapTarget.cardId === FirstTapTarget.cardId) { //两次一致 则对
                                SecondTapTarget.removeSelf()
                                FirstTapTarget.removeComplete = function () {
                                    allObject.cardbox.interactiveChildren = true;
                                }
                                FirstTapTarget.removeSelf()
                                this.anwersRight();
                            } else {
                                SecondTapTarget.turnResval()
                                FirstTapTarget.turnResval(() => {
                                    allObject.cardbox.interactiveChildren = true;
                                })
                            }
                            SecondTapTarget = null;
                            FirstTapTarget = null;
                        }, 500)
                    });
                }
            },
            anwersRight() {
                userAnswerRight++;
                this.addScoreAnimation();
                this.optBar.updateCurrStep(userAnswerRight)
                userScore += 10;
                this.optBar.updateScore(userScore)
                console.log("--------------------userAnswerRight" + userAnswerRight)
                if (userAnswerRight === this.words.length) {
                    this.gameOver();
                } else if (userAnswerRight % 5 === 0) {
                    this.next();
                }
            },
            clearCardboxChild() {  //清理所有卡片
                if (allObject.cardbox.children.length !== 0) {
                    let cards = allObject.cardbox.children;
                    cards.forEach((card, index) => {
                        card.removeListener("tap");
                        card.destroy(true);
                    })
                }
            },
            next() {
                let timer = setTimeout(() => {
                    this.currInning++;
                    allObject.textTotal.text = `共${this.totalInnings}局 第${this.currInning + 1}局`
                    this.createCard();
                }, 500)
            },
            gameOver() {
                if (window.plus) {
                    soundManage.cardBgSound.stop();
                    soundManage.cardBgSound = plus.audio.createPlayer(this.sound.bgSound)
                }
                this.pause()
                allObject.overPopups.show();
                this.showOverPopups = true
                this.optBar.pause();
                this.$emit("postResult", [], userScore, true);

                userScore = 0;  //重置分数
                userAnswerRight = 0 //翻对的个数
                this.currInning = 0; //当前局数
            },
            player() {
                soundManage.cardBgSound = plus.audio.createPlayer(this.sound.bgSound)
                this.isPause || soundManage.cardBgSound.play(this.player);
            },
            begin() {
                if (window.plus) {
                    soundManage.cardBgSound.play(this.player);
                }
                this.createCard();
                this.optBar.play();
                this.isReady =false
                this.play()
            }
        },
        beforeDestroy() {
            this.$store.commit("setLearningBack", true);
            this.$store.commit('setIsGameing', false)
            // if(this.resumeTimer){
            //     clearInterval(this.resumeTimer);
            //     this.resumeTimer = null;
            // }
            if (window.plus) {
                soundManage.cardBgSound.stop()
            }
            // for(let key in soundManage){
            //     if(soundManage[key]){
            //         soundManage[key].unload()
            //     }
            // }
            this.clearCardboxChild();
            if (allObject) {
                for (let val in allObject) {
                    if (allObject[val]) {
                        allObject[val].destroy();
                        allObject[val] = null;
                    }
                }
            }
            allObject = {};
            soundManage = {}
            this.loader && this.loader.destroy();
            this.optBar.destroy();
            this.app.destroy(true);
        },
        components: {
            gameLoading,
            flowLoading
        }
    }
</script>

<style scoped>
    .card {
    	height: 100vh;
    	width: 100vw;
    }
</style>
