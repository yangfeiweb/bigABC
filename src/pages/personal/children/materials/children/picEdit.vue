<template>
  <div class='head-box cnfont'>
    <nav-header title='修改头像'></nav-header>
    <div class='main'>
      <div class='main-box'>
        <div class='img-container'>
          <img :src="userIcon" alt="">
        </div>
        <div class='size'>当前头像</div>
        <div class='photo' @click='getCameraImg'>拍照</div>
        <div class='local-photo' @click='getGalleryImg'>本地照片</div>
      </div>
    </div>
    <crop-picture :url="imgUrl" :show.sync="showCrop"></crop-picture>
  </div>
</template>

<script>
import navHeader from "@/components/navHeader";
import cropPicture from "@/components/cropPicture";
import dataService from "@/service/index";
import reqUrl from "@/service/urlConfig";
import utility from '@/utility/utility'
export default {
  components: {
    navHeader,
    cropPicture
  },
  computed: {
    token: function() {
      return this.$store.getters.token;
    },
    userIcon: function() {
      let userInfo = this.$store.getters.userInfo;
      return (userInfo && userInfo.icon) || "";
    }
  },
  data() {
    return {
      showCrop:false,
      imgUrl:"",
      // imgUrl:"static/test.png",
    };
  },
  methods: {
    getCameraImg: function() {
      plus.camera.getCamera().captureImage(path => {
        plus.nativeUI.showWaiting();
        this.compressImage(path);
      });
    },
    getGalleryImg: function() {
      let plus = window.plus;
      let _self = this
      if (plus) {
        plus.gallery.pick(
          path => {
            plus.nativeUI.showWaiting();
            this.compressImage(path);
          },
          function(e) {
            _self.$store.dispatch("showTipsMsg", "取消选择图片");
          },
          { filter: "image" }
        );
      }
    },
    postImg: function(filePath) {
      console.log("------post img..." + filePath);
      console.log("------post img...url.." + reqUrl.POST_USER_IMG);
      this.$store.dispatch("showTipsMsg", "开始调用上传图片接口");
      let me = this;
      var task = plus.uploader.createUpload(
        reqUrl.POST_USER_IMG,
        {
          method: "POST"
        },
        function(t, status) {
          if (status == 200) {
            console.log("上传成功");
            console.log("reponse" + t.responseText);
            me.$store.dispatch("showTipsMsg", "上传成功！");
            let response = JSON.parse(t.responseText);
            let data = response.data;
            if (data) {
              let icon = data.icon;
              console.log(icon);
              if (icon) {
                // me.imgUrl = icon
                me.$store.commit("updateUserIcon", icon);
                console.log("----update... icon end");
              }
            }
          } else {
            me.$store.dispatch("showTipsMsg", "上传失败");
            console.log("status: " + status);
          }
          plus.nativeUI.closeWaiting();
        }
      );
      task.addData("token", this.token);
      task.addFile(filePath, { key: "file" });
      task.start();
    },
    // 压缩图片
    compressImage: function(filePath) {
      let ts = utility.dateToTimeStr(new Date())
      plus.zip.compressImage(
        {
          src: filePath,
          dst: `_downloads/head${ts}.jpg`,
          quality: 100,
          overwrite: true,
          width: "800px"
        },
        i => {
          plus.nativeUI.closeWaiting();
          console.log(JSON.stringify(i));
          this.imgUrl = i.target; 
          this.showCrop = true;
        },
        e => {
          this.$store.dispatch("showTipsMsg", "压缩失败");
          this.$store.dispatch("showTipsMsg", e.code + ' --- '+ e.message);
          plus.nativeUI.closeWaiting();
        }
      );
    }
  },
  watch: {}
};
</script>

<style lang='scss' scoped>
@import "~@/assets/css/variables.scss";
.head-box {
  width: 100%;
  height: 100%;
  position: fixed;
  flex-direction: column;
  .main {
    height: 100%;
    flex: 1;
    padding: 50px;
    background: #f0f0f0;
    .main-box {
      height: 800px;
      margin-top: -10px;
      border-radius: 50px;
      background: #fff;
      text-align: center;
      padding-top: 140px;
    }
    .img-container {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      display: inline-block;
      overflow: hidden;
      position: relative;
      img {
        width: 130%;
        left: 50%;
        top: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
      }
    }
    .size {
      font-size: 30px;
    }

    .photo,.local-photo {
      background-color: $main-color;
      width: 615px;
      height: 100px;
      line-height: 100px;
      color: #fff;
      font-size: $large-font-size;
      border-radius: 50px;
      &:active{
        background-color:$main-dark-color;
      }
    }
    .photo {
      // background-color: $main-color;
      // width: 615px;
      // height: 100px;
      // line-height: 100px;
      // color: #fff;
      // font-size: $large-font-size;
      margin: 150px auto 0;
      // border-radius: 50px;
    }
    .local-photo {
      // background-color: $main-color;
      // width: 615px;
      // height: 100px;
      // line-height: 100px;
      // color: #fff;
      // font-size: $large-font-size;
      margin: 50px auto 0;
      // border-radius: 50px;
    }
  }
}
</style>
