// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import ElementUI from 'element-ui';
import store from './store';
import VueCodeMirror from 'vue-codemirror';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome-webpack';
import ax from '@/lib/axios';
Vue.use(Vuex);
Vue.use(VueResource);
Vue.use(ElementUI);
Vue.use(VueCodeMirror);
/* require('codemirror')
require('codemirror/addon/selection/active-line.js');
require('codemirror/addon/selection/mark-selection.js');
require('codemirror/addon/edit/closebrackets.js');
require('codemirror/addon/edit/closetag.js');
require('codemirror/addon/edit/continuelist.js');
require('codemirror/addon/edit/matchbrackets.js');
require('codemirror/addon/edit/matchtags.js');
require('codemirror/addon/edit/trailingspace.js'); */
Vue.config.productionTip = false;
Vue.prototype.$https = ax;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
});
