const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto'); //加密模块
const spawn = require('child_process').spawn; //异步子进程模块
const fs = require('fs'); //文件处理
const cookieParser = require('cookie-parser'); // cookie模块
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // post模块
const sqlModule = require('./mysql.js'); //数据库模块
const userModule = require('./user.js'); //用户认证模块
const ejsModule = require('./ejs.js'); //EJS模板引擎
const verify = require('./sdk/verify.js'); //violet
const sLine = '-----------------------------------------------';
app.use(cookieParser()); // cookie模块
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.set('views', './views'); // 指定视图所在的位置
app.set('view engine', 'ejs'); // 注册模板引擎
//------------------------------------------------------------------------------
//日期格式化
Date.prototype.Format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    'S': this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};
//------------------------------------------------------------------------------
//日志处理
app.use((req, res, next) => {
  console.log(sLine);
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log('Time:' + nowTime + '|| Method: ' + req.method);
  console.log('Form' + req.url + '||' + req.headers.referer);
  next();
});
//------------------------------------------------------------------------------
//提交代码评测
app.post('/submit', [userModule.appUserVerif, ejsModule.getPid], (req, res, next) => { //查询是否有这个问题
  var sqlCmd = 'SELECT `standCase` FROM `problem` WHERE id=?';
  var data = [res.locals.pId];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (isNull) {
      console.log('ERR: NO_THIS_PROBLEM');
      res.send({ state: 'failed', why: 'NO_THIS_PROBLEM' });
      next('route');
    } else {
      res.locals.standCase = vals[0].standCase;
      next();
    }
  });
}, (req, res, next) => { //查看数据库是否有记录或者judging
  var sqlCmd = 'SELECT `judging`, `lastTime`, `judgeTimes` FROM `judge` WHERE `uid`=? && `pid`=?';
  var data = [res.locals.data.userID, res.locals.pId];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
    var userCode = sqlModule.dealEscape(req.body.code);
    if (isNull) {
      console.log('Creat a record'); //新建一个记录
      var sqlCmd = 'SELECT `name` FROM `user` WHERE `id`=?';
      var data = res.locals.data.userID
      sqlModule.query(sqlCmd, data, (vals, isNull) => {
        res.locals.userName = vals[0].name;
        var sqlCmd = 'INSERT INTO `judge`(`pid`, `uid`, `code`, `grade`, `gradeMax`, `gradeEach`, `helpText`, `lastTime`, `runTime`, `judging`, `userName`, `judgeTimes`) VALUES' +
          ' (?,?,\'?\',0,0,\'0,0,0,0\',\' #*# #*# #*# \',\'?\',300,1,\'?\',1)';
        var data = [res.locals.pId, res.locals.data.userID, userCode, nowTime, res.locals.userName];
        sqlModule.query(sqlCmd, data, (vals, isNull) => {
          next();
        });
      });
    } else if (vals[0].judging == 0 || (vals[0].lastTime == '' || userModule.comptime(vals[0].lastTime, nowTime) > 1)) {
      console.log('Update the record'); //更新记录
      var sqlCmd = 'UPDATE `judge` SET `code`=\'?\',`lastTime`=\'?' +
        '\',`judging`= 1,`judgeTimes` = ? WHERE `uid`=? && `pid`=?';
      var data = [userCode, nowTime, (vals[0].judgeTimes + 1), res.locals.data.userID, res.locals.pId];
      sqlModule.query(sqlCmd, data, (vals, isNull) => {
        next();
      });
    } else {
      console.log('ERR: problem is judging'); //问题正在评测中，返回failed
      res.send({ state: 'failed', why: 'IS_JUDGING' });
      next('route');
    }
  });
}, (req, res, next) => { //调用judge子进程
  console.log('write to file: file/' + res.locals.data.userID + '_' + res.locals.pId + '.c'); //存文件
  fs.writeFile('file/' + res.locals.data.userID + '_' + res.locals.pId + '.c', req.body.code, (err) => {
    if (err) return console.error(err);
    console.log('toJudge...');
    var judgeModule = spawn('./judge.sh', [res.locals.data.userID, res.locals.pId, res.locals.standCase]);
  });
  console.log('judging success!');
  res.send({ state: 'success' });
});
//------------------------------------------------------------------------------
//返回成绩
app.post('/getGrade', [userModule.appUserVerif, ejsModule.getPid], (req, res, next) => { //查询该用户是否存在这个记录
  var sqlCmd = 'SELECT * FROM `judge` WHERE uid=? && pid=?';
  var data = [res.locals.data.userID, res.locals.pId];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (isNull) { //不存在这个记录
      console.log('user no do it.');
      res.send({ state: 'failed', why: 'NO_DO' });
      next('route');
    } else {
      res.locals.userData = vals[0];
      next();
    }
  });
}, (req, res, next) => { //返回结果
  if (res.locals.userData.judging == 0) {
    console.log('success'); //评测完毕
    var helpText = res.locals.userData.helpText.split("#X#");
    res.send({
      state: 'success',
      grade: res.locals.userData.grade,
      gradeMax: res.locals.userData.grade > res.locals.userData.gradeMax ? res.locals.userData.grade : res.locals.userData.gradeMax,
      judgeTimes: res.locals.userData.judgeTimes,
      gradeEach: res.locals.userData.gradeEach.split(","),
      helpText: helpText,
      lastTime: res.locals.userData.lastTime,
      runTime: res.locals.userData.runTime,
      textName: ['编译测试', '标准测试', '随机测试', '内存测试'],
    });
    if (res.locals.userData.grade > res.locals.userData.gradeMax) {
      var sqlCmd = 'UPDATE `judge` SET `gradeMax`=`grade` WHERE `uid`=?&&`pid`=?';
      var data = [res.locals.data.userID, res.locals.pId];
      sqlModule.query(sqlCmd, data);
    }
  } else {
    console.log('JUDGING'); //在评测中
    res.send({ state: 'failed', why: 'JUDGING' });
    next('route');
  }
});
//------------------------------------------------------------------------------
//用户登录模块
app.post('/login', [userModule.isEmailStr], (req, res, next) => { //用户是否存在
  console.log('User Login:');
  var sqlCmd = 'SELECT `id`, `name`, `password`, `detail`, `web`, `tureEmail` FROM `user` WHERE `email`=\'?\'';
  var data = [req.body.userEmail];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (isNull) {
      console.log('ERR: user is not exist.');
      res.send({ state: 'failed', why: 'ERROR_USER' });
      next('route');
    } else {
      res.locals.userData = vals[0];
      next();
    }
  });
}, (req, res, next) => { //密码是否正确
  if (res.locals.userData.password == userModule.makeAsha(req.body.userPassword)) {
    var newToken = Math.round(Math.random() * 10000000);
    userModule.getToken(res.locals.userData.id, newToken, (oldToken, tureEmail) => {
      var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
      res.locals.data = { //构建session原始数据
        userID: res.locals.userData.id,
        token: newToken,
        lastDate: nowTime
      };
      userModule.makeASign(req, res, () => {
        res.send({
          state: 'success',
          name: res.locals.userData.name,
          detail: res.locals.userData.detail,
          web: res.locals.userData.web,
          tureEmail: res.locals.userData.tureEmail
        });
      });
    });
  } else {
    console.log('ERR: password is error');
    res.send({ state: 'failed', why: 'ERROR_PASSWORD' });
    next('route');
  }
});
//------------------------------------------------------------------------------
//邮箱验证系统
app.get('/login', (req, res, next) => { //获取get参数
  console.log('Email activation:');
  if (req.query.userSession != undefined && req.query.sign != undefined) {
    res.locals.userSession = req.query.userSession;
    res.locals.sign = req.query.sign;
    next();
  } else {
    console.log('Unable to read parameters');
    res.send('unknown error');
    next('route');
  }
}, [userModule.appUserVerifNoMail], (req, res, next) => { //查看是否已经激活
  var sqlCmd = 'SELECT `tureEmail` FROM `user` WHERE id=?';
  var data = [res.locals.data.userID];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (vals[0].tureEmail == 0) {
      console.log('Email activation success');
      var sqlCmd = 'UPDATE `user` SET`tureEmail`=1 WHERE id=?';
      var data = [res.locals.data.userID];
      sqlModule.query(sqlCmd, data, (vals, isNull) => {
        res.redirect('../index.html?op=0');
      });
    } else {
      console.log('Err: email had activation!');
      res.send('Err: email had activation!');
    }
  });
});
//------------------------------------------------------------------------------
//注册模块
app.post('/register', [userModule.isEmailStr, userModule.isTrueUser], (req, res, next) => { // 邮箱是否已经存在
  console.log('User registration:');
  var sqlCmd = 'SELECT `name`FROM `user` WHERE email =\'?\'';
  var data = [req.body.userEmail];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (isNull) {
      next();
    } else {
      console.log('Err: email is had!');
      res.send({ state: 'failed', why: 'EMAIL_HAD' });
      next('route');
    }
  });
}, (req, res, next) => { // 建立用户数据
  var sqlCmd = 'SELECT `intData` FROM `global` WHERE `name` = \'userCount\'';
  var data = [];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    console.log('Register success!');
    res.send({ state: 'success' });
    var userMaxId = vals[0].intData;
    var userPass = userModule.makeAsha(req.body.userPassword);
    var sqlCmd = 'INSERT INTO `user`(`id`, `name`, `password`, `detail`, `email`, `web`, `tureEmail`) VALUES ' +
      '(?,\'?\',\'?\',\'Nothing\',\'?\',\'Nothing\',0)';
    var data = [(userMaxId + 10000), req.body.userName, userPass, req.body.userEmail];
    sqlModule.query(sqlCmd, data);
    sqlCmd = 'UPDATE `global` SET`intData`=? WHERE `name` = \'userCount\'';
    data = [(userMaxId + 1)];
    sqlModule.query(sqlCmd, data);
  });
});
//------------------------------------------------------------------------------
//发送激活邮件
app.post('/mail', (req, res, next) => { // 获取授权参数
  console.log('send email to user: ');
  res.locals.userSession = req.cookies.userSession;
  res.locals.sign = req.cookies.sign;
  next();
}, [userModule.appUserVerifNoMail], (req, res, next) => { //时间限制
  var nowHour = new Date().Format('yyyy-MM-dd-hh');
  var sqlCmd = 'SELECT `email`, `tureEmail`, `sendEmailTime` FROM `user` WHERE `id`=?';
  var data = res.locals.data.userID;
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (vals[0].sendEmailTime != nowHour && vals[0].tureEmail == 0) {
      console.log('ready to Send email!');
      var sqlCmd = 'UPDATE `user` SET `sendEmailTime`=\'' + nowHour + '\' WHERE `id`=?';
      var data = res.locals.data.userID;
      sqlModule.query(sqlCmd, data);
      res.locals.userEmail = vals[0].email;
      next();
    } else {
      if (vals[0].tureEmail == 1) {
        console.log('Err: This had is a tureEmail.');
        res.send({ state: 'failed', why: 'HAD_TURE' });
        next('route');
      } else {
        console.log('Err: Send two emails in a hour.');
        res.send({ state: 'failed', why: 'HAD_SEND' });
        next('route');
      }
    }
  });
}, (req, res, next) => { //发送邮件
  var session = userModule.encrypt(JSON.stringify(res.locals.data), userModule.getKey().mykey);
  var mailSign = userModule.makeAsha(session + userModule.getKey().mysign);
  var mail1 = fs.readFileSync('maildata/mail1.data');
  var mail2 = fs.readFileSync('maildata/mail2.data');
  fs.writeFile('mail.html', mail1 + session + '&sign=' + mailSign + mail2, (err) => {
    if (err) console.error(err);
    const ls = spawn('./sendMail.sh', [res.locals.userEmail]);
  });
  res.send({ state: 'success' });
});
//------------------------------------------------------------------------------
//修改密码
app.post('/user/pwd', [userModule.appUserVerif], (req, res, next) => { //比较是否相同
  console.log('Password Change: ');
  var sqlCmd = 'SELECT `password` FROM `user` WHERE `id`=?';
  var data = [res.locals.data.userID];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (vals[0].password == userModule.makeAsha(req.body.oldPassword)) {
      console.log('Password is Right!');
      var newPass = userModule.makeAsha(req.body.newPassword);
      var sqlCmd = 'UPDATE `user` SET `password`=\'?\' WHERE `id`=?;
      var data = [newPass, res.locals.data.userID];
      sqlModule.query(sqlCmd, data);
      console.log('Updata password!');
      res.send({ state: 'success' });
    } else {
      console.log('Err: Password is ERR');
      res.send({ state: 'failed', why: 'ERR_PWD' });
    }
  });
});
//------------------------------------------------------------------------------
//修改个人信息
app.post('/user/info', [userModule.appUserVerif, userModule.isTrueUser], (req, res, next) => { //更新数据库个人信息
  console.log('Info Change: ');
  var userName = sqlModule.dealEscape(req.body.userName);
  var userDetail = sqlModule.dealEscape(req.body.userDetail);
  var userWeb = sqlModule.dealEscape(req.body.userWeb);
  var sqlCmd = 'UPDATE `user` SET `name`=\'?\', `detail`=\'?\',`web`=\'?\' WHERE `id`=?';
  var data = [userName, userDetail, userWeb, res.locals.data.userID];
  sqlModule.query(sqlCmd, data);
  sqlCmd = 'UPDATE `judge` SET `userName`= \'?\' WHERE `uid`=?';
  data = [userName, res.locals.data.userID];
  sqlModule.query(sqlCmd, data);
  console.log('Update user Info!');
  res.send({ state: 'success' });
});
//------------------------------------------------------------------------------
//问题详情
app.get('/problem/:id', (req, res, next) => { //正则匹配题目ID
  console.log('Get a Problem: ');
  var pattern = /^[0-9]{1,4}$/;
  if (pattern.test(req.params.id)) {
    res.locals.pId = req.params.id;
    next();
  } else {
    console.log('Not a id ' + req.params.id);
    next('route');
  }
}, (req, res, next) => { // 是否已经登陆
  if (req.cookies.isLogin != 1) {
    res.redirect('/index.html?op=1');
    next('route');
  } else {
    next();
  }
}, [userModule.appUserVerif], (req, res, next) => { //查询问题详情
  var sqlCmd = 'SELECT * FROM `problem` WHERE `id`=?;
  var data = [req.params.id];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (isNull) {
      console.log('No a problem');
      res.redirect('/index.html?op=0');
      next('route');
    } else {
      res.locals.problemData = vals[0];
      var sqlCmd = 'SELECT `userName`, `gradeMax` , `runTime` FROM `judge` WHERE `pid`=?' +
        ' ORDER BY `gradeMax` DESC,`runTime` ASC';
      var data = [req.params.id];
      sqlModule.query(sqlCmd, data, (vals, isNull) => { //查询排名
        res.locals.rank = vals;
        next();
      });
    }
  });
}, (req, res, next) => { //返回问题详情
  var sqlCmd = 'SELECT * FROM `judge` WHERE `pid`=? && `uid`=?';
  var data = [req.params.id, res.locals.data.userID];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    res.locals.isDone = !isNull;
    console.log(res.locals.isDone);
    if (!isNull) res.locals.userData = vals[0];
    next();
  });
}, ejsModule.problem); //渲染问题详情页面
//------------------------------------------------------------------------------
//获取问题列表
app.post('/getPlist', (req, res, next) => { //处理数据并返回
  console.log('get Problem list: ');
  var sqlCmd = 'SELECT `id`, `class`, `title`, `hard`, `course` FROM `problem` WHERE 1';
  var data = [];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    var arrId = new Array;
    var arrCourse = new Array;
    var arrClass = new Array;
    var arrTitle = new Array;
    var arrHard = new Array;
    for (var i = 0; i < vals.length; i++) {
      arrId[i] = vals[i].id;
      arrCourse[i] = vals[i].course;
      arrClass[i] = vals[i].class;
      arrTitle[i] = vals[i].title;
      arrHard[i] = vals[i].hard;
    }
    res.send({
      pCount: vals.length,
      pId: arrId,
      pName: arrTitle,
      pCourse: arrCourse,
      pClass: arrClass,
      pHard: arrHard
    });
  });
});
//------------------------------------------------------------------------------
//获取邮件验证码
app.post('/getVCode', (req, res, next) => { //检测请求是否合法
  var sqlCmd = 'SELECT `id`, `vCodeSendTime` FROM `user` WHERE `email`=\'?\'';
  var data = [req.body.userEmail];
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:00');
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (isNull) {
      res.send({ state: 'failed', why: 'EMAIL_NOT' });
      next('route');
    } else {
      if (vals[0].vCodeSendTime == nowTime) {
        res.send({ state: 'failed', why: 'TIME_LIMIT' });
        next('route');
      } else {
        res.locals.nowTime = nowTime;
        res.locals.userId = vals[0].id;
        next();
      }
    }
  });
}, (req, res, next) => { //发送邮件
  var vCode = Math.round(100000 + Math.random() * 1000000);
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  var sqlCmd = 'UPDATE `user` SET `vCode`=?,`vCodeSendTime`=\'?\',`vCodeLimitTime`=\'?\' WHERE `id`=?';
  var data = [vCode, res.locals.nowTime, nowTime, res.locals.userId];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    var mail1 = fs.readFileSync('maildata/mail3.data');
    var mail2 = fs.readFileSync('maildata/mail4.data');
    fs.writeFile('mail.html', mail1 + vCode + mail2, (err) => {
      if (err) console.error(err);
      const ls = spawn('./sendMail2.sh', [req.body.userEmail]);
    });
    res.send({ state: 'success' });
  });
});
//------------------------------------------------------------------------------
//重置密码
app.post('/forget', (req, res, next) => { //核对验证码
  var sqlCmd = 'SELECT `id`, `vCode`,`vCodeLimitTime` FROM `user` WHERE `email`=\'?\'';
  var data = [req.body.userEmail]
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    if (isNull) {
      res.send({ state: 'failed', why: 'EMAIL_NOT' });
      next('route');
    } else {
      if (vals[0].vCode == req.body.vCode && vals[0].vCode != 007 && userModule.comptime(vals[0].vCodeLimitTime, nowTime) < 1) {
        res.locals.userId = vals[0].id;
        next();
      } else {
        res.send({ state: 'failed', why: 'ERR_VCODE' });
        next('route');
      }
    }
  });
}, (req, res, next) => { //重置密码
  userPassword = userModule.makeAsha(req.body.userPassword);
  var sqlCmd = 'UPDATE `user` SET `password`=\'?\', `vCode`=007 WHERE `id`=?';
  var data = [userPassword, res.locals.userId];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    res.send({ state: 'success' });
  });
});
//------------------------------------------------------------------------------
//退出登陆
app.get('/layout', (req, res, next) => { //清空cookies
  res.cookie('userSession', '');
  res.cookie('sign', '');
  res.cookie('isLogin', '0');
  res.redirect('../index.html?op=0');
});
//------------------------------------------------------------------------------
app.post('/violet', (req, res, next) => {
  verify.getUserInfo(req.body.code, (data) => {
    if (data.state == 'ok') {

    } else {

    }
  });
});
//------------------------------------------------------------------------------
//监听30002端口
var server = app.listen(30002, '127.0.0.1', () => { //监听localhost
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
//------------------------------------------------------------------------------