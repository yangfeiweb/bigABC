<template>
  <div class="message cnfont">
    <div class="header">
      <nav-header title="信息" :showBack='false'></nav-header> 
    </div>
    
    <ul class="change-tap">
        <li  @click="msgHandle" class="msg">
          <a  v-bind:class="{ active: isMsg }">消息</a>
        </li>
        <li  @click="noticeHandle" class="notice">
          <a v-bind:class="{ active: !isMsg }">公告</a>
        </li>
    </ul>
    <main class="message-body">
      <msgBody v-show="isMsg" :refresh='isMsg'></msgBody>
      <noticeBody v-show="!isMsg" :refresh='!isMsg'></noticeBody>
    </main>
  </div>
</template>

<script>
import navHeader from "@/components/navHeader";
import msgBody from "./msg.vue";
import noticeBody from "./notice.vue";

export default {
  data:function(){
    return{
      isMsg:true
    }
  },
  methods: {
    msgHandle:function(){
      this.isMsg=true;
    },
    noticeHandle:function(){
      this.isMsg=false;
    }
  },
  components: {
    navHeader,
    msgBody,
    noticeBody
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";
.message {
  width: 100%;
  height:100%;
  background:$bg-color;
  .clear {
    content: "";
    display: block;
    clear: both;
  }
  .header{
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index:10;
  }
  .change-tap {
    width: 100%;
    position: fixed;
    top:110px;
    z-index: 10;
    left:0;
    font-size: $normal-font-size;
    list-style: none;
    display: flex;
    justify-content: space-between;
    color: #747474;
    background:$nav-color;
    > li {
      width: 50%;
      text-align: center;
      line-height: 82px;
      >a{
        display: inline-block;
        line-height: 82px;
      }
    }
  }
  .message-body{
    position: fixed;
    top: 192px;
    left: 0;
    right: 0;
    bottom: 100px;
    padding:10px;
  }
}
.active{
  border-bottom: 3px solid $main-color; 
}
</style>
