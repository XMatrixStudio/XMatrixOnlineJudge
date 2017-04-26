
function login() {

  if(document.getElementById("user_email").value != '' && document.getElementById("user_password").value != ''){
    sendNotice("登陆中，请稍后");
    $.post("api/login",{
      user_email:document.getElementById("user_email").value,
      user_password:document.getElementById("user_password").value
    },function(data){
      if(data.state == 'success'){
        document.cookie="isLogin=yes";
        document.cookie="userName=" + document.getElementById("user_email").value;
        window.location.href='problem.html';
      }else{
        $("#user_password").val("");
        $("#user_password").focus();
        sendNotice("<strong>邮箱 或 密码</strong>错误，请重新输入");
      }
    });
  }
}

function sendNotice(str) {
  $("#Alert_").alert('close');
  $("#notice").load("notice.html", function(){
    document.getElementById("sendtoAlert").innerHTML=str;
  });
}
