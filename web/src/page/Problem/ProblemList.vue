<template>
  <el-row :gutter="10">
    <el-col :xs="{span: 22, offset: 1}" :span="18" :offset="3">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane v-for="(tab, index) in problem" :label="tab.name" :name="'tab' + index" :key="index">
          {{content}}
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      activeName: 'tab0',
      problem: [
        {
          name: '算法',
          content: [{
            name: 'Hello, world!',

          }]
        }, {
          name: '数据结构',
        }, {
          name: '设计模式'
        }
      ]
    };
  },
  computed: {
    content() {
      return this.$store.state.user.logged;
    }
  },
  methods: {
    handleClick(tab, event) {
      return;
    },
    init() {
      this.$emit('changeNav', '2');
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="scss">

</style>
