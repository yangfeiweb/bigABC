import * as PIXI from 'pixi.js'
import { Sprite } from '@/utility/game'
import { clearInterval } from 'timers';
/**
 * @description 游戏顶部 操作bar 包括开始、暂停、字母、图片、返回按钮
 * @class flyBar
 * @extends PIXI.Sprite
 * @param x 横坐标
 * @param y 纵坐标
 *
 * @method cloudMove 控制云的移动
 */

export default class FlyBar extends PIXI.Sprite {
  constructor (options) {
    super(options.texture)
    this.loader = options.loader
    this.onPause = options.onPause
    this.onPlay = options.onPlay
    this.onReturn = options.onReturn
    this.onOver = options.onOver
    this.list=options.list
    this.currStep=options.currStep
    this.wordArray=options.wordArray
    this.getBigContainer=options.getBigContainer
    this.NowWord=options.NowWord
    console.log("------fly---this.wordArray",this.wordArray);

    this.currStepCopy=this.currStep
    this.wordArrayCopy=this.wordArray
    this.NowWordCopy=this.NowWord


    this.imgPublicRoot = 'static/images/game/public/'
    this.imgRoot= "static/images/game/fly/"
    this.imgType = '.png'
    if (!this.loader) {
      throw new Error('Cannot found loader object!')
    }

    this.stage=null
    this.playBtn = null
    this.wordBg=null
    this.wordText = null
    this.showImg=null
    this.bigContainer=null
    this.imgContainer=null
    this.playing = false
    this.loadResource()
  }
  publicImgs(){
    return [
      'return',
      'pause',
      'play'
    ]
  }
  spriteImgs () {
    return [
      "picBg",
      "wordBg"
    ]
  }
  loadResource () {
    let pubImgs = this.publicImgs()
    let Imgs=this.spriteImgs()
    pubImgs.forEach(item => {
      let itemPath = this.imgPublicRoot + item + this.imgType
      this.loader.add(item, itemPath)
    })
    Imgs.forEach(item => {
      let itemPath = this.imgRoot + item + this.imgType
      this.loader.add(item, itemPath)
    }) 
  }
  init (stage) {
    this.stage = stage;
    let resources = this.loader.resources

    // 创建开始按钮 容器
    let playContainer = new PIXI.Container()

    this.playBtn = new Sprite({
      texture: resources['play'].texture,
      x: 30,
      y: 0
    })
    this.playBtn.anchor.y = 0.5
    playContainer.addChild(this.playBtn)

    playContainer.x = 0
    playContainer.y = 95
    stage.addChild(playContainer)
    playContainer.interactive = true
    playContainer.on('tap', e => {
      e.stopPropagation();
      if (this.duration <= 0) {
        return
      }
      if (this.playing) {
        if (this.onPause) {
          this.onPause()
        }
        this.pause()
      } else {
        if (this.onPlay) {
          this.onPlay()
        }
        this.play()
      }
    })
    

    //字母显示区域
    this.bigContainer = new PIXI.Container();
    this.bigContainer.x=366;
    this.bigContainer.y=17;
    stage.addChild(this.bigContainer);
    //单词字母显示区域
    this.createWordShow();
    
    
    //图片显示区域
    this.imgContainer = new PIXI.Container();
    this.imgContainer.x=1460;
    this.imgContainer.y=0;
    stage.addChild(this.imgContainer);
    this.createImgShow();
    
    this.getBigContainer(this.bigContainer,this.imgContainer);
    // this.createBigContainr();
    // 创建返回按钮 精灵
    let goBack = new Sprite({
      texture: resources['return'].texture,
      x: 1720,
      y: 95
    })
    goBack.anchor.y = 0.5
    goBack.interactive = true
    goBack.on('tap', e => {
      e.stopPropagation();
      if (this.onReturn) {
        this.onReturn()
      }
    })
    stage.addChild(goBack)

  }
  createWordShow(){
    let resources = this.loader.resources


    let style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 64,
      align: "center",
      fontWeight: 'bold',
      fill: ['#ffffff'], 
    });
    //生成阴影框
    for(let i=0;i<this.list[this.currStep].word.length;i++){
      let wordContainer = new PIXI.Container();
      wordContainer.x=i*98+30;
      this.wordBg = new Sprite({//阴影
        texture: resources['wordBg'].texture,
        x: 0,
        y: 0
      })
      this.wordBg.anchor.set(0.5);
      wordContainer.addChild(this.wordBg);
      wordContainer.y=this.wordBg.height/2;
      
  
      this.wordText = new PIXI.Text('n', style);//字母
      this.wordText.anchor.set(0.5);
      this.wordText.visible=false;
      wordContainer.addChild(this.wordText);
      
      this.bigContainer.addChild(wordContainer);
      
      this.wordText.text=this.wordArray[i];
    }
  }
  createImgShow(){
    let resources = this.loader.resources
    let imgBg = new Sprite({
      texture: resources['picBg'].texture,
      x: 0,
      y: 95
    })
    imgBg.anchor.y = 0.5; 
    this.imgContainer.addChild(imgBg);

    let m=this.list[this.currStep].imgUrl
    this.showImg = new Sprite({
      texture: resources[m].texture,
      x: 10,
      y: 95,
      width:140,
      height:140
    }) 
    this.showImg.anchor.y = 0.5;
    this.imgContainer.addChild(this.showImg);
  }
  updateCurrStep(wordArray,currStep){
    this.wordArray=wordArray;
    this.currStep=currStep;
    console.log("----fly--this.wordArray",this.wordArray);
    this.createWordShow();
    this.createImgShow();
  }

  stop () {
    this.playing = false
  }
  play () {
    if (this.playing) {
      return
    }
    this.playing = true
    this.playBtn.texture = this.loader.resources['pause'].texture
  }
  pause () {
    if (this.playing) {
      this.playing = false
      this.playBtn.texture = this.loader.resources['play'].texture
    }
  }
  over () {
    this.playing = false
    this.playBtn.texture = this.loader.resources['play'].texture
    if (this.onOver) {
      console.log('-----opt..over')
      this.onOver()
    }
  }
  reset () {
    this.currStep = this.currStepCopy
    this.wordArray = this.wordArrayCopy
    this.NowWord = this.NowWordCopy
    this.playing = false
    // this.stage.removeChild(this.bigContainer);
    // this.createBigContainr();
  }
  destroy () {
    super.destroy(true)
  }
}
