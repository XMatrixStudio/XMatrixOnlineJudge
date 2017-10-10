import Vue from 'vue';
import Router from 'vue-router';
import User from '@/page/User/Index';
import UserPage from '@/page/User/UserPage';
import UserLogin from '@/page/User/Login';
import Problem from '@/page/Problem/ProblemList';
import ProblemDetail from '@/page/Problem/ProblemDetail';

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
  }, {
    path: '/problem/:pid',
    name: 'ProblemDetail',
    component: ProblemDetail
  }, {
    path: '/user/:name',
    name: 'UserPage',
    component: UserPage
  }, {
    path: '/login',
    name: 'LoginPage',
    component: UserLogin
  }]
});
