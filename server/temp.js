app.post('/user/pwd', [userModule.appUserVerif], function(req, res) {
  console.log('Password Change: ');
  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
    'select user_password from user where user_id=\'' + req.data_.userID + '\'';
    conn.query(sqlRun, function(err, results) {
      if (err) console.log(err);
      var hashSHA1 = crypto.createHash('sha1');
      hashSHA1.update(req.body.old_password);
      if (results[0].user_password == hashSHA1.digest('hex')) {
        console.log('Password is Right!');
        hashSHA1.update(req.body.new_password);
        sqlRun = 'update user set user_password=\''+ hashSHA1.digest('hex') + '\' where user_id=\'' +
        req.data_.userID + '\'';
        conn.query(sqlRun, function(error, results, fields){
          if (error) throw error;
          console.log('Updata password!');
          res.send({state:'success', why:'ERR_PWD'});
        });
      } else {
        console.log('Err: Password is ERR');
        res.send({state:'failed', why:'ERR_PWD'});
      }
      conn.release();
    });
  });
});

app.post('/user/info', [userModule.appUserVerif, userModule.isTrueUser], function(req, res) {
  console.log('Info Change: ');
  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
    'update user set user_name=\'' + req.body.user_name + '\', user_detail=\'' + req.body.user_detail + '\', user_web=\'' + req.body.user_web + '\' where user_id=\'' + req.data_.userID + '\'';
    conn.query(sqlRun, function(err, results) {
      if (err) console.log(err);
        console.log('Update user Info!');
      }
      conn.release();
    });
  });
});


//email limit
function (req, res, next) {
   var nowtime = new Date().Format('yyyy-MM-dd-hh');
   pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
    'select send_email from user where user_id=\'' + req.data_.userID + '\'';
    conn.query(sqlRun, function(err, results) {
      if (err) console.log(err);
      if (results[0].send_email != nowtime) {
        console.log('ok to Send email!');
        sqlRun = 'update user set send_email=\''+ nowtime + '\' where user_id=\'' +
        req.data_.userID + '\'';
        conn.query(sqlRun, function(error, results, fields){
          if (error) throw error;
          console.log('Updata send_email!');
          next();
        });
      } else {
        console.log('Err: Send two emails in a hour.');
        res.send({state:'failed', why:'HAD_SEND'});
      	next('route');
      }
      conn.release();
    });
  });
}

//login has BUG about req.data_