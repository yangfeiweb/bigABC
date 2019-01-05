<template>
  <opt-dialog :show.sync='isShow' title='选择要学习的课程'>
    <div class='unit-selector cnfont'>
      <div class='grade'>{{currGrade}}</div>
      <div class='units'>
        <checker v-model="selectedUnit" default-item-class="unit-item" selected-item-class="unit-item-selected">
          <checker-item v-for='(unit, idx) in units' :key="unit.id" :value="unit.id" @on-item-click='unitSelect(unit.id, idx)'>{{unit.name}}</checker-item>
        </checker>
      </div>
    </div>
    <div class='btn'></div>
  </opt-dialog>
</template>
<script>
import optDialog from "./widgets/optDialog";
import { Checker, CheckerItem } from "vux";
import dataService from "@/service/index";
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShow: false,
      selectedUnit: ""
    };
  },
  computed: {
    currGrade: function() {
      let gradeInfo = this.$store.getters.currGradeInfo;
      return (gradeInfo && gradeInfo.label) || "";
    },
    units: function() {
      return this.$store.getters.currUnitList;
    }
  },
  mounted() {
    this.isShow = this.show || false;
    this.selectedUnit = this.$store.getters.getCurrUnitId || "";
  },
  watch: {
    show: function(val) {
      this.isShow = val;
      if (val) {
        this.selectedUnit = this.$store.getters.getCurrUnitId || "";
      }
      this.$store.dispatch('playTapAudio')
    },
    isShow: function(val) {
      this.$emit("update:show", val);
    }
  },
  methods: {
    unitSelect: function(val, idx) {
      dataService.changeUnit(val).then(res => {
        let resultData = res.data;
        if (resultData.code == 200) {
          this.$store.commit("setFirstUnit", idx === 0);
          this.$store.commit("setCurrUnitId", val);
          this.isShow = false;
        }
      });
    }
  },
  components: {
    optDialog,
    Checker,
    CheckerItem
  }
};
</script>
<style lang="scss" scoped>
@import "~@/assets/css/variables.scss";
.unit-selector {
  line-height: $text-line-height;
  .grade {
    font-size: $large-font-size;
    color: $emphases-text-color;
  }
  .unit-item {
    height: 60px;
    line-height: 60px;
    width: 140px;
    background: $assist-color;
    color: #fff;
    border-radius: 20px;
    margin: 0 20px;
    font-size: $small-font-size;
  }
  .unit-item-selected {
    background: $assist-dark-color;
  }
}
</style>
