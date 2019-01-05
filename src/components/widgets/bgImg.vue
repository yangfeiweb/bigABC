<template>
    <img class="loading-img" :class='[cls]' :src='src' @load='onLoad' onerror='this.src="static/images/img-error.png"'/>
</template>

<script>
export default {
  name: "bgImg",
  props: {
    src: {
      type: String
    },
    cls: {
      type: String
    }
  },
  mounted() {},
  methods: {
    onLoad: function() {
      console.log("-----load img success");
      this.$el.classList.remove("loading-img");
    }
  },
  watch: {}
};
</script>

<style lang="scss">
@import "~@/assets/css/variables";
.loading-img {
  background: url("~@/assets/images/img-loading.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size:300px 300px;
  width: 100%;
  height: 100%;
}
</style>