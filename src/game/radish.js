import * as PIXI from 'pixi.js'

/**
 * @description radish游戏中的怪物类
 * @class Monsoter
 * @extends PIXI.Container
 */
export default class Monsoter extends PIXI.Container {
  constructor(options) {
    super();
    this.curr = 0; //表示当前怪物应遵守第几个规则
    this.borderMove = 0; //当前移动的边界
    this.speed = 3; //怪物的移动速度
    this.moveId = 111111; // 无意义
    this.wings = options.wings; //翅膀纹理集合
    this.dieEffects = options.diesAfft; // 死亡纹理集合
    this.monsoterTexture = options.monsoterTexture; //怪物纹理
    this.shadowTexture = options.shadowTexture; //阴影纹理
    this.ghostTexture = options.ghostTexture; //鬼魂的阴影
    this.dragonBox = options.dragonBox //存放小龙的游戏，判断游戏是否结束
    this.rules = options.rules; //移动规则
    this.moveComplete = null;
    this.isMoving = true;
    this.mID = null; //这个怪物在数组里的下标
  }
  init() {

    this.monBox = createBox(); //怪物容器
    this.monster = new PIXI.Sprite(this.monsoterTexture); //怪物纹理
    let monsterWidth = this.monster.width;
    let monsterHeight = this.monster.height;
    this.monster.anchor.set(0.5);
    this.monster.x = monsterWidth / 2;
    this.monster.y = 0;
    this.monsoterTexture = null;
    this.shBox = createBox(); //阴影容器
    this.shadow = new PIXI.Sprite(this.shadowTexture);
    this.shadow.anchor.set(0.5);
    this.shadow.x = monsterWidth / 2;
    this.shadow.y = monsterHeight / 3;
    this.shBox.addChild(this.shadow);
    this.addChild(this.shBox)
    this.addChild(this.monBox);
    this.shadowTexture = null;
    //小翅膀
    this.wing = new PIXI.extras.AnimatedSprite(this.wings);
    this.wing.anchor.set(0.5);
    this.wing.x = monsterWidth / 2;
    this.wing.y = -monsterHeight / 2;
    this.monBox.addChild(this.wing);
    this.wing.animationSpeed = 0.1;
    this.monBox.addChild(this.monster);
    this.wings = null;

    //绘制鬼魂
    this.ghost = new PIXI.extras.AnimatedSprite(this.ghostTexture)
    this.ghost.anchor.set(0.5);
    this.ghost.x = monsterWidth / 2;
    this.ghost.y = 0;
    this.ghost.animationSpeed = 0.1;
    this.ghost.loop = false;
    this.addChild(this.ghost);
    this.ghost.visible = false;

    function createBox() {
      let box = new PIXI.Container();
      box.x = 0;
      box.y = 0;
      return box;
    }
  }
  //怪物移动并控制轨迹
  startMove() {
    let _self = this;
    let dragonY = this.dragonBox.y + this.dragonBox.height / 2; //小龙所在的容器，接触即游戏结束
    let halfWidth = this.monster.width / 2;
    let  halfHeight = this.monster.height / 2;
    this.wing.play();
    this.isMoving = true;
    this.moveId = requestAnimationFrame(move);

    function move() {
      if (_self && _self.isMoving) {
        _self.moveId = requestAnimationFrame(move);
        if (_self.curr === 0) {
          _self.y -= _self.speed;
          if (_self.y <= _self.borderMove + halfHeight) {
            _self.curr++;
            _self.borderMove = _self.rules[1].x;
          }
        } else if (_self.curr === 1) {
          _self.x += _self.speed;
          if (_self.x >= _self.borderMove - halfWidth / 2) {
            _self.curr++;
            _self.borderMove = _self.rules[2].y;
          }
        } else if (_self.curr === 2) {
          _self.y += _self.speed;
          if (_self.y + _self.height / 2 >= _self.borderMove - halfHeight) {
            _self.curr++;
            _self.borderMove = _self.rules[3].x;
          }
        } else if (_self.curr === 3) {
          _self.x += _self.speed;
          if (_self.x + _self.width / 1.7 >= _self.borderMove - halfWidth) {
            _self.curr++;
            _self.borderMove = _self.rules[4].y;
          }
        } else if (_self.curr === 4) {
          _self.y += _self.speed;
          if (_self.y + _self.height / 1.3 >= _self.borderMove - halfHeight) {
            _self.curr++;
            _self.borderMove = _self.rules[5].x;
          }
        } else if (_self.curr === 5) {
          _self.x += _self.speed;
          if (_self.x + _self.width >= _self.borderMove - halfWidth * 1.5) {
            _self.curr++;
            _self.borderMove = _self.rules[6].y;
          }
        } else if (_self.curr === 6) {
          _self.y -= _self.speed;
          if (_self.y < dragonY) {
            _self.stopMove();
            _self.moveComplete && _self.moveComplete(_self);
          }
        }
      } else {
        return
      }
    }


  }

  //停止移动
  stopMove() {
    this.isMoving = false;
    if (!this.moveId) return;
    cancelAnimationFrame(this.moveId);
    this.moveId = null;
    this.wing.stop();
  }
  //击中怪物后的特效
  handleAfteEffect() {
    this.stopMove(); //停止移动
    let _self = this;
    let _width = this.monster.width;
    let _height = this.monster.width;
    //特效
    this.dieEffect = new PIXI.extras.AnimatedSprite(this.dieEffects);
    this.dieEffect.anchor.set(0.5);
    this.dieEffect.x = _width / 2;
    this.dieEffect.y = 0;
    this.addChild(this.dieEffect);
    this.dieEffect.loop = false;
    this.dieEffect.animationSpeed = 0.1;
    this.dieEffect.onComplete = function () {
      _self.monsterDie();
    }
    this.shBox.visible = false;
    this.monBox.visible = false;
    this.dieEffect.play();
  }
  //增加速度
  addSpeed() {
    this.speed += 1;
  }
  //孤魂动画
  monsterDie() {
    this.stopMove();
    this.ghost.visible = true;
    this.ghost.play();
    let _self = this,
      speedY = -0.1,
      speedX = -0.1,
      alpha = -0.05;
    this.ghostID = requestAnimationFrame(ghostUp)

    function ghostUp() {
      _self.ghostID = requestAnimationFrame(ghostUp);
      _self.ghost.y += speedY;
      _self.ghost.x += speedX;
      _self.ghost.alpha += alpha;
      if (_self.ghost.alpha <= 0) {
        //结束动画,将一些数据还原成动画前
        cancelAnimationFrame(_self.ghostID);
        _self.stopMove();
        _self.ghost.stop();
        _self.destroy();
      }

    }

  }
}
