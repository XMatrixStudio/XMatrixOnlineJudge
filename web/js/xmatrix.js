//---------------------------------------------------------------------
function getCookie(name) {
  var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  return (arr = document.cookie.match(reg)) ? unescape(arr[2]) : null;
} //获取cookie

function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  return r !== null ? unescape(r[2]) : null;
} //获取get参数

function sendNotice(str) {
  $('#Alert_').alert('close');
  $('#notice').load('notice.html', function() {
    document.getElementById('sendtoAlert').innerHTML = str;
  });
} //页面内通知

function sendNotice2(str) {
  $('#Alert_').alert('close');
  $('#notice2').load('notice.html', function() {
    document.getElementById('sendtoAlert').innerHTML = str;
  });
} //模态框通知

function regularTest(pattern, id, send) {
  if (!pattern.test(document.getElementById(id).value)) {
    sendNotice(send);
    $('#' + id).focus();
    $('#' + id).val('');
    return 0;
  } else {
    return 1;
  }
} //正则匹配

function isNullTest(id, send) {
  if (document.getElementById(id).value === '') {
    sendNotice(send);
    $('#' + id).focus();
    return 1;
  } else {
    return 0;
  }
} //非空检测

function lengthTest(id, min, max, send, qwq) {
  if (document.getElementById(id).value.length < min || document.getElementById(id).value.length > max) {
    1 === qwq ? sendNotice2(send) : sendNotice(send); //qwq=1是模态框类通知
    $('#' + id).focus();
    return 0;
  } else {
    return 1;
  }
} //检测长度

function isEqualTest(id1, id2, send, qwq) {
  if (document.getElementById(id1).value != document.getElementById(id2).value) {
    qwq === 1 ? sendNotice2(send) : sendNotice(send); //qwq=1是模态框类通知
    $('#' + id2).focus();
    return 0;
  } else {
    return 1;
  }
} //检测相等

function login() {
  if (isNullTest('userEmail', '<strong>邮箱地址为空</strong>  请输入邮箱地址')) return;
  if (isNullTest('userPassword', '<strong>密码为空</strong>  请输入密码')) return;
  var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (!regularTest(pattern, 'userEmail', '请输入有效的Email！')) return;
  sendNotice('登陆中，请稍后');
  $.post('api/login', {
    userEmail: document.getElementById('userEmail').value,
    userPassword: hex_sha1(document.getElementById('userPassword').value)
  }, function(data) {
    if (data.state == 'success') {
      document.cookie = 'name=' + data.name;
      document.cookie = 'detail=' + data.detail;
      document.cookie = 'web=' + data.web;
      document.cookie = 'tureEmail=' + data.tureEmail;
      document.cookie = 'userEmail=' + document.getElementById('userEmail').value;
      if (data.tureEmail === 0) {
        window.location.href = 'mail.html';
      } else {
        window.location.href = 'problem.html';
      }
    } else { //失败
      switch (data.why) {
        case 'ERROR_USER':
          $('#userEmail').val('');
          $('#userEmail').focus();
          sendNotice('<strong>邮箱不存在</strong>请重新输入或进行注册');
          break;
        case 'ERROR_PASSWORD':
          $('#userPassword').val('');
          $('#userPassword').focus();
          sendNotice('<strong>密码</strong>错误，请重新输入');
          break;
      }
    }
  });
} //登陆操作

function judge() {
  $('#myTab a[href="#messages"]').tab('show');
  grade.gradeTotal = '0';
  grade.lastTime = 'Judging...';
  grade.times += 1;
  grade.runTime = 'Judging...';
  grade.color = '008B8B';
  for (var i = 0; i < 4; i++) {
    grade.gradeEach[i].color = '008B8B';
    grade.gradeEach[i].helpText = '';
    grade.gradeEach[i].grade = 'Judging';
    grade.gradeEach[i].ico = 'time';
  } //处理页面
  $.post('/api/submit', { code: document.getElementById('codetext').value }, function(data) {
    if (data.state == 'success') {
      getGrade(0);
    } else {
      switch (data.why) {
        case 'ILLEGAL_SIGN':
        case 'ILLEGAL_TOKEN':
        case 'NO_THIS_PROBLEM':
          window.location.href =
            '/index.html?op=4';
          break;
        case 'NO_MAIL':
          document.cookie = 'tureEmail=0';
          window.location.href = '/mail.html';
          break;
        case 'TIME_OUT':
          window.location.href = '/index.html?op=4';
          break;
        case 'IS_JUDGING':
          alert('正在评测中,请不要重复提交');
          break;
      }
    }
  });
} //评测模块

function getGrade(count) {
  if (count < 5) {
    $.post('/api/getGrade', { state: 'hello,world' }, function(data) {
      if (data.state == 'success') {
        dealGrade(data);
      } else if (data.why == 'NO_DO') {
        window.location.href = '/index.html?op=4';
      } else {
        setTimeout(getGrade, 2000, count + 1); // 5次循环调用，10秒后无相应返回超时
      }
    });
  } else {
    dealGrade({
      grade: 0,
      gradeMax: 0,
      gradeEach: [0, 0, 0, 0],
      helpText: ['', '', '', ''],
      lastTime: '评测超时',
      runTime: '∞',
      judgeTimes: '???',
      textName: ['编译测试', '标准测试', '随机测试', '内存测试']
    })
  }
} //获取成绩

function dealGrade(data) {
  grade.gradeTotal = data.grade;
  grade.lastTime = data.lastTime;
  grade.max = data.gradeMax;
  grade.times = data.judgeTimes;
  grade.runTime = data.runTime;
  grade.color = (data.grade == 100) ? '228B22' : 'B22222';
  for (var i = 0; i < data.gradeEach.length; i++) {
    grade.gradeEach[i].name = data.textName[i];
    grade.gradeEach[i].grade = data.gradeEach[i];
    grade.gradeEach[i].color = data.gradeEach[i] == grade.gradeEach[i].max ? '228B22' : 'B22222';
    grade.gradeEach[i].ico = data.gradeEach[i] == grade.gradeEach[i].max ? 'ok' : 'remove';
    var helpText = '<p>' + data.helpText[i].toString()
      .replace(/\\n/g, '</p><p>')
      .replace(/\n/g, '</p><p>')
      .replace(/\\r/, '') +
      '</p>';
    grade.gradeEach[i].helpText = helpText;
  }
} //处理成绩

function register() {
  if (isNullTest('userEmail', '请输入邮箱地址')) return;
  if (isNullTest('userName', '请输入用户名')) return;
  if (isNullTest('userPassword', '请输入密码')) return;
  if (isNullTest('userPassword2', '请再次输入密码')) return;
  var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (!regularTest(pattern, 'userEmail', '请输入有效的Email！')) return;
  pattern = /^[a-zA-Z0-9\_\.]{3,20}$/;
  if (!regularTest(pattern, 'userName', '请输入有效的用户名(由字母，数字，下划线组成，3-20位)')) return;
  if (!lengthTest('userPassword', 6, 20, '密码长度不合法，有效长度：6 - 20')) return;
  if (!isEqualTest('userPassword', 'userPassword2', '两次输入的密码不一致')) return;
  $.post('api/register', {
    userEmail: document.getElementById('userEmail').value,
    userName: document.getElementById('userName').value,
    userPassword: hex_sha1(document.getElementById('userPassword').value)
  }, function(data) {
    if (data.state == 'success') {
      window.location.href = 'index.html?op=5';
    } else if (data.why == 'EMAIL_HAD') {
      sendNotice('邮箱已经被注册，请登陆。');
    } else {
      sendNotice('非法请求');
    }
  });
} //注册模块

function forgetPwd() {
  if (isNullTest('userEmail', '请输入邮箱地址')) return;
  if (isNullTest('vCode', '请输入验证码')) return;
  if (isNullTest('userPassword', '请输入密码')) return;
  if (isNullTest('userPassword2', '请再次输入密码')) return;
  var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (!regularTest(pattern, 'userEmail', '请输入有效的Email！')) return;
  pattern = /^[0-9\_\.]{6,6}$/;
  if (!regularTest(pattern, 'vCode', '请输入有效的验证码')) return;
  if (!lengthTest('userPassword', 6, 20, '密码长度不合法，有效长度：6 - 20')) return;
  if (!isEqualTest('userPassword', 'userPassword2', '两次输入的密码不一致')) return;
  $.post('api/forget', {
    userEmail: document.getElementById('userEmail').value,
    vCode: document.getElementById('vCode').value,
    userPassword: hex_sha1(document.getElementById('userPassword').value)
  }, function(data) {
    if (data.state == 'success') {
      window.location.href = 'index.html?op=6';
    } else if (data.why == 'EMAIL_NOT') {
      sendNotice('邮箱已经不存在，请进行注册');
    } else if (data.why == 'ERR_VCODE') {
      sendNotice('验证码错误！');
    }
  });
} //忘记密码模块

function toCinfo() {
  var pattern = /^[a-zA-z0-9\_\.]{3,20}$/;
  if (!regularTest(pattern, 'user_tname', '用户名不合法，（可含字母，数字，下划线，长度3-20）')) return;
  $.post('api/user/info', {
      userName: document.getElementById('user_tname').value,
      userDetail: document.getElementById('user_detail').value,
      userWeb: document.getElementById('user_web').value
    },
    function(data) {
      if (data.state == 'success') {
        sendNotice('成功修改信息。');
        document.getElementById('userBar').innerHTML =
          document.getElementById('user_tname').value +
          ' <span class="caret"></span>';
      } else {
        window.location.href = 'index.html?op=4';
      }
    });
} //修改个人信息

function toCpwd() {
  if (!lengthTest('old_password', 6, 20, '密码长度不合法，有效长度：6 - 20', 1)) return;
  if (!lengthTest('new_password', 6, 20, '密码长度不合法，有效长度：6 - 20', 1)) return;
  if (!isEqualTest('new_password', 'new_password2', '两次输入的密码不一致', 1)) return;

  $.post('api/user/pwd', {
      oldPassword: hex_sha1(document.getElementById('old_password').value),
      newPassword: hex_sha1(document.getElementById('new_password').value),
    },
    function(data) {
      if (data.state == 'success') {
        $('#cPwd').modal('hide');
        sendNotice('成功修改密码。');
      } else if (data.why == 'ERR_PWD') {
        sendNotice2('原密码错误。');
        $('#old_password').val('');
        $('#old_password').focus();
      } else {
        window.location.href = 'index.html?op=4';
      }
    });
} //修改密码

function toMail() {
  $.post('api/mail', { state: 'EMAIL' }, function(data) {
    if (data.state == 'success') {
      window.location.href = 'index.html?op=2';
      return;
    } else {
      switch (data.why) {
        case 'HAD_SEND':
          alert('一个小时内只能发送一次');
          break;
        case 'ILLEGAL_SIGN':
        case 'ILLEGAL_TOKEN':
          window.location.href = 'index.html?op=4';
          break;
        case 'TIME_OUT':
          window.location.href = 'index.html?op=3';
          break;
      }
    }
  });
} //发送邮件

function testcode() {
  var textarea = document.getElementById('codetext');
  var editor = CodeMirror.fromTextArea(textarea, {
    autofocus: true,
    content: textarea.value,
    mode: 'text/x-c++src',
    theme: 'blackboard',
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: { 'Ctrl': 'autocomplete' },
    lineNumbers: true,
    inputStyle: 'contenteditable',
  });
  editor.on('change', function(Editor, changes) {
    $('#codetext').text(editor.getValue());
  });
  editor.setSize('auto', '500px');
} //代码编辑框

function isLogin(callback) {
  var qwq = getCookie('isLogin');
  var wdf = getCookie('tureEmail');
  if (qwq === '' || qwq === 0 || qwq == undefined) {
    window.location.href = '/index.html?op=1';
  } else if (wdf == '0' || wdf == undefined || wdf == '') {
    window.location.href = '/mail.html';
  } else {
    if (callback != undefined) callback();
  }
} //检测是否登陆和验证邮箱


function loadBar(id) {
  if (localStorage.navBar === undefined) {
    $.get('nav-bar.html', (data) => {
      localStorage.navBar = data;
      $("#nav-bar").html(localStorage.navBar);
    });
  } else {
    $("#nav-bar").html(localStorage.navBar);
  }
  setTimeout(function() {
    if (getCookie('isLogin') == 'true') {
      $('#loginBtn').hide();
      $('#userBar').show();
      $('#userBar').html(getCookie('name') + '<span class="caret"></span>')
    } else {
      $('#userBar').hide();
      $('#loginBtn').show()
    }
    $(id).addClass("active");
  }, 800);
}

function logout() {
  $.post('/api/logout', {}, (data) => {
    window.location.href = '/';
  });
}