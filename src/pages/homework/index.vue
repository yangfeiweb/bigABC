<template>
  <div class="home-work cnfont">
    <div class="header">
      <nav-header title="我的任务"></nav-header>
    </div>

    <div class="homework-container">
      <vue-better-scroll class="homework-content" ref="scroll" :pullDownRefresh="pullDownRefreshObj" :pullUpLoad="pullUpLoadObj" :startY="parseInt(startY)" @pullingDown="onPullingDown" @pullingUp="onPullingUp">
        <ul class="homework-list">
          <li v-for="item in homeworkList" :key="item.createTime">
            <div class="title">
              <span>截至时间：{{item.deadTime}}</span>
              <span v-if='item.valid' class='status' :class='statusCls(item.result)'>{{homeworkStatus[item.result]}}</span>
              <span v-else class='status invalid'>已过期</span>
            </div>
            <div class="homework-detail">
              <p v-if="item.homeworkType=='BY_WORD'">复习生词本</p>
              <p v-else-if="item.homeworkType=='BY_UNIT'">复习{{item.unit}}</p>
              <p v-else-if="item.homeworkType=='BY_UNIT_SCORE'">复习{{item.unit}}</p>
              <p v-if='item.result == "ING"' class='percent'>已完成{{item.finishedPercent}} %</p>
            </div>
            <div class="homework-do">
              <p>布置时间：{{item.createTime}}</p>
              <p class="write">
                <span v-if='item.valid' class="do-it" @click='doHomework(item)'>
                  去完成
                </span>
                <span v-else class="invalid">
                  去完成
                </span>
              </p>
            </div>
          </li>
        </ul>
      </vue-better-scroll>
    </div>
  </div>
</template>

<script>
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
import { HOMEWORK_STATUS } from "@/utility/dict";
let count = 1;
export default {
  data: function() {
    return {
      homeworkStatus: HOMEWORK_STATUS,
      // 这个配置用于做下拉刷新功能，默认为 false。当设置为 true 或者是一个 Object 的时候，可以开启下拉刷新，可以配置顶部下拉的距离（threshold） 来决定刷新时机以及回弹停留的距离（stop）
      pullDownRefreshObj: {
        threshold: 90,
        stop: 40
      },
      // 这个配置用于做上拉加载功能，默认为 false。当设置为 true 或者是一个 Object 的时候，可以开启上拉加载，可以配置离底部距离阈值（threshold）来决定开始加载的时机
      pullUpLoadObj: {
        threshold: 0,
        txt: {
          more: "加载更多",
          noMore: "没有更多任务了"
        }
      },
      startY: 0, // 纵轴方向初始化位置
      homeworkList: [],
      page: 0,
      size: 10,
      totalPage: 0
    };
  },
  computed: {
    unitList: function() {
      return this.$store.getters.currUnitList;
    }
  },
  mounted: function() {
    this.getData();
  },
  methods: {
    //请求数据
    getData: function(loadMore) {
      dataService
        .getHomeworkList(this.page, this.size)
        .then(res => {
          console.log(res);
          let result = res.data;
          let data = result.data;
          let content = data.content;
          let code = result.code;
          let msg = result.msg;
          this.totalPages = data.totalPages;

          if (code == 200) {
            if (content) {
              let now = new Date();
              content.forEach(item => {
                let deadTime = item.homework && item.homework.deadTime;
                item.valid = false;
                if (deadTime) {
                  let deadline = new Date(deadTime);
                  if (deadline && deadline - now > 0) {
                    item.valid = true;
                  }
                  item.deadTime = deadTime;
                }
                let itemType = item.homeworkType;
                // 将单元ID 转换为单元名称
                if (itemType === "BY_UNIT" || itemType === "BY_UNIT_SCORE") {
                  let unitId = item.refValue - 0;
                  let unitInfo =
                    this.unitList &&
                    this.unitList.find(item => {
                      return item.id === unitId;
                    });
                  if (unitInfo) {
                    item.unit = unitInfo.name;
                  } else {
                    let gradeList = this.$store.getters.getGradeList;
                    if (gradeList) {
                      let gradeCount = gradeList.length;
                      for (let i = 0; i < gradeCount; i++) {
                        let unitList = gradeList[i].unitList;
                        let unitInfo =
                          unitList &&
                          unitList.find(item => {
                            return item.id === unitId;
                          });
                        if (unitInfo) {
                          item.unit = unitInfo.name;
                          break;
                        }
                      }
                    }
                  }
                }
              });

              if (loadMore) {
                this.homeworkList = this.homeworkList.concat(content);
              } else {
                this.homeworkList = content;
              }
            }
          }
        })
        .then(() => {
          if (this.totalPages == 0 || this.page == this.totalPages - 1) {
            this.$refs.scroll && this.$refs.scroll.forceUpdate(false);
          } else {
            this.$refs.scroll && this.$refs.scroll.forceUpdate(true);
          }
          let pulldown = this.$el.querySelector(".pulldown-wrapper");
          if (pulldown) {
            pulldown.style.top = "-50px";
          }
        });
    },
    onPullingDown() {
      // 下拉刷新
      console.log("下拉刷新");
      this.page = 0;
      this.getData();
    },
    onPullingUp() {
      // 上拉 加载更多数据
      console.log("上拉加载");
      if (this.page < this.totalPages - 1) {
        this.page++;
        this.getData(true);
      }
    },
    statusCls(status) {
      let cls = "";
      switch (status) {
        case "INIT":
          cls = "init";
          break;
        case "ING":
          cls = "ing";
          break;
      }
      return cls;
    },
    doHomework(item) {
      let homewordId = item.id;
      let type = item.homeworkType;
      let flowTitle = "任务：复习";
      if (type === "BY_WORD") {
        flowTitle += "[生词本]";
      } else {
        flowTitle += `[${item.unit}]`;
      }
      console.log("------homewordId", homewordId);
      this.$store.commit("loading", true);
      let homeworkInfo = {
        id: homewordId,
        type: type
      };
      this.$store.dispatch("goHomeworkTask", homeworkInfo).then(
        success => {
          this.$store.commit("loading", false);
          this.$store.commit("setFlowTitle", flowTitle);
          this.$router.push({ name: "learnFlow" });
        },
        err => {
          this.$store.commit("loading", false);
        }
      );
    }
  },
  components: {
    navHeader
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";
.home-work {
  width: 100%;
  height: 100%;
  background-image: url("~@/assets/images/homework-bg.png");
  background-position: center center;
  background-size: 100%;
  background-repeat: no-repeat;
  .clear {
    content: "";
    display: block;
    clear: both;
  }
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }
  .homework-container {
    position: fixed;
    top: 110px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
    overflow: hidden;
    .homework-content {
      height: 100%;
      width: 100%;
      overflow: hidden;
      border-radius: 0.266667rem;
      .homework-list {
        list-style: none;
        padding: $padding/2;
        > li {
          background: $nav-color;
          border-radius: 30px;
          padding: 0 $padding;
          margin-bottom: $padding;
          .title {
            height: $title-line-height;
            line-height: $title-line-height;
            border-bottom: 2px solid $stroke-color;
            font-size: $small-font-size;
            color: $emphases-text-color;
            .status {
              float: right;
              &.init {
                color: $main-color;
              }
              &.ing {
                color: $embellish-color;
              }
              &.invalid {
                color: $assist-color;
              }
            }
            // color:$nav-color;
          }
          .homework-do {
            height: $title-line-height;
            line-height: $title-line-height;
            > p {
              display: inline-block;
            }
            > p:first-child {
              width: 75%;
              font-size: $mini-font-size;
              color: $desc-text-color;
            }
            .write {
              width: 23%;
              text-align: center;
              .do-it {
                padding: 15px 30px;
                font-size: $mini-font-size;
                border-radius: 50px;
                color: $nav-color;
                background: $main-color;
              }
              .invalid {
                padding: 15px 30px;
                font-size: $mini-font-size;
                border-radius: 50px;
                color: $nav-color;
                background: $disable-color;
              }
            }
          }
          .homework-detail {
            height: $title-line-height;
            line-height: $title-line-height;
            color: $body-text-color;
            font-size: $small-font-size;
            // border-bottom: 2px solid $stroke-color;
            > p {
              display: inline-block;
            }
            .percent {
              float: right;
            }
          }
        }
      }
    }
  }
}
</style>
