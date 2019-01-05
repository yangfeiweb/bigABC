import * as PIXI from 'pixi.js'

export default class ErasingBox extends PIXI.Container{
    constructor(options){
        super()
        this.selectTexture = options.selectTexture;
        this.normalTexture = options.normalTexture;
        this.text = options.text;
        this.disEffect = options.disEffect;
        this.dirY = options.dirY;
        this.app = options.app;

        this.coordX = null;
        this.coordY = null;
        this.isVanishCall = true
        this.cardDesAfter = null;
        this.cardDownAfter = null;

        this.init()
    }

    init(){
        this.normalBox = new PIXI.Sprite(this.normalTexture);
        this.normalBox.x = 0;
        this.normalBox.y = 0;
        this.addChild(this.normalBox)

        this.selectBox = new PIXI.Sprite(this.selectTexture);
        this.selectBox.x = 0;
        this.selectBox.y = 0;
        this.addChild(this.selectBox)
        this.selectBox.visible = false;

        this.letterText = new PIXI.Text(this.text,{
            fontFamily:'Microsoft YaHei',
            fontSize:48,
            fontWeight:900,
            fill:0x79483A,
            wordWrap:true,
            wordWrapWidth:this.normalBox.width
        })
        this.letterText.anchor.set(0.5);
        this.letterText.x = this.normalTexture.width / 2;
        this.letterText.y = this.normalTexture.height / 2;
        this.addChild(this.letterText)

        this.animationSprite = new PIXI.extras.AnimatedSprite(this.disEffect);
        this.animationSprite.anchor.set(0.5);
        this.animationSprite.x = this.normalTexture.width / 2;
        this.animationSprite.y = this.normalTexture.height / 2;
        this.animationSprite.animationSpeed = 0.3;
        this.animationSprite.loop = false;
        this.animationSprite.visible = false;
        this.addChild(this.animationSprite);
        this.animationSprite.onComplete = this.complete.bind(this);
    }
    
    complete(){
        if(this.isVanishCall){
            this.cardDesAfter && this.cardDesAfter.call(null,this.coordX,this.coordY)
        }
        super.destroy();
    }
    
    changeNormal(){
        this.normalBox.visible = true;
        this.selectBox.visible = false;
    }
    
    changeSelect(){
        this.normalBox.visible = false;
        this.selectBox.visible = true;
    }
    explosive(){ 
        this.letterText.visible = false;
        this.selectBox.visible = false;
        this.animationSprite.visible = true;
        this.animationSprite.play();
    }

    tween(t,b,c,d){ //Quart easeInOut
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    }
    
    downAnimation(){ //下落动画
        let beginTime = 0;
        let begin = 0;
        let end = this.normalBox.height+this.dirY;
        let deltaTime = 100;
        let timer = null;
        let startY = this.y;
        let move = ()=>{
            if(beginTime<deltaTime){
                timer = requestAnimationFrame(move);
                let dis = this.tween(beginTime,begin,end,deltaTime);
                this.y=startY+dis;
            }else{
                cancelAnimationFrame(timer)
                this.cardDownAfter && this.cardDownAfter.call(null,this.coordX,this.coordY);
            }
            beginTime+=16.7;
        }
        move();
    }
}

