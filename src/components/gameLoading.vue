<template>
    <div class='loading'>
        <img src='static/images/loading-dragon.png'></img>
        <div class='progress-bar'>
            <div class='progress-inner' :style='{height:progress+"%"}'></div>
        </div>
        <div class='info cnfont'>
            努力加载中... {{progress}} %
        </div>
    </div>
</template>

<script>
export default {
    props:['progress'],
    data(){
        return {
            // progress:0
        }
    }
}
</script>

<style lang='scss' scoped>
@import "~@/assets/css/variables.scss";
.loading {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url("~@/assets/images/loading-bg.jpg");
  background-repeat: repeat;
  background-size: contain;
  img {
    position: absolute;
    width: 705px;
    height: 694px;
    top: 50%;
    left: 50%;
    transform: translate(-40%, -65%);

    animation-name: lodingAnimate;
    animation-duration: 3s;
    animation-timing-function: linear;
    animation-delay: 1s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-play-state: running;
    // transform: rotate(90deg) scale(0.35) translate(-50%,100%);
  }
  .progress-bar {
    width: 20px;
    height: 500px;
    top: 50%;
    left: 80px;
    transform: translateY(-50%);
    background: lightgray;
    // background: #89ced0;
    border: 6px solid #0cb3ff;
    border-radius: 20px;
    position: absolute;
    .progress-inner {
      background: rgba(155, 202, 106, 0.9);
      border-radius: 10px;
      width: 100%;
    }
  }
  .info{
      position:absolute;
      top:50%;
      left:40px;
      width:500px;
      height:50px;
      color:#6cc3ea;
      text-align:center;
      font-size:  $normal-font-size;
      transform:translate(-50%, -50%) rotate(90deg);
  }
  @keyframes lodingAnimate {
    0% {
      transform: translate(-40%, -65%);
    }
    25% {
      transform: translate(-42%, -60%);
    }
    50% {
      transform: translate(-43%, -55%);
    }
    75% {
      transform: translate(-42%, -50%);
    }
    100% {
      transform: translate(-40%, -45%);
    }
  }
}
</style>
