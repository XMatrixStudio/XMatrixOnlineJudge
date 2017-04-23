

function login() {
  if(document.getElementById("user_email").value != '' && document.getElementById("user_password").value != ''){
  $.post("api/login",{
    user_email:document.getElementById("user_email").value,
    user_password:document.getElementById("user_password").value
  },function(data){
    if(data.state == 'success'){
      window.location.href='problem.html';
    }else{

      $("#password_div").addClass("has-error");
      $("#user_password").val("");
      $("#user_password").focus();
      $("#tips").show();
      setTimeout(function() {$("#tips").hide();}, 3000);
    }
  });
}
}
