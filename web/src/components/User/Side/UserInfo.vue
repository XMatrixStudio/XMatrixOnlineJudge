<template>
  <div>
    <img class="avatarBox" src="../../../assets/20028311.jpg">
    <p class="userName">
      <a href="javascript:;">{{nickName}}</a>
      <el-tag type="primary">{{defaultTitle}}</el-tag>
    </p>
    <p class="userNameReal">{{name}}
      <i class="fa fa-mars fa-fw" aria-hidden="true"></i>
      <i class="fa fa-venus fa-fw" aria-hidden="true" style="display: none;"></i>
    </p>
    <p class="userDetail">{{detail}}</p>
    <hr class="line"/>
    <p class="userInfo">
      <i class="fa fa-link fa-fw" aria-hidden="true"></i>
      <a :href="'http://' + web" target="_blank"> {{web}}</a>
    </p>
    <p class="userInfo">
      <i class="fa fa-envelope-o fa-fw" aria-hidden="true"></i>
      <a :href="'mailto:' + email" target="_blank"> {{email}}</a>
    </p>
    <p class="userInfo">
      <i class="fa fa-map-marker fa-fw" aria-hidden="true"></i> {{locale}}
    </p>
    <hr class="line"/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nickName: 'Zhenly',
      name: 'zhenlychen',
      detail: 'Hello, world!',
      web: 'blog.zhenly.cn',
      email: 'zhenlychen@foxmail.com',
      locale: 'Guangzhou',
      defaultTitle: '管理员'
    };
  }
};
</script>

<style lang="scss">
@import "../../../style/variables.scss";
.userName {
  margin: 0px auto;
  >a {
    font-size: 24px;
  }
}

.avatarBox{
  height: 160px;
  width: 160px;
  border-radius: 9px;
}

.userNameReal {
  margin: 0px auto;
  font-size: 18px;
  color: #555;
  font-weight: lighter;
  >.fa-mars {
    color:cornflowerblue;
  }
  >.fa-venus {
    color: palevioletred;
  }
}

.userDetail{
  font-size: 13px;
}

.line {
  width: 80%;
  height: 1px;
  background: #e5e5e5;
  border: none;
  margin: 10px 0px 10px 0px;
}

.userInfo{
  margin: 5px auto;
  font-size: 14px;
}
</style>
