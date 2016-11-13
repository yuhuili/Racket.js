window.onload = function start(){
  var button = document.getElementById("button");
  button.addEventListener("click", function(){
    var code = $('textarea#code').val();
    populateStep (code);
  })
  
}
function populateStep (code){
  console.log(code);
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
  
  previousStep.addEventListener("click", function(){
    if(whichStep > 0){
      whichStep--;
      $("#steps").fadeOut(800, function(){
        steps.innerHTML = mysteps[whichStep];
        $("#steps").fadeIn();
      });
    }else{
      $("#steps").fadeOut(800, function(){
        steps.innerHTML = "No more previous Steps";
        $("#steps").fadeIn();
      });
    }
  });
  
  nextStep.addEventListener("click", function(){
    if(whichStep < mysteps.length-1){
      whichStep++;
      $("#steps").fadeOut(800, function(){
        steps.innerHTML = mysteps[whichStep];
        $("#steps").fadeIn();
      });
    }else{
      $("#steps").fadeOut(800, function(){
        steps.innerHTML = "All steps processed";
        $("#steps").fadeIn();
      });
    }
  })
}