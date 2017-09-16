<template>
  <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
    <div class="col-lg-8 col-lg-offset-2">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
          <span class="sr-only"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="javasprict:;" @click="test">XMatrix</a>
      </div>

      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav">
          <li id="t-home">
            <a href="/index.html">
              <i class="fa fa-home fa-fw" aria-hidden="true"></i> 首页</a>
          </li>
          <li id="t-problem">
            <a href="/problem.html">
              <i class="fa fa-tasks fa-fw" aria-hidden="true"></i> 题库</a>
          </li>
          <li id="t-rank">
            <a href="/rank.html">
              <i class="fa fa-sort-amount-desc fa-fw" aria-hidden="true"></i> 排行榜</a>
          </li>
          <li id="t-community">
            <a href="/community.html">
              <i class="fa fa-comments-o fa-fw" aria-hidden="true"></i> 社区</a>
          </li>
        </ul>

        <ul class="nav navbar-nav navbar-right">
          <li id="t-user" class="dropdown">
            <a id="loginBtn" href="https://oauth.xmatrix.studio/?sid=10001">登陆</a>
            <a style="display: none;" id="userBar" href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">未登陆
              <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
              <li>
                <a onclick="logout()" href="javasprict:;">
                  <span class="glyphicon glyphicon-log-out" aria-hidden="true"></span> 退出登陆</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <!-- /.navbar-collapse -->
  </nav>
</template>


<script>
export default {
  methods: {
    test () {
      layer.msg('XMatrix Online Judge')
    }
  }
}
</script>



<style lang="scss">
@import "../../style/variables.scss";
.navbar-default {
  background: $navBackColor;
  height: 64px;
  padding-top: 7px;
}

.navbar-header {
  >.navbar-brand {
    color: $navFontColor;
    transition: all 0.4s;
    font-size: 24px;
    &:focus,
    &:hover {
      color: $navFontFocus;
    }
  }
}

.collapse {
  >.navbar-nav {
    >li {
      >a {
        color: $navFontColor;
        transition: all 0.4s;
        &:focus,
        &:hover {
          color: $navFontFocus;
        }
      }
    }
  }
}
</style>

