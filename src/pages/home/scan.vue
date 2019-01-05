<template>
    <div class='scan-page cnfont'>
        <nav-header title='扫描加入学校'></nav-header>
        <div id='bcid' class='scan-body'>
            <!-- <div  class='scan-container'></div> -->
        </div>
    </div>
</template>
<script>
import navHeader from "@/components/navHeader";
import dataService from "@/service/index";
export default {
  data() {
    return {
      scan: null
    };
  },
  mounted() {
    console.log("Barcode scan");
    let plus = window.plus;
    if (plus) {
      let scan = new plus.barcode.Barcode("bcid");
      let me = this;
      scan.onmarked = function(type, result) {
        me.$store.commit("loading", true);
        dataService.joinSchool(result).then(res => {
          let response = res.data;
          let code = response.code;
          let msg = response.msg;
          me.$store.commit("loading", false);
          setTimeout(() => {
            me.$router.go(-1);
          }, 500);
          if (code = 200) {
            let schoolName = response.data.schoolName;
            if (schoolName) {
              me.$store.commit("setSchoolName", schoolName);
              me.$store.dispatch('showTipsMsg',`已成功加入${schoolName}`);
            }
          }
        });
        // plus.nativeUI.toast(result);
        // scan.close();
      };
      scan.onerror = function(type, result) {
        plus.nativeUI.toast(result);
        setTimeout(() => {
          this.$router.go(-1);
        }, 500);
      };
      scan.start();
      this.scan = scan;
    }
  },
  methods: {
    // joinSchool: function() {
    //   console.log("------re start");
    //   this.scan && this.scan.start();
    // }
  },
  beforeDestroy() {
    this.scan && this.scan.close();
  },
  components: {
    navHeader
  }
};
</script>

<style  lang='scss' >
@import "~@/assets/css/variables.scss";
.scan-page {
  width: 100%;
  height: 100%;
  position: relative;
  //   display: flex;
  //   flex-direction: column;
  //   position: relative;
  .scan-body {
    position: absolute;
    top: $nav-line-height;
    bottom: 0;
    left: 0;
    right: 0;
    //   flex:1;
    // width: 100%;
    // margin-top:50px;
    // height: 800px;
    // text-align: center;
    .scan-container {
      position: absolute;
      bottom: 0;
      top: $nav-line-height;
      width: 100%;
      // width:750px;
      // height:1000px;
      // display: inline-block;
      // border:2px solid $main-color;
    }
  }
  .btn-container {
    margin-top: 50px;
    width: 100%;
    height: 110px;
    line-height: 110px;
    text-align: center;
    .btn {
      background: $main-color;
      border-radius: 50px;
      height: 100px;
      line-height: 100px;
      width: 500px;
      display: inline-block;
      color: #fff;
      font-size: $normal-font-size;
    }
  }
}
</style>
