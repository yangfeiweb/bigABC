<template>
  <div class="container cnfont">
      <div class="msg-header">
        <p class="title">活动列表页</p>
      </div>
      <ul class="activity-list">
        <li class="activity-content">
          <img src="../../../static/images/activity1.png" alt="">
          <div class="activity-text clear"> 
            <p class="activity-title">线下活动标题</p>
            <p class="activity-time">2017-11-08</p>
          </div>
        </li>
        <li class="activity-content" style="background:#47B7FF">
          <img src="../../../static/images/activity2.png" alt="">
          <div class="activity-text clear"> 
            <p class="activity-title">线下活动标题</p>
            <p class="activity-time">2017-11-10</p>
          </div>
        </li>
        <li class="activity-content" style="background:#FED255">
          <img src="../../../static/images/activity3.png" alt="">
          <div class="activity-text clear"> 
            <p class="activity-title">线下活动标题</p>
            <p class="activity-time">2017-11-11</p>
          </div>
        </li>
        <li class="activity-content">
          <img src="../../../static/images/activity1.png" alt="">
          <div class="activity-text clear"> 
            <p class="activity-title">线下活动标题</p>
            <p class="activity-time">2017-11-12</p>
          </div>
        </li>
      </ul>
  </div>
</template>

<script>

export default {
  data:function(){
    return{
      
    }
  },
  methods: {
    
  }
   
};
</script>


<style lang="scss" scoped>
@import '../../assets/css/variables.scss';
.clear:after{
    content:"";
    display:block;
    clear:both;
}
.container {
  width: 100%;
  padding: 0;
  margin: 0;
}
.msg-header {
  width: 100%;
  line-height: $title-line-height;
  text-align: center;
  color: $nav-color;
  background:$main-color;
  .title {
    margin: 0 auto;
    font-size: $large-font-size;
  }
}
.msg-header::before {
  content: "";
  position: absolute;
  width: 25px;
  height: 25px;
  border: 3px solid $nav-color;
  border-width: 3px 0 0 3px;
  transform: rotate(315deg);
  top: 26px;
  left: 50px;
}
.activity-list{
  list-style: none;
  min-height: 400px;
  padding:$padding;
  color: $body-text-color;
  background: $bg-color;
  .activity-content{
    width:100%;
    margin-bottom: $padding;
    background: $assist-color;
    border-radius: 30px;
    >img{
      width:100%;  
    }
    .activity-text{
      background: $nav-color;
      border-bottom-left-radius: 30px;
      border-bottom-right-radius: 30px;
      padding:$padding;
      .activity-title{
        float: left;
        font-size: $large-font-size;
        color:$emphases-text-color;
      }
      .activity-time{
        float: right;
        font-size: $small-font-size;
      }
    }
  }
}
</style>
