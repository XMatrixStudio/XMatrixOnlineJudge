<template>
  <div class="sideBox">
    <userInfo></userInfo>
    <follow></follow>
  </div>
</template>

<script>
import userInfo from './UserInfo';
import follow from './Follow';
export default {
  data() {
    return {
      msg: 'Welcome to Your Vue.js App'
    };
  },
  components: { userInfo, follow }
};
</script>

<style lang="scss">
.sideBox {
  margin-left: 10px;
}
</style>
