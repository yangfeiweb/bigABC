<template>
  <div class='data-box cnfont'>
    <nav-header title='资料详情'>
      <router-link class="edit-icon" slot="right" to='/personInfos/infoEdit'>
        <i class='iconfont icon-bianji'></i>修改</router-link>
    </nav-header>
    <div class='space'>
      <group>
        <cell title="昵称">
          <div>
            <span style="color: green">{{userInfo &&　userInfo.nickName}}</span>
          </div>
        </cell>
        <cell title="姓名">
          <div>
            <span>{{userInfo &&　userInfo.realName}}</span>
          </div>
        </cell>
        <cell title="性别">
          <div>
            <span>{{userInfo && genderMap[userInfo.gender]}}</span>
          </div>
        </cell>
        <cell title="家长">
          <div>
            <span>{{families.join('')|| '未绑定'}}</span>
          </div>
        </cell>
        <cell title="手机号">
          <div>
            <span>{{userPhone}}</span>
          </div>
        </cell>
      </group>
    </div>
  </div>
</template>
<script>
import { Group, Cell } from "vux";
import { GENDER_MAP } from "@/utility/dict";
import navHeader from "@/components/navHeader";

export default {
  data() {
    return {
      genderMap: GENDER_MAP
    };
  },
  methods: {},
  computed: {
    userPhone: function() {
      let isTourist = this.$store.getters.isTourist;
      if (isTourist) {
        return "未绑定";
      } else {
        return this.$store.getters.userInfo.userName;
      }
    },
    userInfo:function(){
      return this.$store.getters.userInfo
    },
    families: function() {
      let families = this.$store.getters.families || [];
      let data = []
      families.forEach(item=>{
        data.push(item.name)
      })
      return data
    }
  },
  components: {
    Group,
    Cell,
    navHeader
  }
};
</script>
<style lang='scss' >
@import "~@/assets/css/variables.scss";

.data-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  .edit-icon{
    color: #fff;
    padding: 0 20px;
    font-size: $normal-font-size;
    height:100%;
    display:inline-block;
  }
  .space {
    flex: 1;
    height: 100%;
    padding: 30px;
    .weui-cells {
      border-radius: 50px;
      .weui-cell {
        height: 110px;
        .vux-label {
          font-size: 36px;
        }
        .weui-cell__ft {
          font-size: 30px;
          margin-right: 20px;
        }
      }
    }
  }
}
</style>
