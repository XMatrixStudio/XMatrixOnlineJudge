import Vue from 'vue';
import Router from 'vue-router';

import Index from '@/components/Index/Index';
import User from '@/components/User/Index';
Vue.use(Router);


const router = new Router({
  routes: [{
    path: '/',
    name: 'Index',
    component: Index,
  }, {
    path: '/User/',
    name: 'User',
    component: User
  }]
});

export default router;