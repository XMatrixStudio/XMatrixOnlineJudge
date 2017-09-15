/* 引入vue和主页 */
import Vue from 'vue';
import App from './App.vue';
import router from './router';
Vue.config.debug = true; //开启错误提示
/* 实例化一个vue */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});