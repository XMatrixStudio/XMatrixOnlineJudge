const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const spawn = require('child_process').spawn; //异步子进程模块
const fs = require('fs'); //文件处理
const cookieParser = require('cookie-parser'); // cookie模块
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // post模块
const User = require('./user.js'); //用户模块
const Ejs = require('./ejs.js'); //EJS模板引擎
const Verify = require('./sdk/verify.js'); //violet
const Judge = require('./judge.js');
const Problem = require('./problem.js');
app.use(cookieParser()); // cookie模块
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.set('views', './views'); // 指定视图所在的位置
app.set('view engine', 'ejs'); // 注册模板引擎
//------------------------------------------------------------------------------
//监听30002端口
var server = app.listen(30002, '127.0.0.1', () => { //监听localhost
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
//------------------------------------------------------------------------------
//日志处理
app.use((req, res, next) => {
  var nowTime = new Date();
  console.log('Time:' + nowTime + '|| Form' + req.url + '||' + req.headers.referer);
  next();
});
//------------------------------------------------------------------------------
//提交代码评测
app.post('/submit', [Verify.checkToken, Problem.getPidFromUrl, Problem.checkProblem, Judge.checkJudge, Judge.judging]);
//------------------------------------------------------------------------------
//返回成绩
app.post('/getGrade', [Verify.checkToken, Problem.getPidFromUrl, Judge.findUserGrade, Judge.returnUserGrade]);
//------------------------------------------------------------------------------
//问题详情
app.get('/problem/:id', [Verify.checkToken, Problem.getPidFromParam, User.checkLogin, Problem.findProblemData, Judge.findJudgeData, Ejs.problem]); //渲染问题详情页面
//------------------------------------------------------------------------------
//获取问题列表
app.post('/getPlist', [Problem.returnProblemList]);
//------------------------------------------------------------------------------
//退出登陆
app.post('/logout', [Verify.logout]);
//------------------------------------------------------------------------------
//用户登陆
app.post('/violet', [User.login]);
//------------------------------------------------------------------------------