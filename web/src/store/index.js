import Vue from 'vue';
import Vuex from 'vuex';
const actions = {};
const getters = {};
import user from './modules/user';
Vue.use(Vuex);
export default new Vuex.Store({
  actions,
  getters,
  modules: {
    user
  }
});
