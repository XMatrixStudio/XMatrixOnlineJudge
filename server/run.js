
//基本模块
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//------------------------------------------------------------------------------

// post模块
var urlencodedParser = bodyParser.urlencoded({extended: false})
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

//数据库模块
var pidindex = 0;
var mysql = require('mysql');
var mysql_fs = require('fs');
var mysql_file = 'mysql.json';
var mysqlConfig = JSON.parse(mysql_fs.readFileSync(mysql_file));  //加载配置文件
var pool = mysql.createPool(mysqlConfig);  //创建进程池

pool.getConnection(function(err, conn) {
  if (err) console.log('POOL ==> ' + err);
  var sqlRun = 'select dataint from global where name=\'pid\'';

  conn.query(sqlRun, function(err, results) {
    if (err) console.log(err);
    console.log('The pid is: ', results[0].dataint);
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
app.post('/submit/getpid', urlencodedParser, function(req, res) {
  pidindex++;
  response = {pid: pidindex, user: req.body.user};
  console.log(response);
  res.send(response);
});
//------------------------------------------------------------------------------

//提交代码
app.post('/submit', urlencodedParser, function(req, res) {
  response1 = {pid: req.body.pid, code: req.body.code};
  console.log(response1);

  var fs = require('fs');

  console.log(
    'write to file: ' +
    'file/' + response1.pid + '.c');
  fs.writeFile('file/' + response1.pid + '.c', response1.code, function(err) {
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
  response2 =
  {pid: response1.pid, grade: '100', compiledtest: '40', stardtest: '60'};

  setTimeout(function() {
    res.send(response2);
  }, 1000);
});  //发送成绩回应
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
app.post('/login', urlencodedParser, function(req, res) {

  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
    'select user_name, user_password, user_detail, user_web from user where user_email=\'' +
    req.body.user_email + '\'';
    conn.query(sqlRun, function(error, results, fields) {
      if (error) throw error;
      console.log(req.body);
      console.log(results);
      var hashSHA1 = crypto.createHash('sha1');
      hashSHA1.update(req.body.user_password);
      if (results != '' &&
          results[0].user_password == hashSHA1.digest('hex')) {  //密码正确
        response = {
          state: 'success',
          name: results[0].user_name,
          detail: results[0].user_detail,
          web: results[0].user_web
        };
        res.send(response);
        console.log(response);
      } else {  //密码错误
        response = {state: 'failed'};
        res.send(response);
        console.log(response);
      }
      conn.release();
    });
  });
});

app.get('/login', function(req, res) {
  res.send('Login mod is running!');
  console.log('login ok!');
});  //状态显示

// INSERT INTO `xmoj`.`user` (`user_id`, `user_name`, `user_password`,
// `user_detail`) VALUES ('10000', 'zhenly', '*********', 'it is zhenly
// account!');


// todo
//注册模块



app.post('/register', urlencodedParser, function(req, res) {

  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun = 'select user_name from user where user_email=\'' +
    req.body.user_email + '\'';
    conn.query(sqlRun, function(error, results, fields) {
      if (error) throw error;
      console.log(results);
      if (results != '') {  //邮箱已经存在
        console.log('had');
        res.send({state: 'failed'});
        return;
      } else {
        var sqlRun = 'select dataint from global where name=\'user_num\'';
        conn.query(sqlRun, function(err, results1, fields) {
          console.log(results1);
          if (err) console.log(err);
          console.log('The userMaxID is: ', results1[0].dataint);
          var userMaxID = results1[0].dataint;//获取UserID
          var hashSHA1 = crypto.createHash('sha1');
          hashSHA1.update(req.body.user_password);
          var sqlRun =
          'INSERT INTO `xmoj`.`user` (`user_id`, `user_name`, `user_password`, `user_email`,`user_detail`,`user_web`) VALUES (\'' +
          (userMaxID + 10000) + '\', \'' + req.body.user_name + '\', \'' +
          hashSHA1.digest('hex') + '\', \'' + req.body.user_email +
          '\', \'Nothing\', \'Nothing\')';
          conn.query(sqlRun, function(error, results, fields) {
            if (error) throw error;
            res.send({state: 'success'});
          });//写入数据库
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
//-----------------------------------------------------------------------------------------


//监听30002端口
var server = app.listen(30002, '127.0.0.1', function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at https://%s:%s', host, port);
});
//------------------------------------------------------------------------------
