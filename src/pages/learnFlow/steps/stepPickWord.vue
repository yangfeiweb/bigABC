<template>
  <div class="choose-word">
    <div class="choose-main">
      <!-- 中间内容显示区域 -->
      <div class="choose-content">
        <!-- 单词+小喇叭 -->
        <div class="word-container">
          <p class="word">{{currWord && currWord.word}}</p>
          <speaker :audioSrc='currWord && currWord.voiceUrl' autoPlay :delay='audioDelay'></speaker>
        </div>
        <div class="content-container">
          <transition name='fade'>
            <!-- 汉字列表 -->
            <ul class="word-list" v-for="(item, idx) in wordList" :key="idx" v-if="idx==curr">
              <li class="item-container" v-for="(option,index) in item.options" :key="option.id" @click="isGoOn && check(option.chinese,index)">
                <div class='word-item'>
                  <p>{{option.chinese}}</p>
                  <img class="right" v-show='chooseIdx === index && !currError' src="static/images/success.png" alt="">
                  <img class="error" v-show="chooseIdx === index && currError" src="static/images/error.png" alt="">
                </div>
              </li>
            </ul>
          </transition>
        </div>
      </div>
    </div>
    <!-- 按钮 -->
    <div class="next">
      <div class='btn'>{{curr+1}}/{{wordList.length}}</div>
    </div>
    <right-wrong-voice ref="voice"></right-wrong-voice>
  </div>
</template>
<script>
  import * as PIXI from "pixi.js";
  import _ from 'lodash'
  import utility from '@/utility/utility'
  import { Sprite } from "@/utility/game";
  import Container from "@/game/Container";

  import speaker from '@/components/widgets/speaker'
  import rightWrongVoice from "@/components/rightWrongVoice"

  export default {
    props: ['reset'],
    data: function () {
      return {
        imgRoot: "static/images/stepPickPic/",
        imgDragnRoot:'static/images/game/radish/',
        imgType: ".png",
        spriteImgs: [
          'goBack',
          'bloodBg',
          'bloodBg2',
          'fish',
        ],
        dragnImgs:[
          'action',
          'action2',
          'action1',
          'action',
        ],
        otherImgs:[
          'actionDie1',
          'star',
          'actionDie1',
          'actionDie2',
          'glitter',
        ],
        boonImgs:[
          'DeathEffects/1',
          'DeathEffects/2',
          'DeathEffects/3',
          'DeathEffects/4',
          'DeathEffects/5',
          'DeathEffects/6',
          'DeathEffects/7',
          'DeathEffects/8',
          'DeathEffects/9',
          'DeathEffects/10',
          'DeathEffects/11',
          'DeathEffects/12',
          'DeathEffects/13',
          'DeathEffects/14',
        ],
        soulImgs:[
          'ghost1',
          'ghost2',
          'ghost3',
          'ghost4',
        ],
        deviceConfig: {
          width: 750,
          height: 1334
        },

        goReturn:null,//返回按钮
        monsterContainer:null,//怪物容器
        monster:null,//怪物
        bloodBg:null,//血量背景
        blood:null,//血量
        bloodCopy:null,//再玩一次 血量长度
        boonAnimate:null,//爆炸动画
        monsterAnimate:null,//怪物死亡动画
        dragnContainer:null,//小龙容器
        dragnAnimate:null,//小龙动画
        light:null,//星棒 光芒
        starRotating:null,//星棒 光芒 旋转
        dragnFail:null,//小龙失败
        dragnSoul:null,//小龙灵魂
        star:null,//星星
        running:false,
        monsterMoving:null,//怪物移动
        starMoving:null,//星星移动
        delWidth:null,//血条减少的长度
        distance:null,//怪物到小龙的距离



        chooseIdx: -1,
        currError: false,
        curr: 0,
        audioDelay: 500,
        errorTimes: 0,//错误次数
        wrongWords: [],//错误单词数组
        isGoOn:true,//是否失败 控制 图片点击事件
      }
    },
    mounted() {
      this.createGameApp();
      this.loadResource();
    },
    computed: {
      wordList: function () {
        let words = _.cloneDeep(this.$store.getters.currFlowStepWords || [])
        words.forEach(word => {
          let randomWords = utility.sortArrByRandom(words)
          word.options = [{
            id: word.id,
            word: word.word,
            imgUrl: word.imgUrl,
            chinese: word.chinese
          }]
          for (let i = 0; i < randomWords.length; i++) {
            let randomItem = randomWords[i];
            if (randomItem.id !== word.id) {
              word.options.push({
                id: randomItem.id,
                word: randomItem.word,
                imgUrl: randomItem.imgUrl,
                chinese: randomItem.chinese
              })
              if (word.options.length == 4) {
                break;
              }
            }
          }
          word.options = utility.sortArrByRandom(word.options)
        })
        console.log('------words', words)
        return words
      },
      currWord: function () {
        return this.wordList[this.curr]
      }
    },
    watch: {
      reset: function (val) {
        if (val) {
          this.curr = 0
          this.wrongWords = []
          this.playAgin();
        }
      }
    },
    methods: {
      createGameApp: function() {
        let app = new PIXI.Application({
          width: this.deviceConfig.width,
          height: this.deviceConfig.height,
          antialias: true,
          transparent: true,
          clearBeforeRender: true,
        });
        app.view.style.width = "100%";
        app.view.style.height = "100%";
        this.app = app;
      },
      // 加载图片文件
      loadResource: function() {
        let loader = new PIXI.loaders.Loader();
        this.loader = loader;

        // 加载游戏图片
        this.spriteImgs.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        // 加载小龙动画图片
        this.dragnImgs.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgDragnRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        // 加载爆炸动画图片
        this.boonImgs.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgDragnRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        
        // 加载怪物死亡动画图片
        this.soulImgs.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgDragnRoot + item + this.imgType;
            loader.add(item, itemPath);
          }
        });
        // 加载其他图片
        this.otherImgs.forEach(item => {
          if (!loader.resources[item]) {
            let itemPath = this.imgDragnRoot + item + this.imgType;
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
          this.start();
        });
    
        loader.load();
      },
      createStage: function() {
        let stage = this.app.stage;
        let resources = this.loader.resources;
        //添加返回按钮
        this.goReturn = new Sprite({
          texture: resources["goBack"].texture,
          x: 30,
          y: 50
        });
        stage.addChild(this.goReturn);
        this.goReturn.interactive=true;
        this.goReturn.on('tap', e =>{
          this.$router.go(-1);
        });
        //添加怪物
        this.monsterContainer=new PIXI.Container();
        this.monsterContainer.x=10;
        this.monsterContainer.y=240;
        // 血量
        this.bloodBg = new Sprite({
          texture: resources["bloodBg"].texture,
          x: 10,
          y: 0
        });
        this.blood = new Sprite({
          texture: resources["bloodBg2"].texture,
          x: 10,
          y: 0
        });
        
        //怪物
        this.monster = new Sprite({
          texture: resources["fish"].texture,
          x: 0,
          y: 30
        });

        this.monsterContainer.addChild(this.bloodBg,this.blood,this.monster);
        stage.addChild(this.monsterContainer);

        this.delWidth=this.blood.width/this.wordList.length;
        this.bloodCopy=this.blood.width;

        //添加爆炸动画
        let Imgs2 = [];
        this.boonImgs.forEach(item => {
          Imgs2.push(resources[item].texture);
        });
        this.boonAnimate = new PIXI.extras.AnimatedSprite(Imgs2);
        this.boonAnimate.loop = false;
        this.boonAnimate.x = this.monster.width/2;
        this.boonAnimate.y = this.monster.height/1.5;
        this.boonAnimate.scale.set(0.6,0.6);
        this.boonAnimate.animationSpeed = 0.3;
        this.boonAnimate.anchor.set(0.5,0.5);
        this.boonAnimate.visible=false;
        this.monsterContainer.addChild(this.boonAnimate);

        //添加怪物死亡动画
        let Imgs3 = [];
        this.soulImgs.forEach(item => {
          Imgs3.push(resources[item].texture);
        });
        this.monsterAnimate = new PIXI.extras.AnimatedSprite(Imgs3);
        this.monsterAnimate.loop = false;
        this.monsterAnimate.x = 0;
        this.monsterAnimate.y = 0;
        this.monsterAnimate.scale.set(0.85,0.85);
        this.monsterAnimate.animationSpeed = 0.1;
        this.monsterAnimate.visible=false;
        this.monsterContainer.addChild(this.monsterAnimate);

        //添加小龙动画
        this.dragnContainer=new PIXI.Container();
        this.dragnContainer.x=510;
        this.dragnContainer.y=120;
        let Imgs = [];
        this.dragnImgs.forEach(item => {
          Imgs.push(resources[item].texture);
        });
        this.dragnAnimate = new PIXI.extras.AnimatedSprite(Imgs);
        this.dragnAnimate.loop = false;
        this.dragnAnimate.x = 0;
        this.dragnAnimate.y = 0;
        this.dragnAnimate.scale.set(0.8,0.8);
        this.dragnAnimate.animationSpeed = 0.2;
        this.dragnContainer.addChild(this.dragnAnimate);
        stage.addChild(this.dragnContainer);

        //添加星棒 光芒
        this.light = new Sprite({
          texture: resources["glitter"].texture,
          x: 30,
          y: 155
        });
        this.light.scale.set(0.4,0.4);
        this.light.anchor.set(0.5,0.5);
        this.dragnContainer.addChild(this.light);
        

        //怪物到小龙的初始距离
        this.distance=this.dragnContainer.x-this.monsterContainer.x-this.monsterContainer.width;

        //添加小龙失败
        this.dragnFail = new Sprite({
          texture: resources["actionDie1"].texture,
          x: 510,
          y: 170
        });
        this.dragnFail.scale.set(0.7,0.7);
        this.dragnFail.visible=false;
        stage.addChild(this.dragnFail);
      },
      // 怪物移动
      monsterMove:function(){
        let resources = this.loader.resources;
        //计算怪物10s之内  每秒重绘频率内 的移动距离
        let long=(this.distance/10)/60;
        let Move=()=>{
          if(this.running){
            this.monsterMoving=requestAnimationFrame(Move);
            this.monsterContainer.x+=long;
            if(this.hitTest(this.monsterContainer,this.dragnContainer)){
              this.isGoOn=false;
              this.monsterMoving&&cancelAnimationFrame(this.monsterMoving);
              this.starRotating&&cancelAnimationFrame(this.starRotating);
              this.light.visible=false;
              this.dragnAnimate.visible=false;
              this.dragnFail.visible=true;
              //添加小龙灵魂
              this.dragnSoul= new Sprite({
                texture: resources["actionDie2"].texture,
                x: 550,
                y: 150
              });
              this.dragnSoul.scale.set(0.7,0.7);
              this.app.stage.addChild(this.dragnSoul);

              let timer=setInterval(()=>{
                this.dragnSoul.y-=10;
                if(this.dragnSoul.y<=80){
                  this.app.stage.removeChild(this.dragnSoul);
                  clearInterval(timer);
                  timer=null;
                  this.$emit("postResult",this.wrongWords,0);
                }
              },200);
            }
          }
        }
        Move()
      },
      //小龙射击动画
      shoot:function(){
        console.log("----------shoot");
        let resources = this.loader.resources;
        this.light.visible=false;
        this.dragnAnimate.gotoAndPlay(0);
        let that=this;
        this.dragnAnimate.onComplete=function(){
          that.light.visible=true;
        }
        this.star = new Sprite({
          texture: resources["star"].texture,
          x: 510,
          y: 300
        });
        this.star.scale.set(0.85,0.85);
        this.app.stage.addChild(this.star);
        this.starMove();
      },
      //星星移动
      starMove:function(){
        console.log("-----------starMoving");
        let Move=()=>{
          if(this.running){
            this.starMoving=requestAnimationFrame(Move);
            this.star.x-=20;
            if(this.hitTest(this.star,this.monsterContainer)){
              console.log("-------------碰撞");
              cancelAnimationFrame(this.starMoving);
              this.app.stage.removeChild(this.star);

              this.boonAnimate.visible=true;
              this.boonAnimate.gotoAndPlay(0);
              let that=this;
              this.boonAnimate.onComplete=function(){
                that.boonAnimate.visible=false;
              }
              //怪物 被击退3s移动距离
              this.monsterContainer.x-=(this.distance/10)*3;
              if(this.monsterContainer.x<=0){
                this.monsterContainer.x=0;
              }

              this.blood.width-=this.delWidth;

              if(this.blood.width<1){
                console.log("----------------------恭喜");
                this.blood.width=0;
                cancelAnimationFrame(this.monsterMoving);
                this.monster.visible=false;
                this.bloodBg.visible=false;
                this.monsterAnimate.visible=true;
                this.monsterAnimate.gotoAndPlay(0);
                let that=this;
                this.monsterAnimate.onComplete=function(){
                  that.monsterAnimate.visible=false;
                  // that.$emit("postResult", this.wrongWords);
                }
              }
            }
          }
        }
        Move()
      },
      // 星芒转动
      starRotate:function(){
        // 星棒动画
        let rotationNo=0;
        let starRotation=()=>{
          if(this.running){
            this.starRotating=requestAnimationFrame(starRotation);
            rotationNo+=0.05;
            this.light.rotation=rotationNo;
          }
        }
        starRotation()
      },
      //检测碰撞
      hitTest(r1, r2) {
        //所需变量
        let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

        hit = false;
        //两个参数的中心坐标
        r1.centerX = r1.x+r1.width/2;
        r1.centerY = r1.y + r1.height / 2;
        r2.centerX = r2.x + r2.width / 2;
        r2.centerY = r2.y + r2.height / 2;
        //两个参数的半宽 半高
        r1.halfWidth = r1.width / 2;
        r1.halfHeight = r1.height / 2;
        r2.halfWidth = r2.width / 2;
        r2.halfHeight = r2.height / 2;
        //两个参数之间的距离
        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;
        //两个参数 半宽 及半高 之和
        combinedHalfWidths = r2.halfWidth;
        combinedHalfHeights = r2.halfHeight;
        if (Math.abs(vy) < combinedHalfHeights) {

          //除了检查y方向 还要检查x方向
          if (Math.abs(vx) < combinedHalfWidths) {

            //如果都在碰撞范围 侧hit=true
            hit = true;
          } else {

            //如果有一个条件没达到则没有碰撞
            hit = false;
          }
        } else {

          hit = false;
        }

        return hit;
      },

      start:function(){
        this.running=true;
        this.monsterMove();
        this.starRotate();
      },
      pause:function(){
        this.monsterMoving&&cancelAnimationFrame(this.monsterMoving);
        this.starRotating&&cancelAnimationFrame(this.starRotating);
      },
      playAgin:function(){
        this.isGoOn=true;
        this.monsterContainer.x=0;
        this.dragnFail.visible=false;
        this.dragnAnimate.visible=true;
        this.light.visible=true;
        this.monster.visible=true;
        this.bloodBg.visible=true;
        this.blood.width=this.bloodCopy;
        this.starRotate();
        this.monsterMove();
      },

      check: function (chinese, index) {
        //防止重复点击
        if (this.chooseIdx !== -1) {
          return
        }
        // 当所点击内容的name正确时 执行以下操作
        this.chooseIdx = index;
        if (this.currWord.chinese == chinese) {
          //当所点击的下标小于单词数量时
          this.$refs.voice.playSuccess()
          this.currError = false;
          this.shoot();//小龙射击
          setTimeout(()=>{
            this.next()
          },1000)
        } else { 
          //选错的情况下chooseIdx
          this.currError = true;
          this.$refs.voice.playFailed()
          this.initOptions();
          let errorId = this.currWord.id;

          if (!this.wrongWords.find((item) => {
            return item === errorId
          })) {
            this.wrongWords.push(errorId)
          }
          this.errorTimes++
          setTimeout(()=>{
            if (this.errorTimes >= 2) {
              this.next();
            }
          },1000)
        }
      },
      //下一个
      next: function () {
        setTimeout(() => {
          this.chooseIdx = -1;
          this.errorTimes = 0;
          if (this.curr + 1 >= this.wordList.length) {
            this.pause();
            this.$emit('postResult', this.wrongWords);
          } else {
            this.curr++
          }
        }, 500)
      },
      //重新选择
      initOptions: function () {
        setTimeout(() => {
          this.chooseIdx = -1;
        }, 500)
      }
    },
    beforeDestroy() {
      // 释放资源
      console.log("-------arrgame destory start");
      // this.$store.commit("setLearningBack", true);
      // this.$store.commit('setIsGameing', false);
      this.pause();
      console.log("-----loader destroy");
      this.loader && this.loader.destroy();

      this.app.destroy(true);
      console.log("-------arrgame destory end");
    },
    components: {
      speaker,
      rightWrongVoice,
    }
  }
</script>

<style lang="scss" scoped>
  @import '~@/assets/css/variables.scss';
  .choose-word {
  	position: relative;
  	width: 100%;
  	height: 100%;
  	background:url('~@/assets/images/picWordBg.png') no-repeat;
    background-size:100% 100%;;
  	.choose-main {
  		position: absolute;
  		top: 360px;
  		bottom: 0;
  		left: 0;
  		right: 0;
  		padding: 15px;
  		.choose-content {
  			width: 100%;
  			height: 100%;
  			box-sizing: border-box;
  			// padding: $padding;
  			// border-radius: 30px;
  			// background: #ffffff;
  			overflow: hidden;
  			.word-container {
  				width: 100%;
  				// height: 200px;
  				// line-height: 100px;
  				text-align: center;
  				> p {
  					font-size: 80px;
            color:$nav-color;
            margin: 30px 0;
  				}
  			}
  			.word-list {
  				position: absolute;
  				list-style: none;
  				display: flex;
  				flex-wrap: wrap;
  				width: 100%;
  				height: 600px;
  				justify-content: space-between;
  				box-sizing: border-box;
  				padding: 10px 30px;
  				.item-container {
  					width: 50%;
  					height: 50%;
  					padding: 10px;
  					box-sizing: border-box;
  					.word-item {
  						text-align: center;
  						width: 100%;
  						height: 100%;
  						box-sizing: border-box;
  						border-radius: 20px;
  						text-align: center;
  						font-size: $big-font-size;
  						position: relative; //配合对 错 做绝对定位
  						display: flex;
  						justify-content: center;
  						align-items: center;
              background: $bg-color;
  						.right,
  						.error {
  							position: absolute;
  							top: 50%;
  							left: 50%;
  							transform: translate(-50%, -50%);
  						}
  						&:active {
  							background-color: $bg-color-warm;
  						}
  					}
  					.active {
  						background-color: $bg-color;
  						color: #000000;
  					}
  					.disable {
  						background-color: $disable-color;
  						color: #ffffff;
  					}
  				}
  			}
  		}
  	}
  	.content-container {
  		position: relative;
  	}
    .next {
      position: absolute;
      top:50px;
      left:40%;
      width: 20%;
      text-align: center;
      .btn {
        width: 100%;
        height: 70px;
        line-height: 70px;
        text-align: center;
        background:rgba(0, 0, 0, 0.3);
        margin: 0 auto;
        color: $nav-color;
        font-size: $normal-font-size;
        border-radius: 15px;
      }
    }
  	.fade-enter-active,
  	.fade-leave-active {
  		transition: all 1s;
  	}
  	.fade-enter,
  	.fade-leave-active {
  		opacity: 0;
  	}
  	.fade-enter {
  		transform: translateX(680px);
  	}
  	.fade-leave-active {
  		transform: translateX(-680px);
  	}
  }
</style>
