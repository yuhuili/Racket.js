var animDelay = 100;

window.onload = function start(){
  var button = document.getElementById("run");
  button.addEventListener("click", function(){
    steps = [];
    var code = $('textarea#code').val();
    $("#previousStep").prop("disabled",true);
    populateStep (code);
    $("#steps-wrap").fadeIn();
  })
  
}
function populateStep (code){
  var mydefs = code.split("\n");
  
  for (var i = 0; i < mydefs.length; i++){
    myProcess(mydefs[i]);
  }
  
  animateStep (steps);
  
}
function animateStep (mysteps){
  var whichStep = 0;
  var previousStep = document.getElementById("previousStep");
  var nextStep = document.getElementById("nextStep");
  var steps = document.getElementById("steps");
  
  steps.innerHTML = mysteps[0];
  
  if (mysteps.length==1) {
    $("#nextStep").prop("disabled",true);
  } else {
    $("#nextStep").prop("disabled",false);
  }
  
  previousStep.addEventListener("click", function(){
    if(whichStep > 0){
      whichStep--;
      $("#steps").fadeOut(animDelay, function(){
        steps.innerHTML = mysteps[whichStep];
        $("#steps").fadeIn();
      });
      
      if (whichStep == mysteps.length-1) {
        $("#nextStep").prop("disabled",true);
      } else {
        $("#nextStep").prop("disabled",false);
      }
      
      if (whichStep == 0) {
        $("#previousStep").prop("disabled",true);
      } else {
        $("#previousStep").prop("disabled",false);
      }
    }
  });
  
  nextStep.addEventListener("click", function(){
    if(whichStep < mysteps.length-1){
      whichStep++;
      $("#steps").fadeOut(animDelay, function(){
        steps.innerHTML = mysteps[whichStep];
        $("#steps").fadeIn();
      });
      
      if (whichStep == mysteps.length-1) {
        $("#nextStep").prop("disabled",true);
      } else {
        $("#nextStep").prop("disabled",false);
      }
      
      if (whichStep == 0) {
        $("#previousStep").prop("disabled",true);
      } else {
        $("#previousStep").prop("disabled",false);
      }
      
    }
  })
}