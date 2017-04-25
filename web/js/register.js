


function register() {


  //发送post请求
  $.post("api/register",{
    user_email:document.getElementById("user_email").value,
    user_name:document.getElementById("user_name").value,
    user_password:document.getElementById("user_password").value
  },function(data){
    if(data.state == 'success'){
      alert("注册成功！请登陆你的账号。");
      window.location.href='index.html';
    }else{
      sendNotice("注册失败");
    }
  });

  sendNotice("注册失败");
}
