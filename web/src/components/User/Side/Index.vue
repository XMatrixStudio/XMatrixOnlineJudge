<template>
  <div class="sideBox">
    <userInfo></userInfo>
  </div>
</template>

<script>
import userInfo from './UserInfo';
import follow from './Follow';
import userTitle from './UserTitle';
export default {
  data() {
    return {
      msg: ''
    };
  },
  components: { userInfo, follow, userTitle }
};
</script>

<style lang="scss">
.sideBox {
  margin-left: 10px;
}
</style>
