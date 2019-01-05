import * as PIXI from 'pixi.js'
import _ from 'lodash'

import { Sprite } from '@/utility/game'
import { setTimeout } from 'timers';
/**
 * @description 单词所需字母
 * @class catch
 * @extends PIXI.Sprite
 * @param x 横坐标
 * @param y 纵坐标
 *
 * @method catchMove 控制气球的移动
 */

// export default class Catch extends PIXI.Sprite {
  export default class Catch extends PIXI.Container {
  constructor (options) {
    super(options.texture)
    this.loader = options.loader
    this.x=options.x
    this.y = options.y
    this.stage = options.stage
    this.list=options.list
    this.speed=options.speed
    this.ballAnimates=options.ballAnimates
    this.basket1=options.basket1
    this.basket2=options.basket2
    this.basket3=options.basket3
    this.basket4=options.basket4
    this.basket5=options.basket5
    this.checkHit1=options.checkHit1
    this.checkHit2=options.checkHit2
    this.checkHit3=options.checkHit3
    this.checkHit4=options.checkHit4
    this.checkHit5=options.checkHit5

    this.redAnimate=options.redAnimate
    this.yellowAnimate=options.yellowAnimate
    this.greenAnimate=options.greenAnimate
    this.blueAnimate=options.blueAnimate
    this.purpleAnimate=options.purpleAnimate


    this.moveBall=null  
    this.newPosition=null  
    this.wordSort=null
    this.ballNumber=null
    this.isBasket1=false
    this.isBasket2=false
    this.isBasket3=false
    this.isBasket4=false
    this.isBasket5=false
    this.ballSpeed=3
    this.tapNumber=0

    if (this.stage) {
      this.stage.addChild(this)
    }
    this.running=true
    this.createBall();
    this.createWord();
    this.doubleTap();
    this.ballTuch();
    this.ballMove();
  }

  createBall(){
    let _self = this;
    let resources = this.loader.resources 
    let n=Math.floor(Math.random()*5+1);
    let newBall = new Sprite({
      texture: resources[n].texture,
      x:0,
      y:0
    });
    newBall.anchor.x=0.5;
    _self.addChild(newBall);
    this.ballNumber=n;
    // this.checkColor1(this.wordSort);
  }
  createWord(){
    let _self=this;
    let wordsStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 40,
      align: "center",
      fontWeight: "bold",
      fill: ["#FFFFFF"],
      stroke: "#D93C05",
      strokeThickness: 3,
      wordWrap: true,
      breakWords: true,
      wordWrapWidth:130,
    });
    let m = Math.floor(Math.random() * this.list.length);
    this.wordSort=this.list[m].wordSort;//所显示单词词性
    let wordsText = new PIXI.Text(this.list[m].word, wordsStyle);
    wordsText.anchor.set(0.5);
    wordsText.y =80;
    _self.addChild(wordsText);


    //视图中显示的单词 不会出现重复的单词

    let newList=_.cloneDeep(this.list);
    console.log("---------newList1",newList);
    
    let nowTextArray=[];//视图中显示的单词数组
    this.ballAnimates.forEach(item => {
      // console.log("------------视图中显示的单词",item.children[1].text);
      nowTextArray.push(item.children[1].text);
    });
    if(nowTextArray.find(s=>{
      return s===wordsText.text;
    })){
      //删除视图中已显示的单词  重新组成一个单词数组
      nowTextArray.forEach(item=>{
        console.log("--------------------item",item);
        let index = newList.findIndex(a=> a.word===item);
        console.log("-----------------index",index);
        if(index!==-1&&newList.length>1){
          newList.splice(index,1);
          console.log("-------------newList2",newList);
        }
        
      });
      let n = Math.floor(Math.random() * newList.length);
      wordsText.text=newList[n].word;//将所生成的单词替换为新的单词
      this.wordSort=newList[n].wordSort;//重新生成的单词  所显示单词词性
      console.log("-----------所替换的单词",wordsText.text);
    }
  }
  ballMove(){
    let _self = this
    let Move=()=> {
      if(this.running){
        this.moveBall=requestAnimationFrame(Move);
        _self.y += this.ballSpeed;
        if(_self.y >= 650){
          _self.interactive=false;
          this.confirmWord();
        }
      }  
    }
    Move()
  }
  
  ballTuch(){//气球 触摸 移动功能
    // let _self=this;
    console.log("----------------------ballTuch");
    this.interactive = true;
    this.buttonMode = true;
    this
    .on("touchstart", this.moveStart)
    .on("touchmove", this.moving)
    .on("touchend", this.moveEnd)
    .on('touchendoutside', this.moveEnd);  
    console.log("-------------this",this);
  }
  //点击气球
  moveStart(event) {
    console.log("---------moveStart");
    this.data = event.data;
    this.draging = true;
    console.log("--------------this.data",this.data);
  }
  moving(event) {
    // console.log("---------moving");
    if (this.draging) {
      //左右移动过程中  停止下落 
      // cancelAnimationFrame(this.moveBall);
      this.running=false;
      //获取鼠标移动的位置
      this.newPosition = this.data.getLocalPosition(this.parent); 
      //超出边界
      if (this.newPosition.x > (this.basket5.x + this.basket5.width/2)) {
        this.position.x = this.basket5.x;
      } else if (this.newPosition.x <= (this.basket1.x-this.basket1.width/2)) {
        this.position.x = this.basket1.x;
      } else {
        this.position.x = this.newPosition.x;
      }
    }
  }
  //移动结束 松开
  moveEnd(event) {
    this.running=true;
    this.ballMove();
    // console.log("---------moveEnd");
    let endPosition = this.newPosition;
    if(endPosition){
      if (
        endPosition.x > (this.basket5.x-this.basket5.width/2) &&
        endPosition.x <= (this.basket5.x + this.basket5.width/2)
      ) {
        this.position.x = this.basket5.x;
      } else if (
        endPosition.x > (this.basket4.x-this.basket4.width/2) &&
        endPosition.x <= (this.basket5.x-this.basket5.width/2)
      ) {
        this.position.x = this.basket4.x ;
      } else if (
        endPosition.x > (this.basket3.x-this.basket3.width/2) &&
        endPosition.x <= (this.basket4.x-this.basket4.width/2)
      ) {
        this.position.x = this.basket3.x;
      } else if (
        endPosition.x > (this.basket2.x-this.basket2.width/2) &&
        endPosition.x <= (this.basket3.x-this.basket3.width/2)
      ) {
        this.position.x = this.basket2.x;
      } else if (
        endPosition.x > (this.basket1.x-this.basket1.width/2) &&
        endPosition.x <= (this.basket2.x-this.basket2.width/2)
      ) {
        this.position.x = this.basket1.x;
      }
    }
    this.data = null;
    this.draging = false;
    // this.interactive = false;
    this.buttonMode = false;
    
  }

  confirmWord(){
    let _self = this
    // console.log("----------_self[1].text",_self.children[1].text);
    let hitWord=_self.children[1].text;
    

    //检测碰撞 如果与球框1相撞  与球框2相撞 与球框3相撞....
    if(this.hitTest(_self, this.basket5)){
      console.log("---------球 碰 5");
      this.stage.removeChild(_self);
      this.running=false;
      this.ballAnimates.shift();
      cancelAnimationFrame(this.moveBall);
     
      let a = ['adv','adj','v','n'];
      //判断落下单词的 词性
      if(!this.wordSort.find(s =>{
        let bool=a.find(x=> x===s);
        if(bool){
          return true
        }else{
          return false
        }
      })){
        console.log("选对---其他");
        this.isBasket5=true;

        this.delNowWord(hitWord);
      }else{
        console.log("选错---这是",this.wordSort);
        this.isBasket5=false;
        //相应气球飞走动画
        if(this.ballNumber==1){
          this.redAnimate.x=600;
          this.redAnimatePlay();
        }else if(this.ballNumber==2){
          this.purpleAnimate.x=600;
          this.purpleAnimatePlay();
        }else if(this.ballNumber==3){
          this.yellowAnimate.x=600;
          this.yellowAnimatePlay();
        }else if(this.ballNumber==4){
          this.blueAnimate.x=600;
          this.blueAnimatePlay();
        }else if(this.ballNumber==5){
          this.greenAnimate.x=600;
          this.greenAnimatePlay();
        }
      }
      this.checkHit5(this.isBasket5);
    }else if(this.hitTest(_self, this.basket4)){
      console.log("---------球 碰 4");
      this.stage.removeChild(_self);
      this.running=false;
      this.ballAnimates.shift();
      cancelAnimationFrame(this.moveBall);
      //判断落下单词的 词性
      if(this.wordSort.find(s => s==='adv')){
        console.log("选对---adv");
        this.isBasket4=true;

        this.delNowWord(hitWord);
      }else{
        console.log("选错---这是",this.wordSort);
        this.isBasket4=false;
        this.isBasket5=false;
        //相应气球飞走动画
        if(this.ballNumber==1){
          this.redAnimate.x=350;
          this.redAnimatePlay();
        }else if(this.ballNumber==2){
          this.purpleAnimate.x=350;
          this.purpleAnimatePlay();
        }else if(this.ballNumber==3){
          this.yellowAnimate.x=350;
          this.yellowAnimatePlay();
        }else if(this.ballNumber==4){
          this.blueAnimate.x=350;
          this.blueAnimatePlay();
        }else if(this.ballNumber==5){
          this.greenAnimate.x=350;
          this.greenAnimatePlay();
        }
      }
      this.checkHit4(this.isBasket4);
    }else if(this.hitTest(_self, this.basket3)){
      console.log("---------球 碰 3");
      this.stage.removeChild(_self);
      this.running=false;
      this.ballAnimates.shift();
      cancelAnimationFrame(this.moveBall);
      //判断落下单词的 词性
      if(this.wordSort.find(s => s==='adj')){
        console.log("选对---adj");
        this.isBasket3=true;

        this.delNowWord(hitWord);
      }else{
        console.log("选错---这是",this.wordSort);
        this.isBasket3=false;
        this.isBasket5=false;
        //相应气球飞走动画
        if(this.ballNumber==1){
          this.redAnimate.x=150;
          this.redAnimatePlay();
        }else if(this.ballNumber==2){
          this.purpleAnimate.x=150;
          this.purpleAnimatePlay();
        }else if(this.ballNumber==3){
          this.yellowAnimate.x=150;
          this.yellowAnimatePlay();
        }else if(this.ballNumber==4){
          this.blueAnimate.x=150;
          this.blueAnimatePlay();
        }else if(this.ballNumber==5){
          this.greenAnimate.x=150;
          this.greenAnimatePlay();
        }
      }
      this.checkHit3(this.isBasket3);
    }else if(this.hitTest(_self, this.basket2)){
      console.log("---------球 碰 2");
      this.stage.removeChild(_self);
      this.running=false;
      this.ballAnimates.shift();
      cancelAnimationFrame(this.moveBall);
      //判断落下单词的 词性
      if(this.wordSort.find(s => s==='v')){
        console.log("选对---v");
        this.isBasket2=true;

        // this.list.forEach((item,index)=>{
        //   // console.log(item.word);
        //   if(item.word==hitWord){
        //     console.log("--------------删除2");
        //     this.list.splice(index,1);
        //     console.log("---------this.list",this.list);
        //   }
        // });
        this.delNowWord(hitWord);
      }else{
        console.log("选错---这是",this.wordSort);
        this.isBasket2=false;
        this.isBasket5=false;
        //相应气球飞走动画
        if(this.ballNumber==1){
          this.redAnimate.x=-70;
          this.redAnimatePlay();
        }else if(this.ballNumber==2){
          this.purpleAnimate.x=-70;
          this.purpleAnimatePlay();
        }else if(this.ballNumber==3){
          this.yellowAnimate.x=-70;
          this.yellowAnimatePlay();
        }else if(this.ballNumber==4){
          this.blueAnimate.x=-70;
          this.blueAnimatePlay();
        }else if(this.ballNumber==5){
          this.greenAnimate.x=-70;
          this.greenAnimatePlay();
        }
      }
      this.checkHit2(this.isBasket2);
    }else if(this.hitTest(_self, this.basket1)){
      console.log("---------球 碰 1");
      this.stage.removeChild(_self);
      this.running=false;
      this.ballAnimates.shift();
      cancelAnimationFrame(this.moveBall);
      //判断落下单词的 词性
      if(this.wordSort.find(s => s==='n')){
        console.log("选对---n");
        this.isBasket1=true;

        this.delNowWord(hitWord);
      }else{
        console.log("选错---这是",this.wordSort);
        this.isBasket1=false;
        this.isBasket5=false;
        //相应气球飞走动画
        if(this.ballNumber==1){
          this.redAnimate.x=-300;
          this.redAnimatePlay();
        }else if(this.ballNumber==2){
          this.purpleAnimate.x=-300;
          this.purpleAnimatePlay();
        }else if(this.ballNumber==3){
          this.yellowAnimate.x=-300;
          this.yellowAnimatePlay();
        }else if(this.ballNumber==4){
          this.blueAnimate.x=-300;
          this.blueAnimatePlay();
        }else if(this.ballNumber==5){
          this.greenAnimate.x=-300;
          this.greenAnimatePlay();
        }
      }
      this.checkHit1(this.isBasket1);
    }
    
  }
  //检测碰撞
  hitTest(r1, r2) {
    //所需变量
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    hit = false;
    //两个参数的中心坐标
    r1.centerX = r1.x;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x;
    r2.centerY = r2.y + r2.height / 2;
    //两个参数的半宽 半高
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
    //两个参数之间的距离
    vx = r1.centerX - r2.centerX;
    vy =r2.y-r1.y;
    //两个参数 半宽 及半高 之和
    combinedHalfWidths = r2.halfWidth;
    combinedHalfHeights = r2.halfHeight/2;
    if (Math.abs(vx) < combinedHalfWidths) {

      //除了检查y方向 还要检查x方向
      if (Math.abs(vy) < combinedHalfHeights) {

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
  }
  // 选对之后将相应的单词删除
  delNowWord(hitWord){
    this.list.forEach((item,index)=>{
      // console.log(item.word);
      if(item.word==hitWord){
        console.log("--------------删除");
        this.list.splice(index,1);
        console.log("---------this.list",this.list);
      }
    });
  }
  doubleTap(){
    this.interactive = true;
    this.buttonMode = true;
    this
    .on("tap",e=>{
      this.tapNumber++;
      console.log("----------this.tapNumber",this.tapNumber);
      let timer=setTimeout(()=>{
        this.tapNumber=0;
      },400);
      if(this.tapNumber>=2){
        this.ballSpeed*=3;
      }
    })
  }

  //不同气球的飞走动画播放
  redAnimatePlay(){
    this.redAnimate.visible=true;
    this.redAnimate.gotoAndPlay(0);
    let that=this;
    this.redAnimate.onComplete=function(){
      that.redAnimate.visible=false;
    }
  }
  yellowAnimatePlay(){
    this.yellowAnimate.visible=true;
    this.yellowAnimate.gotoAndPlay(0);
    let that=this;
    this.yellowAnimate.onComplete=function(){
      that.yellowAnimate.visible=false;
    }
  }
  blueAnimatePlay(){
    this.blueAnimate.visible=true;
    this.blueAnimate.gotoAndPlay(0);
    let that=this;
    this.blueAnimate.onComplete=function(){
      that.blueAnimate.visible=false;
    }
  }
  greenAnimatePlay(){
    this.greenAnimate.visible=true;
    this.greenAnimate.gotoAndPlay(0);
    let that=this;
    this.greenAnimate.onComplete=function(){
      that.greenAnimate.visible=false;
    }
  }
  purpleAnimatePlay(){
    this.purpleAnimate.visible=true;
    this.purpleAnimate.gotoAndPlay(0);
    let that=this;
    this.purpleAnimate.onComplete=function(){
      that.purpleAnimate.visible=false;
    }
  }


  play(){
    this.running=true;
    this.ballMove();
  }

  stop(){
    this.running=false;
  }
}
