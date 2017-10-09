<template>
  <el-row :gutter="10">
    <el-col :xs="{span: 22, offset: 1}" :sm="{span: 7, offset: 1}" :md="{span: 6, offset: 1}" :lg="{span: 4, offset: 3}">
      <div class="sideBox">
        <user-info></user-info>
        <follow-info @changeTab="changeTab"></follow-info>
      </div>
    </el-col>
    <el-col :xs="{span: 22, offset: 1}" :sm="16" :md="17" :lg="13">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="主页" name="notice">主页即将上线</el-tab-pane>
        <el-tab-pane label="留言" name="message">留言即将上线</el-tab-pane>
        <el-tab-pane label="统计数据" name="userData">统计数据即将上线</el-tab-pane>
        <el-tab-pane label="关注" name="following"><follow-tab></follow-tab>
        </el-tab-pane>
        <el-tab-pane label="粉丝" name="follower">关注模块即将上线</el-tab-pane>
        <el-tab-pane label="成就" name="userTitle">成就系统即将上线</el-tab-pane>
        <el-tab-pane label="用户设置" name="userSetting">用户设置即将上线</el-tab-pane>
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script>
import userInfo from '../../components/User/Side/UserInfo';
import followInfo from '../../components/User/Side/FollowInfo';
import followTab from '../../components/User/Content/Follow';
export default {
  name: 'User',
  data() {
    return {
      activeName: 'notice'
    };
  },
  mounted() {
    this.$emit('changeNav', '1');
    // 代码登陆
    this.$store.state.user.logged = true;
    // 测试代码
    this.checkLogin();
  },
  components: { userInfo, followInfo, followTab },
  methods: {
    handleClick(tab, event) {

    },
    changeTab(index) {
      this.activeName = index;
    },
    checkLogin() {
      if (this.$store.state.user.logged == false) {
        this.$router.replace('/login');
      }
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
