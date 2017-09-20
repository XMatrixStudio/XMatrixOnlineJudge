<template>
  <div>
    <p class="smailTitle">
      <i class="fa fa-users fa-fw" aria-hidden="true"></i> 关注好友列表</p>
    <div class="sild-bar">
      <p v-for="(follower, index) in followers" :key="index">
        <a :href="'/user/' + follower.name">{{follower.nikeName}}</a>
        <el-button type="text" @click="deleteFriend(index)">
          <i class="fa fa-close fa-fw" aria-hidden="true"></i>
        </el-button>
      </p>
    </div>
    <hr class="line" />

    <el-dialog title="提示" :visible.sync="dialogVisible" size="tiny" :before-close="handleClose">
      <span>是否要取消关注 {{selectedMan}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      followers: [{
        name: 'megashow',
        nikeName: 'ShowShow'
      }, {
        name: 'zhenlychen',
        nikeName: 'Zhenly'
      }],
      dialogVisible: false,
      selectedMan: ''
    };
  },
  methods: {
    deleteFriend(index) {
      this.selectedMan = this.followers[index].nikeName;
      this.dialogVisible = true;
    },
    handleClose(done) {
      done();
    }
  }
};
</script>

<style lang="scss">
.smailTitle {
  font-size: 15px;
}

.sild-bar {
  >p {
    margin: 6px 14px;
    width: 70%;
    >a {
      font-size: 14px;
    }
    >button {
      float: right;
    }
  }
}
</style>
