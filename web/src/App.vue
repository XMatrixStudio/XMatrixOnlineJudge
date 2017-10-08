<template>
  <div id="app">
    <navbar :nav="nav"></navbar>
    <router-view @changeNav="changeNav"></router-view>
  </div>
</template>

<script>
import navbar from './components/Navbar/Navbar';
export default {
  components: { navbar },
  name: 'app',
  data() {
    return {
      nav: 1,
    }
  },
  methods: {
    changeNav(index) {
      console.log(index)
      this.nav = index
    }
  }
};
</script>

<style>
@import "./style/variables.scss";
#app {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
