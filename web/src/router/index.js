import Vue from 'vue';
import Router from 'vue-router';
import User from '@/components/User/Index';
import Problem from '@/components/Problem/Index';

Vue.use(Router);

export default new Router({
  routes: [{
    path: '/',
    name: 'User',
    component: User
  }, {
    path: '/problem',
    name: 'Problem',
    component: Problem
  }]
});
