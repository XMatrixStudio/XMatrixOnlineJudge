

  function running() {
    $.post("api/submit/getpid",{
      user:'zhenly'
    },function(data){
      var nopid = data.pid;
      running2(nopid);
    });
  }

  function running2(nopid) {
    $('#myTab a[href="#messages"]').tab('show');
    $("#grade").html('Judging...');
    $("#compiledtest").html('Judging...');
    $("#stardtest").html('Judging...');
    $.post("api/submit",
    {
      pid : nopid,
      code : document.getElementById("codetext").value
    },
    function(data){
      $("#grade").html(data.grade);
      $("#compiledtest").html(data.compiledtest);
      $("#stardtest").html(data.stardtest);
    });
  }
