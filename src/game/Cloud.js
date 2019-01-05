import * as PIXI from 'pixi.js'
/**
 * @description 云类，实现云层的创建和移动效果,打地鼠游戏
 * @class Cloud
 * @extends PIXI.Sprite
 * @param x 横坐标
 * @param y 纵坐标
 * @param speed  云的移动速度
 *
 * @method cloudMove 控制云的移动
 */

export default class Cloud extends PIXI.Sprite {
  constructor (options) {
    super(options.texture)
    this.x = options.x
    this.y = options.y
    let scale = options.scale || 1
    this.scale = { x: scale, y: scale }
    let stage = options.stage
    this.stageWidth = options.sw // 舞台的宽度
    if (stage) {
      stage.addChild(this)
      this.stageWidth = stage.width
    }
    if (options.speed) {
      this.speed = options.speed
    } else {
      this.speed = Math.random() * 0.5 + 0.3 // 云移动的速度，随机产生
    }
    this.running = false
  }
  cloudMove () {
    let _self = this
    let move = () => {
      if(this.running && _self){
        this.moveID = requestAnimationFrame(move)
        _self.x = _self.x - _self.speed
        if (_self.x <= -_self.width) {
          _self.x = _self.stageWidth + _self.width
        }
      }
    }
    move()
  }
  stop () {
    this.running = false
    if(this.moveID){
     cancelAnimationFrame(this.moveID)
     this.moveID = null;
    }
  }
  play () {
    this.running = true
    this.cloudMove()
  }
  destroy () {
    // this.running = false
    this.stop();
    super.destroy()
  }
}
