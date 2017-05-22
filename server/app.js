﻿const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs'); //文件处理
const sLine = '-----------------------------------------------';
const cookieParser = require('cookie-parser'); // cookie模块
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // post模块
const sqlModule = require('./mysql.js'); //数据库模块
const userModule = require('./user.js'); //用户认证模块
const ejsModule = require('./ejs.js');//EJS模板引擎
const crypto = require('crypto'); //加密模块
const spawn = require('child_process').spawn; //异步子进程模块
app.use(cookieParser()); // cookie模块
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.set('views', './views'); // 指定视图所在的位置
app.set('view engine', 'ejs'); // 注册模板引擎
//------------------------------------------------------------------------------
//时间模块
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
app.use((req, res, next) =>  {
  console.log(sLine);
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log('Time:' + nowTime + '|| Method: ' + req.method);
  console.log('Form' + req.url + '||' + req.headers.referer);
  next();
});
//------------------------------------------------------------------------------
//提交代码评测
app.post('/submit', [userModule.appUserVerif, ejsModule.getPid],(req,res, next) => {
    userModule.makeASign(req, res, () => {
      res.send({ state: 'failed' });
    });
    next('route');
}, (req, res, next) =>  { //查询是否有这个问题
  var sqlCmd = 'SELECT `standCase` FROM `problem` WHERE id=' + res.locals.pId;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    if (isNull) {
      console.log('ERR: NO_THIS_PROBLEM');
      res.send({ state: 'failed', why: 'NO_THIS_PROBLEM' });
      next('route');
    } else {
      res.locals.standCase = vals[0].standCase;
      next();
    }
  });
}, (req, res, next) =>  { //查看数据库是否有记录或者judging
  var sqlCmd = 'SELECT `judging`, `lastTime`, `judgeTimes` FROM `judge` WHERE `uid`=' + res.locals.data.userID + ' && `pid`=' + res.locals.pId;
  sqlModule.query(sqlCmd, (vals, isNull) => {
    var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
    var userCode = sqlModule.dealEscape(req.body.code);
    if (isNull) {
      console.log('Creat a record'); //新建一个记录
      var sqlCmd = 'SELECT `name` FROM `user` WHERE `id`='+ res.locals.data.userID;
      sqlModule.query(sqlCmd, (vals, isNull)  => {
        res.locals.userName = vals[0];
        var sqlCmd = 'INSERT INTO `judge`(`pid`, `uid`, `code`, `grade`, `gradeMax`, `gradeEach`, `helpText`, `lastTime`, `runTime`, `judging`, `userName`, `judgeTimes`) VALUES'+
        ' (' + res.locals.pId + ','+ res.locals.data.userID +',\'' + userCode + '\',0,0,\'0,0,0,0\',\' #*# #*# #*# \',\''+ nowTime + '\',-1,1,\'' + res.locals.userName + '\',0)';
        sqlModule.query(sqlCmd, (vals, isNull)  => {
          next();
        });
      });
    } else if (vals[0].is_judging == 0 || userModule.comptime(vals[0].lastTime, nowTime) > 1) {
      console.log('Update the record'); //更新记录
      var sqlCmd = 'UPDATE `judge` SET `code`=\'' + userCode + '\',`lastTime`=\'' + nowTime +
      '\',`judging`= 1,`judgeTimes` = ' + (vals[0].judgeTimes + 1) + ' WHERE `uid`=' + res.locals.data.userID + ' && `pid`=' + res.locals.pId;
      sqlModule.query(sqlCmd, (vals, isNull) => {
        next();
      });
    } else {
      console.log('ERR: problem is judging'); //问题正在评测中，返回failed
      userModule.makeASign(req, res, () =>  {
        res.send({ state: 'failed', why: 'IS_JUDGING' });
        next('route');
      });
    }
  });
}, (req, res, next) => { //调用judge子进程
    console.log('write to file: file/' + res.locals.data.userID + '_' + res.locals.pId + '.c'); //存文件
    fs.writeFile('file/' + res.locals.data.userID + '_' + res.locals.pId + '.c', req.body.code, (err) =>  {
      if (err) return console.error(err);
      console.log('toJudge...');
      var judgeModule = spawn('./judge.sh', [res.locals.data.userID, res.locals.pId, res.locals.standCase]);
    });
    console.log('judging success!');
    userModule.makeASign(req, res, () => {
      res.send({ state: 'success' });
    });
  });
//------------------------------------------------------------------------------
//返回成绩
app.post('/getGrade', [userModule.appUserVerif, ejsModule.getPid], (req, res, next) => { //查询该用户是否存在这个记录
  var sqlCmd = 'SELECT * FROM `judge` WHERE uid=' + res.locals.data.userID + ' && pid='+ res.locals.pId;
  sqlModule.query(sqlCmd, (vals, isNull) => {
        if (isNull) { //不存在这个记录
          userModule.makeASign(req, res, () => {
            console.log('user no do it.');
            res.send({ state: 'failed', why: 'NO_DO' });
            next('route');
          });
        } else {
          res.locals.vals = vals[0];
          next();
        }
      });
}, (req, res, next) => { //返回结果
  if (res.locals.vals.is_judging == 0) {
        console.log('success'); //评测完毕
        userModule.makeASign(req, res, () =>  {

          var helpText = res.locals.vals.helpText.split("#X#");
          res.send({
            state: 'success',
            grade: res.locals.vals.grade,
            gradeMax: res.locals.vals.gradeMax,
            judgeTimes: res.locals.vals.judgeTimes,
            gradeEach: res.locals.vals.gradeEach,
            helpText: helpText,
            lastTime: res.locals.vals.lastTime,
            runTime: res.locals.vals.runTime,
            textName: ['编译测试', '标准测试', '随机测试', '内存测试'],
          });
        });
      } else {
        userModule.makeASign(req, res, () =>  {
            console.log('JUDGING'); //在评测中
            res.send({ state: 'failed', why: 'JUDGING' });
          });
        next('route');
      }
    });
//------------------------------------------------------------------------------
//用户登录模块
app.post('/login', [userModule.isEmailStr], (req, res, next) =>  { //用户是否存在
  console.log('User Login:');
  var sqlCmd = 'SELECT `id`, `name`, `password`, `detail`, `web`, `tureEmail` FROM `user` WHERE `email`=\'' +
  req.body.userEmail + '\'';
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
    if (isNull) {
      console.log('ERR: user is not exist.');
      res.send({ state: 'failed', why: 'ERROR_USER' });
      next('route');
    } else {
      res.locals.userData = vals[0];
      next();
    }
  });
}, (req, res, next) =>  { //密码是否正确
  if (res.locals.userData.password == userModule.makeAsha(req.body.userPassword)) {
    var newToken = Math.round(Math.random() * 10000000);
    userModule.getToken(res.locals.userData.id, newToken, (oldToken,tureEmail) => {
      var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
      res.locals.data = {
        userID: res.locals.userData.id,
        token: newToken,
        lastDate: nowTime
      };
      userModule.makeASign(req, res, () =>  {
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
app.get('/login', (req, res, next) =>  { //获取get参数
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
}, [userModule.appUserVerifNoMail], (req, res, next) =>  { //查看是否已经激活
  var sqlCmd = 'SELECT `tureEmail` FROM `user` WHERE id='+ res.locals.data.userID;
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
    if (vals_[0].isMail == 0) {
      console.log('Email activation success');
      var sqlCmd = 'UPDATE `user` SET`tureEmail`=1 WHERE id='+ res.locals.data.userID;
      sqlModule.query(sqlCmd, (vals, isNull) =>  {
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
app.post('/register', [userModule.isEmailStr, userModule.isTrueUser], (req, res, next) =>  { // 邮箱是否已经存在
  console.log('User registration:');
  var sqlCmd = 'SELECT `name`FROM `user` WHERE email =\'' + req.body.user_email + '\'';
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
    if (isNull) {
      next();
    } else {
      console.log('Err: email is had!');
      res.send({ state: 'failed', why: 'EMAIL_HAD' });
      next('route');
    }
  });
}, (req, res, next) =>  { // 建立用户数据
  var sqlCmd = 'SELECT `intData` FROM `global` WHERE `name` = \'userCount\'';
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
    console.log('Register success!');
    res.send({ state: 'success' });
    var userMaxId = vals;
    var userPass = userModule.makeAsha(req.body.userPassword);
    var sqlCmd = 'INSERT INTO `user`(`id`, `name`, `password`, `detail`, `email`, `web`, `tureEmail`) VALUES '+
    '('+(userMaxID + 10000)+',\'' + req.body.userName + '\',\'' + hashSHA1 + '\',\'Nothing\',\'' + req.body.userEmail + '\',\'Nothing\',0)';
    sqlModule.query(sqlCmd);
    sqlCmd = 'UPDATE `global` SET`intData`=' + (userMaxID + 1) + ' WHERE `name` = \'userCount\'';
    sqlModule.query(sqlCmd);
  });
});
//------------------------------------------------------------------------------
//发送激活邮件
app.post('/mail', (req, res, next) =>  { // 获取授权参数
  console.log('send email to user: ');
  res.locals.userSession = req.cookies.userSession;
  res.locals.sign = req.cookies.sign;
}, [userModule.appUserVerifNoMail], (req, res, next) =>  { //时间限制
  var nowHour = new Date().Format('yyyy-MM-dd-hh');
  var sqlCmd = 'SELECT `email`, `tureEmail`, `sendEmailTime` FROM `user` WHERE `id`=' + res.locals.data.userID;
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
    if (vals.sendEmailTime != nowHour && vals.tureEmail == 0) {
      console.log('ready to Send email!');
      var sqlCmd = 'UPDATE `user` SET `sendEmailTime`=\'' + nowtime + '\' WHERE `id`=' + res.locals.data.userID;
      sqlModule.query(sqlCmd);
      res.locals.userEmail = vals.user_email;
      next();
    } else {
      if(vals.tureEmail == 1){
        console.log('Err: This had is a tureEmail.');
        userModule.makeASign(req, res, () =>  {
          res.send({ state: 'failed', why: 'HAD_TURE' });
        });
        next('route');
      }else{
        console.log('Err: Send two emails in a hour.');
        userModule.makeASign(req, res, () =>  {
          res.send({ state: 'failed', why: 'HAD_SEND' });
        });
        next('route');
      }
    }
  });
}, (req, res, next) =>  { //发送邮件
  var session = userModule.encrypt(JSON.stringify(res.locals.data), userModule.getKey().mykey);
  var mailSign = userModule.makeAsha(session + userModule.getKey().mysign);
  var mail1 = fs.readFileSync('mail1.data');
  var mail2 = fs.readFileSync('mail2.data');
  fs.writeFile('mail.html', mail1 + session + '&sign=' + mailSign + mail2, (err) =>  {
    if (err) console.error(err);
    const ls = spawn('./sendMail.sh', [res.locals.userEmail]);
  });
  res.send({ state: 'success' });
});
//------------------------------------------------------------------------------
//修改密码
app.post('/user/pwd', [userModule.appUserVerif], (req, res, next) =>  {
  console.log('Password Change: ');
  var sqlCmd = 'select user_password from user where user_id=' + res.locals.data.userID;
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
    if (vals.user_password == userModule.makeAsha(req.body.old_password)) {
      console.log('Password is Right!');
      var newPass = userModule.makeAsha(req.body.new_password);
      var sqlCmd = 'UPDATE `user` SET `password`=\'' + hashSHA1 + '\' WHERE `id`=' + res.locals.data.userID;
      sqlModule.query(sqlCmd);
      console.log('Updata password!');
      userModule.makeASign(req, res, () =>  {
        res.send({ state: 'success' });
      });
    } else {
      console.log('Err: Password is ERR');
      userModule.makeASign(req, res, () =>  {
        res.send({ state: 'failed', why: 'ERR_PWD' });
      });
    }
  });
});
//------------------------------------------------------------------------------
//修改个人信息
app.post('/user/info', [userModule.appUserVerif, userModule.isTrueUser], (req, res, next) =>  {
  console.log('Info Change: ');
  var userName = sqlModule.dealEscape(req.body.user_name);
  var userDetail = sqlModule.dealEscape(req.body.user_detail);
  var userWeb = sqlModule.dealEscape(req.body.user_web);
  var sqlCmd = 'UPDATE `user` SET `name`=\'' + userName + '\' `detail`=\'' + userDetail + '\',`web`=\'' +
  userWeb + '\' WHERE `id`=' + res.locals.data.userID;
  sqlModule.query(sqlCmd);
  var sqlCmd = 'UPDATE `judge` SET `userName`= \'' + userName + '\' WHERE `uid`=' + res.locals.data.userID;
  sqlModule.query(sqlCmd);
  console.log('Update user Info!');
  userModule.makeASign(req, res, () =>  {
    res.send({ state: 'success' });
  });
});

//------------------------------------------------------------------------------
//问题详情
app.get('/problem/:id', (req, res, next) =>  { //正则匹配题目ID
  console.log('Get a Problem: ');
  var pattern = /^[0-9]{1,4}$/;
  if (pattern.test(req.params.id)) {
    res.locals.pId = req.params.id;
    next();
  } else {
    console.log('Not a id ' + req.params.id);
    next('route');
  }
}, (req, res, next) =>  { // 是否已经登陆
  if (req.cookies.isLogin != 1) {
    res.redirect('../../index.html?op=1');
    next('route');
  } else {
    next();
  }
}, [userModule.appUserVerif], (req, res, next) =>  { //查询问题详情
  var sqlCmd = 'SELECT * FROM `problem` WHERE `id`=' + req.params.id;
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
    if (isNull) {
      console.log('No a problem');
      res.redirect('../../index.html?op=0');
      next('route');
    } else {
      res.locals.problemData = vals[0];
      var sqlCmd = 'SELECT `userName`, `gradeMax` , `runTime` FROM `judge` WHERE `pid`='
      + req.params.id + ' ORDER BY `gradeMax` DESC,`runTime` ASC';
      sqlModule.query(sqlCmd, (vals, isNull) => {//查询排名
        res.locals.rank = vals;
        next();
      });
    }
  });
}, (req, res, next) =>  { //返回问题详情
  var sqlCmd = 'SELECT * FROM `judge` WHERE `pid`='+req.params.id+' && `uid`='+ res.locals.data.userID;
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
    userModule.makeASign(req, res, () => {
      res.locals.isDone = !isNull;
      console.log(res.locals.isDone);
      if(!isNull) res.locals.userData = vals[0];
      next();
    });
  });
},ejsModule.problem);

//------------------------------------------------------------------------------
//获取问题列表
app.post('/getPlist', (req, res, next) =>  {
  console.log('get Problem list: ');
  var sqlCmd = 'SELECT `id`, `class`, `title`, `hard`, `course` FROM `problem` WHERE 1';
  sqlModule.query(sqlCmd, (vals, isNull) =>  {
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
//退出登陆
app.get('/layout', (req, res, next) =>  {
  res.cookie('userSession', '');
  res.cookie('sign', '');
  res.cookie('isLogin', '0');
  res.redirect('../index.html?op=0');
});
//------------------------------------------------------------------------------
//监听30002端口
var server = app.listen(30002, '127.0.0.1', () =>  {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
//------------------------------------------------------------------------------
