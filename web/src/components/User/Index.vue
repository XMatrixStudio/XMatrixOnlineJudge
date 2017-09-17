<template>
  <el-row :gutter="10">
    <el-col :xs="{span: 22, offset: 1}" :sm="{span: 7, offset: 1}" :md="{span: 6, offset: 1}" :lg="{span: 4, offset: 3}">
      <sideBar></sideBar>
    </el-col>
    <el-col :xs="{span: 22, offset: 1}" :sm="16" :md="17" :lg="13">

    </el-col>
  </el-row>
</template>

<script>
import sideBar from './Side/Index';
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    };
  },
  components:{sideBar}
};
</script>

<style lang="sass">

</style>
