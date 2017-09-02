//ejs.js
/*
ejs页面渲染引擎

中间件：

problem(返回problem页面)

*/
exports.problem = function(req, res, next) {
  var rankName = [];
  var rankGrade = [];
  var rankTime = [];
  for (var i = 0; i < res.locals.rank.length; i++) {
    rankName[i] = res.locals.rank[i].userName;
    rankGrade[i] = res.locals.rank[i].gradeMax;
    rankTime[i] = res.locals.rank[i].runTime;
  }
  var gradeEachMax = res.locals.problemData.gradeEach.split(",");
  var htmlProblemData;
  if (res.locals.isDone) {
    var isGood = [];
    var helpText = [];
    if (res.locals.userData.helpText !== '') {
      var helpTextOld = res.locals.userData.helpText.split("#X#");
    } else {
      var helpTextOld = ['', '', '', ''];
    }
    var gradeEach = res.locals.userData.gradeEach.split(",");

    for (var i = 0; i < gradeEach.length; i++) {
      isGood[i] = (gradeEach[i] == gradeEachMax[i]);
      helpText[i] = '<p>' + helpTextOld[i].toString()
        .replace(/\\n/g, '</p><p>')
        .replace(/\n/g, '</p><p>')
        .replace(/\\r/g, '') + '</p>';
    }
    htmlProblemData = {
      pTitle: res.locals.problemData.title,
      pId: res.locals.pId,
      pTimeLimit: res.locals.problemData.timeLimit,
      pMemLimit: res.locals.problemData.memLimit,
      pAuthor: res.locals.problemData.author,
      pEmail: res.locals.problemData.email,
      rankTableName: rankName.join("','"),
      rankTableRunTime: rankTime.join(","),
      rankTableGrade: rankGrade.join(","),
      jGrade: res.locals.userData.grade,
      jGradeTimes: res.locals.userData.judgeTimes,
      jGradeColor: (res.locals.userData.grade == 100) ? '228B22' : 'B22222',
      jLtime: res.locals.userData.lastTime,
      jRtime: res.locals.userData.runTime,
      jGradeMax: res.locals.userData.gradeMax,
      jGradeEach: gradeEach,
      jGradeEachMax: gradeEachMax,
      jText: helpText,
      jGradeNum: gradeEachMax.length,
      jGradeName: ['编译测试', '标准测试', '随机测试', '内存测试'],
      jGradeEachColor: [
        isGood[0] ? '228B22' : 'B22222',
        isGood[1] ? '228B22' : 'B22222',
        isGood[2] ? '228B22' : 'B22222',
        isGood[3] ? '228B22' : 'B22222',
      ],
      jGradeEachIcon: [
        isGood[0] ? 'ok' : 'remove',
        isGood[2] ? 'ok' : 'remove',
        isGood[1] ? 'ok' : 'remove',
        isGood[3] ? 'ok' : 'remove',
      ],
      code: res.locals.userData.code
    };
  } else {
    htmlProblemData = {
      pTitle: res.locals.problemData.title,
      pId: req.params.id,
      pTimeLimit: res.locals.problemData.timeLimit,
      pMemLimit: res.locals.problemData.memLimit,
      pAuthor: res.locals.problemData.author,
      pEmail: res.locals.problemData.email,
      rankTableName: rankName.join("\',\'"),
      rankTableRunTime: rankTime.join(","),
      rankTableGrade: rankGrade.join(","),
      jGrade: 0,
      jGradeColor: 'B22222',
      jLtime: '未提交',
      jRtime: '未提交',
      jGradeMax: 0,
      jGradeTimes: 0,
      jGradeEach: [0, 0, 0, 0],
      jGradeEachMax: gradeEachMax,
      jText: ['', '', '', ''],
      jGradeNum: gradeEachMax.length,
      jGradeName: ['编译测试', '标准测试', '随机测试', '内存测试'],
      jGradeEachColor: [
        gradeEachMax[0] ? 'B22222' : '228B22',
        gradeEachMax[1] ? 'B22222' : '228B22',
        gradeEachMax[2] ? 'B22222' : '228B22',
        gradeEachMax[3] ? 'B22222' : '228B22',
      ],
      jGradeEachIcon: [
        gradeEachMax[0] ? 'remove' : 'ok',
        gradeEachMax[1] ? 'remove' : 'ok',
        gradeEachMax[2] ? 'remove' : 'ok',
        gradeEachMax[3] ? 'remove' : 'ok',
      ],
      code: ''
    };
  }
  res.render("problem", htmlProblemData);
};