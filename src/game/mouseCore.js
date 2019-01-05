import * as PIXI from 'pixi.js'

export default class MouseCore extends PIXI.Container {
  /**
   * @constructor 构造函数 @param textures 是地鼠地洞等纹理
   * @memberof MouseCore
   */
  constructor(textures, vertigoTexture, callback) {
    super()
    this.errTexturs = textures.tapError;
    this.id = null;
    this.callback = callback;
    this.isDown = false; //老鼠是否下落
    this.isUp = false; //老鼠是否上升
    this.isStop = true;
    this.isMiddle = false; //老鼠是否在中立期
    this.number = null; //保存自己显示的第几个老鼠
    this.vertigoTexture = vertigoTexture
    this.downId = null;
    this.init(textures);
  }
  /**
   * 
   * @param {*} textures 
   *
   * @description 初始化地鼠的纹理
   * 
   * @param {any} textures 
   * @memberof MouseCore
   */
  init(textures) {
    this.tapRight = new PIXI.Sprite(textures.tapRight); //选对
    this.normal = new PIXI.Sprite(textures.normal); //地鼠正常
    this.mouseHole = new PIXI.Sprite(textures.mouseHole); //鼠洞
    this.mHthan = this.mouseHole.width / this.mouseHole.height;
    this.mouseHoleBefore = new PIXI.Sprite(textures.mouseHoleBefore); //鼠洞前
    this.mouseHoleColor = new PIXI.Sprite(textures.mouseHoleColor); //鼠洞颜色

    //地鼠的宽高比  
    this.kgThan = this.normal.width / this.normal.height;

    /**
     * 设置鼠洞的锚点， x y值
     */
    this.setConfig(this.mouseHole, this.mouseHole.width / 2, this.mouseHole.height / 2);

    /**
     * 创建一个容器用于盛放地鼠
     */
    this.mouseBox = new PIXI.Container();
    this.mouseBox.x = 0;
    this.mouseBox.y = this.mouseHole.height;
    this.mouseBox.width = this.normal.width;
    this.mouseBox.height = this.normal.height * 2;

    this.mouseHole.addChild(this.mouseBox);

    /**
     * 设置地鼠的锚点，x y 值
     */
    this.setConfig(this.normal, 0, this.mouseBox.height);
    this.setConfig(this.tapRight, 0, this.mouseBox.height);
    this.mouseBox.addChild(this.normal);
    //将正在容器中的地鼠保存
    this.target = this.normal;

    //添加鼠洞的前半部分
    this.mouseHole.addChild(this.mouseHoleBefore);
    this.setConfig(this.mouseHoleBefore, 0, 0);

    //将鼠洞添加进容器
    this.addChild(this.mouseHole);

    this.createMask();
    this.createText();

    //敲对后老鼠眩晕动画
    this.vertigo = new PIXI.extras.AnimatedSprite(this.vertigoTexture);
    this.setConfig(this.vertigo, 0, -this.mouseBox.height / 1.5);
    this.vertigo.animationSpeed = 0.1;
    this.vertigo.width = this.tapRight.width * 0.9;
    this.vertigo.height = this.tapRight.width * 0.9 * 0.7;
    this.tapRight.addChild(this.vertigo);
    this.vertigo.play();

  }
  reset() {
    this.isUp = false;
    this.isDown = false;
    this.isMiddle = false;
    this.interactive = false;
    this.id = null;
    this.upTicker = null;
    this.downTicker = null;
    if (this.target.y !== this.normal.height){
      this.target.y = this.normal.height;
    }
    if (this.target !== this.normal){
      this.target = this.normal;
    }
  }
  setConfig(Sprite, x, y) {
    Sprite.anchor.x = 0.5;
    Sprite.anchor.y = 1;
    Sprite.x = x;
    Sprite.y = y
  }
  tapMouseError() {
    let x = this.target.x;
    let y = this.target.y;
    this.tapError = new PIXI.extras.AnimatedSprite(this.errTexturs); //选错
    this.setConfig(this.tapError, 0, this.mouseBox.height);
    this.tapError.animationSpeed = 0.2;
    this.change(this.tapError);
    this.tapError.play();
  }
  stopTapError() {
    this.tapError.stop();
    this.isStop && this.down();
  }
  change(mouseSprite) { //更换地鼠处理函数
    let x = this.target.x;
    let y = this.target.y;
    this.mouseBox.removeChild(this.target);
    this.mouseBox.addChild(mouseSprite);
    mouseSprite.x = x;
    mouseSprite.y = y;
    this.target = mouseSprite;
    mouseSprite = null;

  }
  autoDown(time) {
    this.isStop = true;
    this.downId = setTimeout(() => {
      this.clearTime();
      this.down();
    }, time)
  }
  clearTime() {
    if (this.downId) {
      clearTimeout(this.downId);
      this.downId = null;
    }
  }
  //地鼠刚开始时的上升动画
  up() {
    if (!this.isUp) {
      this.isUp = true;
      this.currentUpY = this.currentUpY || this.target.y;
      this.upTicker = this.upTicker || new PIXI.ticker.Ticker();

      this.upTicker.speed = 10;
      this.upTicker.deltaTime = 1;
      this.upTicker.add((deltaTime) => {
        if (this.currentUpY <= -this.target.height + this.target.height * 0.15) {
          this.upTicker.stop();
          this.upTicker.destroy();
          this.upTicker = null;
          this.currentUpY = null;
          let time = parseInt(Math.random() * 1000 + 1000)
          this.autoDown(time);
          this.interactive = true;
          this.isUp = false;
          this.isMiddle = true;
          this.target.y = -this.target.height + this.target.height * 0.05
          this.mouseRock();
        } else {
          this.currentUpY -= deltaTime;
          this.target.y = this.currentUpY;
        }
      })
      this.upTicker.start();
    }
  }
  /**
   * 
   * 地鼠回落的效果动画
   * 
   * @memberof MouseCore
   */
  down() {
    this.interactive = false; //开始下落，不让点击
    this.clearTime();
    this.isMiddle = false;
    if (!this.isDown) {
      let _self = this;
      this.isDown = true;
      this.currentDownY = this.currentDownY || this.target.y;

      this.downTicker = this.downTicke || new PIXI.ticker.Ticker();
      this.downTicker.speed = 10;
      this.downTicker.deltaTime = 10;
      this.downTicker.add((deltaTime) => {
        if (this.currentDownY >= this.normal.height) { //下落完毕
          this.downTicker.stop();
          this.downTicker.destroy();
          this.downTicker = null;
          this.currentDownY = null;
          if (this.target !== this.normal) {
            this.change(this.normal);
          }
          if (this.tapError) {
            this.tapError.destroy()
            this.tapError = null;
          };
          this.interactive = false;
          this.isDown = false;
          //地鼠落下之后的回调
          this.callback({
            num: this.number,
            tarMouse: this
          });
        } else {
          this.currentDownY += deltaTime;
          this.target.y = this.currentDownY;
        }
      })
      this.downTicker.start();
    }
  }


  //游戏暂停
  gamePause() {
    this.clearTime();
    if (this.downTicker) {
      this.downTicker.stop();
    }
    if (this.upTicker) {
      this.upTicker.stop();
    }
    if (this.rID) {
      cancelAnimationFrame(this.rID)
    }
    if (this.tapError) {
      this.isStop = false;
      this.tapError.stop();
    }
  }
  createMask() {
    /**
     * 设置遮罩层  PIXI.Graphics
     */
    let MaskRect = new PIXI.Graphics()
    MaskRect.x = -this.normal.width * 1.5 / 2;
    MaskRect.y = -this.normal.height * 2.1;
    MaskRect.isMask = true;
    MaskRect.beginFill(0x000000, 1);
    MaskRect.drawRect(0, 0, this.normal.width * 1.5, this.normal.height * 1.1);
    MaskRect.endFill();
    this.mouseBox.mask = MaskRect;
    this.mouseBox.addChild(MaskRect);
  }
  /**
   * 创建文字
   */
  createText() {
    this.English = new PIXI.Text(" ", {
      // fontFamily:"cnfont",
      align: "center",
      fill: 0x840E20,
      fontSize: 40,
      fontWeight: 900,
      wordWrap: true,
      wordWrapWidth: this.normal.width * 0.9,
      lineHeight: 30
    })
    this.setConfig(this.English, 0, -this.mouseBox.height / 1.5);
    this.normal.addChild(this.English);
  }

  /**
   * 更改文字内容 和单词id
   */
  setText(text, id) {
    if (text) {
      this.English.text = text;
    }
    this.id = id || 0;
  }
  /**
   * 让地鼠晃起来
   */
  mouseRock() {
    let _self = this;
    let deg = 10;
    let current = 0;
    let index = 0.5;
    let huDu = Math.PI / 180;

    this.rID = requestAnimationFrame(rotateAmiate);
    //200毫秒后清除
    let timer = setTimeout(() => {
      cancelAnimationFrame(this.rID);
      clearTimeout(timer);
      timer = null;
      this.rID = null;
      this.normal.rotation = 0 * huDu;
    }, 200)

    function rotateAmiate() {
      _self.rID = requestAnimationFrame(rotateAmiate);
      if (current <= -deg) index = 2;
      else if (current >= deg) index = -2;
      current += index;
      _self.normal.rotation = current * huDu;
    }
  }
}
