const crypto = require('crypto');
const fs = require('fs');
var keyConfig = JSON.parse(fs.readFileSync('key.json'));
exports.keyConfig = keyConfig;
var userModule = {

  /*
  SHA1加密调用方法：
  var hashSHA1 = crypto.createHash('sha1');
  hashSHA1.update(input);
  output = hashSHA1.digest('hex')
  */

  // use secret to encrypt string
  encrypt: function(str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
  },  //加密数据

  // use secret to decrypt string
  decrypt: function(str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },  //解密数据

  /*
  aes192加密调用方法：
  var output = encrypt(JSON.stringify(input),key);
  var newinput = JSON.parse(decrypt(output,key));
  */
  comptime: function(beginTime, endTime) {
    var beginTimes = beginTime.substring(0, 10).split('-');
    var endTimes = endTime.substring(0, 10).split('-');
    beginTime = beginTimes[1] + '-' + beginTimes[2] + '-' + beginTimes[0] +
    ' ' + beginTime.substring(10, 19);
    endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' +
    endTime.substring(10, 19);
    var a = (Date.parse(endTime) - Date.parse(beginTime)) / 3600 / 1000;
    return a;
  },  //进行时间比较

  userVerif: function(fxk, req, callback) {
    console.log('User Verif: ');
    userSession = req.cookies.userSession;
    sign = req.cookies.sign;
    if (fxk == 1){
      console.log('Ignore Email');
      userSession = req.userSession_;
      sign = req.sign_;
    }
    if (userSession == undefined || sign == undefined) {
      console.log('Err: NO Sign');
      callback('ILLEGAL_SIGN');
      return;
    }
    var signSHA1 = crypto.createHash('sha1');
    signSHA1.update(userSession + keyConfig.mysign);
    var nowSHA1 = signSHA1.digest('hex');
    if (nowSHA1 != sign) {
      console.log('Err: ILLEGAL_SIGN');
      callback('ILLEGAL_SIGN');
      return;
      }  //验证签名

      var allData = JSON.parse(userModule.decrypt(userSession, keyConfig.mykey));
      console.log('用户ID：' + allData.userID);
      var nowTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
      if (userModule.comptime(allData.lastDate, nowTime) > 3) {
        console.log('Err: user Time out');
        callback('TIME_OUT');
        return;
      }
      allData.lastDate = nowTime;
      var newToken = Math.round(Math.random() * 10000000);
      userModule.getToken(allData.userID, newToken, function(oldToken, isMail) {
        if (oldToken != allData.token) {
          console.log('Err: Illegal Token');
          callback('ILLEGAL_TOKEN');
        } else {
          if (isMail == 0 && fxk == 0) {
            console.log('Email is no active');
            callback('NO_MAIL');
          } else {
            allData.token = newToken;
            callback(allData);
          }
        }
      });
  },  //进行用户认证

  getToken: function(userID, newToken, callback) {
    var pool = require('./run.js').pool;
    pool.getConnection(function(err, conn) {
      if (err) console.log('POOL ==> ' + err);
      var sqlRun = 'select user_token, isMail from user where user_id=\'' +
      userID + '\'';
      conn.query(sqlRun, function(err, results) {  //获取用户token
        if (err) console.log(err);
        var oldToken = results[0].user_token;
        var isMail = results[0].isMail;
        sqlRun = 'update user set user_token=\'' + newToken +
        '\' where user_id=\'' + userID + '\'';
        conn.query(sqlRun, function(error, results, fields) {  //更新用户tokem
          if (error) throw error;
          conn.release();
          callback(oldToken, isMail);
        });
      });
    });
  },  //从数据库读取用户Token


  appUserVerif: function(req, res, next) {
    userModule.userVerif(0, req, function(mydata) {
      if (mydata.userID == undefined) {
        console.log('Illegal access');
        res.send({state: 'failed', why: mydata});
        next('route');
      } else {
        req.data_ = mydata;
        next();
      }
    })
  },  //进行用户认证

  makeASign: function(res, req, callback) {
    var sessionXXX = userModule.encrypt(JSON.stringify(req.data_), keyConfig.mykey);
    var signSHA1 = crypto.createHash('sha1');
    signSHA1.update(sessionXXX + keyConfig.mysign);
    var qwq = signSHA1.digest('hex');
    res.clearCookie('userSession');
    res.clearCookie('sign');
    res.cookie(
      'userSession', sessionXXX,
      {expires: new Date(Date.now() + 10000000), httpOnly: true});
    res.cookie(
      'sign', qwq,
      {expires: new Date(Date.now() + 10000000), httpOnly: true});
    res.cookie('isLogin', 1);
    callback();
  },

  isEmailStr: function(req, res, next) {
    var pattern =
    /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    var strEmail = pattern.test(req.body.user_email);
    if (!strEmail) {
      console.log('Illegal Email');
      res.send({state: 'failed', why: 'NOT_EMAIL'});
      next('route');
    } else {
      next();
    }
  },

  isTrueUser: function(req, res, next) {
    var pattern2 = /^[a-zA-z0-9\_\.]{3,20}$/;
    var strname = pattern2.test(req.body.user_name);
    if (strname) {
      next();
    } else {
      res.send({state: 'failed', why: 'NOT_USER'});
      next('route');
    }
  }
  //对Session进行加密签名并发送到客户端

  //-----------------------------------------------------------------------------------
  /*调用方式
  app.post('/submit', [appUserVerif], function(req, res) {

    ...
    code
    ...

    makeASign(res, req,  function(session, sign) {
      res.send(response);
    });
  });

  */
  //-----------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------
};
module.exports = userModule;
