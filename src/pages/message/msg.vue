<template>
  <div class="msg-container" ref='msgList'>
    <vue-better-scroll class="wrapper" ref="scroll" :pullDownRefresh="pullDownRefreshObj" :pullUpLoad="pullUpLoadObj" :startY="parseInt(startY)" @pullingDown="onPullingDown" @pullingUp="onPullingUp">
      <ul class="msg-content">
        <li v-for="item in msgList" :key="item.createTime" class="msg-list">
          <p>{{item.createTime}}</p>
          <div class="msg-shows  clear">
            <div class="msg-img">
              <img src="static/images/head.png" alt="">
            </div>
            <p>
              <span class="title">{{item.title}}</span>
              <span class="content">{{item.content}}</span>
              <span class="review">
                <span v-if="item.messageSubType=='HOMEWORK_MESSAGE_BY_WORD'" @click="goReview(item)">
                  复习 生词本
                </span>
                <span v-else-if="item.messageSubType=='HOMEWORK_MESSAGE_BY_UNIT' || 
                  item.messageSubType=='HOMEWORK_MESSAGE_BY_UNIT_SCORE'" @click="goReview(item)">
                  复习 {{item.unit}}
                </span>
              </span>
            </p>
          </div>
        </li>
      </ul>
    </vue-better-scroll>

  </div>
</template>
<script>
import dataService from "@/service/index";
import { TASK_SCORE_TYPE } from "@/utility/dict";

export default {
  name: "msgBody",
  props: ["refresh"],
  data() {
    return {
      scroll: null,
      // 这个配置用于做下拉刷新功能，默认为 false。当设置为 true 或者是一个 Object 的时候，可以开启下拉刷新，可以配置顶部下拉的距离（threshold） 来决定刷新时机以及回弹停留的距离（stop）
      pullDownRefreshObj: {
        threshold: 20,
        stop: 40
      },
      // 这个配置用于做上拉加载功能，默认为 false。当设置为 true 或者是一个 Object 的时候，可以开启上拉加载，可以配置离底部距离阈值（threshold）来决定开始加载的时机
      pullUpLoadObj: {
        threshold: 0,
        txt: {
          more: "加载更多",
          noMore: "没有更消息了"
        }
      },
      startY: 0, // 纵轴方向初始化位置
      msgList: [],
      page: 0,
      size: 10,
      totalPages: 0,
      messageType: "MESSAGE"
    };
  },
  watch: {
    refresh: function(val) {
      if (val) {
        this.$refs.scroll && this.$refs.scroll.refresh();
      }
    }
  },
  computed: {
    unitList: function() {
      return this.$store.getters.currUnitList;
    }
  },
  mounted: function() {
    this.getData();
    // this.$refs.scroll && this.$refs.scroll.refresh();
  },
  methods: {
    //请求数据
    getData: function(loadMore) {
      dataService
        .getMessage(this.page, this.szie, this.messageType)
        .then(res => {
          // console.log(res);
          let result = res.data;
          let code = result.code;
          let msg = result.msg;

          if (code == 200) {
            let data = result.data;
            let content = data.content;
            this.totalPages = data.totalPages;
            if (content) {
              content.forEach(item => {
                let itemType = item.messageSubType;
                // 将单元ID 转换为单元名称
                let refValues = item.refValue.split("-");
                let homeworkId = refValues[0] - 0;
                item.homeworkId = homeworkId;
                if (
                  itemType === "HOMEWORK_MESSAGE_BY_UNIT" ||
                  itemType === "HOMEWORK_MESSAGE_BY_UNIT_SCORE"
                ) {
                  let unitId = refValues[1] - 0;
                  item.unitId = unitId;
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
                this.msgList = this.msgList.concat(content);
              } else {
                this.msgList = content;
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
          let ids = [];
          this.msgList.forEach(item => {
            if (item.remarks === "UNREAD") {
              ids.push(item.id);
            }
          });
          ids.length && dataService.markReadedMsg(ids.join(","));
        });
    },
    onPullingDown() {
      // 下拉刷新
      this.page = 0;
      this.getData();
    },
    onPullingUp() {
      if (this.page < this.totalPages - 1) {
        this.page++;
        this.getData(true);
      }
    },
    goReview: function(item) {
      console.log("----goReview..");
      // dataService.getHomeworkTaskInfo()
      let homeworkType = TASK_SCORE_TYPE.homeworkUnit;
      let flowTitle = "任务：复习";
      if (item.messageSubType === "HOMEWORK_MESSAGE_BY_WORD") {
        homeworkType = TASK_SCORE_TYPE.homeworkWord;
        flowTitle += "[生词本]";
      } else {
        flowTitle += `[${item.unit}]`;
      }
      this.$store
        .dispatch("goHomeworkTask", {
          type: homeworkType,
          id: item.homeworkId
        })
        .then(
          res => {
            // 跳转到学习页
            this.$store.commit("loading", false);
            this.$store.commit("setFlowTitle", flowTitle);
            this.$router.push({ name: "learnFlow" });
          },
          err => {
            // 移除该消息
            let msgId = item.id;
            dataService.deleteMsg(msgId).then(res => {
              let result = res.data;
              if (result.code == 200) {
                let idx = this.msgList.findIndex(msg => {
                  return msg.id === msgId;
                });
                this.msgList.splice(idx, 1);
              }
            });
          }
        );
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/css/variables.scss";
.clear:after {
  content: "";
  display: block;
  clear: both;
}
.msg-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #ffffff;
  border-radius: 0.266667rem;
  .wrapper {
    height: 100%;
    .msg-content {
      list-style: none;
      margin: 0 auto;
      padding: 0 $padding;
      .msg-list {
        padding: 15px $padding;
        > p {
          text-align: center;
          font-size: $small-font-size;
          color: $desc-text-color;
        }
        .msg-shows {
          margin-top: 20px;
          display: flex;
          .msg-img {
            width: 100px;
            margin-right: 10px;
            text-align: center;
            display: inline-block;
            > img {
              width: 80px;
              padding: 10px;
              border-radius: 50%;
              background: $nav-color;
            }
          }
          > p {
            // float: right;
            // width: 65%;
            flex: 1;
            padding: 20px;
            color: $emphases-text-color;
            background: $nav-color;
            border-radius: 30px;
            position: relative;
          }
          > p::before {
            content: "";
            position: absolute;
            width: 30px;
            height: 30px;
            background: $nav-color;
            border-width: 3px 0 0 3px;
            transform: rotate(315deg);
            top: 30px;
            left: -13px;
          }
          .title {
            // background: $bg-color-warm;
            display: block;
            text-align: center;
            color: $main-color;
            font-size: $normal-font-size;
            // border-radius: 20px;
          }
          .content {
            font-size: $small-font-size;
          }
          .review {
            font-size: $small-font-size;
            text-align: center;
            padding-top: $padding;
            color: $assist-light-color;
            display: block;
            span {
              padding: 10px 20px;
            }
          }
        }
      }
    }
  }
}
</style>
