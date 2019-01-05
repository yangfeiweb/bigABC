<template>
  <div class='score-dialog' :class='[dialogCls]'>
    <transition name='score-info' v-on:after-enter="afterEnter" v-on:leave="leaving">
      <div class='group-container cnfont' :class='{centerCls:centerDialog}' v-show='showInfo'>
        <img v-if='!isFail' class='score-img' src='static/images/step-dialog.png'>
        <img v-if='isFail' class='score-img' src='static/images/step-fail-dialog.png'>
        <img class='score-close' src='static/images/icon-close.png' @click='hide'>
        <img v-if='!isFail' class='score-star' :src='starSrc'>
				<img v-if='isFail' class='score-star' src='static/images/step-fail-star.png'>
        <div class='content'>
          <div class='step'>{{scoreInfo && scoreInfo.stepTitle}}</div>
          <div v-show='!isFail' class='score'>{{scoreInfo && scoreInfo.score}}分</div>
          <div v-show='!isFail' class='coins'>获得龙币
            <span class='highlight'>{{scoreInfo && scoreInfo.reward}}</span> 枚</div>
          <div v-show='!isFail' class='desc'>击败
            <span class='highlight'>{{scoreInfo && scoreInfo.desc}}</span> 的学生</div>
					<!-- 为失败弹框新加 -->
					<div v-if='isFail' class='failed'>
						<span>闯关失败</span>
					</div>

          <div class='btn-container'>
            <span class='btn' @click='replay'>再来一次</span>
            <span v-if='!isFail' class='btn' @click='next'>下一关</span>
            <!-- 为失败弹框新加 -->
            <span v-if='isFail' class='btn' @click='hide'>返回</span>
          </div>
        </div>
        <div class='ranking'>
          <div class='ranking-title'>我的排名 {{scoreInfo && scoreInfo.location}}</div>
          <div class='ranking-desc'>本关榜单</div>
          <!-- <div class='ranking-list'> -->
          <vue-better-scroll class="ranking-list" ref='scoreScroller'>
            <ul>
              <li v-for="(rank,idx) in scoreInfo && scoreInfo.rankList" :key='idx'>
                <img class='icon-img' v-if="idx ==0" src='static/images/crown-first.png'>
                <img class='icon-img' v-else-if="idx ==1" src='static/images/crown-second.png'>
                <img class='icon-img' v-else-if="idx ==2" src='static/images/crown-third.png'>
                <span class="icon" v-else>{{idx+1}}</span>
                <div class='head-img-container'>
                  <img class='head-img' :src='rank.icon'>
                </div>
                <!-- <img v-if='rank.icon' class='head-img' :src='rank.icon'></img> -->
                <span class='item-score'>{{rank.score}} 分</span>
              </li>
            </ul>
          </vue-better-scroll>
          <!-- </div> -->
        </div>
      </div>
    </transition>
    <audio src="static/audio/victory.mp3" preload="auto" ref="victory"></audio>
  </div>
</template>
<script>
  export default {
    props: {
      show: {
        type: Boolean,
        default: false
      },
      scoreInfo: {
        type: Object
      },
      isFail:{
        type:Boolean,
				default: false
      }
    },
    components: {},
    data() {
      return {
        dialogShow: false,
        centerDialog: false,
        showInfo: false,
        groupCls: "hide",
        dialogCls: "hide",
        starPath: "static/images/header-star",
        victorySound: null,
      };
    },
    mounted() {
      this.dialogShow = this.show || false;
      this.victorySound = this.$refs.victory;
      if (this.victorySound) {
        this.victorySound.onpause = () => {
          this.victorySound.load()
        }
      }
    },
    computed: {
      starSrc: function () {
        let star = this.scoreInfo && this.scoreInfo.star || 0
        if (star > 3) {
          star = 3
        }
        return this.starPath + star + ".png";
      }
    },
    watch: {
      show: function (val) {
        this.dialogShow = val;
        this.showInfo = val;
        if (val) {
          this.dialogCls = "show";
          this.victorySound && this.victorySound.play()
          setTimeout(() => {
            this.$refs.scoreScroller && this.$refs.scoreScroller.forceUpdate(false)
          }, 1000)
        } else {
          this.dialogCls = "hide";
        }
      }
    },
    methods: {
      hide: function () {
        this.showInfo = false;
        setTimeout(() => {
          this.dialogShow = false;
          this.$emit("update:show", false);
          this.$emit('hide')
        }, 400);
      },
      replay: function () {
        this.$emit('replay')
      },
      next: function () {
        this.$emit('next')
      },
      afterEnter: function () {
        this.centerDialog = true
      },
      leaving: function () {
        this.centerDialog = false
      }
    }
  };
</script>
<style lang="scss" scoped>
  @import '~@/assets/css/variables.scss';
  .score-dialog {
  	position: fixed;
  	top: 0;
  	bottom: 0;
  	left: 0;
  	right: 0;
  	background: $mask-color;
  	display: none;
  	overflow: hidden;
  	z-index: 1000;
  	&.show {
  		display: block;
  	}
  	&.hide {
  		display: none;
  	}
  	.score-info-enter-active {
  		transition-duration: 0.5s;
  		transform: translate(-50%, -50%);
  		transition-property: transform;
  	}
  	.score-info-leave-active {
  		transition-duration: 0.5s;
  		transform: translate(-50%, -2000px);
  		transition-property: transform;
  	}
  	.score-info-enter {
  		transform: translate(-50%, -2000px);
  	}
  	.score-info-enter-to {
  		transform: translate(-50%, -50%);
  	}
  	.group-container {
  		width: 544px;
  		height: 1024px;
  		position: absolute;
  		left: 50%;
  		top: 50%;
  		.score-close {
  			width: 60px;
  			height: 60px;
  			position: absolute;
  			right: 0;
  			top: -30px;
  		}
  		.score-img {
  			width: 544px;
  			height: 1024px;
  		}
  		.score-star {
  			position: absolute;
  			top: -50px;
  			left: 110px;
  			width: 323px;
  			height: 130px;
  		}

  		.content {
  			position: absolute;
  			top: 100px;
  			left: 60px;
  			right: 60px;
  			height: 320px;
  			// background: rgba(0, 0, 0, 0.15);
  			text-align: center;
  			.step {
  				font-size: $normal-font-size;
  				height: 60px;
  				line-height: 60px;
  			}
  			.score {
  				font-size: $max-font-size;
  				color: $main-color;
  				font-weight: bold;
  				height: 80px;
  				line-height: 80px;
  				letter-spacing: 10px;
  			}
  			.coins {
  				font-size: $mini-font-size;
  				height: 40px;
  				line-height: 40px;
  				color: $body-text-color;
  			}
  			.desc {
  				font-size: $normal-font-size;
  				height: 60px;
  				line-height: 60px;
  				color: $desc-text-color;
  			}
  			.btn-container {
  				font-size: $normal-font-size;
  				height: 80px;
  				line-height: 80px;
  				.btn {
  					background: $assist-light-color;
  					color: $main-color;
  					border-radius: 30px;
  					padding: 10px 20px;
  					&:active {
  						background: $assist-dark-color;
  					}
  				}
  			}
  			.highlight {
  				color: $main-color;
  			}
				.failed{
					font-size:80px;
					color:$btn-color;
					margin:$padding 0;
				}
  		}
  		.ranking {
  			position: absolute;
  			top: 500px;
  			left: 60px;
  			right: 60px;
  			height: 500px;
  			text-align: center;
  			.ranking-title {
  				font-size: $normal-font-size;
  				height: 80px;
  				line-height: 80px;
  			}
  			.ranking-desc {
  				font-size: $small-font-size;
  				height: 110px;
  				line-height: 115px;
  				color: #fff;
  			}
  			.ranking-list {
  				font-size: $mini-font-size;
  				height: 300px;
  				width: 100%;
  				color: $body-text-color;
  				border-radius: 20px 20px 80px 80px;
  				box-sizing: border-box;
  				padding: 0 10px;
  				overflow: hidden;
  				li {
  					height: 100px;
  					line-height: 100px;
  					text-align: left;
  					padding: 0 10px;
  					.icon-img {
  						display: inline-block;
  						height: 60px;
  						width: 60px;
  						margin: 0 10px;
  						vertical-align: middle;
  					}
  					.icon {
  						width: 60px;
  						height: 60px;
  						line-height: 60px;
  						margin: 0 10px;
  						display: inline-block;
  						vertical-align: middle;
  						text-align: center;
  					}
  					.head-img-container {
  						width: 60px;
  						height: 60px;
  						border-radius: 50%;
  						overflow: hidden;
  						display: inline-block;
  						position: relative;
  						background: $bg-color-warm;
  						margin: 0 10px;
  						vertical-align: middle;
  						.head-img {
  							width: 130%;
  							left: 50%;
  							top: 50%;
  							position: absolute;
  							transform: translate(-50%, -50%);
  						}
  					}
  					.item-score {
  						vertical-align: middle;
  						display: inline-block;
  						text-align: right;
  						width: 180px;
  						height: 80px;
  						line-height: 80px;
  						font-size: $small-font-size;
  						color: $body-text-color;
  					}
  				}
  			}
  		}
  	}
  	.group-container.centerCls {
  		transform: translate(-50%, -50%);
  	}
  }
</style>
