<template>
  <div class='suggession cnfont'>
    <nav-header title='意见建议'></nav-header>
    <div class='container'>
      <x-textarea v-model="suggestion" :max="500" :placeholder="placeholder" :rows='rows' class="suggestion-input"></x-textarea>
      <div class="btn" @click='submitSuggestion'>提交反馈</div>
    </div>
  </div>
</template>
<script>
import navHeader from "@/components/navHeader";
import { XTextarea } from "vux";
import dataService from "@/service/index";
export default {
  data() {
    return {
      rows: 10,
      placeholder: "期待您的意见和反馈",
      suggestion: ""
    };
  },
  mounted() {},
  methods: {
    submitSuggestion: function() {
      if (!this.suggestion) {
        this.$store.dispatch("showTipsMsg", "请输入建议");
        return;
      }
      this.$store.commit("loading");
      let osType = "ANDROID";
      if (window.plus.os.name.toLowerCase() === "ios") {
        osType = "IOS";
      }
      dataService.submitSuggestion(this.suggestion, osType).then(
        res => {
          let result = res.data;
          if (result.code === 200) {
            this.$store.dispatch("showTipsMsg", "感谢反馈，我们会继续努力！");
            setTimeout(() => {
              this.$router.go(-1);
            }, 1000);
          }
        },
        err => {
          this.$store.dispatch("showTipsMsg", "提交失败，请重试！");
        }
      );
    }
  },
  components: {
    navHeader,
    XTextarea
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";
.suggession {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  .container {
    flex: 1;
    height: 100%;
    padding: 30px;
    text-align: center;
    .suggestion-input {
      font-size: $normal-font-size;
      textarea {
        font-family: "cnfont";
        padding: 10px;
        &::-webkit-input-placeholder {
          /* WebKit, Blink, Edge */
          color: $desc-text-color;
          font-size: $normal-font-size;
          text-align: center;
          font-family: "cnfont";
        }
      }
    }
    .btn {
      width: 600px;
      height: 100px;
      line-height: 100px;
      text-align: center;
      border-radius: 50px;
      background: $main-color;
      color: #fff;
      font-size: $large-font-size;
      display: inline-block;
      &:active {
        background: $main-dark-color;
      }
    }
  }
}
</style>