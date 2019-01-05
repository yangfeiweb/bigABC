<template>
  <vue-better-scroll class="single-flow" refs='singleFlow'>
    <stepNav :stepInfos='steps' :stepType='stepType'></stepNav>
  </vue-better-scroll>
</template>
<script>
import stepNav from "./stepNav";
// import stepNav from "./stepNavCanvas";
import { TASK_SCORE_TYPE } from "@/utility/dict";
export default {
  data() {
    return {};
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
  components: {
    stepNav
  },
  beforeDestroy() {
    // this.$refs.singleFlow.destroy()
  }
};
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables";
.single-flow {
  height: 100%;
  width: 100%;
  background: $bg-color-warm;
  border-radius: 100px;
  // overflow: auto;
  position: relative;
  overflow: hidden;
}
</style>
