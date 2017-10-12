<template>
  <el-row :gutter="10">
    <el-col :xs="{span: 22, offset: 1}" :sm="{span: 7, offset: 1}" :md="{span: 6, offset: 1}" :lg="{span: 4, offset: 3}">
      <div class="sideBox">
        <user-info></user-info>
        <follow-info @changeTab="changeTab"></follow-info>
        <el-button v-if="isFollow" type="warning">取消关注</el-button>
        <el-button v-else type="primary">关注</el-button>
      </div>
    </el-col>
    <el-col :xs="{span: 22, offset: 1}" :sm="16" :md="17" :lg="13">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="留言" name="message">由于该用户隐私设置，你没有权限查看</el-tab-pane>
        <el-tab-pane label="统计数据" name="userData">即将上线</el-tab-pane>
        <el-tab-pane label="成就" name="userTitle">由于该用户隐私设置，你没有权限查看</el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script>
import userInfo from '../../components/User/Side/UserInfo';
import followInfo from '../../components/User/Side/FollowInfo';
export default {
  name: 'User',
  data() {
    return {
      activeName: 'message',
      isFollow: true
    };
  },
  components: { userInfo, followInfo },
  mounted() {
    if (this.$route.params.name === this.$store.state.user.name) {
        this.$router.replace('/');
    }
  },
  methods: {
    handleClick(tab, event) {

    },
    changeTab(index) {
      this.activeName = index;
    }
  }
};
</script>

<style lang="scss">
.sideBox {
  margin-left: 10px;
}

.line {
  width: 80%;
  height: 1px;
  background: #e5e5e5;
  border: none;
  margin: 10px 0px 10px 0px;
}

.el-tabs__content {
  padding-left: 20px;
}
</style>
