const db = require('./mongo.js');
var problemSchema = db.xmoj.Schema({
  pid: Number, // 问题id
  class: String, // 问题类型 [编程题]
  category: String, // 问题分类 [秀秀推荐的题目]
  title: String, // 标题
  timeLimit: Number, //时间限制
  memoryLimit: Number, //内存限制
  authorName: String, //作者名称
  ACCounts: Number, // 通过数
  JudgeCounts: Number, // 总评测数
  rank: [{ //排行榜
    uName: String,
    Grade: Number,
    submitTime: Date,
    runTime: Number,
    memoryUsage: Number,
  }],
  test: [{ //评测项目以及分数
    name: String,
    grade: Number,
  }],
}, { collection: 'problem' });
var problemDB = db.xmoj.model('problem', problemSchema);

exports.returnProblemList = (req, res, next) => { //获取问题列表
  console.log('get Problem list: ');
  problemDB.find({}, (err, val) => {
    res.send(val);
  });
};

exports.getPidFromUrl = (req, res, next) => {
  var str = req.headers.referer;
  var regular = /\/api\/problem\/([0-9]{4})/;
  arr = str.match(regular);
  if (arr === undefined) { // url请求非法
    console.log('NOT_PROBLEM');
    res.send({ state: 'failed', why: 'NOT_PROBLEM' });
    next('route');
  } else {
    console.log('Get pid!');
    res.locals.pid = arr[1];
    next();
  }
};

exports.getPidFromParam = (req, res, next) => { //正则匹配题目ID
  console.log('Get a Problem: ');
  var pattern = /^[0-9]{1,5}$/;
  if (pattern.test(req.params.id)) {
    res.locals.pid = req.params.id;
    next();
  } else {
    console.log('Not a id ' + req.params.id);
    next('route');
  }
};

exports.checkProblem = (req, res, next) => { //查询是否有这个问题
  problemDB.findOne({ id: res.locals.pid }, (err, val) => {
    if (val) {
      res.locals.problemData = val;
      next();
    } else {
      console.log('ERR: NO_THIS_PROBLEM');
      res.send({ state: 'failed', why: 'NO_THIS_PROBLEM' });
      next('route');
    }
  });
};

exports.findProblemData = (req, res, next) => { //查询问题详情
  problemDB.findOne({ id: req.params.id }, (err, val) => {
    if (!val) {
      console.log('No a problem');
      res.redirect('/index.html?op=0');
      next('route');
    } else {
      res.locals.problemData = val;
      next();
    }
  });
};