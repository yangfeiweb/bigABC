<template>
  <div class='learn-header'>
     <img class='returnImg' src='static/images/btn-return.png' @click='goBack'></img>
     <div class='diamondContainer'>
        <img class='diamondImg' src='static/images/info-diamond.png'></img>
        <div class='diamondVal'>{{diamonds}}</div>
     </div>
     <div class='coinContainer'>
        <img class='coinImg' src='static/images/info-coin.png'></img>
        <div class='coindVal'>{{coins}}</div>
     </div>
  </div>
</template>
<script>
export default {
  props:{
    callback:{
      type:Function
    }
  },
  computed:{
    coins: function(){
      return this.$store.getters.coins || 0
    },
    diamonds: function(){
      return this.$store.getters.diamonds || 0
    }
  },
  methods: {
    goBack:function(){
      if(this.callback){
        this.callback()
      }else{
        this.$store.commit("setLearningBack", true);
        this.$router.go(-1)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";
  .learn-header{
    height: $learn-line-height;
    width:100%;
    display: flex;
    justify-content:space-around;
    -webkit-justify-content:space-around;
    align-items:center;
    .returnImg{
      height: 108px;
      width: 100px;
    }
    .diamondContainer{
      height: 108px;
      width: 224px;
      position: relative;
      .diamondImg{
        height: 108px;
        width: 224px;
      }
      .diamondVal{
        position:absolute;
        width: 45%;
        overflow:hidden;
        top: 25%;
        left: 30%;
        text-align:center;
        color:$main-color;
        font-size:$small-font-size;
      }
    }
    .coinContainer{
      height: 108px;
      width: 243px;
      position: relative;
      .coinImg{
        height: 108px;
        width: 243px;
      }
      .coindVal{
        position:absolute;
        width: 45%;
        overflow:hidden;
        top: 25%;
        left: 30%;
        text-align:center;
        color:$main-color;
        font-size:$small-font-size;
      }
    }
  }
</style>
