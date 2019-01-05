import * as PIXI from 'pixi.js'
import { Sprite } from '@/utility/game'
/**
 * @description 游戏顶部 操作bar 包括开始、暂停、进度、分数、返回按钮
 * @class optBar
 * @extends PIXI.Sprite
 * @param x 横坐标
 * @param y 纵坐标
 *
 * @method cloudMove 控制云的移动
 */

export default class OptBar extends PIXI.Sprite {
  constructor (options) {
    super(options.texture)
    // this.x = options.x
    // this.y = options.y
    this.loader = options.loader
    this.onPause = options.onPause
    this.onPlay = options.onPlay
    this.onReturn = options.onReturn
    this.onOver = options.onOver

    this.duration = options.duration
    this.currStep = options.currStep
    this.stepCount = options.stepCount
    this.score = options.score

    this.durationCopy = this.duration
    this.currStepCopy = this.currStep
    this.stepCountCopy = this.stepCount
    this.scoreCopy = this.score

    this.imgRoot = 'static/images/game/public/'
    this.imgType = '.png'
    if (!this.loader) {
      throw new Error('Cannot found loader object!')
    }
    this.playBtn = null
    this.progressBar = null
    this.timerText = null
    this.targetText = null
    this.scoreText = null
    this.playTimer = null
    this.progressPerW = null
    this.playing = false
    this.loadResource()
  }
  loadResource () {
    let imgs = this.spriteImgs()
    imgs.forEach(item => {
      let itemPath = this.imgRoot + item + this.imgType
      this.loader.add(item, itemPath)
    })
  }
  init (stage) {
    let resources = this.loader.resources
    // 创建进度条1 精灵
    let progressOuter = new Sprite({
      texture: resources['processBar1'].texture,
      x: 80,
      y: 95
    })
    progressOuter.anchor.y = 0.5
    stage.addChild(progressOuter)

    // 创建进度条2 容器
    let progressContainer = new PIXI.Container()
    this.progressBar = new Sprite({
      texture: resources['processBar2'].texture,
      x: 0,
      y: 0
    })
    this.progressBar.anchor.y = 0.5
    progressContainer.addChild(this.progressBar)
    progressContainer.x = 80
    progressContainer.y = 95
    stage.addChild(progressContainer)
    this.progressPerW = (this.progressBar.width - 120) / this.duration

    // 添加progress bar mask
    let progressMask = new PIXI.Graphics()
    progressMask.x = 0
    progressMask.y = -50
    progressMask.drawRect(
      0,
      0,
      progressContainer.width,
      progressContainer.height
    )

    progressContainer.mask = progressMask
    progressContainer.addChild(progressMask)

    // 创建定时器文字
    // 定义文字样式
    let style = new PIXI.TextStyle({
      fontFamily: 'Microsoft YaHei',
      fontSize: 36,
      fontWeight: 'bold',
      fill: ['#FFFFFF'],
      stroke: '#658019',
      strokeThickness: 2
    })
    this.timerText = new PIXI.Text(`时间：${this.duration} 秒`, style)
    this.timerText.anchor.y = 0.5
    this.timerText.x = 280
    this.timerText.y = progressContainer.y - this.timerText.height / 10
    stage.addChild(this.timerText)

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

    // 创建目标 精灵
    let targe = new Sprite({
      texture: resources['target'].texture,
      x: 770,
      y: 95
    })
    targe.anchor.y = 0.5
    stage.addChild(targe)

    // 创建目标文字
    this.targetText = new PIXI.Text('10 / 10', {
      fontFamily: 'Microsoft YaHei',
      fontSize: 36,
      fontWeight: 'bold',
      fill: ['#FFFFFF'],
      stroke: '#EF5004',
      strokeThickness: 1
    })
    this.targetText.anchor.y = 0.5
    this.targetText.x = 980
    this.targetText.y = targe.y - this.targetText.height / 10
    this.targetText.text = this.currStep + '/' + this.stepCount
    stage.addChild(this.targetText)

    // 创建分数 精灵
    let scoreSprite = new Sprite({
      texture: resources['coin'].texture,
      x: 1220,
      y: 95
    })
    scoreSprite.anchor.y = 0.5
    stage.addChild(scoreSprite)

    // 创建分数文字
    this.scoreText = new PIXI.Text(this.score, {
      fontFamily: 'Microsoft YaHei',
      fontSize: 36,
      fontWeight: 'bold',
      fill: ['#FFFFFF'],
      stroke: '#EF5004',
      strokeThickness: 1
    })
    this.scoreText.anchor.y = 0.5
    this.scoreText.x = 1450
    this.scoreText.y = scoreSprite.y - this.scoreText.height / 10
    this.scoreText.text = 0
    stage.addChild(this.scoreText)

    // 创建返回按钮 精灵
    let goBack = new Sprite({
      texture: resources['return'].texture,
      x: 1720,
      y: 95
    })
    goBack.anchor.y = 0.5
    goBack.interactive = true
    goBack.on('tap', e => {
      if (this.onReturn) {
        this.onReturn()
      }
    })
    stage.addChild(goBack)
  }
  spriteImgs () {
    return [
      'target',
      'return',
      'pause',
      'play',
      'coin',
      'processBar1',
      'processBar2'
    ]
  }
  updateCurrStep (step) {
    this.currStep = step
    this.targetText.text = this.currStep + '/' + this.stepCount
  }
  updateStepCount (Count) {
    this.stepCount = Count
    this.targetText.text = this.currStep + '/' + this.stepCount
  }
  updateScore (score) {
    this.scoreText.text = score
  }
  play () {
    if (this.playing) {
      return
    }
    this.playing = true
    this.playBtn.texture = this.loader.resources['pause'].texture
    this.playTimer = setInterval(() => {
      if (this.duration <= 0) {
        this.over()
        return
      }
      this.duration--
      this.timerText.text = `时间：${this.duration} 秒`
      this.progressBar.x -= this.progressPerW
    }, 1000)
  }
  pause () {
    if (this.playing) {
      this.playing = false
      this.playBtn.texture = this.loader.resources['play'].texture
      if (this.playTimer) {
        clearInterval(this.playTimer)
      }
    }
  }
  over () {
    this.playing = false
    this.playBtn.texture = this.loader.resources['play'].texture
    if (this.playTimer) {
      clearInterval(this.playTimer)
    }
    if (this.onOver) {
      console.log('-----opt..over')
      this.onOver()
    }
  }
  reset () {
    this.duration = this.durationCopy
    this.currStep = this.currStepCopy
    this.stepCount = this.stepCountCopy
    this.score = this.scoreCopy

    this.timerText.text = `时间：${this.duration} 秒`
    this.targetText.text = this.currStep + '/' + this.stepCount
    this.scoreText.text = this.score
    this.progressBar.x = 0
    this.playing = false
  }
  destroy () {
    if (this.playTimer) {
      clearInterval(this.playTimer)
    }
    super.destroy(true)
  }
}
