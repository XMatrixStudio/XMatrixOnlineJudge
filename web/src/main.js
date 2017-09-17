// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import ElementUI from 'element-ui';
import '../node_modules/element-ui/lib/theme-default/index.css';
import 'font-awesome-webpack';
Vue.use(Vuex);
Vue.use(VueResource);
Vue.use(ElementUI);

// require('./lib/layer/layer.js')
Vue.config.productionTip = false;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});
