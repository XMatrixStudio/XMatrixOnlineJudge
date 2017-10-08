<template>
  <div class="followBox">
    <a href="javascript:;" @click="toFollow('following')">
      <p class="followTitle">关注</p>
      <p>{{following}}</p>
    </a>
    <a href="javascript:;" @click="toFollow('follower')">
      <p class="followTitle">粉丝</p>
      <p>{{follower}}</p>
    </a>
    <a>
      <p class="followTitle">访客</p>
      <p>{{visitor}}</p>
    </a>
  </div>
</template>

<script>
export default {
  data() {
    return {
      following: 2,
      follower: 0,
      visitor: 0
    };
  },
  methods: {
    toFollow (index) {
      this.$emit('changeTab', index)
    }
  }
};
</script>

<style lang="scss">
.followBox {
  display: flex;
  margin-left: 10px;
  * {
    margin-right: 15%;
    >.followTitle {
      font-size: 14px;
      color: gray;
      margin: 0;
    }
  }
}
</style>
