<template>
  <div>
    <p><i class="fa fa-mortar-board fa-fw" aria-hidden="true"></i> 成就</p>
    <p class="titleBox">
      <el-tag class="userTitle" v-for="(userTitle, index) in userTitles" :key="index" type="primary">{{userTitle}}</el-tag>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'hello',
      userTitles: ['连错十题','管理员']
    };
  }
};
</script>

<style lang="scss">
.userTitle{
  margin-right: 10px;
}

.titleBox{
  margin-left: 14px;
}
</style>
