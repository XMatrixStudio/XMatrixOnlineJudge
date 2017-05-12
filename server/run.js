
//基本模块
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const sLine = '-----------------------------------------------';
const cookieParser = require('cookie-parser');  // cookie模块
app.use(cookieParser());
//------------------------------------------------------------------------------
// post模块
const urlencodedParser = bodyParser.urlencoded({extended: false})
app.use(bodyParser.urlencoded(
    {extended: false}));  // for parsing application/x-www-form-urlencoded
//------------------------------------------------------------------------------
const userModule = require('./user.js');  //引入用户认证模块
const crypto = require('crypto');         //加密模块
//------------------------------------------------------------------------------
//时间模块
Date.prototype.Format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1,                    //月份
    'd+': this.getDate(),                         //日
    'h+': this.getHours(),                        //小时
    'm+': this.getMinutes(),                      //分
    's+': this.getSeconds(),                      //秒
    'q+': Math.floor((this.getMonth() + 3) / 3),  //季度
    'S': this.getMilliseconds()                   //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        (RegExp.$1.length == 1) ? (o[k]) :

        (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
  }
//********************************************************************************************************************************
//上面是各种函数
//********************************************************************************************************************************
//下面是各种监听
//********************************************************************************************************************************

//数据库模块
var pidindex = 0;
var mysql = require('mysql');
var mysqlConfig = JSON.parse(fs.readFileSync('mysql.json'));  //加载配置文件
var pool = mysql.createPool(mysqlConfig);                     //创建进程
exports.pool = pool;                                          // 外部调用
console.log('Connecting to MySQL...');
pool.getConnection(function(err, conn) {
  if (err) console.log('POOL ==> ' + err);
  var sqlRun = 'select dataint from global where name=\'pid\'';
  conn.query(sqlRun, function(err, results) {
    if (err) console.log(err);
    console.log('PID： ', results[0].dataint);
    pidindex = results[0].dataint;
    conn.release();
  });
});

//------------------------------------------------------------------------------
//日志处理
app.use(function(req, res, next) {
  console.log(sLine);
  console.log('Method: ' + req.method);
  var nowtime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log('Time:' + nowtime);
  next();
});
//-----------------------------------------
//提交代码评测

app.post('/submit', [userModule.appUserVerif], function(req, res) {
  pidindex++;
  console.log('write to file: file/' + pidindex + '.c');
  fs.writeFile('file/' + pidindex + '.c', req.body.code, function(err) {
    if (err) return console.error(err);
  });  //写入文件

  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
    'update global set dataint=' + pidindex + ' where name=\'pid\'';
    conn.query(sqlRun, function(error, results, fields) {
      if (error) throw error;
      console.log('updata pid to ' + pidindex);
      conn.release();
    });
  });  //更新pid状态
  //------------------------------------------------------------------------------
  // todo
  //调用评测系统
  //------------------------------------------------------------------------------
  var nowtime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  response = {
    state: 'success',
    pid: pidindex,
    time: nowtime,
    runtime: '211ms',
    grade: {
      total: 95,
      totalm: 100,
      test1: 20,
      test1m: 20,
      test1e: '',
      test2: 20,
      test2m: 20,
      test2e: '',
      test3: 35,
      test3m: 40,
      test3e: 'Wrong answer',
      test4: 20,
      test4m: 20,
      test4e: ''
    },
  };
  console.log('judging success!');
  userModule.makeASign(res, req, function() {
    res.send(response);
  });
});

//----------------------------------------------------------------------------------------------------------------------------------------
//子进程调用模块
/*
function calSHA1(str) {
  var spawn =
require('child_process').spawnSync;//创建同步子进程，回阻塞主进程直到返回结果。
  free = spawn('node', ['SHA1.js', str]);
  var myout = free.stdout.toString();
  myout=myout.replace('\n','');
  return myout;
}

*/
//---------------------------

//用户登录模块
app.post('/login', [userModule.isEmailStr], function(req, res) {
  console.log('用户登陆:');
  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
    'select user_name, user_password, user_detail, user_web, user_id, isMail from user where user_email=\'' +
    req.body.user_email + '\'';
    conn.query(sqlRun, function(error, results, fields) {
      if (error) throw error;
      var hashSHA1 = crypto.createHash('sha1');
      hashSHA1.update(req.body.user_password);
      if (results != '' &&
          results[0].user_password == hashSHA1.digest('hex')) {  //密码正确
        var newToken = Math.round(Math.random() * 10000000);
      userModule.getToken(results[0].user_id, newToken, function(oldToken) {
        var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
        req.data_ = {
          userID: results[0].user_id,
          token: newToken,
          lastDate: nowTime
        };
        response = {
          state: 'success',
          name: results[0].user_name,
          detail: results[0].user_detail,
          web: results[0].user_web,
          isMail: results[0].isMail,
        };
        userModule.makeASign(res, req, function() {
          console.log(response);
          res.send(response);
        });
      });
      } else {  //密码错误
        response = {state: 'failed', why: 'ERROR_PASSWORD'};
        console.log(response);
        res.send(response);
      }
      conn.release();
    });
  });
});

//邮箱验证系统

app.get(
  '/login',
  function(req, res, next) {
    console.log('Email activation:');
    if (req.query.userSession != undefined && req.query.sign != undefined) {
      req.userSession_ = req.query.userSession;
      req.sign_ = req.query.sign;
      next();
    } else {
      console.log('Unable to read parameters');
      res.send('unknown error');
      next('route');
    }
  },
  function(req, res, next) {
    userModule.userVerif(1, req, function(mydata) {
      if (mydata.userID == undefined) {
        console.log('Illegal request');
        res.send('Illegal request');
        next('route');
      } else {
        req.data_ = mydata;
        next();
      }
    });
  },
  function(req, res) {
    pool.getConnection(function(err, conn) {
      if (err) console.log('POOL ==> ' + err);
      var sqlRun = 'select isMail from user where user_id=\'' +
      req.data_.userID + '\'';
      conn.query(sqlRun, function(err, results) {
        if (err) console.log(err);
        if (results[0].isMail == 0) {
          console.log('Email activation success');
          sqlRun = 'update user set isMail=1 where user_id=\'' +
          req.data_.userID + '\'';
          conn.query(sqlRun, function(error, results, fields) {
            if (error) throw error;
            res.redirect('../index.html?op=0');
          });
        } else {
          console.log('Err: email had activation!');
          res.send('Err: email had activation!');
        }
        conn.release();
      });
    });
  });


// todo
//注册模块

app.post(
  '/register', [userModule.isEmailStr, userModule.isTrueUser],
  function(req, res, next) {
    console.log('User registration:');
    pool.getConnection(function(err, conn) {
      if (err) console.log('POOL ==> ' + err);
      var sqlRun = 'select user_name from user where user_email=\'' +
      req.body.user_email + '\'';
      conn.query(sqlRun, function(error, results, fields) {
        if (error) throw error;
          if (results != '') {  //邮箱已经存在
            console.log('Err: email is had!');
            res.send({state: 'failed'});
            return;
          } else {
            var sqlRun = 'select dataint from global where name=\'user_num\'';
            conn.query(sqlRun, function(err, results1, fields) {
              if (err) console.log(err);
              console.log(results1);
              var userMaxID = results1[0].dataint;  //获取UserID
              var hashSHA1 = crypto.createHash('sha1');
              hashSHA1.update(req.body.user_password);
              var sqlRun =
              'INSERT INTO `xmoj`.`user` (`user_id`, `user_name`, `user_password`, `user_email`,`user_detail`,`user_web`) VALUES (\'' +
              (userMaxID + 10000) + '\', \'' + req.body.user_name +
              '\', \'' + hashSHA1.digest('hex') + '\', \'' +
              req.body.user_email + '\', \'Nothing\', \'Nothing\')';
              conn.query(sqlRun, function(error, results, fields) {
                if (error) throw error;
                console.log('Register success!');
                res.send({state: 'success'});
              });  //写入数据库
              sqlRun =
              'CREATE TABLE `xmoj`.`' + (userMaxID + 10000) + '` ( `pid` INT NOT NULL , `code` TEXT NOT NULL , `grade` INT NOT NULL , `grade_max` INT NOT NULL , `grade_1` INT NOT NULL , `grade_2` INT NOT NULL , `grade_3` INT NOT NULL , `grade_4` INT NOT NULL , `last_time` TEXT NOT NULL , `run_time` TEXT NOT NULL ) ENGINE = InnoDB;';
              conn.query(sqlRun, function(error, results, fields) {
                if (error) throw error;
                console.log('Creat a biao success!');
              });
              var sqlRun = 'update global set dataint=\'' + (userMaxID + 1) +
              '\' where name=\'user_num\'';
              conn.query(sqlRun, function(error, results, fields) {
                if (error) throw error;
                console.log('updata userMaxID to ' + (userMaxID + 1));
              });  //更新UserID
            });
          }
          conn.release();
        });
    });
  });

//-----------------------------------------------
//发送激活邮件
app.post(
  '/mail',
  function(req, res, next) {
    console.log('send email to user: ');
    req.userSession_ = req.cookies.userSession;
    req.sign_ = req.cookies.sign;
    userModule.userVerif(1, req, function(mydata) {
      if (mydata.userID == undefined) {
        console.log(mydata);
        res.send({state: 'failed', why: mydata});
        next('route');
      } else {
        req.data_ = mydata;
        next();
      }
    });
  },
  function(req, res, next) {
    var nowtime = new Date().Format('yyyy-MM-dd-hh');
    pool.getConnection(function(err, conn) {
      if (err) console.log('POOL ==> ' + err);
      var sqlRun = 'select send_email from user where user_id=\'' +
      req.data_.userID + '\'';
      conn.query(sqlRun, function(err, results) {
        if (err) console.log(err);
        if (results[0].send_email != nowtime) {
          console.log('ok to Send email!');
          sqlRun = 'update user set send_email=\'' + nowtime +
          '\' where user_id=\'' + req.data_.userID + '\'';
          conn.query(sqlRun, function(error, results, fields) {
            if (error) throw error;
            console.log('Updata send_email!');
            next();
          });
        } else {
          console.log('Err: Send two emails in a hour.');
          userModule.makeASign(res, req, function() {
            res.send({state: 'failed', why: 'HAD_SEND'});
          });
          next('route');
        }
        conn.release();
      });
    });
  },
  function(req, res) {
    pool.getConnection(function(err, conn) {
      if (err) console.log('POOL ==> ' + err);
      var sqlRun = 'select user_email from user where user_id=\'' +
      req.data_.userID + '\'';
      conn.query(sqlRun, function(err, results, fields) {
        if (err) console.log(err);
        console.log('user_email:' + results[0].user_email);
        var keyConfig = JSON.parse(fs.readFileSync('key.json'));
        var session =
        userModule.encrypt(JSON.stringify(req.data_), keyConfig.mykey);
        var signSHA1 = crypto.createHash('sha1');
        signSHA1.update(session + keyConfig.mysign);
        var qwq = signSHA1.digest('hex');
        var mail1 = fs.readFileSync('mail1.data');
        var mail2 = fs.readFileSync('mail2.data');
        fs.writeFile(
          'test.txt', mail1 + session + '&sign=' + qwq + mail2,
          function(err) {
            if (err) console.error(err);
            const spawn = require('child_process').spawn;
            const ls = spawn('./sendMail.sh', [results[0].user_email]);
          });
        res.send({state: 'success'});
        conn.release();
      });
    });
  });
//-----------------------------------------------------------------------------------------

//-----------------------------------------------------------------------
//修改密码
app.post('/user/pwd', [userModule.appUserVerif], function(req, res) {
  console.log('Password Change: ');
  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun = 'select user_password from user where user_id=\'' +
    req.data_.userID + '\'';
    conn.query(sqlRun, function(err, results) {
      if (err) console.log(err);
      var hashSHA1 = crypto.createHash('sha1');
      hashSHA1.update(req.body.old_password);
      if (results[0].user_password == hashSHA1.digest('hex')) {
        console.log('Password is Right!');
        var nhashSHA1 = crypto.createHash('sha1');
        nhashSHA1.update(req.body.new_password);
        sqlRun = 'update user set user_password=\'' + nhashSHA1.digest('hex') +
        '\' where user_id=\'' + req.data_.userID + '\'';
        conn.query(sqlRun, function(error, results, fields) {
          if (error) throw error;
          console.log('Updata password!');
          userModule.makeASign(res, req, function() {
            res.send({state: 'success'});
          });
        });
      } else {
        console.log('Err: Password is ERR');
        userModule.makeASign(res, req, function() {
          res.send({state: 'failed', why: 'ERR_PWD'});
        });
      }
      conn.release();
    });
  });
});
//-----------------------------------------------------------------------
//修改个人信息
app.post(
  '/user/info', [userModule.appUserVerif, userModule.isTrueUser],
  function(req, res, next) {
    var re =
    /select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/i;
    if (re.test(req.body.user_detail) || re.test(req.body.user_web)) {
      res.redirect('.../index.html?op=3');
      next('route');
    } else {
      next();
    }
  },
  function(req, res) {
    console.log('Info Change: ');
    pool.getConnection(function(err, conn) {
      if (err) console.log('POOL ==> ' + err);
      var sqlRun = 'update user set user_name=\'' + req.body.user_name +
      '\', user_detail=\'' + req.body.user_detail + '\', user_web=\'' +
      req.body.user_web + '\' where user_id=\'' + req.data_.userID + '\'';
      conn.query(sqlRun, function(err, results) {
        if (err) console.log(err);
        console.log('Update user Info!');
        userModule.makeASign(res, req, function() {
          res.send({state: 'success'});
        });
      });
      conn.release();
    });
  });
//------------------------------
// problem模板引擎
app.engine('ntl', function(filePath, options, callback) {  // 定义模板引擎
  fs.readFile(filePath, function(err, content) {
    if (err) return callback(new Error(err));

    var rank_table = '<table class="table table-hover table-striped"><tr><th>名次</th><th>名字</th><th>提交时间</th><th>分数</th></tr>';
    var rank_name = options.rank_name.split(',');
    var rank_time = options.rank_time.split(',');
    var rank_grade = options.rank_grade.split(',');
    for (var i = 0; i < options.rank_count; i++) {
      rank_table += '<tr><td>' + i + '</td><td>' + rank_name[i] + '</td><td>' +
      rank_time[i] + '</td><td>' + rank_grade[i] + '</td></tr>';
    }
    rank_table += '</table>';
    var rendered =
    content.toString()
    .replace('#pid#', options.pid)
    .replace('#pTitle#', options.title)
    .replace('#pTimeLimit#', options.pTimeLimit)
    .replace('#pMemLimit#', options.pMemLimit)
    .replace('#pMan#', options.pMan)
    .replace('#pManEmail#', options.pManEmail)
    .replace('#jGrade#', options.jGrade)
    .replace('#jGrade_p#', options.jGrade)
    .replace('#jLtime#', options.jLtime)
    .replace('#jRtime#', options.jRtime)
    .replace('#jMGrade#', options.jMGrade)
    .replace('#jGrade1#', options.jGrade1 + ' / ' + options.jGrade1m)
    .replace('#jGrade2#', options.jGrade2 + ' / ' + options.jGrade2m)
    .replace('#jGrade3#', options.jGrade3 + ' / ' + options.jGrade3m)
    .replace('#jGrade4#', options.jGrade4 + ' / ' + options.jGrade4m)
    .replace('#rank#', rank_table)
    .replace('#code#', options.code)
    .replace('#jGrade_c#',options.jGrade_c)
    .replace('#jGrade1_c#',options.jGrade1_c)
    .replace('#jGrade1_g#',options.jGrade1_g)
    .replace('#jGrade2_c#',options.jGrade2_c)
    .replace('#jGrade2_g#',options.jGrade2_g)
    .replace('#jGrade3_c#',options.jGrade3_c)
    .replace('#jGrade3_g#',options.jGrade3_g)
    .replace('#jGrade4_c#',options.jGrade4_c)
    .replace('#jGrade4_g#',options.jGrade4_g);

    return callback(null, rendered);
  })
});
app.set('views', './views');    // 指定视图所在的位置
app.set('view engine', 'ntl');  // 注册模板引擎
//-----------------------------------------------------------------------
//问题详情
app.get('/problem/:id',function(req, res, next){
  console.log('Get a Problem: ');
  var pattern = /^[0-9]{1,4}$/;
  if(pattern.test(req.params.id)){
    next();
  }else{
    console.log('Not a id ' + req.params.id);
    next('route');
  }
},[userModule.appUserVerif],function(req, res, next){
  console.log(req.params.id);
  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
    'SELECT `title`, `time_limit`, `mem_limit`, `author`, `email`, `hard`, `course`, `grade_1`, `grade_2`, `grade_3`, `grade_4`, `rank_count`, `rank_name`, `rank_time`, `rank_grade` FROM `problem` WHERE `pid` = ' +
    req.params.id;
    conn.query(sqlRun, function(err, results) {
      if(results.length === 0){
        console.log('No a problem');
        userModule.makeASign(res,req,function () {
          res.redirect('../../problem.html');
        });
        conn.release();
        next('route');
      }else{
        req.problem_detail = results[0];
        next();
      }
    });
  });
},
function (req,res,next) {
  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun = 'SELECT `code`, `grade`, `grade_max`, `grade_1`, `grade_2`, `grade_3`, `grade_4`, `last_time`, `run_time` FROM `' + req.data_.userID + '` WHERE pid=' + req.params.id;
    conn.query(sqlRun, function(err, results) {
      if(results.length === 0){
        userModule.makeASign(res,req,function () {
          console.log('No do');
          res.render('problem', {
            title: req.problem_detail.title,
            pid: req.params.id,
            pTimeLimit: req.problem_detail.time_limit,
            pMemLimit: req.problem_detail.mem_limit,
            pMan: req.problem_detail.author,
            pManEmail: req.problem_detail.email,
            rank_count:req.problem_detail.rank_count,
            rank_name:req.problem_detail.rank_name,
            rank_time:req.problem_detail.rank_time,
            rank_grade:req.problem_detail.rank_grade,
            jGrade: '0',jGrade_c:'B22222',
            jLtime: '',
            jRtime: '',
            jMGrade: '0',
            jGrade1:'0',jGrade1m:req.problem_detail.grade_1,jGrade1_c:'B22222',jGrade1_g:'remove',
            jGrade2:'0',jGrade2m:req.problem_detail.grade_2,jGrade2_c:'B22222',jGrade2_g:'remove',
            jGrade3:'0',jGrade3m:req.problem_detail.grade_3,jGrade3_c:'B22222',jGrade3_g:'remove',
            jGrade4:'0',jGrade4m:req.problem_detail.grade_4,jGrade4_c:'B22222',jGrade4_g:'remove',
            code:''
          });
        });
        conn.release();
      }else{
        userModule.makeASign(res,req,function () {
          console.log('yes');
          var isGood1 = results[0].grade_1 == req.problem_detail.grade_1;
          var isGood2 = results[0].grade_2 == req.problem_detail.grade_2;
          var isGood3 = results[0].grade_3 == req.problem_detail.grade_3;
          var isGood4 = results[0].grade_4 == req.problem_detail.grade_4;
          res.render('problem', {
            title: req.problem_detail.title,
            pid: req.params.id,
            pTimeLimit: req.problem_detail.time_limit,
            pMemLimit: req.problem_detail.mem_limit,
            pMan: req.problem_detail.author,
            pManEmail: req.problem_detail.email,
            rank_count:req.problem_detail.rank_count,
            rank_name:req.problem_detail.rank_name,
            rank_time:req.problem_detail.rank_time,
            rank_grade:req.problem_detail.rank_grade,
            jGrade: results[0].grade,jGrade_c:(results[0].grade == 100)?'228B22':'B22222',
            jLtime: results[0].last_time,
            jRtime: results[0].run_time,
            jMGrade:results[0].grade_max,
            jGrade1:results[0].grade_1,jGrade1m:req.problem_detail.grade_1,
            jGrade1_c:isGood1?'228B22':'B22222',jGrade1_g:isGood1?'ok':'remove',
            jGrade2:results[0].grade_2,jGrade2m:req.problem_detail.grade_2,
            jGrade2_c:isGood2?'228B22':'B22222',jGrade2_g:isGood2?'ok':'remove',
            jGrade3:results[0].grade_3,jGrade3m:req.problem_detail.grade_3,
            jGrade3_c:isGood3?'228B22':'B22222',jGrade3_g:isGood3?'ok':'remove',
            jGrade4:results[0].grade_4,jGrade4m:req.problem_detail.grade_4,
            jGrade4_c:isGood4?'228B22':'B22222',jGrade4_g:isGood4?'ok':'remove',
            code:results[0].code
          });
        });
        conn.release();
      }
    });
  });
});

app.post('/getPlist',function(req, res, next){
  console.log('get Problem list: ');
  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun = 'SELECT `pid`, `class`, `title`, `hard`, `course` FROM `problem` WHERE 1';
    conn.query(sqlRun, function(err, results) {
      var arrId = new Array;
      var arrCourse = new Array;
      var arrClass = new Array;
      var arrTitle = new Array;
      var arrHard = new Array;

      for (var i = 1; i <= results.length; i++) {
        arrId[i] = results[i - 1].pid;
        arrCourse[i] = results[i - 1].course;
        arrClass[i] = results[i - 1].class;
        arrTitle[i] = results[i - 1].title;
        arrHard[i] = results[i - 1].hard;
      }

      var resdata = {
        pCount: results.length,
        pId: arrId,
        pName: arrTitle,
        pCourse: arrCourse,
        pClass: arrClass,
        pHard:arrHard
      }
      res.send(resdata);
      conn.release();
    });
  });

});


//-------------------------------------------------
//退出登陆
app.get('/layout',function(req, res, next){
  res.cookie('userSession', '');
  res.cookie('sign', '');
  res.cookie('isLogin', '0');
  res.redirect('../index.html?op=0');
});
//--------------------------------------------------------------------
//监听30002端口
var server = app.listen(30002, '127.0.0.1', function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at https://%s:%s', host, port);
});
//------------------------------------------------------------------------------
