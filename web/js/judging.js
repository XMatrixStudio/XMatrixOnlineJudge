

function running() {
  $('#myTab a[href="#messages"]').tab('show');
  $('#grade').html('Judging...');
  $('#compiledtest').html('Judging...');
  $('#stardtest').html('Judging...');
  $.post('api/submit', {
    userSession: getCookie('userSession'),
    sign:getCookie('sign'),
    code: document.getElementById('codetext').value
}, function(data) {
    if (data.state == 'success') {
      var nopid = data.pid;
      document.cookie="userSession=" + data.userSession;
      document.cookie="sign=" + data.sign;
      $('#grade').html(data.grade);
      $('#compiledtest').html(data.compiledtest);
      $('#stardtest').html(data.stardtest);
    } else {
      if(data.why == 'ILLEGAL_SIGN' || data.why == 'ILLEGAL_TOKEN') alert("非法访问，请重新登陆");
      if(data.why == 'TIME_OUT') alert("登陆超时，请重新登陆");
      if(data.why == 'NO_MAIL'){
        document.cookie="isMail=0";
        window.location.href='mail.html';
      }else{
         window.location.href='index.html?op=0';
      }

    }
  });
}

function getCookie(name)
{
  var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  if(arr=document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}
