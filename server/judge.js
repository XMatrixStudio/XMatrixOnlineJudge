const db = require('./mongo.js');
const Verify = require('./sdk/verify.js'); //violet
const User = require('./user.js'); //violet
const fs = require('fs'); //文件处理
var judgeSchema = db.xmoj.Schema({
  pid: Number, // 问题id
  uid: Number, // 用户id
  uName: String, // 用户名
  nikeName: String, // 用户昵称
  pName: String, // 问题名字
  grade: Number, // 总成绩
  lang: String, // 编译语言
  details: [{ // 详细评测项目
    name: String,
    grade: Number,
    io: [{ in: String,
      out: String,
      stdout: String,
    }],
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
};

exports.newJudge = (req, res, next) => { //查看数据库是否有记录或者judging
  var gradeDetails = res.locals.problemData.test;
  for (var i in gradeDetails) {
    gradeDetails[i].grade = 0;
    gradeDetails[i].text = '';
  }
  db.insertDate(judgeDB, {
    pid: res.locals.pid,
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
    res.locals.judgeData = val;
    User.upDateUserJudge(res);
    next();
  });
};

exports.judging = (req, res, next) => { //调用judge子进程
  console.log('write to file: file/' + res.locals.judgeData._id + '.c'); //存文件
  fs.writeFile('file/' + res.locals.judgeData._id + '.c', req.body.code, (err) => {
    if (err) return console.error(err);
    console.log('toJudge...');
    var judgeModule = spawn('./judge.sh', [res.locals.judgeData._id]);
  });
  console.log('judging success!');
  res.send({ state: 'success' });
};

exports.returnUserGrade = (req, res, next) => { //返回结果
  if (res.locals.isDone) {
    if (!res.locals.judgeData.judging) {
      console.log('success'); //评测完毕
      res.send({
        state: 'success',
        grade: res.locals.judgeData.grade,
        detail: res.locals.judgeData.detail,
        lastTime: res.locals.judgeData.submitTime,
        runTime: res.locals.judgeData.runTime,
        memoryUsage: res.locals.judgeData.memoryUsage,
        lang: res.locals.judgeData.lang,
      });
      if (val.grade > res.locals.userData.grade) {
        User.upDateUserGrade(res.locals.userData.uid, val.pid, val.grade);
      }
    } else {
      console.log('JUDGING'); //在评测中
      res.send({ state: 'failed', why: 'JUDGING' });
      next('route');
    }
  } else {
    console.log('NO_DONE');
    res.send({ state: 'failed', why: 'NO_DONE' });
    next('route');
  }
};

exports.findJudgeData = (req, res, next) => { //返回问题详情
  let userJudge = Verify.getUserData(res).problems;
  User.findLastJudge(userJudge, res.locals.pid).then((jid) => {
    res.locals.isDone = false;
    judgeDB.findById(jid, (err, val) => {
      res.locals.judgeData = val;
      next();
    });
  }).catch((err) => {
    res.locals.isDone = true;
    next();
  });
};
