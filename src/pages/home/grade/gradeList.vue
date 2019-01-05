<template>
  <div class="grade-list cnfont">
    <!-- 顶部 -->
    <div>
      <nav-header title="选择课程" :showBack="showArrow"></nav-header>
    </div>
    <!-- 课程列表 -->
    <div class="list-box">
      <vue-better-scroll class="list" ref="gradeList">
        <group>
          <cell v-for="val in gradeList" :key="val.id" class="list-cell" is-link primary="content" @click.native="selectGrade(val.id)">
            <span slot="title">
              <span :class="{active: val.id === currId}">{{val.label}}</span>
            </span>
          </cell>
        </group>
      </vue-better-scroll>
    </div>
  </div>
</template>
<script>
  import { Group, Cell } from "vux";
  import navHeader from "@/components/navHeader";

  export default {
    name: "gradeList",
    data() {
      return {
        showArrow: true,
        // pressCode:''
      };
    },

    computed: {
      gradeList: function () {  //课程数据集合
        return this.$store.getters.assistGradeList
      },
      currId: function () {// 当前选中的课程id
        return this.$store.getters.getCurrGradeId
      },
      pressCode: function () {
        let grade = this.gradeList[0];
        let code = ''
        if (grade) {
          code = grade.pressCode
        }
        return code
      }
    },
    mounted() {
      // if(this.$store.getters.getGradeList.length ===0){
      //     this.$store.commit("loading",true)
      //     this.$store.dispatch("getGradeList").then(success=>{
      //         this.$store.commit("loading",false)
      //     },err=>{
      //         this.$store.commit("loading",false)
      //     });
      // }
      // console.log("-------------gradelist",this);
    },
    methods: {
      selectGrade(id) {
        if (id) {
          this.$router.push({ path: '/unitList', query: { id: id, pressCode: this.pressCode } });
        }
      }
    },
    components: {
      Group,
      Cell,
      navHeader
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
  .active {
  	// 当前选择的课程特殊标记颜色
  	color: $main-color;
  }
  .grade-list {
  	width: 100%;
  	height: 100%;
  	position: relative;
  	box-sizing: border-box;
  	.list-box {
  		position: absolute;
  		top: $nav-line-height;
  		left: 0;
  		right: 0;
  		bottom: 0;
  		padding: 10px;
  		overflow: hidden;
  		box-sizing: border-box;
  		.list {
  			height: 100%;
  			width: 100%;
  			border-radius: 20px;
  			overflow: hidden;
  			background-color: #fff;
  			.weui-cell,
  			.vux-tap-active,
  			.weui-cell_access {
  				height: $text-line-height;
  			}

  			.weui-cell {
  				&::before {
  					left: 0;
  				}
  				& > div,
  				& > p {
  					line-height: $text-line-height;
  					height: $text-line-height;
  				}
  				padding: 0 50px;
  				.vux-label {
  					& > span {
  						font-size: $normal-font-size;
  						font-weight: normal;
  					}
  				}
  			}
  			.weui-cells {
  				border-radius: 45px;
  				margin-top: 0;
  				padding-top: 0;
  				&::before,
  				&::after {
  					height: 0;
  					display: none;
  				}
  			}
  			.vux-tap-active:active {
  				background-color: #fff;
  			}
  			.weui-cell__ft::after {
  				height: 20px;
  				width: 20px;
  				border-width: 3px 3px 0 0;
  				border-color: $body-text-color;
  				border-style: solid;
  			}
  		}
  	}
  }
</style>
