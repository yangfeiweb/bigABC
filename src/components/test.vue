<template>
  <div class='test cnfont'>
    test ---- {{curr}}
    <div class='content-container'>
      <transition name='fade'>
        <div class='content' v-for="idx in count" :key="idx" v-if="idx==curr">
          <div class='dialog-text'>测试字体大小和行高， 窗口title {{idx}}</div>
          <div class='large-text'>测试字体大小和行高， large</div>
          <div class='main-text'>测试字体大小和行高, 正文</div>
          <div class='small-text'>测试字体大小和行高， small</div>
          <div class='mini-text'>测试字体大小和行高， mini {{idx}}</div>
        </div>
      </transition>
    </div>
    <div class='navs'>
      <router-link to='/learnFlow/true'>学习流程1</router-link>
      <router-link to='/learnFlow/false'>学习流程2</router-link>
      <router-link to='/personInfos/signIn'>签到</router-link>
      <router-link to='/scan'>扫码</router-link>
      <router-link to='/testScroll'>scroll</router-link>
      <router-link to='/testArrgame'>arrowGame</router-link>
      <a href='http://pixijs.io/pixi-sound/examples/demo.html'>pixiSound</a>
    </div>
    <speaker audioSrc='static/audio/apple.mp3'></speaker>
    <speaker color='blue' audioSrc='static/audio/apple.mp3'></speaker>
    <speaker color='yellow' audioSrc='static/audio/apple.mp3'></speaker>
    <speaker audioSrc='static/audio/apple.mp3'></speaker>
    <speaker audioSrc='static/audio/apple.mp3'></speaker>
    <div>
      <span class='btn-span' @click='showDialog=true'>单词弹窗</span>
      <span class='btn-span' @click='showScore=true'>分数弹窗</span>
      <span class='btn-span' @click='showHomework=true'>作业弹窗</span>
      <span class='btn-span' @click='next'>下一个</span>
      <span class='btn-span' @click='spell'>拼写</span>
      <span class='btn-span' @click='spellDrag'>拼写Drag</span>
      <span class='btn-span' @click='svg'>svg nav</span>
      <span class='btn-span' @click='showOptDialog=true'>optDialog</span>
      <span class='btn-span' @click='goMultiFlows'>多关卡</span>
    </div>
    <unit-dialog :show.sync='showDialog'></unit-dialog>
    <score-dialog :show.sync='showScore'></score-dialog>
    <homework-dialog :show.sync='showHomework'></homework-dialog>
    <opt-dialog :show.sync='showOptDialog' title='弹框测试'>
      <div>
        哈哈哈
      </div>
    </opt-dialog>
  </div>
</template>
<script>
  import speaker from "./widgets/speaker";
  import unitDialog from "./unitDialog";
  import scoreDialog from "./scoreDialog";
  import homeworkDialog from "./homeworkDialog";
  import optDialog from "./widgets/optDialog";

  export default {
    components: {
      speaker,
      unitDialog,
      scoreDialog,
      homeworkDialog,
      optDialog
    },
    data() {
      return {
        showDialog: false,
        showHomework: false,
        showScore: false,
        curr: 1,
        count: 10,
        showOptDialog: false
      };
    },
    methods: {
      next: function() {
        if (this.curr == this.count) {
          this.curr = 1;
        } else {
          this.curr++;
        }
      },
      spell: function() {
        this.$router.push("./testSpellPick");
      },
      spellDrag: function() {
        this.$router.push("./testSpellDrag");
      },
      svg: function() {
        this.$router.push("./testSvg");
      },
      goMultiFlows: function(){
        
      }
    }
  };
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";
.test {
  line-height: $text-line-height;
  padding: $padding;
  .main-text {
    font-size: $normal-font-size;
  }
  .dialog-text {
    font-size: $max-font-size;
    font-weight: bold;
  }
  .small-text {
    font-size: $small-font-size;
  }
  .large-text {
    font-size: $large-font-size;
  }
  .mini-text {
    font-size: $mini-font-size;
  }
  .btn-span {
    background: $main-color;
    color: #fff;
    border-radius: 20px;
    padding: 10px;
  }
  .btn-span:active {
    background: red;
  }
  .scoreDialog {
    position: relative;
    height: 100px;
    width: 100%;
    .childContainer {
      position: absolute;
      left: 30px;
      top: 30px;
      bottom: 0;
      right: 0;
    }
  }
  .navs {
    a {
      padding: 10px;
      background: $assist-color;
      color: #fff;
      border-radius: 20px;
    }
  }

  // .content-container{
  //   // display:flex;
  //   // overflow:hidden;
  //   width:680px;
  //   height:750px;
  //   // background:lightcyan;
  //   overflow-y:hidden;
  //   overflow-x:hidden;
  //   white-space: nowrap;

  // }

  // .content{
  //   width:680px;
  // 	height:750px;
  //   white-space: initial;
  // 	// line-height:50px;
  // 	// text-align:center;
  // 	background:lightgray;
  // 	//margin:10px;
  // 	display: inline-block;
  // }

  // .fade-enter-active {
  //   transition: all .3s ease;
  // }
  // .fade-leave-active {
  //   transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  // }
  // .fade-enter, .fade-leave-to
  // /* .slide-fade-leave-active for below version 2.1.8 */ {
  //   transform: translateX(10px);
  //   opacity: 0;
  // }

  .content-container {
    position: relative;
    width: 680px;
    height: 650px;
  }
  .content-container .content {
    position: absolute;
    width: 680px;
    height: 650px;
    background: #fff;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: all 1s;
  }
  .fade-enter,
  .fade-leave-active {
    opacity: 0;
  }
  .fade-enter {
    transform: translateX(680px);
  }
  .fade-leave-active {
    transform: translateX(-680px);
  }
}
</style>
