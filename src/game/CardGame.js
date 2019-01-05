import * as PIXI from 'pixi.js'
import _ from "lodash"
/**
 * 
 * @description 用于处理卡牌的类
 * 
 * @export
 * @class Card
 * @extends PIXI.Container
 * 
 * @method resversal() 用于控制卡牌的翻转
 * @method removeSelf()  
 */

export default class Card extends PIXI.Container {
  constructor(animationTexture) {
    super();
    this.cardId = null;
    this.removeComplete = null;
    this.info = null;
  }
  /**
   * 
   * @method init() 初始化数据
   * @param {Array} animationTexture 答对后的特效
   * @param {Array} revTextures 翻转动效  
   */
  init(animationTexture,revTextures) {
    let len = revTextures.length;
    let turnTexture = revTextures[len-1]
    let coverTexture = revTextures[0]
    let _self = this;
    this.turn = new PIXI.Sprite(turnTexture)
    this.cover = new PIXI.Sprite(coverTexture)
    this.cover.x =  this.turn.x= 0
    this.cover.y =  this.turn.y= 0

    this.turn.visible = false;

    let w = this.turn.width;
    let h = this.turn.height

    //正反转动效
    this.coverAnimation = this.createAnimation({
      textures:revTextures,
    });
    this.coverAnimation
    
      
    revTextures = _.cloneDeep(revTextures)
    revTextures = revTextures.reverse();
    //逆反转动效
    this.turnAnimation = this.createAnimation({
      textures:revTextures,
    });
    //卡牌正确特效
    this.animation = this.createAnimation({
      textures:animationTexture,
      x:w / 2,
      y:h / 2,
      anchor:true,
      speed:0.3
    });
    this.animation.width = this.animation.width * 1.8;
    this.animation.height = this.animation.height * 1.8;
    this.animation.onComplete = function () { //播放完成时的处理函
      if (_self.removeComplete) {
        _self.removeComplete.call();
      }
      _self.visible = false;
    }

    this.addChild(this.cover)
    this.addChild(this.turn)
  }
  createAnimation(options){
    let animation = new PIXI.extras.AnimatedSprite(options.textures);
    animation.x =options.x || 0;
    animation.y = options.y || 0;
    if(options.anchor){
      animation.anchor.set(0.5);
    }
    animation.loop = options.loop || false;
    animation.animationSpeed = options.speed || 1;
    animation.visible = false;
    this.addChild(animation)
    return animation;
  }
  /**
   * 
   * 
   * @param {any} options 
   * @returns 
   * @memberof Card
   */
  drawInfo(options) {
    if (!options) return;
    this.cardId = options.id || 0;
    let width = this.cover.width;
    let height = this.cover.height;
    if (options.isText) {
        let text = options.text || " ";
        this.info = new PIXI.Text(options.text, {
          fontFamily: "Microsoft YaHei",
          fontSize: 36,
          fontWeight: 900,
          fill: 0x00C8FE,
          algin: "center",
          wordWrap: true,
          wordWrapWidth: width * 0.9
        });
    } else {
        if (!options.texture) return;
        this.info = new PIXI.Sprite(options.texture);
        this.info.width = width * 0.8;
        this.info.height = width * 0.8;
    }
    this.info.anchor.set(0.5);
    this.info.x = width / 2;
    this.info.y = height / 2;
    this.turn.addChild(this.info);
  }

  /**
   * @author
   * @description 实现两张卡牌的翻转
   * @memberof Container
   * 
   */
  resversal(fn) {
    let _self = this;
    this.interactive = false;
    this.coverAnimation.visible = true;
    this.cover.visible = false;
    if(this.coverAnimation){
      this.coverAnimation.gotoAndPlay(0);
    }
    this.coverAnimation.onComplete = function(){
        this.visible = false;
        _self.turn.visible = true;
        fn && fn.call()
    }
  }
  /**
   * 
   * @description 控制卡牌回转，当对比不正确时执行这个函数
   * 
   * @memberof Container
   */
  turnResval(callback) {
    let _self = this;
    this.turn.visible = false;
    this.turnAnimation.visible = true;
    this.turnAnimation.gotoAndPlay(0);
    this.turnAnimation.onComplete = function(){
      _self.interactive = true;
      this.visible = false;
      _self.cover.visible = true;
      callback && callback.call()
    }
  }
  /**
   * 动画显示和
   * 移除自身
   * 
   * @memberof Container
   */
  removeSelf() {
    this.turn.visible = false;
    this.animation.visible = true;
    this.animation.play(); //开始播放
  }
}
