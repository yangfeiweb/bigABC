<template>
  <div class="learn-record cnfont">
    <div class="learn-record-header">
      <nav-header title="学习记录">
      </nav-header>
    </div>
    <div class="record-box" v-if="hasRecord">
      <vue-better-scroll class="record-scroll" ref="recordBox">
        <div>
          <!-- 学习进度条 20-->
          <div class="learn-title">
            <p>{{currGreade}}</p>
          </div>
          <!-- 进度条 -->
          <div class="learn-pregress-box">

            <div class="learn-pregress">

              <div ref="tipInfo" class="pregress-tip" :style="{left:percentage+'%'}">
                <span>{{percentage}}%</span>
                <!-- 提示 图片背景-->
              </div>

              <div class="pregress-outBar" ref="outBar">
                <!-- 底色 -->
                <div class="pregress-innerBar" :style="{width:percentage+'%'}">
                  <!-- 红色 -->
                  <div ref="circle" class="pregress-circle" v-show="!!innerBar">
                    <!-- 小圆 -->
                  </div>
                </div>
              </div>
            </div>

            <!-- 数字 -->
            <div class="word-nums">{{wordText}}</div>
          </div>
          <div class="unit-record">
            <!-- 单元的学习记录 -->
            <group :title="currGreadeTime">
              <cell-box v-for="val in unitScore" :key="val.unit">
                <!-- 单元 -->
                <div class="unit">{{val.unit}}</div>

                <!-- 学习评价和得分 -->
                <!-- 大于90 -->
                <div v-if="val.score>=90" class="evaluate-score clearfix">
                  <!-- 学习评家 -->
                  <div class="evaluate">优秀</div>
                  <!-- 学习得分 -->
                  <div class="score height-score">
                    <span class="lower-score-text">{{val.score}}</span>
                  </div>
                </div>
                <!-- 大于80 -->
                <div v-else-if="val.score>=80" class="evaluate-score clearfix">
                  <!-- 学习Ping家 -->
                  <div class="evaluate">良好</div>
                  <!-- 学习得分 -->
                  <div class="score middle-score">
                    <span class="lower-score-text">{{val.score}}</span>
                  </div>
                </div>
                <!-- 其他 -->
                <div v-else-if="val.score>0" class="evaluate-score clearfix">
                  <!-- 学习Ping家 -->
                  <div class="evaluate">还需努力</div>
                  <!-- 学习得分 -->
                  <div class="score lower-score">
                    <span class="lower-score-text">{{val.score}}</span>
                  </div>
                </div>
                <!-- 沒分 -->
                <div v-else class="evaluate-score clearfix">
                  <!-- 学习Ping家 -->
                  <div class="evaluate">快去学习吧</div>
                  <!-- 学习得分 -->
                  <div class="score none-score"></div>
                </div>
              </cell-box>
            </group>
          </div>
        </div>
      </vue-better-scroll>
    </div>
    <div class="forget-tip cnfont" v-else>
      先去选择课程吧
    </div>

  </div>
</template>
<script>
  import { Group, CellBox } from "vux";
  import navHeader from "@/components/navHeader";

  import dataService from "@/service/index";

  import { GRADE_PART } from "@/utility/dict";

  export default {
    name: "learnRecord",
    data() {
      return {
        outBarWidth: 0, //进度条的总宽度,
        tipInfoWidth: 0, //提示容器的宽度
        currGreade: "",
        currGreadeTime: "",
        hasRecord: true,
        leanRecord: []
      };
    },

    computed: {
      totalWords: function () {
        //单元的总单词数
        if (this.unitList) {
          let total = 0;
          this.unitList.forEach(unit => {
            if (unit) {
              total += unit.words;
            }
          });
          return total;
        }
        return 0;
      },
      completeWords: function () {
        //现在完成的单词数
        if (this.leanRecord && this.unitList) {
          let comWords = 0;
          this.leanRecord.forEach(val => {
            let unit = this.unitList.find(unit => unit.id === val.unitId);
            if (unit) {
              comWords += unit.words;
            }
          });
          return comWords;
        }
        return 0;
      },
      innerBar: function () {
        //内进度条宽度
        let inner;
        if (this.completeWords > 0) {
          if (this.completeWords === this.totalWords) {
            //如果全部完成则宽度为外进度条的宽度
            inner = this.outBarWidth;
          } else {
            // 每个单词所对应的进度条的宽度
            let eachWidth = this.outBarWidth / this.totalWords;
            //内侧进度条应该有的宽度 每个单词应有的宽度 * 完成单词的个数
            inner = this.completeWords * eachWidth;
            if (inner + this.outBarHeight <= this.outBarWidth * 0.3) {
              inner += this.outBarHeight;
            }
          }
        } else {
          inner = 0;
        }
        return inner;
      },
      tipInfoLeft: function () {
        //提示信息的左则距离
        //提示信息的位置  进度条的宽度 - 自身的宽度
        let tipInfo = this.innerBar - this.tipInfoWidth / 2;
        if (tipInfo < 0) {
          tipInfo = 0;
        }
        return tipInfo;
      },
      percentage: function () {
        //计算完成的单词数站的百分比
        if (this.completeWords === 0) {
          return 0;
        }
        return Math.floor(this.completeWords / this.totalWords * 100);
      },
      wordText: function () {
        return this.completeWords + "/" + this.totalWords;
      },
      unitScore: function () {
        //单元分数计算
        if (this.unitList) {
          return this.unitList.map(unit => {
            let leanRecord = this.leanRecord.find(
              record => record.unitId === unit.id
            );
            let score = leanRecord ? leanRecord.score : 0;
            return {
              unit: unit.name,
              score: score
            };
          });
        } else {
          return 0;
        }
      },
      unitList: function () {
        console.log("unitList----", this.$store.getters.currUnitList);
        return this.$store.getters.currUnitList;
      }
    },
    mounted() {
      if (this.hasRecord) {
        this.tipInfoWidth = this.$refs.tipInfo.clientWidth;
        this.outBarWidth = this.$refs.outBar.clientWidth;
        this.outBarHeight = this.$refs.outBar.clientHeight;
        this.circleWidth = this.$refs.circle.clientWidth;
      }
      console.log("---------learn Record", this);
    },
    created() {
      let currGradeId = this.$store.getters.getCurrGradeId;
      if (currGradeId) {
        this.hasRecord = true;
        let gradeList = this.$store.getters.getGradeList;
        let cGrade = gradeList.find(s => s.id === currGradeId);
        //获取当前的年级信息
        if (cGrade) {
          this.currGreade = cGrade.label + "单词学习进度";
          this.currGreadeTime = GRADE_PART[cGrade.gradeTime] + "学习情况";
          this.getRecord(cGrade.grade, cGrade.gradeTime);
        }
      } else {
        this.hasRecord = false;
      }
    },
    methods: {
      getRecord(grade, gradeTime) {
        dataService.getLearnRecord(grade, gradeTime).then(res => {
          let result = res.data;
          let code = result.code;
          if (code === 200) {
            this.leanRecord = result.data;
          }
        });
      }
    },
    components: {
      Group,
      CellBox,
      navHeader
    }
  };
</script>
<style lang="scss">
  @import '~@/assets/css/variables';
  .learn-record {
  	width: 100%;
  	height: 100%;
  	position: relative;
  	padding-top: $nav-line-height;
  	box-sizing: border-box;

  	.clearfix:after {
  		content: '';

  		display: table;

  		clear: both;

  		overflow: hidden;
  	}
  	.learn-record-header {
  		position: fixed;
  		top: 0;
  		left: 0;
  		width: 100%;
  		z-index: 100;
  	}
  	.forget-tip {
  		position: absolute;
  		top: $nav-line-height;
  		left: 0;
  		width: 100%;
  		height: 200px;
  		line-height: 200px;
  		text-align: center;
  		font-size: $max-font-size;
  		color: $desc-text-color;
  		padding: 10px;
  		overflow: hidden;
  		box-sizing: border-box;
  	}
  	//学习记录
  	.record-box {
  		position: absolute;
  		top: $nav-line-height;
  		left: 0;
  		right: 0;
  		bottom: 0;
  		padding: 10px;
  		overflow: hidden;
  		box-sizing: border-box;
  		.record-scroll {
  			height: 100%;
  			width: 100%;
  			border-radius: 20px;
  			padding: 0 50px;
  			overflow: hidden;
  			background-color: rgb(255, 247, 235);
  			box-sizing: border-box;
  			.learn-title {
  				height: 120px;
  				line-height: 120px;
  				border-bottom: 2px solid $gray-border;
  				p {
  					font-size: $normal-font-size;
  					font-weight: 500;
  				}
  			}
  			//进度条的样式
  			.learn-pregress-box {
  				position: relative;
  				height: 230px;
  				& > div {
  					height: 230px;
  					line-height: 230px;
  					// float: left;
  				}
  				// 进度条
  				.learn-pregress {
  					position: absolute;
  					left: 0;
  					right: 150px;
  					// width: 490px;
  					//提示的信息
  					.pregress-tip {
  						position: absolute;
  						top: 30px;
  						width: 80px;
  						height: 51px;
  						line-height: 45px;
  						text-align: center;
  						color: #fff;
  						font-size: $mini-font-size;
  						font-family: 'Mircosoft YaHei';
  						background-image: url('~@/assets/images/process-dialog.png');
  						background-size: 80px 51px;
  						transform: translateX(-65%);
  					}
  					.pregress-outBar,
  					.pregress-innerBar {
  						height: 20px;
  						border-radius: 20px;
  					}
  					//进度条大框
  					.pregress-outBar {
  						width: 100%;
  						// margin-top: 105px;
  						// margin-left: 20px;
  						position: absolute;
  						// left: 20px;
  						top: 105px;
  						background-color: $gray-border;
  						.pregress-innerBar {
  							//内框
  							position: relative;
  							background-color: $main-color;
  							.pregress-circle {
  								position: absolute;
  								top: 3.5px;
  								right: 5px;
  								width: 14px;
  								height: 14px;
  								border-radius: 14px;
  								background-color: #fff;
  							}
  						}
  					}
  				}
  				.word-nums {
  					position: absolute;
  					right: 20px;
  					font-size: $mini-font-size;
  					color: $body-text-color;
  				}
  			}
  			//单元的学习记录样式
  			.unit-record {
  				.weui-cells {
  					background-color: rgb(255, 247, 235);
  				}
  				.weui-cells::before,
  				.weui-cells::after,
  				.weui-cell:before,
  				.weui-cell:after {
  					height: 0;
  					border: none;
  				}
  				.weui-cells__title {
  					height: 70px;
  					font-size: $normal-font-size;
  					color: #000;
  				}
  				//单元得分
  				.vux-cell-box {
  					height: $text-line-height;
  					border-top: 2px solid $gray-border;
            justify-content: space-between;
  					.unit {
  						// width: 160px;
  						padding: 1px;
  						box-sizing: border-box;
  						font-size: $normal-font-size;
  						font-weight: 400;
  					}
  					.evaluate-score {
  						width: 450px;
  						float: right;
  						& > div {
  							float: left;
  							height: $text-line-height;
  							line-height: $text-line-height;
  						}
  						.evaluate {
  							width: 150px;
  							font-size: $mini-font-size;
  							color: $desc-text-color;
  						}
  						.score {
  							width: 274px;
  							float: right;
  							color: #fff;
  							background-size: 274px 74px;
  							background-repeat: no-repeat;
  							background-position: center 20%;
  							span {
  								display: block;
  								width: 75px;
  								height: $text-line-height;
  								line-height: 120px;
  								text-align: center;
  								font-size: $small-font-size;
  							}
  						}
  						.lower-score {
  							background-image: url('~@/assets/images/score-lower.png');
  							.lower-score-text {
  								margin-left: 5px;
  							}
  						}
  						.none-score {
  							background-image: url('~@/assets/images/score-none.png');
  							background-size: 274px 43px;
  							background-position: center 40%;
  						}
  						.middle-score {
  							background-image: url('~@/assets/images/score-middle.png');
  							.lower-score-text {
  								margin-left: 98px;
  							}
  						}
  						.height-score {
  							background-image: url('~@/assets/images/score-height.png');
  							.lower-score-text {
  								margin-left: 190px;
  							}
  						}
  					}
  				}
  			}
  		}
  	}
  }
</style>
