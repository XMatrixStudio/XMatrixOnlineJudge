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
  Rank: [{ //排行榜
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

exports.returnProblemList = (req, res, next) => { //处理数据并返回
  console.log('get Problem list: ');
  problemDB.find({}, (err, val) => {
    var arrId = [];
    var arrCourse = [];
    var arrClass = [];
    var arrTitle = [];
    var arrACCounts = [];
    var arrAllCounts = [];
    for (var i = 0; i < val.length; i++) {
      arrId[i] = val[i].pid;
      arrCourse[i] = val[i].category;
      arrClass[i] = val[i].class;
      arrTitle[i] = val[i].title;
      arrACCounts[i] = val[i].ACCounts;
      arrAllCounts[i] = val[i].JudgeCounts;
    }
    res.send({
      pCount: val.length,
      pId: arrId,
      pName: arrTitle,
      pCourse: arrCourse,
      pClass: arrClass,
      pACCounts: arrACCounts,
      pAllCounts: arrAllCounts,
    });
  });
}


exports.getPidFromUrl = (req, res, next) => {
  var str = req.headers.referer;
  var regular = /\/api\/problem\/([0-9]{4})/;
  arr = str.match(regular);
  if (arr === undefined) { // url请求非法
    console.log('NOT_PROBLEM');
    res.send({ state: 'failed', why: 'NOT_PROBLEM' });
    next('route');
  } else {
    console.log('Get Pid!');
    res.locals.pId = arr[1];
    next();
  }
};

exports.getPidFromParam = (req, res, next) => { //正则匹配题目ID
  console.log('Get a Problem: ');
  var pattern = /^[0-9]{1,4}$/;
  if (pattern.test(req.params.id)) {
    res.locals.pId = req.params.id;
    next();
  } else {
    console.log('Not a id ' + req.params.id);
    next('route');
  }
};

exports.checkProblem = (req, res, next) => { //查询是否有这个问题
  problemDB.findOne({ id: res.locals.pId }, (err, val) => {
    if (val) {
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
      // todo 获取排名
      var sqlCmd = 'SELECT `userName`, `gradeMax` , `runTime` FROM `judge` WHERE `pid`=?' +
        ' ORDER BY `gradeMax` DESC,`runTime` ASC';
      var data = [req.params.id];
      sqlModule.query(sqlCmd, data, (vals, isNull) => { //查询排名
        res.locals.rank = vals;
        next();
      });
    }
  });
};