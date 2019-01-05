import * as PIXI from 'pixi.js'
import { Howl, Howler } from 'howler';
/**
 * @description 游戏结算页面弹窗
 * @class GameOverPopups
 * @extends PIXI.Container
 * 
 */

export default class GameOverPopups extends PIXI.Container {
  /**
   * @constructor GameOverPopups的构造函数
   * @param Object options
   */
  constructor(options) {
    super();
    if (typeof options !== "object") throw new Error("the arguments is not a object")
    this.showReturn = options.showReturn;
    this.examineRank = options.examineRank;
    this.nextLevel = options.nextLevel;
    this.onceAgain = options.onceAgain;
    this.close = options.close;
    this.isLast = options.isLast;
    this.AuraRotation = new PIXI.ticker.Ticker();
    this.StoreRank = [];
    this.star = ['noneVenus', 'oneVenus', 'twoVenus', 'threeVenus'];
    this.addRes();
  }
  addRes() {
    this.loader = new PIXI.loaders.Loader();
    let PopupsSprite = [{
        name: "Aura",
        url: "static/images/game/public/Aura.png"
      },
      {
        name: "complete",
        url: "static/images/game/public/complete.png"
      },
      {
        name: "doItAgain",
        url: "static/images/game/public/do-it-again.png"
      },
      {
        name: "examineRanking",
        url: "static/images/game/public/examine-ranking.png"
      },
      {
        name: "failedFloor",
        url: "static/images/game/public/failed-floor.png"
      },
      {
        name: "victoryFloor",
        url: "static/images/game/public/victory-floor.png"
      },
      {
        name: "cancleRight",
        url: "static/images/game/public/cancle-right.png"
      },
      {
        name: "nextLevel",
        url: "static/images/game/public/next-level.png"
      },
      {
        name: "nounBox",
        url: "static/images/game/public/noun-box.png"
      },
      {
        name: "oneVenus",
        url: "static/images/game/public/one-venus.png"
      },
      {
        name: "twoVenus",
        url: "static/images/game/public/two-venus.png"
      },
      {
        name: "threeVenus",
        url: "static/images/game/public/three-venus.png"
      },
      {
        name: "noneVenus",
        url: "static/images/game/public/none-venus.png"
      },
      {
        name: "firstBox",
        url: "static/images/game/public/first-box.png"
      },
      {
        name: "otherBox",
        url: "static/images/game/public/other-box.png"
      },
      {
        name: "firstMedal",
        url: "static/images/game/public/first.png"
      },
      {
        name: "secondMedal",
        url: "static/images/game/public/second.png"
      },
      {
        name: "thirdMedal",
        url: "static/images/game/public/third.png"
      },
      {
        name: "userAvatarMale",
        url: "static/images/game/public/userAvatar-male.png"
      },
      {
        name: "userAvatarFemale",
        url: "static/images/game/public/userAvatar-female.png"
      },
      {
        name: "userAvatarDefault",
        url: "static/images/game/public/userAvatar-default.png"
      },
      {
        name: "loading",
        url: "static/images/game/public/loading.png"
      },
    ];

    this.loader.on("complete", (loader, res) => {
      this.onComplete(loader, res);
    })
    PopupsSprite.forEach((picUrl) => {
      if (!this.loader.resources[picUrl.name]) {
        this.loader.add(picUrl.name, picUrl.url);
      }
    })
    this.loader.load();
  }
  onComplete(loader, res) {
    this.textures = {
      Aura: res["Aura"].texture, //胜利时的旋转光环
      doItAgain: res["doItAgain"].texture, // 再来一次
      examineRanking: res["examineRanking"].texture, // 查看排行
      failedFloor: res["failedFloor"].texture, //失败底板
      victoryFloor: res["victoryFloor"].texture, //胜利底板
      cancleRight: res["cancleRight"].texture, //右上角取消按钮
      nextLevel: res["nextLevel"].texture, //下一关
      complete: res["complete"].texture, //下一关
      nounBox: res["nounBox"].texture, //名次底板
      oneVenus: res["oneVenus"].texture, //一个金星
      twoVenus: res["twoVenus"].texture, //二个金星
      threeVenus: res["threeVenus"].texture, //三个金星
      noneVenus: res["noneVenus"].texture, //没有金星
      firstBox: res["firstBox"].texture, //第一名底板
      otherBox: res["otherBox"].texture, //其他名次底板
      firstMedal: res["firstMedal"].texture, //第一名勋章
      secondMedal: res["secondMedal"].texture, //第二名勋章
      thirdMedal: res["thirdMedal"].texture, //第三名勋章
      userAvatarMale: res['userAvatarMale'].texture, //用户头像男
      userAvatarFemale: res['userAvatarFemale'].texture, //用户头像女
      userAvatarDefault: res['userAvatarDefault'].texture, //用户头像默认
      loading: res['loading'].texture, //用户头像默认
    }
    //胜利时播放的声音
    this.audio = new Howl({
      src:['static/audio/victory.mp3'],
    })
    this.createFloor(this.textures);
  }
  createFloor(textures) { //创建遮罩和胜利失败底板
    this.ContainerBox = new PIXI.Container();
    this.ContainerBox.x = 0;
    if (!textures) return;
    this.ContainerBox.visible = false;
    //胜利或失败的底板
    this.failed = new PIXI.Sprite(textures.failedFloor);
    this.victory = new PIXI.Sprite(textures.victoryFloor);

    let width = this.victory.width;
    let height = this.victory.height;

    this.ContainerBox.y = 0;
    this.ContainerBox.y = -height;
    this.negtaHeight = -height
    //背景遮罩
    let mask = new PIXI.Graphics();
    mask.x = 0;
    mask.y = 0;
    mask.beginFill(0x000000, 0.4);
    mask.drawRect(0, 0, width, height);
    mask.endFill();
    this.addChild(mask);
    mask.interactive = true;
    mask = null;
    this.addChild(this.ContainerBox);
    this.failed.visible = false;
    this.victory.visible = false;
    this.ContainerBox.addChild(this.failed);
    this.ContainerBox.addChild(this.victory);
    //loading 图
    this.loading = new PIXI.Sprite(textures.loading);
    this.loading.anchor.set(0.5);
    this.loading.x = width / 2;
    this.loading.y = height / 2;
    this.addChild(this.loading);
    this.loadAinmation = new PIXI.ticker.Ticker();
    let rotation = 0;
    this.loadAinmation.add(() => { //loading图旋转
      rotation += 7;
      if (this.loading) {
        this.loading.rotation = rotation * Math.PI / 180;
      }
    })
    //右上角按钮
    let closeBtn = new PIXI.Sprite(textures.cancleRight)
    closeBtn.x = 1400;
    closeBtn.y = 110;
    closeBtn.interactive = true;
    closeBtn.on("tap", this.closePopups.bind(this));
    this.ContainerBox.addChild(closeBtn);
    //星星 
    this.star.forEach(venus => { //星星
      this[venus] = new PIXI.Sprite(textures[venus])
      this[venus].anchor.set(0.5);
      this[venus].x = width / 2;
      this[venus].y = 150;
      this[venus].visible = false;
      this.ContainerBox.addChild(this[venus]);
    });

    this.getScore = new PIXI.Text('闯关得分:0', { //所得分数
      fill: [0xFFFFFA, 0xFFF79B],
      fillGradientStops: [0, 1],
      fontSize: 54,
      fontWeight: 900,
      align: "center",
    });
    this.getScore.anchor.set(0.5);
    this.getScore.x = width / 2;
    this.getScore.y = 445;
    this.ContainerBox.addChild(this.getScore);

    // 所得龙币
    let style = { //所得龙币样式
      fill: 0xFF3C33,
      fontSize: 48,
      fontWeight: 900,
      stroke: 0xffffff,
      strokeThickness: 3,
      align: "center",
    }
    this.CionsText = new PIXI.Text("奖励龙币:0", style)
    this.CionsText.anchor.set(0.5);
    this.CionsText.x = width / 2;
    this.CionsText.y = height / 2;
    this.ContainerBox.addChild(this.CionsText);

    //排名信息
    this.rankText = new PIXI.Text("我的排名:0", {
      fill: 0xffffff,
      fontSize: 32,
      fontWeight: 900,
      stroke: 0x9B8AEE,
      strokeThickness: 5,
      align: "center",
    });
    this.rankText.anchor.set(0.5);
    this.rankText.x = width / 2 + 20;
    this.rankText.y = 690;
    this.ContainerBox.addChild(this.rankText);

    //查看排行的精灵
    this.examineRanking = new PIXI.Sprite(textures.examineRanking);
    this.examineRanking.anchor.set(0.5);
    this.examineRanking.x = 1400;
    this.examineRanking.y = 690;
    this.examineRanking.interactive = true;
    this.examineRanking.on('tap', this.examinefn.bind(this));
    this.examineRanking.visible = false;
    this.ContainerBox.addChild(this.examineRanking);

    let nextLevel = new PIXI.Sprite(textures.nextLevel);
    nextLevel.anchor.set(0.5);
    nextLevel.x = 1250;
    nextLevel.y = 950;
    nextLevel.interactive = true;
    nextLevel.on("tap", this.nextLevelFn.bind(this))

    let complete = new PIXI.Sprite(textures.complete);
    complete.anchor.set(0.5);
    complete.x = 1250;
    complete.y = 950;
    complete.interactive = true;
    complete.on("tap", this.close.bind(this))
    if (this.isLast) {
      this.ContainerBox.addChild(complete)
      nextLevel.destroy()
    } else {
      this.ContainerBox.addChild(nextLevel)
      complete.destroy()
    }
    //再来一次
    let onceAgain = new PIXI.Sprite(textures.doItAgain);
    onceAgain.anchor.set(0.5);
    onceAgain.x = 700;
    onceAgain.y = 950;
    onceAgain.interactive = true;
    onceAgain.on("tap", this.onceAgainFn.bind(this))
    this.ContainerBox.addChild(onceAgain)
    //光环
    this.Aura = new PIXI.Sprite(textures.Aura);
    this.Aura.anchor.set(0.5);
    this.Aura.x = width / 2;
    this.Aura.y = height / 2;
    this.Aura.visible = false;
    this.ContainerBox.addChild(this.Aura);
    let deg = 1;
    this.AuraRotation.add((delatime) => {
      if (this.Aura) {
        this.Aura.rotation = deg * Math.PI / 180;
        deg += delatime;
      }
    })
    textures = null;
    this.visible = false;
  }
  //设置数据
  setData(data) {
    if (!data) data = {};
    let top = null;
    if (data.invaild) { //成绩无效
      this.failed.visible = true;
      let tipinfo = data.desc || '';
      let width = this.ContainerBox.width;
      let height = this.ContainerBox.height;
      let tipText = new PIXI.Text("成绩无效", {
        fontSize: 50,
        fill: 0xff0000,
      });
      tipText.anchor.set(0.5);
      tipText.x = width / 2;
      tipText.y = height / 2;
      this.ContainerBox.addChild(tipText)
      this.getScore.visible = false;
      this.CionsText.visible = false;
    } else { //成绩有效
      let userScore = data.score || 0; //得分
      let reward = data.reward || 0; //奖励的龙币值
      top = data.rankList || []; //排行榜信息
      let star = data.star || 0 //几颗星星
      let mylocation = (data.location && data.location !== -1) ? data.location : 9999; //我的排名
      if (userScore === 0) {
        this.failed.visible = true;
      } else {
        this.victory.visible = true;
        if (this.AuraRotation) {
          this.Aura.visible = true;
          this.AuraRotation.start();
        }
        //显示几颗金星
        if (star === 1) {
          this.oneVenus.visible = true;
        } else if (star === 2) {
          this.twoVenus.visible = true;
        } else if (star === 3) {
          this.threeVenus.visible = true;
        } else {
          this.noneVenus.visible = true;
        }
        this.audio && this.audio.play()
      }
      this.getScore.text = `闯关得分:${userScore}`
      this.CionsText.text = "奖励龙币:" + reward
      this.examineRanking.visible = !!this.showReturn
      this.rankText.text = `我的排名:${mylocation}`
    }
    let len = 0;
    if (top) {
      len = top.length;
    }
    this.createRanking(top, len);
  }
  createRanking(top, len) {
    if (len !== 0) {
      if (this.StoreRank.length !== 0) {
        this.StoreRank.forEach(rank => {
          rank.destroy();
        })
        this.StoreRank = [];
      }
      let rankingConfig = []; //排行榜位置信息配置
      switch (len) {
        case 1:
          rankingConfig = [{
            x: 900,
            y: 730,
            Medal: this.textures.firstMedal,
            AvatarBox: this.textures.firstBox
          }];
          break;
        case 2:
          rankingConfig = [{
              x: 650,
              y: 730,
              Medal: this.textures.firstMedal,
              AvatarBox: this.textures.firstBox
            },
            {
              x: 1050,
              y: 730,
              Medal: this.textures.secondMedal,
              AvatarBox: this.textures.otherBox
            },
          ]
          break;
        default:
          rankingConfig = [{
              x: 500,
              y: 730,
              Medal: this.textures.firstMedal,
              AvatarBox: this.textures.firstBox
            },
            {
              x: 850,
              y: 730,
              Medal: this.textures.secondMedal,
              AvatarBox: this.textures.otherBox
            },
            {
              x: 1200,
              y: 730,
              Medal: this.textures.thirdMedal,
              AvatarBox: this.textures.otherBox
            }
          ]
          break;
      }
      for (let i = 0; i < rankingConfig.length; i++) {
        let config = rankingConfig[i];
        let box = new PIXI.Container();
        box.x = config.x;
        box.y = config.y;
        this.ContainerBox.addChild(box);
        this.StoreRank.push(box);
        let AvatarBox = new PIXI.Sprite(config.AvatarBox);
        AvatarBox.x = 0;
        AvatarBox.y = 0;
        box.addChild(AvatarBox);

        let userAvatarTexture = null; //用户头像
        if (!top[i].gender || top[i].gender === 'UNKNOWN') {
          userAvatarTexture = this.textures.userAvatarDefault;
        } else if (top[i].gender === 'MALE') {
          userAvatarTexture = this.textures.userAvatarMale;
        } else {
          userAvatarTexture = this.textures.userAvatarFemale;
        }
        let userAvatar = new PIXI.Sprite(userAvatarTexture);
        userAvatar.x = 5;
        userAvatar.y = 5;
        userAvatar.width = AvatarBox.width - 10;
        userAvatar.height = AvatarBox.height - 10;
        box.addChild(userAvatar);
        let firstMedal = new PIXI.Sprite(config.Medal);
        firstMedal.anchor.x = 0.5;
        firstMedal.x = 0;
        firstMedal.y = 0;
        box.addChild(firstMedal);

        let placeFloor = new PIXI.Sprite(this.textures.nounBox);
        placeFloor.x = AvatarBox.width + 10;
        placeFloor.y = 0;
        box.addChild(placeFloor);
        let theFirstView = new PIXI.Text(`${i+1}`, {
          fill: 0XFFFFFF
        })
        theFirstView.anchor.set(0.5);
        theFirstView.x = placeFloor.width / 2;
        theFirstView.y = placeFloor.height / 2;
        placeFloor.addChild(theFirstView);
        let nickStyle = {
          fill: 0x935F2F,
          fontSize: 32,
          fontWeight: 600,
          wordWrap: true
        }
        let userNickname = top[i].nickname || "暂无昵称";
        let len = userNickname.length;
        if (len > 8) {
          userNickname = userNickname.slice(0, 8);
        }
        let nickname = new PIXI.Text(userNickname, nickStyle)
        let nickScore = new PIXI.Text(top[i].score, nickStyle)
        nickname.x = nickScore.x = AvatarBox.width + 20,
          nickname.y = placeFloor.height,
          nickScore.y = placeFloor.height + nickname.height,
          box.addChild(nickname)
        box.addChild(nickScore)
        nickname = nickScore = placeFloor = null;
        box = theFirstView = AvatarBox = null;
      }
    }
    this.loadAinmation.stop();
    this.loading.visible = false;
    this.visible = true;
    this.ContainerBox.visible = true;
    this.startAnimation();
  }

  /**
   * 
   * @param {Number} t  //动画当前时间
   * @param {Number} b  // 动画初始值
   * @param {Number} c  //动画结束值
   * @param {Number} d  // 持续时间
   **/
  easeOut(t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
      return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
      return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
      return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
      return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
  }
  //开始动画
  startAnimation() {
    let currentTime = 0;
    let beginVal = 0;
    let endVal = this.victory.height;
    let duration = 15;
    let _self = this;
    let reqID = requestAnimationFrame(step)

    function step() {
      let dis = _self.easeOut(currentTime, beginVal, endVal, duration);
      if (currentTime <= duration) {
        reqID = requestAnimationFrame(step)
        _self.ContainerBox.y = -(endVal - dis)
      } else {
        cancelAnimationFrame(reqID);
      }
      currentTime++;
    }
  }
  closeAuraRotation() {
    if (this.AuraRotation) {
      this.AuraRotation.destroy();
    }
  }
  closePopups(e) { //关闭弹窗
    e.stopPropagation()
    this.closeAuraRotation()
    if (this.close && typeof this.close === "function") this.close.call();
  }
  examinefn(e) { //查看排行
    e.stopPropagation()
    if (this.examineRank && typeof this.examineRank === "function") this.examineRank.call();
  }
  nextLevelFn(e) { //下一关
    e.stopPropagation()
    this.closeAuraRotation()
    if (this.nextLevel && typeof this.nextLevel === "function") this.nextLevel.call();
  }
  onceAgainFn(e) { //再来一次
    e.stopPropagation()
    this.reset()
    if (this.onceAgain && typeof this.onceAgain === "function") this.onceAgain.call();
  }
  show() {
    if (this.loadAinmation && !this.loadAinmation.started) {
      this.loadAinmation.visible = true;
      this.loadAinmation.start()
    };
    this.visible = true
  }
  hide() {
    if (this.loadAinmation && this.loadAinmation.started) {
      this.loadAinmation.visible = false;
      this.loadAinmation.stop()
    };
    this.visible = false;
  }
  reset() {
    this.loading.visible = false;
    // this.loadAinmation.start();
    this.visible = false;
    this.victory.visible = false;
    this.failed.visible = false;
    this.ContainerBox.y = this.negtaHeight;
    this.star.forEach(star => {
      if (this[star].visible) {
        this[star].visible = false;
      }
    })
    if (!this.AuraRotation) {
      this.AuraRotation = new PIXI.ticker.Ticker()
    } else {
      this.AuraRotation.stop();
    }
    this.Aura.visible = false;
  }
  destroy() {
    this.audio && this.audio.unload();
    this.loadAinmation && this.loadAinmation.stop();
    this.AuraRotation && this.AuraRotation.stop();
    this.loader && this.loader.destroy();
    this.textures = null;
    // this.ContainerBox.destroy(true);
    super.destroy(true);
  }
}
