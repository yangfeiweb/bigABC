<template>
    <div class="spell">
        <gameLoading v-if="showLoading" :progress="progress"></gameLoading>
        <audio ref="addSound" :src="sounds.addScore" preload="auto"></audio>
        <audio ref="erasingError" :src="sounds.erasingError" preload="auto"></audio>
        <audio ref="tease" :src="sounds.tease" preload="auto"></audio>
        <audio ref="go" :src="sounds.go" preload="auto"></audio>
        <audio ref="hi" :src="sounds.hi" preload="auto"></audio>
        <audio ref="ready" :src="sounds.ready" preload="auto"></audio>
    </div>
</template>

<script>
    import * as PIXI from "pixi.js"
    import _ from "lodash";
    // import Howl from "howler";
    import gameLoading from "@/components/gameLoading";
    import OptBar from "./children/optBar";
    import { Sprite } from "@/utility/game";
    import { TASK_SCORE_TYPE } from "@/utility/dict";
    import words from "@/game/testWord"
    import ErasingBox from "@/game/erasingGame"
    import GameOverPopups from '@/game/gameSettlementPopups'
    import GameBack from '@/game/gameBack'
    import Cloud from "@/game/Cloud";

    export default {
        props: ["playResult","isLast"],
        data() {
            return {
                progress: 0,
                showLoading: true,
                cloudAnimates: [], //云的云动
                imgRoot: "static/images/game/erasingGame/",
                imgPublicRoot: "static/images/game/public/",
                soundRoot: "static/audio/",
                imgType: ".png",
                soundType: ".mp3",
                score: 0,
                currStep: 0,  //用户已经消除了多少个
                wordText: [],   // 存放点击多的文字，最后拼成单词
                firstCard: null,  //存放点击的第一个卡片
                secondCard: null, //存放点击的第二个卡片
                isSecond: false, //是不是第二点击
                eliminate: [], //存放所有待消除的单词片段
                spriteImgs: [
                    "erasingBg",
                    "cloud",
                    "botBorder",
                    "select-box",
                    "normal-box",
                    "shadow"
                ],
                gather: [
                    { name: "effect", num: 8 },
                    { name: "dragon", num: 8 },
                    { name: "Blink", num: 8 },
                    { name: "lovingHeart", num: 10 }
                ],
                sounds: {
                    addScore: "static/audio/addScore.mp3",
                    erasingBgSound: "_www/static/audio/erasingBgSound.mp3",
                    erasingError: "static/audio/erasingError.mp3",
                    tease: "static/audio/tease.mp3",
                    hi: "static/audio/hi.mp3",
                    go: "static/audio/go.mp3",
                    ready: "static/audio/ready.mp3"
                },
                publicImg: [
                    "addScore",
                    "subScore",
                    "go",
                    "ready"
                ],
                soundManage: {},
                resumeTimer: null,
                showReturnCfm: false,
                showOverPopups: false,
                isReady:false
            }
        },
        computed: {
            wordList() {
                let words = _.cloneDeep(this.$store.getters.currFlowStepWords || [])
                let res = words.filter(item => item.word.length > 1)
                return res
            },
            replaceWords() {
                let words = _.cloneDeep(this.wordList || []);
                let reg = /[\s|-|…]/g;
                words = words.map((word) => {
                    return word.word.replace(reg, "")
                })
                return words;
            },
            splitUpWords() {
                let list = _.cloneDeep(this.wordList || []);
                let arr = []
                list.forEach((word) => {
                    if (word) {
                        let space = (word.wordStyle === "GROUP"); //是否加空格
                        let phonics = word.phonics;
                        if (phonics && phonics.indexOf("_") === -1) {
                            arr = arr.concat(this.splitUpPhonics(phonics, space));
                        } else {
                            arr = arr.concat(this.splitUpSentences(word.word, space));
                        }
                    }
                })
                let len = arr.length;
                if(len>12){
                    let preArr = arr.splice(len-6)
                    return preArr.concat(_.shuffle(arr))
                }else{
                    return _.shuffle(arr)
                }
            },
            showReturn() {
                let type = this.$store.getters.flowType;
                return type === TASK_SCORE_TYPE.unit
            }
        },
        watch: {
            playResult(val) {
                if (val && this.overPopups) {
                    this.overPopups.setData(val)
                }
            },
            '$store.getters.dialogShowing': function (val) {
                if(this.showOverPopups){
                    this.$emit('close')
                }else{
                    if(!this.isReady){
                        if (val === false && this.showReturnCfm == true) {
                            this.showReturnCfm = false
                            this.backBox.hide();
                            this.play();
                        } else if (val && this.showReturnCfm == false) {
                            this.showReturnCfm = true
                            this.backBox.show();
                            this.pause();
                            // this.optBar.pause()
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
            let len = this.splitUpWords.length;
            let row = Math.ceil(len / 3); //算出有多少行
            for (let i = 0; i < row; i++) {
                this.eliminate[i] = [];
                for (let j = 0; j < 3; j++) {
                    this.eliminate[i][j] = null;
                }
            }
            this.createSound()
            this.createApp();
            this.loadResource();
        },
        methods: {
            createSound() {
                if (window.plus) {
                    this.soundManage.bgSound = plus.audio.createPlayer(this.sounds.erasingBgSound)
                }
                this.soundManage.addSound = this.$refs.addSound;
                this.soundManage.addSound.onpause = ()=>{
                    this.soundManage.addSound.load()
                }
                this.soundManage.SayHi = this.$refs.hi;
                    this.soundManage.SayHi.onpause = ()=>{
                        this.soundManage.SayHi.load()
                }
                this.soundManage.go = this.$refs.go;
                this.soundManage.ready = this.$refs.ready;
                this.soundManage.tease = this.$refs.tease;
                this.soundManage.tease.onpause = ()=>{
                        this.soundManage.tease.load()
                }
                this.soundManage.anwserError = this.$refs.erasingError;
                     this.soundManage.anwserError.onpause = ()=>{
                            this.soundManage.anwserError.load()
                        }
                
            },
            merge(arr, n, space) {
                let left = "";
                let right = "";
                arr.forEach((contect, index) => {
                    if (index < n) {
                        left += contect
                        if (space) left += " ";
                    } else {
                        right += contect
                        if (space) right += " ";
                    }
                })
                return [left, right];
            },
            splitUpPhonics(phonics, space) {
                let arr = phonics.split("=")[0].split("+");
                let n = Math.floor(arr.length / 2)
                let result = this.merge(arr, n, space)
                return result
            },
            splitUpSentences(word, space) {
                word = word || "";
                let reg = /[\s|-|…]/g;
                let arr = [];
                if (word.search(reg) === -1) {
                    arr = word.split("");
                } else {
                    arr = word.split(reg);
                }
                let n = Math.floor(arr.length / 2);
                let result = this.merge(arr, n, space)
                return result
            },

            createApp() {
                let deviceConfig = {
                    width: 1080,
                    height: 1920
                };
                let app = new PIXI.Application({
                    width: deviceConfig.width,
                    height: deviceConfig.height,
                    antialias: true,
                    transparent: true,
                    clearBeforeRender: true,
                    // forceCanvas: true
                });
                this.app = app;
                let stage = this.app.stage;
                stage.rotation = Math.PI / 2;
                stage.x = deviceConfig.width;
                this.app.backgroundColor = 0x222fff;
                this.app.view.style.width = "100%";
                this.app.view.style.height = "100%";
            },
            loadResource() {
                this.loader = new PIXI.loaders.Loader();

                //加载游戏基本精灵图片
                this.spriteImgs.forEach((name) => {
                    if (!this.loader.resources[name]) {
                        let path = this.imgRoot + name + this.imgType;
                        this.loader.add(name, path);
                    }
                })
                // this.sounds.forEach((sound) => {
                //     let path = this.soundRoot + sound + this.soundType;
                //     let name = "sound_" + sound;
                //     if (!this.loader.resources[name]) {
                //         this.loader.add(name, path)
                //     }
                // })
                this.gather.forEach(item => {
                    for (let i = 1; i <= item.num; i++) {
                        let name = item.name + i;
                        let path = this.imgRoot + name + this.imgType;
                        if (!this.loader.resources[name]) {
                            this.loader.add(name, path);
                        }
                    }
                })

                this.publicImg.forEach(item => {
                    let path = this.imgPublicRoot + item + this.imgType;
                    let name = "game_" + item
                    if (!this.loader.resources[name]) {
                        this.loader.add(name, path);
                    }
                })
                this.optBar = new OptBar({
                    loader: this.loader,
                    duration: 90,
                    currStep: this.currStep,
                    stepCount: this.wordList.length,
                    onPause: this.pause,
                    onPlay: this.play,
                    onReturn: this.quitClick,
                    onOver: this.end,
                    score: this.score
                });
                this.loader.on("progress", ({ progress }) => {
                    this.progress = Math.floor(progress);
                })
                this.loader.on("complete", (loader, res) => {
                    this.showLoading = false;
                    this.$el.appendChild(this.app.view);
                    this.createStage(loader, res)
                    this.gameReady();
                })
                this.loader.load()
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
                    this.soundManage.ready && this.soundManage.ready.play()
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

                    this.goId = null;
                    let scale = 1;
                    let readyScale = () => {
                        this.goId = requestAnimationFrame(readyScale);
                        scale += 0.02;
                        this.goSprite.scale.set(scale);
                    }
                    readyScale();
                    this.soundManage.go && this.soundManage.go.play()
                    setTimeout(()=>{
                        this.goNext()
                    },800)
                }
            },
            goNext() {
                if (this.goId) {
                    cancelAnimationFrame(this.goId);
                    this.goId = null;
                }
                if (!this.goSprite) return
                this.app.stage.removeChild(this.goSprite)
                this.goSprite = null;
                this.begin();
            },
            createStage(loader, res) {
                let stage = this.app.stage;
                let bgImage = new Sprite({
                    texture: res["erasingBg"].texture,
                    x: 0,
                    y: 0
                })
                stage.addChild(bgImage);

                let clouds = [
                    { name: "cloud", x: 50, y: 20, speed: 0.6, scale: 0.4 },
                    { name: "cloud", x: 200, y: 60, speed: 0.5, scale: 0.6 },
                    { name: "cloud", x: 550, y: 180, speed: 1, scale: 1 },
                    { name: "cloud", x: 900, y: 140, speed: 0.2, scale: 0.9 },
                    { name: "cloud", x: 1300, y: 50, speed: 1.5, scale: 0.75 },
                    { name: "cloud", x: 1880, y: 250, speed: 0.8, scale: 0.4 }
                ];
                clouds.forEach(cloud => {
                    this.cloudAnimates.push(
                        new Cloud({
                            texture: res[cloud.name].texture,
                            x: cloud.x,
                            y: cloud.y,
                            speed: cloud.speed,
                            scale: cloud.scale,
                            stage: stage
                        })
                    );
                });
                this.optBar.init(stage);

                this.addSprite = new PIXI.Sprite(res['game_addScore'].texture)
                this.subSprite = new PIXI.Sprite(res['game_subScore'].texture)
                this.addSprite.x = this.subSprite.x = 1500;
                this.addSprite.y = this.subSprite.y = 40;
                this.addSprite.visible = this.subSprite.visible = false;
                stage.addChild(this.addSprite, this.subSprite)

                //大容器  盛放游戏的主要功能
                let mainBox = this.createContainer({ x: 0, y: 180 });
                stage.addChild(mainBox);
                let shadow = new PIXI.Sprite(res["shadow"].texture);
                shadow.anchor.y = 1;
                shadow.x = 200;
                shadow.y = 850;
                mainBox.addChild(shadow)

                //下面是几种动画效果
                let dragonTextures = [];
                let blinkTextures = [];
                for (let i = 1; i < 9; i++) {
                    dragonTextures.push(res[`dragon${i}`].texture)
                    blinkTextures.push(res[`Blink${i}`].texture)
                }
                dragonTextures.push(res[`dragon1`].texture)
                this.animationBox = this.createContainer({ x: -10, y: 65 });
                this.animationBox.interactive = true;
                this.animationBox.addListener("tap", this.playAnimation);
                mainBox.addChild(this.animationBox)
                //打招呼
                this.Greet = this.createSpriteAnimation(dragonTextures, 0.05);
                this.animationBox.addChild(this.Greet)
                this.Greet.onComplete = () => {
                    this.Greet.visible = false;
                    this.blink.visible = true;
                    this.blink.gotoAndPlay(0)
                }
                // 眨眼
                this.blink = this.createSpriteAnimation(blinkTextures, 0.1);
                this.animationBox.addChild(this.blink)
                this.blink.visible = false;
                let heartTexture = []
                for (let i = 1; i <= 10; i++) {
                    heartTexture.push(res[`lovingHeart${i}`].texture);
                }
                //爱心
                this.loveHeart = this.createSpriteAnimation(heartTexture);
                this.animationBox.addChild(this.loveHeart)
                this.loveHeart.visible = false;
                this.loveHeart.onComplete = () => {
                    this.animationBox.interactive = true;
                    this.loveHeart.visible = false;
                    this.blink.visible = true;
                    this.blink.gotoAndPlay(0)
                }
                heartTexture = blinkTextures = dragonTextures = null;
                //底板
                let botBorderSprite = new Sprite({ texture: res["botBorder"].texture, x: 480, y: 0 })
                mainBox.addChild(botBorderSprite);

                //盛放所有卡片的大容器 外有遮罩 内置小容器
                let graphics = new PIXI.Graphics();
                graphics.beginFill(0xFF0000);
                graphics.drawRect(0, 0, 1363, 830)
                graphics.endFill();
                graphics.x = 0;
                graphics.y = 0;
                let borderBox = this.createContainer({ x: 510, y: 20, width: 1363, height: 830 })
                borderBox.mask = graphics;
                borderBox.addChild(graphics)
                mainBox.addChild(borderBox)
                //卡片容器
                this.cardBox = new PIXI.Container();
                borderBox.addChild(this.cardBox)
                //结果弹窗
                this.overPopups = new GameOverPopups({
                    showReturn: this.showReturn,
                    flowType: this.flowType,
                    examineRank: this.examineCallBack,  //查看排行的函数
                    nextLevel: this.nextLevel,  //下一关的函数
                    onceAgain: this.onceAgain,  //再来一次的函数
                    close: this.close, //关闭游戏和弹窗函数
                    isLast:this.isLast
                })
                stage.addChild(this.overPopups);
                this.overPopups.hide();

                //返回弹窗
                this.backBox = new GameBack();
                this.backBox.cancelCallback = this.cancelBtn,
                    this.backBox.certainCallback = this.certainBtn
                this.backBox.x = 0;
                this.backBox.y = 0;
                stage.addChild(this.backBox);
                this.backBox.hide()
                this.$store.commit('setIsGameing', true)
                mainBox = botBorderSprite = borderBox = graphics = stage = null
            },
            createSpriteAnimation(textures, speed, loop) {
                let AnimatedSprite = new PIXI.extras.AnimatedSprite(textures)
                AnimatedSprite.x = 0
                AnimatedSprite.y = 0
                AnimatedSprite.animationSpeed = speed || 0.1
                AnimatedSprite.loop = !!loop
                return AnimatedSprite
            },
            playAnimation() {
                this.animationBox.interactive = false;
                this.blink.playing && this.blink.stop();
                this.Greet.playing && this.Greet.stop();
                this.loveHeart.visible = true
                this.Greet.visible = false
                this.blink.visible = false
                this.soundManage.tease && this.soundManage.tease.play()
                this.loveHeart.gotoAndPlay(0)
            },
            scoreAnimation(target) {
                target.visible = true;
                let tiemrId = null;
                let animation = () => {
                    if (target.alpha >= 0) {
                        tiemrId = requestAnimationFrame(animation)
                        target.alpha -= 0.05;
                        target.y -= 1;
                        target.x -= 0.05;
                    } else {
                        cancelAnimationFrame(tiemrId);
                        target.visible = false;
                        target.alpha = 1;
                        target.y = 40;
                        target.x = 1500;
                        target = null;
                    }
                }
                animation();
            },
            cancelBtn() {  //返回弹窗的取消按钮
                this.showReturnCfm = false;
                this.$store.commit('setDialogShowing', false);
                this.backBox.hide()
                this.play()
                // this.optBar.play()
            },
            certainBtn() {  //返回确认按钮
                this.$router.go(-1)
            },
            examineCallBack() {
                this.$emit("showRanking");
            },
            nextLevel() {
                this.$emit("next");
            },
            onceAgain() {
                let len = this.eliminate.length
                for (let i = 0; i < len; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (this.eliminate[i][j]) {
                            this.eliminate[i][j].destroy()
                            this.eliminate[i][j] = null;
                        }
                    }
                }
                this.splitUpWords = _.shuffle(this.splitUpWords)
                this.score = 0;
                this.currStep = 0;  //用户已经消除了多少个
                this.wordText = [],   // 存放点击多的文字，最后拼成单词
                    this.firstCard = null,  //存放点击的第一个卡片
                    this.secondCard = null, //存放点击的第二个卡片
                    this.isSecond = false, //是不是第二点击
                    // this.overPopups.reset();
                    this.optBar.reset();
                this.showOverPopups = false
                this.gameReady()
            },
            close() {
                this.$emit("close");
            },
            createContainer(options) { //创建一个容器
                let box = new PIXI.Container()
                box.x = options.x || 0;
                box.y = options.y || 0;
                options.width && (box.width = options.width)
                options.height && (box.height = options.height)
                return box;
            },
            createCard() {
                let res = this.loader.resources;
                let selectTexture = res["select-box"].texture;
                let normalTexture = res["normal-box"].texture;
                let disEffect = []; //消失特效纹理
                for (let i = 1; i <= 8; i++) {
                    disEffect.push(res[`effect${i}`].texture)
                }
                let config = {
                    cardWidth: selectTexture.width,
                    cardHegiht: selectTexture.height,
                    dirY: 20, //纵轴间隔
                    dirX: 15,//横轴间隔 
                }
                let len = this.eliminate.length;
                let index = 0;
                let wordLen = this.splitUpWords.length;
                for (let i = len - 1; i >= 0; i--) {
                    for (let j = 0; j < 3; j++) {
                        if (wordLen > index) {
                            let con = new ErasingBox({
                                selectTexture: selectTexture,
                                normalTexture: normalTexture,
                                text: this.splitUpWords[index],
                                disEffect: disEffect,
                                dirY: config.dirY,
                                app: this.app
                            })
                            con.x = config.dirX * (j + 1) + j * config.cardWidth
                            con.y = config.dirY * (i + 1) + i * config.cardHegiht
                            con.coordX = i;
                            con.coordY = j;
                            con.cardDesAfter = this.cardDesAfter
                            con.cardDownAfter = this.cardDownAfter
                            con.interactive = true;
                            con.addListener("tap", this.tapCard);
                            this.cardBox.addChild(con);
                            this.eliminate[i][j] = con;
                            con = null;
                            index++;
                        }
                    }
                }
                let num = len - 4;
                this.cardBox.y = -(config.dirY * num + config.cardHegiht * num);
            },
            //点击处理函数
            tapCard(e) {
                let target = e.target;
                if (this.firstCard && this.firstCard === target) {
                    this.firstCard.changeNormal();
                    this.firstCard = null;
                    this.isSecond = false;
                    this.wordText = [];
                } else {
                    target.changeSelect()
                    if (!this.isSecond) {
                        this.isSecond = true;
                        this.firstCard = target;
                        this.wordText.push(target.text);
                    } else {
                        this.cardBox.interactiveChildren = false;
                        this.isSecond = false;
                        this.secondCard = target;
                        this.wordText.push(target.text);
                        this.checkWord();  //对比
                    }
                }
                target = null;
            },
            checkWord() { //查看看两次点击的是否组成了一个正确单词
                let text = this.wordText.toString().replace(/\s|,/g, "")
                let result = this.replaceWords.find(word => word.toLowerCase() === text.toLowerCase())
                if (result) { //答题正确
                    let firstCoordX = this.firstCard.coordX;
                    let firstCoordY = this.firstCard.coordY;
                    let secondCoordX = this.secondCard.coordX;
                    let secondCoordY = this.secondCard.coordY;
                    this.eliminate[firstCoordX][firstCoordY] = null;
                    this.eliminate[secondCoordX][secondCoordY] = null;
                    if (firstCoordY === secondCoordY) {  //如果在同一列,只有一个触发回调
                        if (firstCoordX > secondCoordX) {
                            this.secondCard.isVanishCall = false;
                        } else {
                            this.firstCard.isVanishCall = false;
                        }
                    }
                    this.score += 10;
                    this.optBar.updateScore(this.score)
                    this.soundManage.addSound.play()
                    this.scoreAnimation(this.addSprite)
                    this.firstCard.explosive()
                    this.secondCard.explosive()
                    this.currStep += 1;
                    this.optBar.updateCurrStep(this.currStep)
                    if (this.currStep === this.wordList.length) {
                        this.end() //游戏结束
                    }
                } else {//答题错误
                    this.soundManage.anwserError.play()
                    this.score -= 5;
                    if (this.score < 0) {
                        this.score = 0;
                    } else {
                        this.scoreAnimation(this.subSprite)
                    }
                    this.optBar.updateScore(this.score)
                    setTimeout(() => {
                        this.firstCard.changeNormal()
                        this.secondCard.changeNormal()
                    }, 300)
                }
                let timer = setTimeout(() => {
                    this.firstCard = null;
                    this.secondCard = null;
                    this.cardBox.interactiveChildren = true;
                    clearTimeout(timer)
                    timer = null;
                }, 500)
                this.wordText = [];
            },
            /**
             * coordX 这个卡片在数组中的一维坐标值
             * coordY 这个卡片在数组中的二维坐标值
             * coordX 和coordY 表示的是需要有卡片向当前这个位置移动
             */
            cardDesAfter(coordX, coordY) { //卡片点击正确，消失动画执行后的回调
                let len = this.eliminate.length - 1;
                let j = 0;
                if (coordX > 0 && coordX <= len) {
                    for (let i = 1; i <= coordX; i++) {
                        let card = this.eliminate[coordX - i][coordY];
                        if (card) {
                            card.downAnimation();
                            this.eliminate[coordX - i][coordY] = null
                            this.eliminate[coordX - j][coordY] = card
                            card.coordX = coordX - j
                        }
                        j++;
                    }
                }
            },
            //卡片下落之后的回调函数 目的是为了当卡片下落一次之后判断还能否向下移动
            cardDownAfter(coordX, coordY) {
                let len = this.eliminate.length - 1;
                if (coordX + 1 <= len) {
                    let findDown = this.eliminate[coordX + 1][coordY];
                    if (!findDown) {
                        this.cardDesAfter(coordX + 1, coordY)
                    }
                }
            },
            pause() { //暂停
                // this.resumeTimer = setInterval(()=>{
                //     if(this.soundManage.SayHi){
                //         this.soundManage.SayHi.play()
                //     }else{
                //        this.resumeTimer && clearInterval(this.resumeTimer) 
                //     }
                // },10000)
                this.cloudAnimates.forEach((cloud) => {
                    cloud.stop()
                })
                // if(this.soundManage.bgSound.playing()){
                if (window.plus) {
                    this.soundManage.bgSound.stop();
                    this.soundManage.bgSound = plus.audio.createPlayer(this.sounds.erasingBgSound)
                }
                // }
                this.cardBox.interactiveChildren = false;
                this.animationBox.interactive = false
                this.optBar.pause()
            },
            play() { //开始
                // if(this.resumeTimer){
                //     clearInterval(this.resumeTimer );
                //     this.resumeTimer = null;
                // }
                this.cloudAnimates.forEach((cloud) => {
                    cloud.play()
                })
                // if (!this.soundManage.bgSound.playing()) {
                if (window.plus) {
                    this.soundManage.bgSound.play(this.player)
                }
                // }
                this.animationBox.interactive = true
                this.cardBox.interactiveChildren = true;
                this.optBar.play()
            },// 返回
            quitClick() {
                this.showReturnCfm = true;
                this.$store.commit('setDialogShowing', true);
                this.pause()
                this.backBox.show()
                // this.optBar.pause()
            },
            end() {  //游戏结束
                if (window.plus) {
                    this.soundManage.bgSound.stop();
                    this.soundManage.bgSound = plus.audio.createPlayer(this.sounds.erasingBgSound)
                }
                this.pause()
                // this.optBar.pause()
                this.overPopups.show()
                this.showOverPopups = true
                this.$emit("postResult", [], this.score, true)
            },
            sayHi() {
                if (!this.Greet.visible) {
                    this.Greet.visible = true;
                }
                if (this.blink.visible) {
                    this.blink.visible = false
                }
                if (this.loveHeart.visible) {
                    this.loveHeart.visible = false
                }
                this.Greet.gotoAndPlay(0);
                this.soundManage.SayHi && this.soundManage.SayHi.play()
            },
            player() {
                this.soundManage.bgSound = plus.audio.createPlayer(this.sounds.erasingBgSound)
                this.soundManage.bgSound.play(this.player)
            },
            begin() { //游戏开始
                if (window.plus) {
                    this.soundManage.bgSound.play(this.player)
                }
                this.createCard()
                this.play()
                this.isReady = false
                // this.optBar.play()
                this.sayHi()
            }
        },
        beforeDestroy() {
            this.$store.commit("setLearningBack", true);
            this.$store.commit('setIsGameing', false)
            if (window.plus) {
                this.soundManage.bgSound.stop()
            }
            // for(let key in this.soundManage){
            //     if(this.soundManage[key]){
            //         this.soundManage[key].unload()
            //     }
            // }
            // if(this.resumeTimer){
            //         clearInterval(this.resumeTimer );
            //         this.resumeTimer = null;
            // }

            this.soundManage = {}
            this.loader && this.loader.destroy();
            this.cloudAnimates.forEach(item => {
                item && item.destroy()
            })
            this.cloudAnimates = [];
            this.optBar.destroy();
            this.backBox.destroy();
            this.overPopups.destroy();
            this.app.destroy(true);
        },
        components: {
            gameLoading
        }
    }
</script>

<style>
    .spell {
    	width: 100vw;
    	height: 100vh;
    }
</style>
