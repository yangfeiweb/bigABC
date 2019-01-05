<template>
  <div class='main'>
    <div class='top'>
      <!-- <keep-alive> -->
        <router-view></router-view>
      <!-- </keep-alive> -->
    </div>
    <div class='foot'>
      <nav-footer></nav-footer>
    </div>
  </div>
</template>
<script>
import navFooter from "./navFooter";
export default {
  components: {
    navFooter
  },
  mounted() {}
};
</script>
<style lang="scss" scoped>
.main {
  width: 100%;
  height: 100%;
  position: relative;
  .top {
    position: absolute;
    top: 0;
    bottom: 100px;
    left: 0;
    right: 0;
  }
  .foot {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
  }
}
</style>
