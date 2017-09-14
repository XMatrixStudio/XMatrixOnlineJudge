const db = require('./mongo.js');
var userSchema = db.xmoj.Schema({
  // 用户基础资料
  uid: Number, // 用户id
  name: String, // 用户名

  // 安全访问
  token: Number, // 访问令牌

  info: { // 用户个性资料 (from violet)
    nikeName: String, // 昵称
    sex: Number, // 性别
    email: String, // 电子邮箱
    web: String, // 个人主页
    locale: String, // 所在地
    avatar: String, // 用户头像url
  },

  // 用户等级积分信息
  detail: {
    exp: Number, // 用户当前经验
    level: Number, // 用户等级
    class: Number, // 用户类型(0:普通用户，1：投稿者，2：管理员，3：最高权限)
    title: [{ // 已获得成就
      id: Number, // 成就 id
      name: String, // 成就名称
    }], // 已获得成就
    showTitle: String, // 显示的成就
  },

  problems: [{ // 题目评测记录
    pid: Number, // 问题id
    lastJudge: Number, //最新一次评测的id，
    grade: Number, // 最高成绩
    submitCounts: Number, // 提交次数
  }],

  userSetting: { // 用户设置
    allow: {
      Message: Boolean, // 是否允许留言
    },
    public: {
      message: Boolean, // 是否公开留言
      title: Boolean, // 是否公开成就
      showTitle: Boolean, // 是否显示成就头衔
      titleId: Number, // 显示头衔的 id
    },
  },

  follow: { // 社交信息
    following: [{ // 关注的人
      name: String,
    }],
    followers: [{ // 我的粉丝
      name: String,
    }],
  },

  message: [{ // 主页留言
    from: String, // 评论者 name
    content: String, // 评论内容
    new: Boolean, // 是否未读
    title: Boolean, // 是否显示头衔
    time: Date, // 发表时间
  }],
}, { collection: 'users' });
var userDB = db.xmoj.model('users', userSchema);
exports.db = userDB;
const verify = require('./sdk/verify.js');


exports.checkLogin = function(req, res, next) { // 是否已经登陆
  if (req.cookies.isLogin != 'true') {
    res.redirect('/index.html?op=1');
    next('route');
  } else {
    next();
  }
};

exports.login = function(req, res, next) {
  verify.getUserInfo(req.body.code, (data) => {
    if (data.state == 'ok') {
      userDB.findOne({ uid: data.userData.uid }, (err, val) => { //更新用户信息
        res.locals.userDataByViolet = data.userData;
        console.log(data.userData);
        if (val === null) {
          register(req, res, next);
        } else {
          res.locals.userDataByMe = val;
          res.locals.userDataByMe.userClass = val.class;
          res.locals.userDataByMe.userExp = val.exp;
          res.locals.userDataByMe.userLevel = val.level;
          val.detail = data.userData.detail;
          val.web = data.userData.web;
          val.sex = data.userData.sex;
          val.save(() => { sendUserData(req, res, next); });
        }
      });
    } else {
      res.send(data); //登陆失败
    }
  });
};

exports.upDateUserGrade = function(uid, pid, newGrade) {
  userDB.findOne({ uid: uid }, (err, val) => {
    var details = val.details;
    for (var i in details) {
      if (details[i].pid == pid) {
        details[i].grade = newGrade;
      }
    }
    val.details = details;
    val.save(() => {});
  });
};

exports.upDateUserJudge = function(res) {
  userDB.findOne({ uid: verify.getUserId(res) }, (err, val) => {
    var problems = val.problems;
    for (var i in problems) {
      if (problems[i].pid == res.locals.problemData.pid) {
        problems[i].lastJudge = res.locals.judgeData._id;
        return;
      }
    }
    problems.push({
      pid: res.locals.problemData.pid,
      pName: res.locals.problemData.title,
      class: res.locals.problemData.class,
      lastJudge: res.locals.judgeData._id,
      grade: 0,
      submitCounts: 1,
    });
    val.problems = problems;
    val.save(() => {});
  });
};




exports.findLastJudge = function(userJudge, pid) {
  let p = new Promise((resolve, reject) => {
    for (let i in userJudge) {
      if (userJudge[i].pid == pid) {
        resolve(userJudge[i].lastJudge);
      }
    }
    reject('null');
  });
  return p;
};

let register = function(req, res, next) {
  db.insertDate(userDB, {
    uid: res.locals.userDataByViolet.uid,
    name: res.locals.userDataByViolet.name,
    email: res.locals.userDataByViolet.email,
    detail: res.locals.userDataByViolet.detail,
    web: res.locals.userDataByViolet.web,
    sex: res.locals.userDataByViolet.sex,
    token: 0,
    level: 0,
    exp: 0,
    class: 0,
    problems: [],
  }, () => {
    res.locals.userDataByMe = {
      userClass: 0,
      userExp: 0,
      userLevel: 0,
    };
    sendUserData(req, res, next);
  });
};

let sendUserData = function(req, res, next) {
  verify.makeNewToken(req, res, res.locals.userDataByViolet.uid, () => {
    res.send({
      state: 'ok',
      // userData by Violet
      name: res.locals.userDataByViolet.name,
      email: res.locals.userDataByViolet.email,
      detail: res.locals.userDataByViolet.detail,
      web: res.locals.userDataByViolet.web,
      sex: res.locals.userDataByViolet.sex,
      // userData by me
      level: res.locals.userDataByMe.userLevel,
      exp: res.locals.userDataByMe.userExp,
      class: res.locals.userDataByMe.userClass,
    });
  });
};