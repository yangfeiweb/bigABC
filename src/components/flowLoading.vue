<template>
  <div class="flowLoading">

  </div>
</template>

<script>
import * as PIXI from "pixi.js"
export default {
    props:{
        progress:{
            type:Number,
            default:0
        }
    },
    data(){
        return {
            imgRoot:"static/images/",
            imgType:".png",
            spriteImgs:[
                "flowLoading"
            ],
        }
    },
    watch:{
        progress(val){
            if(val && this.innerbar && this.text){
                let num = Math.floor(val);
                // this.innerbar 在100 % 时的宽度应为 590 所以 每份 5.9
                this.innerbar.graphicsData[0].shape.width= num * 5.9;
                this.text.text = `加载资源中… ${num}%`
            }
        }
    },
    mounted(){
        this.createApp()
        this.loaderResources()
    },
    methods:{
        createApp(){
            const device = {
                width:700,
                height:1000
            }
            this.app = new PIXI.Application({
                width:device.width,
                height:device.height,
                antialias: true,
                transparent: true,
                clearBeforeRender: true,
                forceCanvas: true
            })

            this.app.backColorColor = 0x222fff;
            this.app.view.style.width = "100%";
            this.app.view.style.height = "100%";
        },
        loaderResources(){
            let loader = new PIXI.loaders.Loader();

            loader.on("complete",(l,res)=>{
                this.$el.appendChild(this.app.view);
                this.createStage(res)
                this.start()
            })
            this.spriteImgs.forEach((name)=>{
                let path = this.imgRoot+name+this.imgType;
                if(!loader.resources[name]){
                    loader.add(name,path)
                }
            })

            loader.load()
            this.loader = loader;
            loader = null;
            
        },
        createStage(res){
            let stage = this.app.stage;
            let width = this.app.screen.width;
            let height = this.app.screen.height;

            let backColor = new PIXI.Graphics;
                backColor.beginFill(0xff5f5f);
                backColor.drawRect(0,0,width,height)
                backColor.endFill()
                stage.addChild(backColor)

            const circle = 600
            let container = new PIXI.Container();
                container.width = circle;
                container.height = circle;
                container.x = width/2-circle/2;
                container.y = 100;
                stage.addChild(container)
            
            let planeBackColor = new PIXI.Graphics;
                planeBackColor.beginFill(0xFFF0E3)
                planeBackColor.drawCircle(circle/2,circle/2,circle/2)
                planeBackColor.endFill()
                container.addChild(planeBackColor)

                //飞机精灵
            let planeSprite = new PIXI.Sprite(res["flowLoading"].texture)
                planeSprite.anchor.y = 0.5;
                planeSprite.x = 0;
                planeSprite.y = circle/2;
                container.addChild(planeSprite)
                this.planeSprite = planeSprite; 
                planeSprite = null;

            let planeMask = planeBackColor.clone();
                container.mask = planeMask;
                container.addChild(planeMask)

                //进度条容器
            let proBarContainer = new PIXI.Container()
                proBarContainer.width = circle;
                proBarContainer.height = 30;
                proBarContainer.x = width/2-circle/2;
                proBarContainer.y =800;
                stage.addChild(proBarContainer)

                let outbar = new PIXI.Graphics;
                outbar.beginFill(0xFFF0E3)
                outbar.drawRoundedRect(0,0,circle,30,30)
                outbar.endFill()
                proBarContainer.addChild(outbar)

                this.innerbar = new PIXI.Graphics;
                this.innerbar.beginFill(0xFDC63B)
                this.innerbar.drawRoundedRect(5,5,0,20,20)
                this.innerbar.endFill()
                proBarContainer.addChild(this.innerbar)
                //进度条遮罩
                let proBarMask = outbar.clone();
                proBarContainer.mask = proBarMask;
                proBarContainer.addChild(proBarMask);


                this.text = new PIXI.Text("下载资源中… 0%",{
                    fontFamily:"cnfont",
                    fontSize:36,
                    fontWeight:900,
                    fill:0xFFF0E3,
                })
                this.text.anchor.x = 0.5;
                this.text.x = width/2;
                this.text.y = 850;
                stage.addChild(this.text);
        },
        start(){
            let startX = this.x;
            let width = this.planeSprite.width;
            let parentWidth = this.planeSprite.parent.width;
            let move = ()=> {
                    this.moveId = requestAnimationFrame(move) 
                    if(this.planeSprite.x >= parentWidth){
                        this.planeSprite.x = -width;
                    }else{
                        this.planeSprite.x += 5;
                    }
            }   
            move(); 
        },
        stop(){
            if(this.moveId){
                cancelAnimationFrame(this.moveId)
                this.moveId = null;
            }
        }
    },
    beforDestroy(){
        this.stop();
        this.loader && this.loader.destroy()
        this.app.destroy(true);
    }
}
</script>

<style>

</style>
