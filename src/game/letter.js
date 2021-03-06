import * as PIXI from 'pixi.js'
import { Sprite } from '@/utility/game'
/**
 * @description 单词所需字母
 * @class letter
 * @extends PIXI.Sprite
 * @param x 横坐标
 * @param y 纵坐标
 *
 * @method wordMove 控制字母的移动
 */

export default class Letter extends PIXI.Sprite {
  constructor (options) {
    super(options.texture)
    this.loader = options.loader
    this.x=options.x
    this.y = options.y
    this.stage = options.stage
    this.speed=options.speed
    this.wordAnimates=options.wordAnimates
    this.basketContainer=options.basketContainer
    this.letter=options.letter
    this.checkWord=options.checkWord


    this.moving=null
    

    if (this.stage) {
      this.stage.addChild(this)
    }
    this.running=true
    this.letterMove()
  }

  letterMove(){
    let _self = this
    let Move=()=> {
      if(this.running){
        this.moving=requestAnimationFrame(Move);
        _self.x -= 7;
        this.confirmLetter();
        if (_self.x <= -_self.width) {
          this.stage.removeChild(_self);
          this.running=false;
          this.wordAnimates.shift();
          cancelAnimationFrame(this.moving);
          // console.log("-------this.wordAnimates2",this.wordAnimates)
        }
      }  
    }
    Move()
  }

  confirmLetter(){
    let _self = this
    if(this.hitTest(_self,this.basketContainer)){
      // console.log("---------------------------_self",_self);
      // console.log("-------------------this.letter",this.letter);
      this.stage.removeChild(_self);
      this.running=false;
      this.wordAnimates.shift();
      cancelAnimationFrame(this.moving);
      this.checkWord(this.letter);
      
    }
    
  }

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
  };


  play(){
    this.running=true;
    this.letterMove();
  }

  stop(){
    this.running=false;
  }

  destroy () {
    super.destroy(true)
  }
}
