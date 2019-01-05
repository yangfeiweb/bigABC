<template>
  <div class="nav-header cnfont">
    <div v-show="showBack" class="nav-header-left" @click="handleClickBack">
      <i class="back-arrow"></i>
    </div>
    <div class="nav-header-title">
      <span v-if="title" class="title">{{title}}</span>
      <slot v-else name='title'></slot>
    </div>
    <div class="nav-header-right">
      <slot name='right'></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String
    },
    goBackUrl: [String, Object],
    showBack: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {};
  },
  methods: {
    handleClickBack(e) {
      if (!this.goBackUrl) {
        this.$router.go(-1);
      } else {
        this.$router.push(this.goBackUrl);
      }
    }
  }
};
</script>

<style lang='scss'>
@import "~@/assets/css/variables.scss";
.nav-header {
  position: relative;
  box-sizing: border-box;
  height: $nav-line-height;
  background-color: $main-color;
  line-height: $nav-line-height;
  font-size: $large-font-size;
  .nav-header-left {
    position: absolute;
    height: 100%;
    width: 100px;
    z-index: 2;
    .back-arrow {
      position: absolute;
      width: 100px;
      height: $nav-line-height;
      top: 0px;
      left: 0px;
    }
    .back-arrow::before {
      content: "";
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
  .nav-header-title {
    position: absolute;
    color: #ffffff;
    margin: 0 auto;
    width: 100%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nav-header-right {
    position: absolute;
    right: 0;
    height: 100%;
    z-index: 2;
  }
}
</style>
