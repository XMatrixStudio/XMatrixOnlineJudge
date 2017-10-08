<template>
  <div class="navBox">
    <el-col :lg="{span: 18, offset: 3}">
      <el-menu theme="dark" :default-active="activeIndex" mode="horizontal" @select="handleSelect">
        <li class="nav-brand">XMatrix</li>
        <el-menu-item index="1">
          <i class="fa fa-home fa-fw" aria-hidden="true"></i> 个人中心</el-menu-item>
        <el-menu-item index="2">
          <i class="fa fa-tasks fa-fw" aria-hidden="true"></i> 题库</el-menu-item>
        <el-menu-item index="3">
          <i class="fa fa-sort-amount-desc fa-fw" aria-hidden="true"></i> 排行榜</el-menu-item>
        <el-menu-item index="4">
          <i class="fa fa-comments-o fa-fw" aria-hidden="true"></i> 社区</el-menu-item>
      </el-menu>
    </el-col>
  </div>
</template>


<script>
import router from '../../router';
export default {
  props: ['nav'],
  data() {
    return {
    };
  },
  computed: {
    activeIndex() {
      return this.nav.toString();
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      if (key === 0) activeIndex = 1;
      switch (key) {
        case '1':
          router.push('/');
          break;
        case '2':
          router.push('/problem');
          break;
        case '3':
          router.push('/rank');
          break;
        case '4':
          router.push('/community');
          break;
      }
    }
  }
}
</script>



<style lang="scss">
$fontColor: #bfcbd9;
.navBox {
  z-index: 1024;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #324157;
  min-width: 530px;
}

@keyframes brand {
  0% {
    color: $fontColor;
  }
  50% {
    color: #ffffff;
  }
  100% {
    color: $fontColor;
  }
}

.nav-brand {
  color: $fontColor;
  user-select: none;
  cursor: default;
  float: left;
  height: 60px;
  line-height: 60px;
  margin: 0;
  position: relative;
  box-sizing: border-box;
  border-bottom: 5px solid transparent;
  margin: auto 20px;
  font-size: 23px;
  transition: color .4s;
  &:focus,
  &:hover {
    color: #ffffff;
    animation: brand 2s infinite;
  }
}
</style>

