const db = require('./mongo.js');
const Verify = require('./sdk/verify.js'); //violet
const fs = require('fs'); //文件处理
var judgeSchema = db.xmoj.Schema({
  jid: Number, // 评测id
  pid: Number, // 问题id
  uid: Number, // 用户id
  uName: String, // 用户名
  pName: String, // 问题名字
  grade: Number, // 总成绩
  lang: String, // 编译语言
  details: [{ // 详细评测项目
    name: String,
    grade: Number,
    text: String,
  }],
  runTime: Number, // 运行时间
  memoryUsage: Number, // 内存占用
  judging: Boolean, // 正在评测
  submitTime: Date, // 提交时间
}, { collection: 'judge' });
var judgeDB = db.xmoj.model('judge', judgeSchema);


exports.checkJudge = (req, res, next) => { //查看数据库是否有记录或者judging
  judgeDB.count({}, (count) => {
    db.insertDate(judgeModule, {
      jid: count,
      pid: res.locals.pId,
      uid: Verify.getUserId(res),

    });
  });

  var sqlCmd = 'SELECT `judging`, `lastTime`, `judgeTimes` FROM `judge` WHERE `uid`=? && `pid`=?';
  var data = [res.locals.data.userID, res.locals.pId];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    var nowTime = new Date().Format();
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
};


exports.judging = (req, res, next) => { //调用judge子进程
  console.log('write to file: file/' + res.locals.data.userID + '_' + res.locals.pId + '.c'); //存文件
  fs.writeFile('file/' + res.locals.data.userID + '_' + res.locals.pId + '.c', req.body.code, (err) => {
    if (err) return console.error(err);
    console.log('toJudge...');
    var judgeModule = spawn('./judge.sh', [res.locals.data.userID, res.locals.pId, res.locals.standCase]);
  });
  console.log('judging success!');
  res.send({ state: 'success' });
};

exports.findUserGrade = (req, res, next) => { //查询该用户是否存在这个记录
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
};

exports.returnUserGrade = (req, res, next) => { //返回结果
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
};



exports.findJudgeData = (req, res, next) => { //返回问题详情
  var sqlCmd = 'SELECT * FROM `judge` WHERE `pid`=? && `uid`=?';
  var data = [req.params.id, res.locals.data.userID];
  sqlModule.query(sqlCmd, data, (vals, isNull) => {
    res.locals.isDone = !isNull;
    console.log(res.locals.isDone);
    if (!isNull) res.locals.userData = vals[0];
    next();
  });
};