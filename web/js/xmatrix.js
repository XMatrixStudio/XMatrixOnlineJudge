// SHA1加密模块
var hexcase = 0;
var b64pad = '';
var chrsz = 8;
function hex_sha1(s) {
  return binb2hex(core_sha1(str2binb(s), s.length * chrsz));
  }
function core_sha1(x, len) {
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;
  var w = Array(80);
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  var e = -1009589776;
  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;
    for (var j = 0; j < 80; j++) {
      if (j < 16)
        w[j] = x[i + j];
      else
        w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      var t = safe_add(
          safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
          safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }
    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
    }
  return Array(a, b, c, d, e);
  }
function sha1_ft(t, b, c, d) {
  if (t < 20) return (b & c) | ((~b) & d);
  if (t < 40) return b ^ c ^ d;
  if (t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
  }
function sha1_kt(t) {
  return (t < 20) ? 1518500249 :
                    (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
  }
function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
  }
function rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
  }
function str2binb(str) {
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
  return bin;
  }
function binb2hex(binarray) {
  var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
  var str = '';
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
        hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
    }
  return str;
  }

//---------------------------------------------------------------------
function getCookie(name) {
  var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  if (arr = document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
  }  //获取cookie

function GetQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
  }  //获取get参数

function sendNotice(str) {
  $('#Alert_').alert('close');
  $('#notice').load('notice.html', function() {
    document.getElementById('sendtoAlert').innerHTML = str;
  });
  }  //页面内通知
function sendNotice2(str) {
  $('#Alert_').alert('close');
  $('#notice2').load('notice.html', function() {
    document.getElementById('sendtoAlert').innerHTML = str;
  });
  }  //模态框通知
function login(_password) {
  if (document.getElementById('user_email').value != '' &&
      document.getElementById('user_password').value != '') {
    sendNotice('登陆中，请稍后');
    $.post(
        'api/login', {
          user_email: document.getElementById('user_email').value,
          user_password: _password
        },
        function(data) {
          if (data.state == 'success') {
            document.cookie = 'name=' + data.name;
            document.cookie = 'detail=' + data.detail;
            document.cookie = 'web=' + data.web;
            document.cookie = 'isMail=' + data.isMail;
            document.cookie =
                'userEmail=' + document.getElementById('user_email').value;
            if (data.isMail == 0) {
              window.location.href = 'mail.html';
            } else {
              window.location.href = 'problem.html';
            }

          } else {
            $('#user_password').val('');
            $('#user_password').focus();
            sendNotice('<strong>邮箱 或 密码</strong>错误，请重新输入');
          }
        });
  }
  }  //登陆操作
function toLogin() {
  if (document.getElementById('user_email').value == '') {
    sendNotice('<strong>邮箱地址为空</strong>  请输入邮箱地址');
    $('#user_email').focus();
    return;
  } else if (
      document.getElementById('user_password').value == '' &&
      document.getElementById('user_email').value != '') {
    sendNotice('<strong>密码为空</strong>  请输入密码');
    $('#user_password').focus();
    return;
    }
  var pattern =
      /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  var strEmail = pattern.test(document.getElementById('user_email').value);
  if (!strEmail) {
    sendNotice('请输入有效的Email！');
    $('#user_email').focus();
    $('#user_email').val('');
    return;
  }
  login(hex_sha1(document.getElementById('user_password').value));
  }

function running() {
  $('#myTab a[href="#messages"]').tab('show');
  $('#j_grade').html('Judging');
  document.getElementById('j_pro').style.width = '0%';
  $('#j_Ltime').html('最后提交：Judging...');
  $('#j_Rtime').html('运行时间：Judging...');
  $('#j_men').html('占用内存：Judging...');
  $('#j_test1')
      .html(
          '编译测试：Judging... <span class="glyphicon glyphicon-time" style="float:right;"></span>');
  $('#j_test2')
      .html(
          '标准测试：Judging... <span class="glyphicon glyphicon-time" style="float:right;"></span>');
  $('#j_test3')
      .html(
          '随机测试：Judging... <span class="glyphicon glyphicon-time" style="float:right;"></span>');
  $('#j_test4')
      .html(
          '内存测试：Judging... <span class="glyphicon glyphicon-time" style="float:right;"></span>');
  document.getElementById('j_test1').style.color = '#008B8B';
  document.getElementById('j_test2').style.color = '#008B8B';
  document.getElementById('j_test3').style.color = '#008B8B';
  document.getElementById('j_test4').style.color = '#008B8B';
  document.getElementById('j_grade').style.color = '#008B8B';
  $('#j_info1').html('');
  $('#j_info2').html('');
  $('#j_info3').html('');
  $('#j_info4').html('');
  $.post('/api/submit', {code: document.getElementById('codetext').value}, function(data) {
    if (data.state == 'success') {
      $('#j_grade').html(data.grade.total);
      document.getElementById('j_pro').style.width = data.grade.total + '%';
      $('#j_Ltime').html('最后提交：' + data.time);
      $('#j_Rtime').html('运行时间：' + data.runtime);
      $('#j_men').html('最高分数：' + data.grade.totalm);
      $('#j_info1').html(data.grade.test1e);
      $('#j_info2').html(data.grade.test2e);
      $('#j_info3').html(data.grade.test3e);
      $('#j_info4').html(data.grade.test4e);

      if (data.grade.total === 100) {
        document.getElementById('j_grade').style.color = '#228B22';
      } else {
        document.getElementById('j_grade').style.color = '#B22222';
        }
      if (data.grade.test1 === data.grade.test1m) {
        $('#j_test1')
            .html(
                '编译测试： ' + data.grade.test1 + '/' + data.grade.test1m +
                ' <span class="glyphicon glyphicon-ok" style="float:right;"></span>');
        document.getElementById('j_test1').style.color = '#228B22';
      } else {
        $('#j_test1')
            .html(
                '编译测试： ' + data.grade.test1 + '/' + data.grade.test1m +
                ' <span class="glyphicon glyphicon-remove" style="float:right;"></span>');
        document.getElementById('j_test1').style.color = '#B22222';
        }
      if (data.grade.test2 === data.grade.test2m) {
        $('#j_test2')
            .html(
                '标准测试： ' + data.grade.test2 + '/' + data.grade.test2m +
                ' <span class="glyphicon glyphicon-ok" style="float:right;"></span>');
        document.getElementById('j_test2').style.color = '#228B22';
      } else {
        $('#j_test2')
            .html(
                '标准测试： ' + data.grade.test2 + '/' + data.grade.test2m +
                ' <span class="glyphicon glyphicon-remove" style="float:right;"></span>');
        document.getElementById('j_test2').style.color = '#B22222';
        }
      if (data.grade.test3 === data.grade.test3m) {
        $('#j_test3')
            .html(
                '随机测试： ' + data.grade.test3 + '/' + data.grade.test3m +
                ' <span class="glyphicon glyphicon-ok" style="float:right;"></span>');
        document.getElementById('j_test3').style.color = '#228B22';
      } else {
        $('#j_test3')
            .html(
                '随机测试： ' + data.grade.test3 + '/' + data.grade.test3m +
                ' <span class="glyphicon glyphicon-remove" style="float:right;"></span>');
        document.getElementById('j_test3').style.color = '#B22222';
        }
      if (data.grade.test4 === data.grade.test4m) {
        $('#j_test4')
            .html(
                '内存测试： ' + data.grade.test4 + '/' + data.grade.test4m +
                ' <span class="glyphicon glyphicon-ok" style="float:right;"></span>');
        document.getElementById('j_test4').style.color = '#228B22';
      } else {
        $('#j_test4')
            .html(
                '内存测试： ' + data.grade.test4 + '/' + data.grade.test4m +
                ' <span class="glyphicon glyphicon-remove" style="float:right;"></span>');
        document.getElementById('j_test4').style.color = '#B22222';
      }
    } else {
      if (data.why == 'ILLEGAL_SIGN' || data.why == 'ILLEGAL_TOKEN')
        alert('非法访问，请重新登陆');
      if (data.why == 'TIME_OUT') alert('登陆超时，请重新登陆');
      if (data.why == 'NO_MAIL') {
        document.cookie = 'isMail=0';
        window.location.href = 'mail.html';
      } else {
        window.location.href = 'index.html?op=0';
      }
    }
  });
  }  //评测模块

function register(_password) {
  //发送post请求
  $.post(
      'api/register', {
        user_email: document.getElementById('user_email').value,
        user_name: document.getElementById('user_name').value,
        user_password: _password
      },
      function(data) {
        if (data.state == 'success') {
          alert('注册成功！请登陆你的账号。');
          window.location.href = 'index.html';
        } else if (data.why == 'NOT_EMAIL' || data.why == 'NOT_USER') {
          sendNotice('非法POST请求');
        } else {
          sendNotice('邮箱已经被注册，请登陆。');
        }
      });
  }  //注册模块
function toregister() {
  if (document.getElementById('user_email').value == '') {
    sendNotice('请输入邮箱地址');
    $('#user_email').focus();
    return;
    }
  if (document.getElementById('user_name').value == '') {
    sendNotice('请输入用户名');
    $('#user_name').focus();
    return;
    }
  if (document.getElementById('user_password').value == '') {
    sendNotice('请输入密码');
    $('#user_password').focus();
    return;
    }
  if (document.getElementById('user_password2').value == '') {
    sendNotice('请再次输入密码');
    $('#user_password2').focus();
    return;
    }
  var pattern =
      /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  var strEmail = pattern.test(document.getElementById('user_email').value);
  if (!strEmail) {
    sendNotice('请输入有效的Email！');
    $('#user_email').focus();
    $('#user_email').val('');
    return;
    }

  var pattern2 = /^[a-zA-z0-9\_\.]{3,20}$/;
  var strname = pattern2.test(document.getElementById('user_name').value);
  if (!strname) {
    sendNotice('请输入有效的用户名！(由字母，下划线，点组成的3-20位字符串)');
    $('#user_name').focus();
    $('#user_name').val('');
    return;
    }
  if (document.getElementById('user_password').value.length < 6 ||
      document.getElementById('user_password').value.length > 20) {
    sendNotice('密码长度不合法，有效长度：6 - 20');
    $('#user_password').focus();
    return;
    }

  if (document.getElementById('user_password2').value !=
      document.getElementById('user_password').value) {
    sendNotice('两次输入的密码不一致');
    $('#user_password2').focus();
    return;
  }
  register(hex_sha1(document.getElementById('user_password').value));
  }

function toCinfo() {
  var re = /^[a-zA-z0-9\_\.]{3,20}$/;
  if (!re.test(document.getElementById('user_tname').value)) {
    sendNotice('用户名不合法，（可含字母，数字，下划线，长度3-20）');
    $('#user_tname').val('');
    $('#user_tname').focus();
    return;
  }
  re =
      /select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/i;
  if (re.test(document.getElementById('user_detail').value)) {
    sendNotice('个人信息含有非法字符。');
    $('#user_detail').val('');
    $('#user_detail').focus();
    return;
    }
  if (re.test(document.getElementById('user_web').value)) {
    sendNotice('个人主页含有非法字符。');
    $('#user_web').val('');
    $('#user_web').focus();
    return;
  }
  $.post(
      'api/user/info', {
        user_name: document.getElementById('user_tname').value,
        user_detail: document.getElementById('user_detail').value,
        user_web: document.getElementById('user_web').value
      },
      function(data) {
        if (data.state == 'success') {
          sendNotice('成功修改信息。');
        } else {
          window.location.href = 'index.html?op=3';
        }

      });
  }  //修改个人信息



function toCpwd() {
  if (document.getElementById('old_password').value.length < 6 ||
      document.getElementById('old_password').value.length > 20) {
    sendNotice2('密码长度不合法，有效长度：6 - 20');
    $('#old_password').val('');
    $('#old_password').focus();
    return;
    }
  if (document.getElementById('new_password').value.length < 6 ||
      document.getElementById('new_password').value.length > 20) {
    sendNotice2('密码长度不合法，有效长度：6 - 20');
    $('#new_password').val('');
    $('#new_password').focus();
    return;
    }
  if (document.getElementById('new_password2').value.length < 6 ||
      document.getElementById('new_password2').value.length > 20) {
    sendNotice2('密码长度不合法，有效长度：6 - 20');
    $('#new_password2').val('');
    $('#new_password2').focus();
    return;
    }
  if (document.getElementById('new_password2').value !=
      document.getElementById('new_password').value) {
    sendNotice2('两次输入的密码不一致');
    $('#new_password2').focus();
    return;
  }

  $.post(
      'api/user/pwd', {
        old_password: hex_sha1(document.getElementById('old_password').value),
        new_password: hex_sha1(document.getElementById('new_password').value),
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
          window.location.href = 'index.html?op=3';
        }
      });
  }  //修改密码

function toMail() {
  $.post('api/mail', {state: 'EMAIL'}, function(data) {
    if (data.state == 'success') {
      window.location.href = 'index.html?op=2';
      return;
      }
    if (data.why == 'HAD_SEND') {
      alert('一个小时内只能发送一次');
      return;
      }
    if (data.why == 'ILLEGAL_SIGN' || data.why == 'ILLEGAL_TOKEN') {
      window.location.href = 'index.html?op=1';
      return;
      }
    if (data.why == 'TIME_OUT') window.location.href = 'index.html?op=3';
  });
  }  //发送邮件

function testcode() {
  var textarea = document.getElementById('codetext');
  var editor = CodeMirror.fromTextArea(textarea, {
    autofocus: true,
    content: textarea.value,
    mode: 'text/x-c++src',
    theme: 'blackboard',
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {'Ctrl': 'autocomplete'},
    lineNumbers: true,
    inputStyle: 'contenteditable',
  });
  editor.on('change', function(Editor, changes) {
    $('#codetext').text(editor.getValue());
  });
  editor.setSize('auto','500px');
}  //代码编辑框

function isLogin(callback) {
  var qwq = getCookie('isLogin');
  var wdf = getCookie('isMail');
  if (qwq == '' || qwq == 0 || qwq == undefined) {
    //window.location.href='index.html?op=1';
  } else if (wdf == '0' || wdf == undefined || wdf == '') {
    window.location.href = 'mail.html';
  }else{
    if(callback != undefined)callback();
  }
}  //检测是否登陆和验证邮箱

function getPlist() {

  $.post('api/getPlist', {state: 'hello,world'}, function(resdata) {
    var proList = new Array;
    var proCount = new Array;
    proCount=[0,0,0,0,0,0];
    for (var i = 1; i <= resdata.pCount; i++) {
      proCount[resdata.pCourse[i]]++;
      if (proList[resdata.pCourse[i]] == undefined) proList[resdata.pCourse[i]] = '';
      proList[resdata.pCourse[i]] += '<a href="api/problem/';
      proList[resdata.pCourse[i]] += resdata.pId[i];
      proList[resdata.pCourse[i]] +=
          '"class="list-group-item"><h4 class="list-group-item-heading">';
      proList[resdata.pCourse[i]] += resdata.pName[i];
      proList[resdata.pCourse[i]] += '   <span class="label label-';
      switch (resdata.pHard[i]) {
        case 1:
          proList[resdata.pCourse[i]] += 'success">easy';
          break;
        case 2:
          proList[resdata.pCourse[i]] += 'info">common';
          break;
        case 3:
          proList[resdata.pCourse[i]] += 'danger">hard';
          break;
      }
      proList[resdata.pCourse[i]] +=
          '</span></h4><p class="list-group-item-text">';
      switch (resdata.pClass[i]) {
        case 1:
          proList[resdata.pCourse[i]] += '编程题';
          break;
        case 2:
          proList[resdata.pCourse[i]] += '选择题';
          break;
        case 3:
          proList[resdata.pCourse[i]] += '不知道什么题';
          break;
      }
      proList[resdata.pCourse[i]] += '</p></a>'
      }

    for (var i = 1; i <= 4; i++) {
      if (proList[i] == undefined) {
        proList[i] =
            '<a href="#" class="list-group-item"><h4 class="list-group-item-heading"><span class="label label-info">NULL</span></h4></a>'
      }
      if(proCount[i] == undefined)proCount[i] = 0;
    }
    document.getElementById('course_1').innerHTML= proList[1];
    document.getElementById('course_2').innerHTML= proList[2];
    document.getElementById('course_3').innerHTML= proList[3];
    document.getElementById('course_4').innerHTML= proList[4];
    document.getElementById('course_num_1').innerHTML= proCount[1];
    document.getElementById('course_num_1_').innerHTML= proCount[1];
    document.getElementById('course_num_2').innerHTML= proCount[2];
    document.getElementById('course_num_2_').innerHTML= proCount[2];
    document.getElementById('course_num_3').innerHTML= proCount[3];
    document.getElementById('course_num_3_').innerHTML= proCount[3];
    document.getElementById('course_num_4').innerHTML= proCount[4];
    document.getElementById('course_num_4_').innerHTML= proCount[4];
  });
  }


