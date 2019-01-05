<template>
  <div class="word-details">
    <!-- 顶部 -->
    <div class="datail-header">
      <nav-header title="单词详情"></nav-header>
    </div>
    <!-- 单词详情 -->
    <div class="word-details-box">
      <!-- 单词图片 -->
      <div class="words">
        <vue-better-scroll ref="wordsDetails">
          <div>
            <div class="words-img">
              <img :src="wordDetails.imgUrl">
            </div>
            <!-- 单词的字母，音标,词性，读音，中文意思，和phonics -->
            <div class="detail">
              <div class="word-phonetic">
                <div class="english-word">
                  <!-- 单词 -->
                  <p>{{wordDetails.word}}</p>
                </div>
                <!-- 读音 -->
                <div class="sperkerIcon">
                  <speaker :audioSrc='wordDetails.voiceUrl'></speaker>
                </div>
              </div>
              <!-- 音标 -->
              <div class="phonetics">
                <!-- 音标 -->
                <span>{{wordDetails.readStyle || ''}}</span>
              </div>
              <!-- 词性中文意思 -->
              <div class="chineseMean">
                <!-- 词性 -->
                <span> {{wordDetails.wordSort ||  ''}}</span>
                <!-- 中文意思 -->
                <span>{{wordDetails.chinese || ''}}</span>
              </div>
              <!-- phonics -->
              <div class="phonics" v-if="wordDetails.phonics">
                <p>Phonics:</p>
                <span>{{wordDetails.phonics}}</span>
              </div>
            </div>
            <!-- 例句 -->
            <div class="example" v-if="wordDetails.statements.length !==0">
              <p class="example-title">例句如下</p>
              <div class="example-detail" v-for="statement in wordDetails.statements" :key="statement.id">
                <!-- 英文例句 -->
                <div v-html="markEnglishWord(statement.statements,wordDetails.word)">
                </div>
                <!-- 中文 -->
                <p>{{statement.chinese}}</p>
              </div>
            </div>
          </div>
        </vue-better-scroll>
      </div>
        
    </div>
  </div>

  </div>
</template>
<script>
import navHeader from "@/components/navHeader";
import speaker from "@/components/widgets/speaker";
export default {
  name: "wordDetail",
  computed: {
    wordDetails: function() {
      let id = this.$route.query.id; //单词id
      let isForget = this.$route.query.isForget; //是不是生词本中的单词
      id = Number(id);
      if (!isForget) {
        //从单词列表中查找单词
        let list = this.$store.getters.unitWords;
        console.log("-------------单词列表", list);
        if (list) {
          return list.find(words => words.id === id);
        }
      } else {
        //从生词列表中查找单词
        let list = this.$store.getters.forgetWords;
        console.log("------------生词列表", list);
        if (list) {
          let word = list.find(words => words.id === id);
          return word ? word.word : {};
        }
      }
      return {};
    }
  },
  mounted() {
    console.log("-------------wordDetail", this);
  },
  methods:{
      markEnglishWord(sentence,word){  //标记例子中的单词
          if(typeof sentence !== 'string' || typeof word !==  'string'){
              return '';
          }
          let reg ;
          do{
            reg = new RegExp(`(${word})[a-zA-z]*`,'ig');
            word= word.slice(0,-1);
          } while(sentence.search(reg) === -1 && word)

          return sentence.replace(reg,(word)=>{
              return  `<i class="word-color">${word}</i>`;
          })
      },
  },
  components: {
    navHeader,
    speaker
  }
};
</script>
<style lang="scss">
@import "~@/assets/css/variables";
.clearfix:after {
  content: "";
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
  .datail-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
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
          & > div.phonetics {
            width: 100%;
            padding: 0 15px;
            box-sizing: border-box;
          }
          //单词发音
          .word-phonetic {
            width: 100%;
            height: 90px;
            line-height: 90px;
            & > div {
              display: inline-block;
              height: 90px;
              line-height: 90px;
              vertical-align: middle;
              margin: 0;
            }
            .english-word {
              width: 85%;
              p {
                font-size: $large-font-size;
                color: #000000;
                font-weight: 800;
              }
            }
            .sperkerIcon {
              width: 10%;
            }
          }
          .phonetics {
            font-size: 28px;
            font-weight: 500;
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
        .example {
          border-top: 2px solid $gray-border;
          box-sizing: border-box;
          padding: 0 20px;
          p {
            color: $desc-text-color;
            font-size: 28px;
          }
          .example-title {
            padding: 15px 0;
          }
          .example-detail {
            & > div {
              font-size: 34px;
              font-weight: 500;
              //变色的例句单词样式
              .word-color {
                font-style: normal;
                color: #ff5f5f;
              }
            }
          }
        }
      }
    }
  }
}
</style>
