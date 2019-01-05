<template>
  <div class='spell-drag-container'>
    <learn-header></learn-header>
    <div class='spell-body'>
      <div class='content'>
        <div class='words-container'>
          <transition name='fade'>
            <div class='word-item' v-for="(word, idx) in words" :key='idx' v-if="curr == (idx+1)">
              <div class='img-container'>
                <bg-img :src='word.imgUrl' cls='word-img'></bg-img>
              </div>
              <speaker class='word-speaker' :audioSrc='word.voiceUrl' autoPlay :delay='audioDelay' @onStart="startPlay" @onEnd="wordVoiceEnd" @onError="wordVoiceEnd"></speaker>
              <div class='tips'>{{tips}}</div>
              <div class='result'>
                <span class='combined'>{{combinedWord}}</span>
                <span class='check-icon'>
                  <img class="right" v-show='showResult && !currError' src="static/images/success.png" alt="">
                  <img class="error" v-show="showResult && currError" src="static/images/error.png" alt="">
                </span>
              </div>
              <div class='phonics'>
                <draggable class="list-group" element="ul" v-model="segments" :options="dragOptions">
                  <!-- <transition-group type="transition" :name="'flip-list'"> -->
                  <li class="list-group-item" v-for='(segment, idx) in segments' :key="idx">
                    {{segment}}
                  </li>
                  <!-- </transition-group> -->
                </draggable>
              </div>
            </div>
          </transition>
        </div>
        <div class='btn-container cnfont'>
          <div class='btn' :class="{disable:locking,active:!locking}" @click='checkResult'>检测一下（{{curr}}/{{words.length}}）</div>
        </div>
      </div>
    </div>
    <right-wrong-voice ref="voice"></right-wrong-voice>
    <dragon-effects ref="dragon"></dragon-effects>
  </div>
</template>
<script>
  import learnHeader from "@/components/learnHeader";
  import speaker from "@/components/widgets/speaker";
  import bgImg from "@/components/widgets/bgImg";
  import rightWrongVoice from "@/components/rightWrongVoice"
  import utility from "@/utility/utility";
  import draggable from "vuedraggable";
  import _ from "lodash";
  import dragonEffects from '@/pages/learnFlow/children/dragonEffects'
  export default {
    props: ["reset"],
    data() {
      return {
        curr: 1,
        selectedSegments: [],
        multi: false,
        dragOptions: {
          // animation: 0,
          animation: 50,
          ghostClass: "ghost"
        },
        segments: [],
        tips: "拖动调整顺序",
        currError: false,
        errorTimes: 0,
        showResult: false,
        combinedWord: "",
        audioDelay: 500,
        wrongWords: [],
        locking: true
      };
    },
    computed: {
      words: function () {
        let words = _.cloneDeep(this.$store.getters.currFlowStepWords);
        words &&
          words.forEach((item, idx) => {
            !item.segments && this.buildSegments(item);
            if (idx === 0) {
              this.segments = item.segments;
            }
          });
        console.log("-----words", words);
        return words;
      }
    },
    watch: {
      curr: function (val) {
        let currWord = this.words[val - 1];
        console.log("----set segments", val);
        currWord && (this.segments = currWord.segments);
      },
      reset: function (val) {
        if (val) {
          console.log("-----reset ", this.curr);
          this.curr = 1;
          this.wrongWords = [];
        }
      }
    },
    methods: {
      checkResult: function () {
        if (this.locking) {
          return
        }
        this.locking = true
        let word = this.words[this.curr - 1];
        let wordId = word.id;
        this.showResult = true;
        if (word.wordStyle == "GROUP") {
          this.combinedWord = this.segments.join(" ");
        } else {
          this.combinedWord = this.segments.join("");
        }
        if (this.combinedWord.toLowerCase() == word.word.toLowerCase()) {
          // this.$emit('right')
          this.$refs.dragon && this.$refs.dragon.playVictory(() => {
            this.next();
          })
          // this.$refs.voice.playSuccess()
          this.currError = false;
          // setTimeout(() => {
          // }, 2500)
        } else {
          // this.$emit('error')
          this.$refs.dragon && this.$refs.dragon.playCry(() => {
            this.showResult = false;
            this.combinedWord = "";
            if (this.errorTimes == 2) {
              this.next();
            }else{
               this.locking = false
            }
          })
          this.currError = true;
          // this.$refs.voice.playFailed()
          if (
            !this.wrongWords.find(item => {
              return item === wordId;
            })
          ) {
            this.wrongWords.push(wordId);
          }
          this.errorTimes++;
          // setTimeout(() => {
          //   this.showResult = false;
          //   this.combinedWord = "";
          //   if (this.errorTimes == 2) {
          //     this.next();
          //   }
          // }, 3000);
        }
      },
      next: function () {
        setTimeout(() => {
          this.errorTimes = 0;
          this.showResult = false;
          this.combinedWord = "";
          if (this.curr == this.words.length) {
            // this.curr = 1;
            console.log("----end ", this.curr);
            this.$emit("postResult", this.wrongWords);
          } else {
            console.log("----next1... ", this.curr);
            this.curr++;
            console.log("----next2... ", this.curr);
          }
        }, 800);
      },
      buildSegments: function (wordItem) {
        let segments = [];
        let type = wordItem.wordStyle;
        let word = wordItem.word;
        if (type == "WORD") {
          let phonics = wordItem.phonics;
          if (phonics) {
            let arr = phonics.split("=");
            if (arr.length == 2) {
              segments = arr[0].split("+");
            }
          } else if (word.indexOf("-") != -1) {
            segments = word.split("-");
            segments.push("-");
          } else {
            segments = word.split("");
          }
        } else {
          segments = word.split(" ");
        }
        wordItem["segments"] = utility.sortArrByRandom(segments);
      },
      startPlay() {
        this.locking = true
      },
      wordVoiceEnd() {
        this.locking = false
      }
    },
    components: { learnHeader, speaker, bgImg, draggable, rightWrongVoice, dragonEffects }
  };
</script>

<style lang='scss' scoped>
  @import '~@/assets/css/variables.scss';
  .spell-drag-container {
  	background: $main-color;
  	height: 100%;
  	width: 100%;
  	position: relative;
  	.spell-body {
  		position: absolute;
  		top: $learn-line-height;
  		bottom: 0;
  		left: 0;
  		right: 0;
  		padding: 15px;
  		.content {
  			height: 100%;
  			width: 100%;
  			border-radius: 30px;
  			background: #fff;
  			overflow: hidden;
  			position: relative;
  			.words-container {
  				position: absolute;
  				top: 30px;
  				left: 30px;
  				right: 30px;
  				bottom: 200px;
  				.word-item {
  					height: 100%;
  					width: 100%;
  					text-align: center;
  					top: 0;
  					left: 0;
  					position: absolute;
  					.img-container {
  						width: 360px;
  						height: 360px;
  						margin: 0 auto;
  						box-sizing: border-box;
  						.word-img {
  							width: 100%;
  							height: 100%;
  						}
  					}
  					.word-speaker {
  						margin-top: 40px;
  					}
  					.tips {
  						margin-top: 20px;
  						color: gray;
  						font-size: $tiny-font-size;
  					}
  					.result {
  						height: 80px;
  						line-height: 80px;
  						margin-bottom: 20px;
  						font-size: $large-font-size;
  						position: relative;
  						.combined {
  							display: inline-block;
  							border-bottom: 2px solid $stroke-color;
  							min-width: 200px;
  							height: 80%;
  							line-height: 80%;
  							vertical-align: middle;
  							text-align: center;
  						}
  						.check-icon {
  							position: absolute;
  							top: -10px;
  							right: 0;
  							// display:block;
  							// .right {
  							//   width: 30px;
  							// }
  							// .error {
  							//   width: 30px;
  							// }
  						}
  					}
  					.phonics {
  						height: 150px;
  						line-height: 75px;
  						// background: lightblue;
  						.list-group {
  							display: block;
  							list-style-type: none;
  							.list-group-item {
  								height: 60px;
  								line-height: 60px;
  								display: inline-block;
  								font-size: $normal-font-size;
  								min-width: 70px;
  								padding: 10px 30px;
  								background: $embellish-color;
  								color: #fff;
  								border-radius: 20px;
  								margin-left: 20px;
  								margin-top: 10px;
  							}
  							.ghost {
  								opacity: 0.5;
  								background: $assist-color;
  							}
  						}
  						.list-group-item-selected {
  							background: $embellish-dark-color;
  						}
  					}
  				}
  			}
  			.btn-container {
  				position: absolute;
  				bottom: 0;
  				width: 100%;
  				height: 160px;
  				line-height: 160px;
  				// background:lightsalmon;
  				text-align: center;
  				.btn {
  					width: 80%;
  					height: 100px;
  					line-height: 100px;
  					text-align: center;
  					// background: $assist-light-color;
  					margin: 0 auto;
  					// color: $main-color;
  					font-size: $large-font-size;
  					border-radius: 100px;
  					// &:active{
  					//  background-color:$assist-color;
  					// }
  					// font-size: $big-font-size;
  					// // width:500px;
  					// // height:120px;
  					// border-radius: 50px;
  					// color: $main-color;
  					// background: $assist-light-color;
  					// padding: 20px 100px;
  				}
  				.active {
  					background-color: $assist-light-color;
  					color: $main-color;
  					&:active {
  						background-color: $assist-color;
  					}
  				}
  				.disable {
  					background-color: $disable-color;
  					color: #ffffff;
  				}
  			}
  		}
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

  	.flip-list-move {
  		transition: transform 0.5s;
  	}
  }
</style>
