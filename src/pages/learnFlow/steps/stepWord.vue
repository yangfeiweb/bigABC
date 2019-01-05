<template>
  <div class='step1-read-word'>
    <learn-header></learn-header>
    <div class='word-info'>
      <!-- <div class="word-details"> -->
      <!-- 单词图片 -->
      <div class='word-content'>
        <div class="progress">
          <div class="out-bar" ref="outBar">
            <div class="inner-bar" :style="{width:innerWidth+'px'}"></div>
          </div>
        </div>
        <!-- <div class='word-amount'>({{curr+1}}/{{words.length}})</div> -->
        <transition name='fade'>
          <div class="words" v-for="(word, idx) in wordsArr" :key='idx' v-if="curr === idx">
            <div class='img-container'>
              <bg-img :src='word.imgUrl' cls='word-img'></bg-img>
            </div>
            <div class='word-meaning'>
              <h3>{{word.word}}</h3>
              <div class="readStyle" v-if="word.readStyleUsa || word.readStyle">
                <span v-if="word.readStyleUsa" class="readStyleUsa">[美] {{word.readStyleUsa}}</span>
                <span v-if="word.readStyle" class="readStyleUK">[英] {{word.readStyle}}</span>
              </div>
              <div class="speaker">
                <speaker :audioSrc='word.voiceUrl' autoPlay :delay='audioDelay' @onEnd="wordVoiceEnd" @onError="wordVoiceError" class='speak'></speaker>
              </div>
            </div>
            <div class='woed-speech'>
              <p> {{word.wordSort}}. {{ word.chinese}}</p>
            </div>
            <!-- phonics -->
            <div class="phonics" v-if="word.phonics">
              <span>Phonics :</span>
              <span>{{ word.phonics}}</span>
            </div>
            <!-- 例句 -->
            <div class="statement" v-if="word.statements && word.statements.length !==0 && showStatement">
              <vue-better-scroll ref="scroll" class="statement-list">
                <div class="statement-detail" v-for="statement in word.statements" :key="statement.id">
                  <!-- 英文例句 -->
                  <div v-html="markEnglishWord(statement.statements,word.word)">
                  </div>
                  <!-- 中文 -->
                  <p>{{statement.chinese}}</p>
                  <speaker ref="statement" autoPlay :audioSrc='statement.voiceUrl' class='statementVoice' @onEnd="playEnd" @onError="playError"></speaker>
                </div>
              </vue-better-scroll>
            </div>
          </div>
        </transition>
        <div class='word-btn cnfont'>
          <div @click='wordClick' class="active">单词</div>
          <div @click='unrecognize' :class="{active:!locking,disable:locking}">不认识</div>
          <div @click='recognize' :class="{active:!locking,disable:locking}">认识</div>
        </div>
      </div>
      <!-- </div> -->
    </div>
    <words-popup :show.sync="showWord" :lists='words'></words-popup>
  </div>

</template>
<script>
  import learnHeader from "@/components/learnHeader"
  import speaker from "@/components/widgets/speaker"
  import bgImg from "@/components/widgets/bgImg"
  import wordsPopup from "@/components/wordsPopup"
  import scoreDialog from "@/components/scoreDialog"
  import _ from "lodash"
  // import testWords from "@/game/testWord"
  export default {
    props: ["reset"],
    data() {
      return {
        curr: 0,
        index: 0,
        audioDelay: 500,
        showWord: false,
        showStatement: false,
        wrongWords: new Set(),
        locking: true,
        wordsArr: [],
        outWidth: 0,
        innerWidth: 0,
      }
    },
    computed: {
      words: function () {
        let words = _.cloneDeep(this.$store.getters.currFlowStepWords || [])
        words.forEach((item, index) => {
          if (item) {
            item.UnknownCount = 0
            item.isKnown = true
          }
        })
        return words
      }
    },
    watch: {
      reset: function (val) {
        if (val) {
          this.curr = 0
          this.index = 0
          this.wrongWords = new Set()
          this.innerWidth = 0
        }
      },
      index: function (newVal) {
        if (newVal) {
          let each = this.outWidth / this.wordsArr.length
          this.innerWidth = each * newVal
        }
      }
    },
    mounted() {
      if (this.$refs.outBar) {
        this.outWidth = this.$refs.outBar.clientWidth
      }
      this.wordsArr = _.cloneDeep(this.words)
    },
    methods: {
      recognize: function () {
        if (this.locking) {
          return
        }
        this.$store.dispatch("playTapAudio");
        this.showStatement = false
        this.locking = true
        let currWord = this.wordsArr[this.curr]
        if (!currWord.isKnown) {
          let currId = currWord.id;
          for (let i = this.curr + 1; i < this.wordsArr.length; i++) {
            let word = this.wordsArr[i]
            let id = word.id;
            if (currId === id) {
              this.wordsArr.splice(i, 1);
              i--;
            }
          }
        }
        this.next()
      },
      unrecognize: function () {
        if (this.locking) {
          return
        }
        this.$store.dispatch("playTapAudio");
        this.locking = true
        this.showStatement = false
        let word = this.wordsArr[this.curr]
        if (word.isKnown) { //第一次点击不认识 插入三次 出现三次
          word.isKnown = false
          this.checkKnown(word)
        } else { //再点击不认识继续让其出现
          let len = this.wordsArr.length
          // let id = word.id
          let arr = [1, 2, 3]
          let index = word.index
          let num = arr.find(val => val === index)
          if (num) {
            // if (!word.secondInsert) {
            //   this.wordsArr.forEach(item => {
            //     if (item.id === id) {
            //       item.secondInsert = true
            //     }
            //   })
            // }
            let cloneWord = _.cloneDeep(word)
            cloneWord.index = 0;
            this.insert(len, cloneWord)
          }
        }
        this.wrongWords.add(word.id)
        this.next()
      },
      checkCurrWord() {  //检查当前单词有无例句
        let word = this.wordsArr[this.curr]
        let statement = word.statements
        if (statement && statement.length !== 0) {
          return true
        }
        return false
      },
      checkKnown(word) { //第一次点不认识
        let arr = [2, 5, 9]
        arr.forEach((val, index) => {
          let cloneWord = _.cloneDeep(word)
          cloneWord.index = index + 1
          // cloneWord.secondInsert = false
          this.insert(val, cloneWord)
        })
      },
      insert(num, word) {
        let len = this.wordsArr.length
        if (this.curr + num >= len) {
          this.wordsArr.splice(len, 0, word)
        } else {
          this.wordsArr.splice(this.curr + num, 0, word)
        }
      },
      next: function () {
        // setTimeout(() => {
        //   this.locking = false
        // }, 1000)
        if (this.curr == this.wordsArr.length - 1) {
          this.index++
          let wrongWords = Array.from(this.wrongWords)
          this.$emit("postResult", wrongWords)
        } else {
          this.locking = true
          this.curr++
          this.index = this.curr
        }
      },
      wordVoiceEnd() {
        if (this.checkCurrWord()) {
          this.showStatement = true
        } else {
          this.locking = false
        }
      },
      wordVoiceError() {
        this.wordVoiceEnd()
      },
      playEnd() {
        this.locking = false
      },
      playError() {
        setTimeout(() => {
          this.playEnd()
        }, 500)
      },
      wordClick: function () {
        this.showWord = true
      },
      markEnglishWord(sentence, word) {  //标记例子中的单词
        if (typeof sentence !== 'string' || typeof word !== 'string') {
          return ""
        }
        if (word.includes("’")) {
          word = word.replace("’", "'")
        }

        let index = word.indexOf("(")
        if (index !== -1) {
          word = word.slice(0, index)
        }

        let reg = new RegExp(`\\b(${word}[a-z]*)\\b`, "ig")
        if (word.length <= 2) {
          reg = new RegExp(`\\b${word}\\b`, "i")
        }
        if (reg.test(sentence)) {
          return sentence.replace(reg, (word) => {
            return `<i>${word}</i>`
          })
        }
        let words = this.checkWord(word)
        let regs = this.createReg(words, sentence)
        let sentences = sentence
        regs.forEach(reg => {
          if (reg) {
            sentences = sentences.replace(reg, (word) => {
              return `<i>${word}</i>`
            })
          }
        })
        return sentences
      },
      checkWord(word) {
        let reg = /[\s|…]/g
        let wordArr = []
        if (word.search(reg) !== -1) {
          wordArr = word.split(reg)
        } else {
          wordArr.push(word)
        }
        return wordArr
      },
      createReg(arr, sentence) {  //产生不同的正则表达式
        let regs = arr.map((word) => {
          if (word) {
            let reg = null
            do {
              reg = new RegExp(`\\b(${word}[a-z]*)\\b`, "i")
              word = word.slice(0, -1)
            } while (sentence.search(reg) === -1 && word)
            return reg
          }
        })
        return regs
      }
    },
    components: {
      learnHeader,
      speaker,
      bgImg,
      wordsPopup,
      scoreDialog
    },
  }
</script>

<style lang="scss" >
  @import '~@/assets/css/variables';
  .step1-read-word {
  	background-color: $main-color;
  	height: 100%;
  	width: 100%;
  	position: relative;
  	.word-info {
  		position: absolute;
  		top: $learn-line-height;
  		bottom: 0;
  		left: 0;
  		right: 0;
  		padding: 15px;
  		.word-content {
  			height: 100%;
  			width: 100%;
  			border-radius: 30px;
  			background-color: #fff;
  			overflow: hidden;
  			position: relative;
  			.progress {
  				width: 400px;
  				margin: 20px auto;
  				.out-bar {
  					position: relative;
  					width: 100%;
  					height: 15px;
  					background-color: $bg-color-warm;
  					border-radius: 15px;
  					.inner-bar {
  						position: absolute;
  						left: 0;
  						top: 0;
  						// width:100%
  						height: 15px;
  						border-radius: 15px;
  						background-color: $embellish-color;
  					}
  				}
  			}
  			.word-amount {
  				width: 100%;
  				height: 80px;
  				line-height: 80px;
  				text-align: center;
  				font-size: $mini-font-size;
  				color: #969696;
  			}
  			.words {
  				position: absolute;
  				top: 80px;
  				left: 30px;
  				right: 30px;
  				bottom: 200px;
  				text-align: left;
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
  				.word-meaning {
  					width: 500px;
  					margin: 0 auto;
  					position: relative;
  					& > h3 {
  						overflow-wrap: break-word;
  						font-size: $large-font-size;
  					}
  					.readStyle {
  						width: 100%;
  						box-sizing: border-box;
  						.readStyleUsa,
  						.readStyleUK {
  							display: block;
  							font-size: $mini-font-size;
  						}
  						.readStyleUK {
  							color: $desc-text-color;
  						}
  					}
  					.speaker {
  						position: absolute;
  						top: 10px;
  						right: 0px;
  					}
  				}
  				.woed-speech {
  					width: 500px;
  					color: $desc-text-color;
  					font-size: $small-font-size;
  					margin: 0 auto;
  				}
  				.phonics {
  					width: 500px;
  					font-size: $small-font-size;
  					overflow-wrap: break-word;
  					margin: 0 auto;
  				}
  				//例句
  				.statement {
  					width: 500px;
  					height: 330px;
  					margin: 0 auto;
  					margin-top: 10px;
  					overflow: hidden;
  					border-top: 2px solid $gray-border;
  					box-sizing: border-box;
  					p {
  						color: $desc-text-color;
  						font-size: 28px;
  					}
  					.statement-list {
  						width: 100%;
  						height: 100%;
  						overflow: hidden;
  						.statement-detail {
  							position: relative;
  							width: 400px;
  							padding: 10px 0;
  							overflow-wrap: break-word;
  							.statementVoice {
  								position: absolute;
  								top: 10px;
  								right: -100px;
  								z-index: 100;
  							}
  							& > div {
  								font-size: $small-font-size;
  								font-weight: 500;
  								//变色的例句单词样式
  								i {
  									font-style: normal;
  									color: $main-color;
  								}
  							}
  						}
  					}
  				}
  			}

  			.word-btn {
  				width: 100%;
  				height: 160px;
  				line-height: 160px;
  				position: absolute;
  				bottom: 0px;
  				display: flex;
  				justify-content: space-around;
  				-webkit-justify-content: space-around;
  				align-items: center;
  				& > div {
  					// float: left
  					width: 150px;
  					height: 80px;
  					line-height: 80px;
  					text-align: center;
  					// margin-left: 60px
  					font-size: $large-font-size;
  					border-radius: 35px;
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
  }
</style>
