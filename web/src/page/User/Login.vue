<template>
  <div>
    <el-col :span="12" :offset="6">
      <el-row>
        <el-steps :space="100" direction="vertical" :active="1">
          <el-step title="登陆/注册 Violet 账号"></el-step>
          <el-step title="授权登陆 XMatrix Online Judge"></el-step>
          <el-step title="成功登陆"></el-step>
        </el-steps>
      </el-row>
      <el-row>
        <el-button type="primary" size="large" class="login-btn" @click="gotoViolet" >转到 Violet</el-button>
      </el-row>
    </el-col>
  </div>
</template>

<script>
export default {
  data() {
    return {
      autoLogin: false,
    };
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.$emit('changeNav', '1');
      this.$message({
          showClose: true,
          message: '请登陆后再访问',
          type: 'error'
        });
    },
    gotoViolet() {
      window.location.href = 'https://oauth.xmatrix.studio/?sid=10001&args=login';
    }
  }
};
</script>

<style lang="scss">
.el-steps {
  margin-top: 100px;
  min-width: 400px;
}

.login-btn {
  margin-top: 60px;
}
</style>
