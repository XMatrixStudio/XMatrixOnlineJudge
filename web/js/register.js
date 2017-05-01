


function register(_password) {


  //发送post请求
  $.post("api/register",{
    user_email:document.getElementById("user_email").value,
    user_name:document.getElementById("user_name").value,
    user_password:_password
  },function(data){
    if(data.state == 'success'){
      alert("注册成功！请登陆你的账号。");
      window.location.href='index.html';
    }else if(data.why == 'NOT_EMAIL'){
      sendNotice("非法POST请求");
    }else{
      sendNotice("邮箱已经被注册，请登陆。");
    }
  });
}
