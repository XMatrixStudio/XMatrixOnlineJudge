// SHA1加密模块
var hexcase = 0;
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
  return (arr = document.cookie.match(reg)) ? unescape(arr[2]) : null;
  }  //获取cookie

function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  return r != null ? unescape(r[2]) : null;
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
  if (document.getElementById('userEmail').value != '' &&
      document.getElementById('userPassword').value != '') {
    sendNotice('登陆中，请稍后');
    $.post(
        'api/login', {
          userEmail: document.getElementById('userEmail').value,
          userPassword: _password
        },
        function(data) {
          if (data.state == 'success') {
            document.cookie = 'name=' + data.name;
            document.cookie = 'detail=' + data.detail;
            document.cookie = 'web=' + data.web;
            document.cookie = 'tureEmail=' + data.tureEmail;
            document.cookie =
                'userEmail=' + document.getElementById('userEmail').value;
            if (data.tureEmail == 0) {
              window.location.href = 'mail.html';
            } else {
              window.location.href = 'problem.html';
            }
          } else {  //失败
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
  }
  }  //登陆操作


function toLogin() {
  if (document.getElementById('userEmail').value == '') {
    sendNotice('<strong>邮箱地址为空</strong>  请输入邮箱地址');
    $('#userEmail').focus();
    return;
  } else if (
      document.getElementById('userPassword').value == '' &&
      document.getElementById('userEmail').value != '') {
    sendNotice('<strong>密码为空</strong>  请输入密码');
    $('#userPassword').focus();
    return;
    }
  var pattern =
      /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  var strEmail = pattern.test(document.getElementById('userEmail').value);
  if (!strEmail) {
    sendNotice('请输入有效的Email！');
    $('#userEmail').focus();
    $('#userEmail').val('');
    return;
  }
  login(hex_sha1(document.getElementById('userPassword').value));
  }

function running() {
  $('#myTab a[href="#messages"]').tab('show');
  $('#j_grade').html('Judging');
  document.getElementById('j_pro').style.width = '0%';
  $('#j_Ltime').html('最后提交：Judging...');
  $('#j_Rtime').html('运行时间：Judging...');
  $('#j_Times').html('提交次数：Judging...');
  $('#j_men').html('占用内存：Judging...');
  var textName = ['编译测试', '标准测试', '随机测试', '内存测试'];
  document.getElementById('j_grade').style.color = '#008B8B';
  for (var i = 0; i < 4; i++) {
    $('#j_test' + i).html(textName[i] + '：Judging... <span class="glyphicon glyphicon-time" style="float:right;"></span>');
    document.getElementById('j_test' + i).style.color = '#008B8B';
  $('#j_info' + i).html("");
  }
  $.post(
      '/api/submit', {code: document.getElementById('codetext').value},
      function(data) {
        if (data.state == 'success') {
          getGrade(0);
        } else {
          switch (data.why) {
            case 'ILLEGAL_SIGN':
            case 'ILLEGAL_TOKEN':
            case 'NO_THIS_PROBLEM':
                window.location.href =
                    'index.html?op=4';
                break; case 'NO_MAIL':
              document.cookie = 'tureEmail=0';
              window.location.href = 'mail.html';
              break;
            case 'TIME_OUT':
              window.location.href =
                  'index.html?op=4';
              break;
            case 'IS_JUDGING':
              alert('正在评测中,请不要重复提交');
              break;
          }
        }
      });
  }  //评测模块

function getGrade(count) {
  if (count < 5) {
    $.post('/api/getGrade', {state: 'hello,world'}, function(data) {
      if (data.state == 'success') {
        dealGrade(data);
      } else if (data.why == 'NO_DO') {
        window.location.href = 'index.html?op=4';
      } else {
        setTimeout(
            getGrade, 2000, count + 1);  // 5次循环调用，10秒后无相应返回超时
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
  }

function dealGrade(data) {
  $('#j_grade').html(data.grade);
  document.getElementById('j_pro').style.width = data.grade + '%';
  $('#j_Ltime').html('最后提交：' + data.lastTime);
  $('#j_Max').html('最高分数：' + data.gradeMax);
  $('#j_Times').html('提交次数：' + data.judgeTimes);
  $('#j_Rtime').html('运行时间：' + data.runTime + ' ms');
  document.getElementById('j_grade').style.color = data.grade == 100 ? '#228B22' : '#B22222';
  //-----------------------------------------------------------------
  for (var i = 0; i < 4; i++) {
    if (data.gradeEach[i] == gradeEachMax[i]) {
      $('#j_test' + i)
          .html(
              data.textName[i] + '： ' + data.gradeEach[i] + '/' + gradeEachMax[i] +
              ' <span class="glyphicon glyphicon-ok" style="float:right;"></span>');
      document.getElementById('j_test' + i).style.color = '#228B22';
    } else {
      $('#j_test' + i)
          .html(
              data.textName[i] + '： ' + data.gradeEach[i] + '/' + gradeEachMax[i] +
              ' <span class="glyphicon glyphicon-remove" style="float:right;"></span>');
      document.getElementById('j_test' + i).style.color = '#B22222';
    }
    var helpText = '<p>' +
        data.helpText[i]
            .toString()
            .replace(/\\n/g, '</p><p>')
            .replace(/\n/g, '</p><p>')
            .replace(/\\r/, '') +
        '</p>';
        $('#j_info' + i).html(helpText);
    }
}

function register(_password) {
  //发送post请求
  $.post(
      'api/register', {
        userEmail: document.getElementById('userEmail').value,
        userName: document.getElementById('userName').value,
        userPassword: _password
      },
      function(data) {
        if (data.state == 'success') {
          window.location.href = 'index.html?op=5';
        } else if (data.why == 'EMAIL_HAD') {
          sendNotice('邮箱已经被注册，请登陆。');
        } else {
          sendNotice('非法请求');
        }
      });
  }  //注册模块
function toregister() {
  if (document.getElementById('userEmail').value == '') {
    sendNotice('请输入邮箱地址');
    $('#userEmail').focus();
    return;
    }
  if (document.getElementById('userName').value == '') {
    sendNotice('请输入用户名');
    $('#userName').focus();
    return;
    }
  if (document.getElementById('userPassword').value == '') {
    sendNotice('请输入密码');
    $('#userPassword').focus();
    return;
    }
  if (document.getElementById('userPassword2').value == '') {
    sendNotice('请再次输入密码');
    $('#userPassword2').focus();
    return;
    }
  var pattern =
      /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  var strEmail = pattern.test(document.getElementById('userEmail').value);
  if (!strEmail) {
    sendNotice('请输入有效的Email！');
    $('#userEmail').focus();
    $('#userEmail').val('');
    return;
    }

  var pattern2 = /^[a-zA-z0-9\_\.]{3,20}$/;
  var strname = pattern2.test(document.getElementById('userName').value);
  if (!strname) {
    sendNotice('请输入有效的用户名！(由字母，下划线，点组成的3-20位字符串)');
    $('#userName').focus();
    $('#userName').val('');
    return;
    }
  if (document.getElementById('userPassword').value.length < 6 ||
      document.getElementById('userPassword').value.length > 20) {
    sendNotice('密码长度不合法，有效长度：6 - 20');
    $('#userPassword').focus();
    return;
    }

  if (document.getElementById('userPassword2').value !=
      document.getElementById('userPassword').value) {
    sendNotice('两次输入的密码不一致');
    $('#userPassword2').focus();
    return;
  }
  register(hex_sha1(document.getElementById('userPassword').value));
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
        userName: document.getElementById('user_tname').value,
        user_detail: document.getElementById('user_detail').value,
        user_web: document.getElementById('user_web').value
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
  }  //修改密码

function toMail() {
  $.post('api/mail', {state: 'EMAIL'}, function(data) {
    if (data.state == 'success') {
      window.location.href = 'index.html?op=2';
      return;
      }else{
        switch(data.why){
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
  editor.setSize('auto', '500px');
  }  //代码编辑框

function isLogin(callback) {
  var qwq = getCookie('isLogin');
  var wdf = getCookie('tureEmail');
  if (qwq == '' || qwq == 0 || qwq == undefined) {
     window.location.href='/index.html?op=1';
  } else if (wdf == '0' || wdf == undefined || wdf == '') {
    window.location.href = '/mail.html';
  } else {
    if (callback != undefined) callback();
  }
  }  //检测是否登陆和验证邮箱

function getPlist() {
  $.post('api/getPlist', {state: 'hello,world'}, function(resdata) {
    var proList = new Array;
    var proCount = new Array;
    proCount = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < resdata.pCount; i++) {
      proCount[resdata.pCourse[i]]++;
      if (proList[resdata.pCourse[i]] == undefined)
        proList[resdata.pCourse[i]] = '';
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

    for (var i = 0; i < 4; i++) {
      if (proList[i] == undefined) {
        proList[i] =
            '<a href="#" class="list-group-item"><h4 class="list-group-item-heading"><span class="label label-info">NULL</span></h4></a>'
        }
      if (proCount[i] == undefined) proCount[i] = 0;
    document.getElementById('course_' + (i + 1)).innerHTML = proList[i];
    document.getElementById('course_num_'+ (i + 1)).innerHTML = proCount[i];
    document.getElementById('course_num_'+ (i + 1) + '_').innerHTML = proCount[i];
    }
  });
}

function loadBar(id) {
    $("#nav-bar").load("nav-bar.html", function() {
        $(id).addClass("active");
        var username = getCookie("name");
        if (username !== null && username !== "") {
            document.getElementById('userBar').innerHTML = username + ' <span class="caret"></span>';
        } else {
            document.getElementById('userBar').innerHTML = '未登陆 <span class="caret"></span>';
        }
    }); //加载标题栏
}
