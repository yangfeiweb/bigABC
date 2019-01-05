<template>
  <div class="opt-dialog cnfont">
    <div class='mask' v-show="isShow" @click="maskClick"></div>
    <transition name="opt-fade" v-on:after-enter="afterEnter" v-on:leave="leaving">
      <div class='dialog' :class='{centerCls:centerDialog}' v-show='showDialog'>
        <div class="dialog-title">
          <span>{{title}}</span>
          <i @click="closeDialog" class="iconfont icon-close"></i>
        </div>
        <div class="dialog-body">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "optDialog",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "温馨提示"
    },
    closeOnClickModal: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isShow: false,
      showDialog: false,
      centerDialog: false
    };
  },
  watch: {
    show: function(state) {
      this.isShow = state;
      this.showDialog = this.isShow;
      this.$store.commit('setDialogShowing', state);
    },
    '$store.getters.dialogShowing': function(val){
      if(val === false && this.showDialog == true){
        this.hideDialog()
      }
    }
  },
  mounted() {
    this.isShow = this.show;
    this.showDialog = this.isShow;
    this.$store.commit('setDialogShowing', this.isShow);
  },
  methods: {
    maskClick: function() {
      console.log("--------- musk click");
      if (this.closeOnClickModal) {
        this.hideDialog();
      }
    },
    closeDialog: function() {
      this.hideDialog();
    },
    hideDialog: function() {
      this.showDialog = false;
      this.$emit('hide')
      setTimeout(() => {
        this.$emit("update:show", false);
      }, 400);
    },
    afterEnter: function() {
      this.centerDialog = true;
    },
    leaving: function() {
      this.centerDialog = false;
    }
  }
};
</script>

<style lang="scss">
@import "~@/assets/css/variables";
.opt-dialog {
  margin: 0;
  padding: 0;
  .mask {
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
  }
  .dialog {
    position: fixed;
    z-index: 5000;
    width: 560px;
    height: auto;
    max-width: 800px;
    border-radius: 45px;
    overflow: hidden;
    background-color: #ffffff;
    text-align: center;
    left: 50%;
    top: 50%;
    .dialog-title {
      position: relative;
      width: 100%;
      height: 100px;
      line-height: 100px;
      color: #fff;
      background-color: $main-color;
      span {
        display: inline-block;
        width: 400px;
        height: 100%;
        overflow: hidden;
        font-size: $normal-font-size;
        text-align: center;
      }
      i {
        position: absolute;
        right: 30px;
        top: 30px;
      }
    }
  }
  .dialog.centerCls {
    transform: translate(-50%, -50%);
  }
  .opt-fade-enter-active {
    transition-duration: 0.5s;
    transform: translate(-50%, -50%);
    transition-property: transform;
  }
  .opt-fade-leave-active {
    transition-duration: 0.5s;
    opacity: 0.1;
    transform: translate(-50%, -50%);
    transition-property: opacity transform;
    // transform: translate(-50%, -2000px);
    // transition-property: transform;
  }
  .opt-fade-enter {
    transform: translate(-50%, -2000px);
  }
  .opt-fade-enter-to {
    transform: translate(-50%, -50%);
  }
}
</style>