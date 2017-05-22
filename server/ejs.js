//ejs.js
/*
ejs页面渲染引擎

中间件：

problem(返回problem页面)

getPid： 获取问题页面的问题id参数

*/
exports.getPid = function (req,res,next) {
  var str = req.headers.referer;
  var regular = /\/api\/problem\/([0-9]{4})/;
  arr = str.match(regular);
  if (arr == undefined) {  // url请求非法
    console.log('NOT_PROBLEM');
    res.send({state: 'failed', why: 'NOT_PROBLEM'});
    next('route');
  } else {
    console.log('Get Pid!');
    res.locals.pId = arr[1];
    next();
  }
}

exports.problem = function (req,res, next) {
  var rankTable = '<table class="table table-hover table-striped"><tr style="font-size:17px;color:#fff;' +
  'background-color: #00B0AD"><th>No</th><th>昵称</th><th>运行时间</th><th>分数</th></tr>';
  var rankName= new Array;
  var rankGrade = new Array;
  var rankTime = new Array;
  for (var i = 0; i < res.locals.rank.length; i++) {
    rankName[i] = res.locals.rank[i].userName;
    rankGrade[i] = res.locals.rank[i].gradeMax;
    rankTime[i] = res.locals.rank[i].runTime;
  }
  for (var i = 0; i < res.locals.rank.length; i++) {
    rankTable += '<tr><td>' + i + '</td><td>' + rankName[i] + '</td><td>' +
    rankTime[i] + ' ms</td><td>' + rankGrade[i] + '</td></tr>';
  }
  rankTable += '</table>';
  if(res.locals.isDone){
    var isGood= new Array;
    var helpText= new Array;
    var helpTextOld = res.locals.userData.helpText.split("#X#");
    var gradeEach = res.locals.userData.gradeEach.split(",");
    var gradeEachMax = res.locals.problemData.gradeEach.split(",");

    for (var i = 0; i < 4; i++) {
      isGood[i] = (gradeEach[i] == gradeEachMax[i]);
      helpText[i] = '<p>' + helpTextOld[i].toString()
      .replace(/\\n/g, '</p><p>')
      .replace(/\n/g, '</p><p>')
      .replace(/\\r/, '') + '</p>';
    }
    var htmlProblemData = {
      pTitle: res.locals.problemData.title,
      pId: res.locals.pId,
      pTimeLimit: res.locals.problemData.timeLimit,
      pMemLimit: res.locals.problemData.memLimit,
      pAuthor: res.locals.problemData.author,
      pEmail: res.locals.problemData.email,
      rankTable: rankTable,
      jGrade: res.locals.userData.grade,
      jGradeTimes: res.locals.userData.judgeTimes,
      jGradeColor: (res.locals.userData.grade == 100) ? '228B22' : 'B22222',
      jLtime: res.locals.userData.lastTime,
      jRtime: res.locals.userData.runTime + 'ms',
      jGradeMax: res.locals.userData.gradeMax,
      jGradeEach: gradeEach,
      jGradeEachMax: gradeEachMax,
      jText: helpText,
      jGradeName: ['编译测试', '标准测试','随机测试','内存测试'],
      jGradeEachColor: [
      isGood[0] ? '228B22' : 'B22222',
      isGood[1] ? '228B22' : 'B22222',
      isGood[2] ? '228B22' : 'B22222',
      isGood[3] ? '228B22' : 'B22222',
      ],
      jGradeEachIcon: [
      isGood[0] ? 'ok' : 'remove',
      isGood[1] ? 'ok' : 'remove',
      isGood[2] ? 'ok' : 'remove',
      isGood[3] ? 'ok' : 'remove',
      ],
      code: res.locals.userData.code
    };
  }else{
    var gradeEach = res.locals.userData.gradeEach[i].split(",");
    var htmlProblemData = {
      pTitle: res.locals.problemData.title,
      pId: req.params.id,
      pTimeLimit: res.locals.problemData.timeLimit,
      pMemLimit: res.locals.problemData.memLimit,
      pAuthor: res.locals.problemData.author,
      pEmail: res.locals.problemData.email,
      rankTable: rankTable,
      jGrade: 0,
      jGradeColor: 'B22222',
      jLtime: '未提交',
      jRtime: '未提交',
      jGradeMax: 0,
      jGradeTimes: 0,
      jGradeEach: [0, 0, 0, 0],
      jGradeEachMax: gradeEach,
      jText: ['', '', '', ''],
      jGradeName: ['编译测试', '标准测试','随机测试','内存测试'],
      jGradeEachColor: [
      gradeEach[0] ? 'B22222' : '228B22',
      gradeEach[1] ? 'B22222' : '228B22',
      gradeEach[2] ? 'B22222' : '228B22',
      gradeEach[3] ? 'B22222' : '228B22',
      ],
      jGradeEachIcon: [
      gradeEach[0] ? 'remove' : 'ok',
      gradeEach[1] ? 'remove' : 'ok',
      gradeEach[2] ? 'remove' : 'ok',
      gradeEach[3] ? 'remove' : 'ok',
      ],
      code: ''
    };
  }
  res.render("problem", htmlProblemData);
};
