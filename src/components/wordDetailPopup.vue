<template>
  <div class="word-details">
    <popup v-model="show" height="100%" @on-hide='onHide'>
      <div class="word-popup-header cnfont">
        <div class="close" @click="closePopup">
          <!-- 关闭按钮 -->
          <i class="back-arrow"></i>
        </div>
        <div class="popup-title">
          <p>单词详情</p>
        </div>
      </div>
      <!-- 单词详情 -->
      <div class="word-details-box">
        <!-- 单词图片 -->
        <div class="words">
          <vue-better-scroll ref="wordsDetails">
            <div>
              <div class="words-img">
                <bg-img :src='word.imgUrl' cls='word-img'></bg-img>
              </div>
              <!-- 单词的字母，音标,词性，读音，中文意思，和phonics -->
              <div class="detail">
                <div class="word-phonetic">
                  <div class="english-word">
                    <!-- 单词 -->
                    <p>{{word.word}}</p>
                  </div>
                  <!-- 读音 -->
                  <div class="sperkerIcon">
                    <speaker :audioSrc='word.voiceUrl'></speaker>
                  </div>
                </div>
                <!-- 音标 -->
                <div class="readStyle" v-if="word.readStyleUsa || word.readStyle">
                  <!-- 音标 -->
                  <span v-if="word.readStyleUsa" class="readStyleUsa">[美] {{word.readStyleUsa }}</span>
                  <span v-if="word.readStyle" class="readStyleUk">[英] {{word.readStyle }}</span>
                </div>
                <!-- 词性中文意思 -->
                <div class="chineseMean">
                  <!-- 词性 -->
                  <span> {{word.wordSort || ''}}</span>
                  <!-- 中文意思 -->
                  <span>{{word.chinese || ''}}</span>
                </div>
                <!-- phonics -->
                <div class="phonics" v-if="word.phonics">
                  <p>Phonics:</p>
                  <span>{{word.phonics}}</span>
                </div>
              </div>
              <!-- 例句 -->
              <div class="statement" v-if="word.statements && word.statements.length !==0">
                <p class="statement-title">例句如下</p>
                <div class="statement-detail" v-for="statement in word.statements" :key="statement.id">
                  <!-- 英文例句 -->
                  <div class="detaile-es" v-html="markEnglishWord(statement.statements,word.word)">
                  </div>
                  <!-- 中文 -->
                  <p>{{statement.chinese}}</p>
                  <speaker :audioSrc='statement.voiceUrl' class='statementVoice'></speaker>
                </div>
              </div>
            </div>
          </vue-better-scroll>
        </div>
      </div>
    </popup>
  </div>

  <!-- </div> -->
</template>
<script>
  import { Popup } from "vux";
  import bgImg from "./widgets/bgImg";
  import speaker from "./widgets/speaker";
  export default {
    name: "wordDetail",
    props: {
      showPopup: {
        type: Boolean,
        default: false
      },
      word: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        show: false
      };
    },
    watch: {
      showPopup(val) {
        console.log("------showPopup..", val);
        this.show = val;
        this.$store.commit("setDialogShowing", val);
        this.$store.dispatch("playTapAudio");
      },
      "$store.getters.dialogShowing": function (val) {
        if (val === false && this.show == true) {
          this.closePopup();
        }
      }
    },
    methods: {
      markEnglishWord(sentence, word) {
        //标记例子中的单词
        if (typeof sentence !== "string" || typeof word !== "string") {
          return "";
        }
        if (word.includes("’")) {
          word = word.replace("’", "'");
        }

        let index = word.indexOf("(");
        if (index !== -1) {
          word = word.slice(0, index);
        }

        let reg = new RegExp(`\\b(${word}[a-z]*)\\b`, "ig");
        if (word.length <= 2) {
          reg = new RegExp(`\\b${word}\\b`, "i");
        }
        if (reg.test(sentence)) {
          return sentence.replace(reg, word => {
            return `<i>${word}</i>`;
          });
        }
        let words = this.checkWord(word);
        let regs = this.createReg(words, sentence);
        let sentences = sentence;
        regs.forEach(reg => {
          if (reg) {
            sentences = sentences.replace(reg, word => {
              return `<i>${word}</i>`;
            });
          }
        });
        return sentences;
      },
      checkWord(word) {
        let reg = /[\s|…]/g;
        let wordArr = [];
        if (word.search(reg) !== -1) {
          wordArr = word.split(reg);
        } else {
          wordArr.push(word);
        }
        return wordArr;
      },
      createReg(arr, sentence) {
        //产生不同的正则表达式
        let regs = arr.map(word => {
          if (word) {
            let reg = null;
            do {
              reg = new RegExp(`\\b(${word}[a-z]*)\\b`, "i");
              word = word.slice(0, -1);
            } while (sentence.search(reg) === -1 && word);
            return reg;
          }
        });
        return regs;
      },
      closePopup() {
        this.show = false;
        console.log("---------close popup..");
      },
      onHide() {
        console.log("---------onhide..");
        this.$emit("update:showPopup", false);
      }
    },
    components: {
      speaker,
      Popup,
      bgImg
    }
  };
</script>
<style lang="scss">
  @import '~@/assets/css/variables';
  .clearfix:after {
  	content: '';
  	display: table;
  	clear: both;
  	overflow: hidden;
  }
  .word-details {
  	width: 100%;
  	height: 100%;
  	position: relative;
  	padding-top: $nav-line-height;
  	box-sizing: border-box;
  	.word-popup-header {
  		position: fixed;
  		top: 0;
  		left: 0;
  		width: 100%;
  		height: $nav-line-height;
  		.close,
  		.popup-title {
  			text-align: center;
  			color: #fff;
  		}
  		.close {
  			position: fixed;
  			left: 0px;
  			width: $nav-line-height;
  			height: $nav-line-height;
  			line-height: $nav-line-height;
  			font-size: $max-font-size;
  			z-index: 1;
  			.back-arrow {
  				position: absolute;
  				width: 100px;
  				height: $nav-line-height;
  				top: 0px;
  				left: 0px;
  			}
  			.back-arrow::before {
  				content: '';
  				position: absolute;
  				width: 25px;
  				height: 25px;
  				border: 3px solid #ffffff;
  				border-width: 3px 0 0 3px;
  				transform: rotate(315deg);
  				top: 40px;
  				left: 50px;
  			}
  		}
  		.popup-title {
  			width: 100%;
  			height: $nav-line-height;
  			line-height: $nav-line-height;
  			background-color: $main-color;
  			font-size: $large-font-size;
  		}
  	}
  	// 单词详情
  	.word-details-box {
  		position: absolute;
  		top: $nav-line-height;
  		left: 0;
  		right: 0;
  		bottom: 0;
  		overflow: hidden;
  		box-sizing: border-box;
  		.words {
  			height: 100%;
  			width: 100%;
  			border-radius: 20px;
  			overflow: hidden;
  			background-color: #fff;
  			& > div {
  				height: 100%;
  				width: 100%;
  				padding: 0 75px;
  				overflow: hidden;
  				box-sizing: border-box;
  				.words-img {
  					width: 360px;
  					height: 360px;
  					margin: 20px auto;
  					box-sizing: border-box;
  					img {
  						width: 100%;
  						height: 100%;
  					}
  				}
  				.detail {
  					//p标签里的样式
  					box-sizing: border-box;
  					padding-bottom: 20px;
  					p {
  						color: $desc-text-color;
  						font-size: 28px;
  					}
  					& > div.word-phonetic,
  					& > div.chineseMean,
  					& > div.phonics,
  					& > div.readStyle {
  						width: 100%;
  						padding: 0 15px;
  						box-sizing: border-box;
  					}
  					//单词发音
  					.word-phonetic {
  						width: 100%;
  						& > div {
  							display: inline-block;
  							vertical-align: middle;
  							margin: 0;
  						}
  						.english-word {
  							width: 85%;
  							p {
  								overflow-wrap: break-word;
  								font-size: $large-font-size;
  								color: #000000;
  								font-weight: 800;
  							}
  						}
  						.sperkerIcon {
  							width: 10%;
  						}
  					}
  					.readStyle {
  						font-size: $mini-font-size;
  						font-weight: 500;
  						& > span {
  							overflow-wrap: break-word;
  							padding-right: 10px;
  						}
  						.readStyleUk {
  							color: $desc-text-color;
  						}
  					}
  					.chineseMean {
  						margin-top: 10px;
  						color: $desc-text-color;
  						font-size: 28px;
  					}
  					//phonics
  					.phonics {
  						p,
  						span {
  							display: inline;
  						}
  						p {
  							color: #000;
  							font: {
  								weight: 500;
  								size: $normal-font-size;
  							}
  						}
  						span {
  							font-size: $small-font-size;
  						}
  					}
  				}
  				//例句
  				.statement {
  					border-top: 2px solid $gray-border;
  					box-sizing: border-box;
  					padding: 0 20px;
  					p {
  						color: $desc-text-color;
  						font-size: $mini-font-size;
  					}
  					.statement-title {
  						padding: 15px 0;
  					}
  					.statement-detail {
  						position: relative;
  						.detaile-es {
  							width: 90%;
                overflow-wrap: break-word;
  							font-size: $small-font-size;
  							font-weight: 500;
  							//变色的例句单词样式
  							i {
  								font-style: normal;
  								color: $main-color;
  							}
  						}
  						.statementVoice {
  							position: absolute;
  							top: 0;
  							right: -10px;
  						}
  					}
  				}
  			}
  		}
  	}
  }
</style>
