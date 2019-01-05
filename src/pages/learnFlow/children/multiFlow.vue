<template>
  <div class='multi-flow' ref='flow'>
    <vue-better-scroll class="flows-container" ref="flowScroll">
      <div class='flows' v-for="(flow,idx) in flows" :key='idx'>
        <div class='flow-header'>
          <span class='title'>{{'STEP ' + (idx+1)}}</span>
        </div>
        <div class='flow-space'>
        </div>
        <div class='flow-body'>
          <!-- <stepNavSvg :loader='loader' :stepInfos='status[idx]' :stepBegin='idx<=stepBeginIdx' :stepPart='idx' :stepType='stepType'></stepNavSvg> -->
          <stepNav :stepInfos='status[idx]' :stepBegin='idx<=stepBeginIdx' :stepPart='idx' :stepType='stepType'></stepNav>
        </div>
      </div>
    </vue-better-scroll>
  </div>
</template>
<script>
import stepNav from "./stepNav";
// import stepNav from "./stepNavCanvas";
import { TASK_SCORE_TYPE } from "@/utility/dict";
export default {
  data() {
    return {
      flows: [],
      status: [],
      stepBeginIdx: 0
    };
  },
  computed: {
    steps: function() {
      return this.$store.getters.flowTask;
    },
    stepType: function() {
      let type = this.$store.getters.flowType;
      if (type === TASK_SCORE_TYPE.unit) {
        return "learn";
      } else {
        return "review";
      }
    }
  },
  watch: {
    steps: function(steps) {
      this.initSteps(steps);
    }
  },
  components: {
    stepNav
  },
  mounted: function() {
    this.$nextTick(() => {
      this.initSteps(this.steps);
    });
  },
  methods: {
    initSteps: function(steps) {
      this.$refs.flowScroll.scrollTo(0, 0);
      if (steps) {
        let len = steps.length;
        if (len == 19) {
          this.flows = [1, 2];
          this.status = [[], []];
          steps.forEach((item, idx) => {
            if (idx < 9) {
              this.status[0].push(item);
            } else {
              this.status[1].push(item);
            }
          });
        } else if (len == 28) {
          this.flows = [1, 2, 3];
          this.status = [[], [], []];
          steps.forEach((item, idx) => {
            if (idx < 9) {
              this.status[0].push(item);
            } else if (idx < 18) {
              this.status[1].push(item);
            } else {
              this.status[2].push(item);
            }
          });
        }
        for (let i = 0; i < this.status.length; i++) {
          let stepStatus = this.status[i];
          let stepPlayed = false;
          console.log("----step status", stepStatus);
          let stepItem = stepStatus[stepStatus.length - 1];
          if (stepItem.playDays > 0 || stepItem.played === "Y") {
            this.stepBeginIdx = i + 1;
          }
        }
        this.$store.commit("setCurrStepPart", this.stepBeginIdx);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables";
.multi-flow {
  height: 100%;
  overflow: hidden;
  .flows-container {
    height: 100%;
  }
  .test {
    height: 1200px;
    width: 100%;
    margin: 30px 0;
    background: lightgrey;
  }
  .flows {
    // position: relative;
    // margin-top:100px;
    // padding-top: 100px;
    position: relative;
    .flow-header {
      position: absolute;
      top: 65px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      height: 60px;
      line-height: 60px;
      font-size: 40px;
      border: 6px solid #fff;
      border-radius: 35px;
      text-align: center;
      background: $embellish-color;
      color: #fff;
    }
    .flow-space {
      height: 100px;
    }
    .flow-body {
      background: $bg-color-warm;
      border-radius: 100px;
      padding-top: 30px;
    }
  }
}
</style>
