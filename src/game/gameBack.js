import * as PIXI from 'pixi.js'

/**
 * 
 * 
 * @export
 * @class GameBack
 * @extends {PIXI.Container}
 */
export default class GameBack extends PIXI.Container {

  constructor() {
    super();
    this.cancelCallback = null; // 取消的回调函数
    this.certainCallback = null; // 确认函数
    this.init();
  }
  init() {
    let picUrl = [
      "static/images/game/public/cancle-btn.png",
      "static/images/game/public/certain-btn.png",
      "static/images/game/public/right-cancle.png",
      "static/images/game/public/tip-plate.png",
    ];
    this.loader = new PIXI.loaders.Loader();

    picUrl.forEach(url => {
      if (!this.loader.resources[url]) {
        this.loader.add(url);
      }
    })

    this.loader.on("complete", (loader, res) => {
      this.onComplete(loader, res)
    })
    this.loader.load();
    picUrl = null;
  }
  onComplete(loader, res) {
    let maskBack = new PIXI.Graphics();
        maskBack.x = 0;
        maskBack.y = 0;
        maskBack.beginFill(0x000000,0.1)
        maskBack.drawRect(0,0,1920,1080)
        maskBack.endFill();
        maskBack.interactive = true;
       this.addChild(maskBack)
    let tipPlate = new PIXI.Sprite(res["static/images/game/public/tip-plate.png"].texture);
        tipPlate.x = 250;
        tipPlate.y = 100;
        tipPlate.interactive = true;
    this.addChild(tipPlate); //取消按钮
    let cancleBtn = new PIXI.Sprite(res["static/images/game/public/cancle-btn.png"].texture);
        cancleBtn.anchor.y = 1;
        cancleBtn.x = 700;
        cancleBtn.y = tipPlate.height;
        cancleBtn.interactive = true;
        cancleBtn.on("tap", this.cancelBtn.bind(this)) //确认按钮
    let certainBtn = new PIXI.Sprite(res["static/images/game/public/certain-btn.png"].texture);
        certainBtn.anchor.y = 1;
        certainBtn.x = 200;
        certainBtn.y = tipPlate.height;
        certainBtn.interactive = true;
        certainBtn.on("tap", this.certainBtn.bind(this));
        tipPlate.addChild(certainBtn)
        tipPlate.addChild(cancleBtn) //右上角取消按钮
    let rightCancle = new PIXI.Sprite(res["static/images/game/public/right-cancle.png"].texture);
        rightCancle.x = tipPlate.width - rightCancle.width - 40
        rightCancle.y = 150
        tipPlate.addChild(rightCancle)
        rightCancle.interactive = true
        rightCancle.on("tap", this.cancelBtn.bind(this)) // 提示文字
    let text = '确认退出吗？退出后所得分数将不计入总分';
        let style = {
          fontSize: 48,
          align: "center",
          fill: 0xC9533F,
          fontWeight: 900
        }
    let tipText = new PIXI.Text(text, style);
        tipText.anchor.set(0.5);
        tipText.x = tipPlate.width / 2;
        tipText.y = tipPlate.height / 2 + 75;
        tipPlate.addChild(tipText);
        certainBtn = rightCancle = tipText = tipPlate = null;
        cancleBtn = null;
        this.visible = false;
  }
  cancelBtn(e) { //取消
    e.stopPropagation()
    this.hide();
    if (this.cancelCallback && typeof this.cancelCallback === "function") {
      this.cancelCallback.call();
    }
  }
  certainBtn(e) { //确认
    e.stopPropagation()
    if (this.certainCallback && typeof this.certainCallback === "function") {
      this.certainCallback.call();
    }
  }
  //显示返回框
  show() {
    this.visible = true;
  }
  //隐藏返回框
  hide() {
    this.visible = false;
  }
  destroy() {
    this.certainCallback = null;
    this.cancelCallback = null;
    this.loader.destroy();
    super.destroy(true);
  }
}
