const db = require('./mongo.js');
const verify = require('./sdk/verify.js');
var userSchema = db.xmoj.Schema({
  uid: Number,
  token: Number,
  name: String,
  sex: Number,
}, { collection: 'users' });
var userDB = db.xmoj.model('users', userSchema);
exports.db = userDB;


exports.checkLogin = (req, res, next) => { // 是否已经登陆
  if (req.cookies.isLogin != 1) {
    res.redirect('/index.html?op=1');
    next('route');
  } else {
    next();
  }
};