
//基本模块
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const sLine = '-----------------------------------------------';
//------------------------------------------------------------------------------

// post模块
const urlencodedParser = bodyParser.urlencoded({extended: false})
app.use(express.static('public'));


//------------------------------------------------------------------------------
//加密模块
const crypto = require('crypto');

/*
SHA1加密调用方法：
var hashSHA1 = crypto.createHash('sha1');
hashSHA1.update(input);
output = hashSHA1.digest('hex')
*/

// use secret to encrypt string
function encrypt(str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
  }

// use secret to decrypt string
function decrypt(str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

/*
aes192加密调用方法：
var output = encrypt(JSON.stringify(input),key);
var newinput = JSON.parse(decrypt(output,key));
*/

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

function comptime(beginTime, endTime) {
  var beginTimes = beginTime.substring(0, 10).split('-');
  var endTimes = endTime.substring(0, 10).split('-');
  beginTime = beginTimes[1] + '-' + beginTimes[2] + '-' + beginTimes[0] + ' ' +
      beginTime.substring(10, 19);
  endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' +
      endTime.substring(10, 19);
  var a = (Date.parse(endTime) - Date.parse(beginTime)) / 3600 / 1000;
  return a;
  }

//--------------------------------------------------------------------------------------

//用户认证模块
const mykey = 'xiuxiuDALAO';
const mysign = 'DALAOxiuxiu'
function userVerif(fxk, userSession, sign, callback) {
  console.log(sLine);
  var t_now = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log(t_now);
  console.log('用户认证开始');
  if (fxk == 1) console.log('特殊模式：忽略邮箱认证');
  if (userSession == undefined || sign == undefined) {
    console.log('凭据为空');
    callback('ILLEGAL_SIGN');
    return;
    }
  var signSHA1 = crypto.createHash('sha1');
  signSHA1.update(userSession + mysign);
  var nowSHA1 = signSHA1.digest('hex');
  if (nowSHA1 != sign) {
    console.log('签名认证失败');
    callback('ILLEGAL_SIGN');
    return;
    }  //验证签名

  var allData = JSON.parse(decrypt(userSession, mykey));
  console.log('用户ID：' + allData.userID);
  var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
  if (comptime(allData.lastDate, nowTime) > 3) {
    console.log('登陆超时');
    callback('TIME_OUT');
    return;
  }
  allData.lastDate = nowTime;

  var newToken = Math.round(Math.random() * 10000000);

  getToken(allData.userID, newToken, function(oldToken, isMail) {
    console.log(oldToken);
    console.log(allData.token);
    if (oldToken != allData.token) {
      console.log('与数据库token不匹配');
      callback('ILLEGAL_TOKEN');
    } else {
      if (isMail == 0 && fxk == 0) {
        console.log('邮箱没有激活');
        callback('NO_MAIL');
      } else {
        allData.token = newToken;
        callback(allData);
      }
    }
  });
  }


function getToken(userID, newToken, callback) {
  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
        'select user_token, isMail from user where user_id=\'' + userID + '\'';
    conn.query(sqlRun, function(err, results) {  //获取用户token
      if (err) console.log(err);
      var oldToken = results[0].user_token;
      var isMail = results[0].isMail;
      console.log('从数据库读取TOKEN：', oldToken);
      sqlRun = 'update user set user_token=\'' + newToken +
          '\' where user_id=\'' + userID + '\'';
      conn.query(sqlRun, function(error, results, fields) {  //更新用户tokem
        if (error) throw error;
        console.log('更新TOKEN为 ' + newToken);
        conn.release();
        callback(oldToken, isMail);
      });
    });
  });
  }

//-----------------------------------------------------------------------------------
/*调用方式
var session =
    '7c89c5356a60f14f90e59811d253b89942279ca838f6b878a3a4afb08c846cd3c3b840299805c61225ea4b02a14f62c120cb6891af4d9c427232c1f1c2f09a534d28cd40e0b32affc412b6ae6a22b556';
var qwq = 'ae39517251a2fc929ac98542e6e0c592fc25fbce';

userVerif(session, qwq, function(mydata) {
  if (mydata.userID == undefined) {

  } else {
    console.log(mydata);
    session = encrypt(JSON.stringify(mydata), mykey);
    console.log(session);
    var signSHA1 = crypto.createHash('sha1');
    signSHA1.update(session + mysign);
    qwq = signSHA1.digest('hex');
    console.log(qwq);
  }
});*/
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------



//********************************************************************************************************************************
//上面是各种函数
//********************************************************************************************************************************
//下面是各种监听
//********************************************************************************************************************************



//数据库模块
var pidindex = 0;
var mysql = require('mysql');
var mysql_file = 'mysql.json';
var mysqlConfig = JSON.parse(fs.readFileSync(mysql_file));  //加载配置文件
var pool = mysql.createPool(mysqlConfig);                   //创建进程池

pool.getConnection(function(err, conn) {
  if (err) console.log('POOL ==> ' + err);
  var sqlRun = 'select dataint from global where name=\'pid\'';

  conn.query(sqlRun, function(err, results) {
    if (err) console.log(err);
    console.log('从数据库读取PID： ', results[0].dataint);
    pidindex = results[0].dataint;
    conn.release();
  });
});

//------------------------------------------------------------------------------

//状态提示
app.get('/submit', function(req, res) {
  res.send('File mod is running!');
  console.log('file ok!');
});
//------------------------------------------------------------------------------

//获取pid
app.post('/submit', urlencodedParser, function(req, res) {
  userVerif(0, req.body.userSession, req.body.sign, function(mydata) {
    console.log(sLine);
  var t_now = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log(t_now);
    console.log('题目评测开始');
    if (mydata.userID == undefined) {
      console.log(mydata);
      console.log('认证失败');
      res.send({state: 'failed', why: mydata});
    } else {
      pidindex++;
      response1 = {pid: pidindex, code: req.body.code};
      console.log(response1);
      console.log(
          'write to file: ' +
          'file/' + response1.pid + '.c');
      fs.writeFile(
          'file/' + response1.pid + '.c', response1.code, function(err) {
            if (err) {
              return console.error(err);
            }
            console.log('success save!');
          });  //写入文件

      pool.getConnection(function(err, conn) {
        if (err) console.log('POOL ==> ' + err);
        var sqlRun = 'update global set dataint=\'' + response1.pid +
            '\' where name=\'pid\'';
        conn.query(sqlRun, function(error, results, fields) {
          if (error) throw error;
          console.log('updata pid to' + response1.pid);
          conn.release();
        });
      });  //更新pid状态

      //------------------------------------------------------------------------------

      // todo
      //调用评测系统



      //------------------------------------------------------------------------------

      var sessionXXX = encrypt(JSON.stringify(mydata), mykey);
      var signSHA1 = crypto.createHash('sha1');
      signSHA1.update(sessionXXX + mysign);
      var qwq = signSHA1.digest('hex');
      response = {
        state: 'success',
        pid: response1.pid,
        grade: '100',
        compiledtest: '40',
        stardtest: '60',
        userSession: sessionXXX,
        sign: qwq
      };
      console.log(response);
      res.send(response);
    }
  });
});
//------------------------------------------------------------------------------

//提交代码

//-----------------

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


function isEmailStr(str) {
  var pattern =
      /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  var strEmail = pattern.test(str);
  if (!strEmail) {
    return 0;
  } else {
    return 1;
  }
}

app.post('/login', urlencodedParser, function(req, res) {
  console.log(sLine);
  var t_now = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log(t_now);
  console.log('用户登陆:');
  if (isEmailStr(req.body.user_email)) {
    pool.getConnection(function(err, conn) {
      if (err) console.log('POOL ==> ' + err);
      var sqlRun =
          'select user_name, user_password, user_detail, user_web, user_id, isMail from user where user_email=\'' +
          req.body.user_email + '\'';
      conn.query(sqlRun, function(error, results, fields) {
        if (error) throw error;
        console.log('读取用户数据');
        console.log(results);
        var hashSHA1 = crypto.createHash('sha1');
        hashSHA1.update(req.body.user_password);
        if (results != '' &&
            results[0].user_password == hashSHA1.digest('hex')) {  //密码正确
          console.log('认证成功');
          var newToken = Math.round(Math.random() * 10000000);
          getToken(results[0].user_id, newToken, function(oldToken) {
            var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
            mydata = {
              userID: results[0].user_id,
              token: newToken,
              lastDate: nowTime
            }
            var sessionXXX = encrypt(JSON.stringify(mydata), mykey);
            var signSHA1 = crypto.createHash('sha1');
            signSHA1.update(sessionXXX + mysign);
            qwq = signSHA1.digest('hex');
            response = {
              state: 'success',
              name: results[0].user_name,
              detail: results[0].user_detail,
              web: results[0].user_web,
              isMail: results[0].isMail,
              userSession: sessionXXX,
              sign: qwq
            };
            res.send(response);
          });
        } else {  //密码错误
          console.log('密码或用户名错误');
          response = {state: 'failed', why: 'ERROR_PASSWORD'};
          res.send(response);
        }
        conn.release();
      });
    });
  } else {
    console.log('非法POST请求');
    res.send({state: 'failed', why: 'NOT_EMAIL'});
  }
});
//邮箱验证系统
app.get('/login', function(req, res) {
  console.log(sLine);
  var t_now = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log(t_now);
  console.log('邮件认证:');
  if (req.query.userSession != undefined && req.query.sign != undefined) {
    userVerif(1, req.query.userSession, req.query.sign, function(mydata) {
      if (mydata.userID == undefined) {
        console.log('非法请求！');
        res.send('非法请求！');
      } else {
        pool.getConnection(function(err, conn) {
          if (err) console.log('POOL ==> ' + err);
          var sqlRun =
              'select isMail from user where user_id=\'' + mydata.userID + '\'';
          conn.query(sqlRun, function(err, results) {
            if (err) console.log(err);
            if (results[0].isMail == 0) {
              console.log('邮箱激活成功');
              sqlRun = 'update user set isMail=1 where user_id=\'' +
                  mydata.userID + '\'';
              conn.query(sqlRun, function(error, results, fields) {
                if (error) throw error;
                session = encrypt(JSON.stringify(mydata), mykey);
                var signSHA1 = crypto.createHash('sha1');
                signSHA1.update(session + mysign);
                qwq = signSHA1.digest('hex');
                res.redirect('../index.html?op=0');
              });
            } else {
              console.log('邮箱已激活');
              res.send('邮箱已激活');
            }
            conn.release();
          });
        });
      }
    });
  } else {
    console.log('无法读取参数');
    res.send('未知错误！');
  }
});  //状态显示

// INSERT INTO `xmoj`.`user` (`user_id`, `user_name`, `user_password`,
// `user_detail`) VALUES ('10000', 'zhenly', '*********', 'it is zhenly
// account!');


// todo
//注册模块
function isTrueUser(email, name) {
  var isEmail = isEmailStr(email);
  var pattern2 = /^[a-zA-z0-9\_\.]{3,20}$/;
  var strname = pattern2.test(name);
  if (strname && isEmail) {
    return 1;
  } else {
    return 0;
  }
}


app.post('/register', urlencodedParser, function(req, res) {
  console.log(sLine);
  var t_now = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log(t_now);
  console.log('用户注册:');
  if (isTrueUser(req.body.user_email, req.body.user_name)) {
    pool.getConnection(function(err, conn) {
      if (err) console.log('POOL ==> ' + err);
      var sqlRun = 'select user_name from user where user_email=\'' +
          req.body.user_email + '\'';
      conn.query(sqlRun, function(error, results, fields) {
        if (error) throw error;
        if (results != '') {  //邮箱已经存在
          console.log('邮箱已经存在');
          res.send({state: 'failed'});
          return;
        } else {
          var sqlRun = 'select dataint from global where name=\'user_num\'';
          conn.query(sqlRun, function(err, results1, fields) {
            if (err) console.log(err);
            console.log('数据库操作');
            console.log(results1);
            var userMaxID = results1[0].dataint;  //获取UserID
            var hashSHA1 = crypto.createHash('sha1');
            hashSHA1.update(req.body.user_password);
            var sqlRun =
                'INSERT INTO `xmoj`.`user` (`user_id`, `user_name`, `user_password`, `user_email`,`user_detail`,`user_web`) VALUES (\'' +
                (userMaxID + 10000) + '\', \'' + req.body.user_name + '\', \'' +
                hashSHA1.digest('hex') + '\', \'' + req.body.user_email +
                '\', \'Nothing\', \'Nothing\')';
            conn.query(sqlRun, function(error, results, fields) {
              if (error) throw error;
              console.log('注册成功');
              res.send({state: 'success'});
            });  //写入数据库
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
  } else {
    res.send({state: 'failed', why: 'NOT_EMAIL'});
  }
});


app.post('/mail', urlencodedParser, function(req, res) {
  console.log(sLine);
  var t_now = new Date().Format('yyyy-MM-dd hh:mm:ss');
  console.log(t_now);
  console.log('发送激活邮件');
  if (req.body.userSession == null || req.body.sign == null) {
    res.send({state: 'failed', why: 'ILLEGAL_SIGN'});
  } else {
    userVerif(1, req.body.userSession, req.body.sign, function(mydata) {
      if (mydata.userID == undefined) {
        res.send({state: 'failed', why: mydata});
      } else {
        pool.getConnection(function(err, conn) {
          if (err) console.log('POOL ==> ' + err);
          var sqlRun = 'select user_email from user where user_id=\'' +
              mydata.userID + '\'';
          conn.query(sqlRun, function(err, results, fields) {
            if (err) console.log(err);
            console.log('读取用户邮箱' + results[0].user_email);
            session = encrypt(JSON.stringify(mydata), mykey);
            var signSHA1 = crypto.createHash('sha1');
            signSHA1.update(session + mysign);
            qwq = signSHA1.digest('hex');
            var textArr = {
              text:
                  '请点击下面的连接完成邮箱激活\nhttps://xmatrix.ml/api/login?userSession=',
              session2: session,
              sign: qwq
            };
            fs.writeFile(
                'test.txt',
                textArr.text + textArr.session2 + '&sign=' + textArr.sign,
                function(err) {
                  if (err) console.error(err);
                  const spawn = require('child_process').spawn;
                  const ls = spawn('./sendMail.sh', [results[0].user_email]);
                });
            res.send({state: 'success'});
            conn.release();
          });
        });
      }
    });
  }
});
//-----------------------------------------------------------------------------------------


//监听30002端口
var server = app.listen(30002, '127.0.0.1', function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at https://%s:%s', host, port);
});
//------------------------------------------------------------------------------
