const db = require('./mongo.js');
const Verify = require('./sdk/verify.js'); //violet
const User = require('./user.js'); //violet
const fs = require('fs'); //文件处理
var judgeSchema = db.xmoj.Schema({
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

var dealEscape = function(str) {
  return str.toString().replace(/\\/g, '\\\\').replace(/\'/g, '\\\'');
}

exports.newJudge = (req, res, next) => { //查看数据库是否有记录或者judging
  var gradeDetails = res.locals.problemData.test;
  for (var i in gradeDetails) {
    gradeDetails[i].grade = 0;
    gradeDetails[i].text = '';
  }
  db.insertDate(judgeDB, {
    pid: res.locals.pId,
    uid: Verify.getUserId(),
    uName: Verify.getUserName(),
    pName: res.locals.problemData.title,
    grade: 0,
    lang: req.body.lang,
    details: gradeDetails,
    runTime: 9999,
    memoryUsage: 9999,
    judging: true,
    submitTime: new Date(),
  }, (val) => {
    res.locals.problemData = val;
  });
};


exports.judging = (req, res, next) => { //调用judge子进程
  console.log('write to file: file/' + res.locals.problemData._id + '.c'); //存文件
  fs.writeFile('file/' + res.locals.problemData._id + '.c', req.body.code, (err) => {
    if (err) return console.error(err);
    console.log('toJudge...');
    var judgeModule = spawn('./judge.sh', [res.locals.problemData._id]);
  });
  console.log('judging success!');
  res.send({ state: 'success' });
};

exports.findUserGrade = (req, res, next) => { //查询该用户是否存在这个记录
  var problemData = res.locals.userData.problemData;
  for (var i in problemData) {
    if (problemData[i].pId == res.locals.pId) {
      res.locals.userProblem = problemData[i];
      next();
    }
  }
  console.log('user no do it.');
  res.send({ state: 'failed', why: 'NO_DO' });
  next('route');
};

exports.returnUserGrade = (req, res, next) => { //返回结果
  judgeDB.findById(res.locals.userProblem.lastJudge, (err, val) => {
    if (val.judging) {
      console.log('JUDGING'); //在评测中
      res.send({ state: 'failed', why: 'JUDGING' });
      next('route');
    } else {
      console.log('success'); //评测完毕
      res.send({
        state: 'success',
        grade: val.grade,
        gradeMax: val.grade > res.locals.userData.grade ? val.grade : res.locals.userData.grade,
        submitCounts: res.locals.userData.submitCounts,
        detail: val.detail,
        lastTime: val.submitTime,
        runTime: val.runTime,
        lang: val.lang,
      });
      if (val.grade > res.locals.userData.grade) {
        User.upDateUserGrade(res.locals.userData.uid, val.pid, val.grade);
      }
    }
  });
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