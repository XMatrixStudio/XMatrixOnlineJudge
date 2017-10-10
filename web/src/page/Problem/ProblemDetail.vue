<template>
  <el-row :gutter="10">
    <el-col :xs="{span: 22, offset: 1}" :span="18" :offset="3">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="问题描述" name="detail" class="problem_detail">
          <problemData></problemData>
        </el-tab-pane>
        <el-tab-pane label="成绩报告" name="second"></el-tab-pane>
        <el-tab-pane label="提交记录" name="third"></el-tab-pane>
        <el-tab-pane label="问题排名" name="fourth"></el-tab-pane>
      </el-tabs>
      <codeBox></codeBox>
    </el-col>
  </el-row>
</template>

<script>
import problemData from '../../components/Problem/ProblemData';
import codeBox from '../../components/Problem/codeBox';
export default {
  components: {
    problemData,
    codeBox
  },
  data() {
    return {
      activeName: 'detail',
    }
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
    async init() {
      this.$emit('changeNav', '2');
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss">
.el-card__body .el-tag {
  margin-top: 12px;
  margin-right: 10px;
}
</style>
