var BlockType = {
  UNKNOWN: 0,
  DEFINE: 1, // regular definition
  DEFINEFUNC: 2, // DEFINE FUNCTION
  BUILTINBIN: 3,
  BUILTININF: 4,
  FUNC: 5,
  LIST: 6,
  LISTFUNC: 7,
  COND: 8,
  BUILTINUNO: 9
};

var ProgressStage = {
  OPENBRACKET: 0,
  OPERATOR: 1,
  IDENTIFIER: 2,
  ARGUMENT: 3,
  CLOSEBRACKET: 4,
  CLEANUP: 5
}

var definitions = {"else": true, "true": true, "false": false};
var functions = {};
var builtInFuncInf = ["+", "-", "/", "*"];
var builtInFuncBin = ["remainder", "quotient"];
var builtInFuncUno = ["zero?"];
var listBuiltIn = ["first", "second", "third", "rest", "empty?"];
var listFuncMap = {"first": 1, "second": 2, "third": 3};
var steps = [];
//var firstStep = 0;

function e(block) {
  return myProcess(block);
}

function myProcess(block){
  var result = process(block, "", "", steps.length);
  if (result != null){
    addStep(result, 0);//console.log("Al 51"+result);
  }
  return steps;
}

function process(block, frontTxt, backTxt, firstStep) {
  //console.log("block= "+block);
  var thisBlockType = BlockType.UNKNOWN;
  var thisProgressStage = ProgressStage.OPENBRACKET;
  
  
  var operator = "";
  var identifier = ""; // one thing by itself
  var parameters = []; // include function name itself
  var currentParameter = 0;
  
  var arguments = [];
  
  var identifierHasBracket = false;
  
  var currentArgument = 0;
  var numberOfArguments = 0;
  
  var numOpenBrack = 0;
  for (var i = 0, s = block.length; i<s; i++) {
    
    var c = block[i];
    
    //console.log(c);
    //console.log(thisProgressStage);
    
    var shouldExit = false;
    
    switch(thisProgressStage) {
      case ProgressStage.OPENBRACKET:
        if (c==" ") {
          continue;
        } else if (c!="(") {
          console.log("PRDef 89" + block.substring(i));   return processDefinition(block.substring(i));       
        } else {
          thisProgressStage = ProgressStage.OPERATOR;
        }
        break;
      case ProgressStage.OPERATOR:
        if (c==" ") {
          if (operator.length==0) {
            continue;
          } else {
            //console.log("op"+operator);
            // Found operator
            if (operator=="define") {
              thisProgressStage = ProgressStage.IDENTIFIER;
              numberOfArguments = 1;
              thisBlockType = BlockType.DEFINE;
            } else if (operator == "list") {
              thisProgressStage = ProgressStage.ARGUMENT;
              numberOfArguments = -1;
              thisBlockType = BlockType.LIST;
            } else if (operator == "cond") {
              thisProgressStage = ProgressStage.ARGUMENT;
              numberOfArguments = -1;
              thisBlockType = BlockType.COND;
            } else if (listBuiltIn.indexOf(operator) > -1){
              thisProgressStage = ProgressStage.ARGUMENT;
              numberOfArguments = 1;
              thisBlockType = BlockType.LISTFUNC;
            } else if (builtInFuncBin.indexOf(operator) > -1) {
              thisBlockType = BlockType.BUILTINBIN;
              thisProgressStage = ProgressStage.ARGUMENT;
              numberOfArguments = 2;
            } else if (builtInFuncInf.indexOf(operator) > -1) {
              thisBlockType = BlockType.BUILTININF;
              thisProgressStage = ProgressStage.ARGUMENT;
              numberOfArguments = -1;
            } else if (builtInFuncUno.indexOf(operator) > -1){
              thisBlockType = BlockType.BUILTINUNO;
              thisProgressStage = ProgressStage.ARGUMENT;
              numberOfArguments = 1;
            } else if (operator in functions) {
              thisBlockType = BlockType.FUNC;
              thisProgressStage = ProgressStage.ARGUMENT;
              numberOfArguments = functions[operator]["parameters"].length;
            } else {
              throw "Undefined function " + operator;
            }
            
          }
        } else {
          //console.log(i+" "+(block.length-1)+" "+operator+" "+c);
          if (i == block.length-1 && operator == "list" && c == ")"){
            return "(list)";
          }
          operator += c;
        }
        break;
      case ProgressStage.IDENTIFIER:
      
        if (identifierHasBracket) {
          if (parameters.length==currentParameter) {
            parameters[currentParameter]="";
          }
        }
        
        if (c=="(") {
          identifierHasBracket = true;
        }
        else if (c==" ") {
          if (identifierHasBracket) {
            if (parameters[currentParameter].length==0) {
              continue;
            } else {
              currentParameter++;
            }
          } else {
            if (identifier.length==0) {
              continue;
            } else {
              thisProgressStage = ProgressStage.ARGUMENT;
            }
          }
        } else if (c==")") {
          // assume it is a function
          // finished all parameters
          if (parameters.length<=1) {
            throw "Invalid function";
          } else {
            thisBlockType = BlockType.DEFINEFUNC;
            thisProgressStage = ProgressStage.ARGUMENT;
          }
        } else {
          if (identifierHasBracket) {
            parameters[currentParameter] += c;
          } else {
            identifier += c;
          }
        }
        break;
      case ProgressStage.ARGUMENT:
        if (numberOfArguments==0) {
          thisProgressStage = ProgressStage.CLOSEBRACKET;
          break;
        } 
        
        if (arguments.length==currentArgument) {
          arguments[currentArgument]="";
        }
        console.log(currentArgument);
        if (c==" ") {
          if (arguments[currentArgument].length==0) {
            continue;
          } else if (numOpenBrack > 0) {
            arguments[currentArgument] += c;
          } else {
            //console.log("currentarg" + arguments[currentArgument]);
            
            if (thisBlockType == BlockType.DEFINEFUNC) {
              addStep(frontTxt + block + backTxt, firstStep);//console.log("Al 207"+frontTxt + block + backTxt, firstStep);
              currentArgument++;
              numberOfArguments--;
              continue;
            } else if (thisBlockType == BlockType.COND) {
              addStep(frontTxt + block + backTxt, firstStep);//console.log("Al 212"+frontTxt + block + backTxt, firstStep);
              
              //console.log("argument= " + arguments[currentArgument]);
              
              try {
                //console.log("fronttext= " +frontTxt+"(cond ");
                //console.log("backtext= " + block.substring(i)+backTxt);
                console.log("IDK");
                console.log("PRCond 219" + "+++" + arguments[currentArgument] + "+++" + frontTxt+"(cond " + "+++" + block.substring(i)+backTxt); arguments[currentArgument] = processCond(arguments[currentArgument], frontTxt+"(cond ", block.substring(i)+backTxt); console.log("IDK2" + arguments[currentArgument] + " ");
                
                if (arguments[currentArgument][0] == "(" ){
                  console.log("ABAB");
                  arguments[currentArgument] = process(arguments[currentArgument], frontTxt, backTxt, steps.length-1); console.log("BBB "+frontTxt+"----"+backTxt);
                  addStep(frontTxt+arguments[currentArgument]+backTxt, firstStep); console.log("CCC ");
                }
                
              }  catch (e) {
                //console.log("abc");
                if (e == "false question"){
                  arguments[currentArgument] = "";
                  //console.log("asdf");
                  continue;
                } else {
                  throw e;
                }
              }
              return arguments[currentArgument];
              
            }
            
            if (arguments[currentArgument][0] == "("){
              addStep(frontTxt + block + backTxt, firstStep);//console.log("Al 235"+frontTxt + block + backTxt, firstStep);
              var newfront = frontTxt+constructFront(operator, thisBlockType == BlockType.DEFINEFUNC ? constructIdentifier(parameters) : identifier, arguments.slice(0,arguments.length-1));
              var newback = block.substring(i)+backTxt;
              console.log("PR 238" + "+++" + arguments[currentArgument] + "+++" + newfront + "+++" + newback + "+++" + steps.length-1); arguments[currentArgument] = process(arguments[currentArgument], newfront, newback, steps.length-1);
              addStep(newfront+arguments[currentArgument]+newback, firstStep);//console.log("Al 239"+frontTxt + block + backTxt, firstStep);
            } else if (isNaN(arguments[currentArgument])){
              addStep(frontTxt + block + backTxt, firstStep);//console.log("Al 240"+frontTxt + block + backTxt, firstStep);
              console.log("PRDef 242" + arguments[currentArgument]); arguments[currentArgument] = processDefinition(arguments[currentArgument]);
              var newfront = frontTxt+constructFront(operator, thisBlockType == BlockType.DEFINEFUNC ? constructIdentifier(parameters) : identifier, arguments.slice(0,arguments.length-1));
              var newback = block.substring(i)+backTxt;
              addStep(newfront+arguments[currentArgument]+newback, firstStep);//console.log("Al 245"+frontTxt + block + backTxt, firstStep);
            }
            currentArgument++;
            numberOfArguments--;
          }
        } else if (c == "(") {
            numOpenBrack++;
            arguments[currentArgument] += c;
        } else if (c==")") {
          if (numOpenBrack > 0){
            numOpenBrack--;
            arguments[currentArgument] += c;
          } else { 
            //console.log(arguments[currentArgument]);
            
            if (thisBlockType == BlockType.DEFINEFUNC) {
              addStep(frontTxt + block + backTxt, firstStep);//console.log("Al 261"+frontTxt + block + backTxt, firstStep);
              i--;
              thisProgressStage = ProgressStage.CLOSEBRACKET;
              continue;
            }else if (thisBlockType == BlockType.COND) {
              addStep(frontTxt + block + backTxt, firstStep); //console.log("Al 266"+frontTxt + block + backTxt, firstStep);
              
              //console.log("argument= " + arguments[currentArgument]);
              
              try {
                //console.log("fronttext= " +frontTxt+"(cond ");
                //console.log("backtext= " + block.substring(i)+backTxt);
                console.log("IDK");
                console.log("PRCond 219" + "+++" + arguments[currentArgument] + "+++" + frontTxt+"(cond " + "+++" + block.substring(i)+backTxt); arguments[currentArgument] = processCond(arguments[currentArgument], frontTxt+"(cond ", block.substring(i)+backTxt); console.log("IDK2" + arguments[currentArgument] + " ");
                
                if (arguments[currentArgument][0] == "(" ){
                  console.log("ABAB");
                  arguments[currentArgument] = process(arguments[currentArgument], frontTxt, backTxt, steps.length-1); console.log("BBB "+frontTxt+"----"+backTxt);
                  addStep(frontTxt+arguments[currentArgument]+backTxt, firstStep); console.log("CCC ");
                }
                
              } catch (e) {
                //console.log("abc");
                if (e == "false question"){
                  arguments[currentArgument] = "";
                  //console.log("asdf");
                  continue;
                } else {
                  throw e;
                }
              }
              return arguments[currentArgument];
              
            }
            
            if (arguments[currentArgument][0] == "("){
              console.log("=============begin");
              addStep(frontTxt + block + backTxt, firstStep); //console.log("Al 289"+frontTxt + block + backTxt, firstStep);
              var newfront = frontTxt+constructFront(operator, thisBlockType == BlockType.DEFINEFUNC ? constructIdentifier(parameters) : identifier, arguments.slice(0,arguments.length-1));
              var newback = block.substring(i)+backTxt;
              console.log("PR 293" + arguments[currentArgument] + "+++" + newfront + "+++" + newback + "+++" + firstStep); arguments[currentArgument] = process(arguments[currentArgument], newfront, newback, steps.length-1);
              addStep(newfront + arguments[currentArgument] + newback, firstStep); //console.log("Al 293"+newfront+"++++++"+arguments[currentArgument]+"+++++++"+newback, firstStep);
              console.log("=============end");
            }else if (isNaN(arguments[currentArgument])){
              addStep(frontTxt + block + backTxt, firstStep); //console.log("Al 295"+frontTxt + block + backTxt, firstStep);
              console.log("PRDef 298" + arguments[currentArgument]); arguments[currentArgument] = processDefinition(arguments[currentArgument]);
              var newfront = frontTxt+constructFront(operator, thisBlockType == BlockType.DEFINEFUNC ? constructIdentifier(parameters) : identifier, arguments.slice(0,arguments.length-1));
              var newback = block.substring(i)+backTxt;
              addStep(newfront+arguments[currentArgument]+newback,firstStep); //console.log("Al 299"+newfront+arguments[currentArgument]+newback,firstStep);
            }            
            i--;
            thisProgressStage = ProgressStage.CLOSEBRACKET;
          }
        } else {
          arguments[currentArgument] += c;
        }
        
        
        break;
      case ProgressStage.CLOSEBRACKET:
        if (c==" ") {
          continue;
        } else if (c!=")") {
          throw "No CLOSE Bracket";
        } else {
          //console.log("AAAAA"+thisBlockType);
          switch (thisBlockType){
            case BlockType.DEFINE:
              definitions[identifier] = !isNaN(arguments[0]) ? arguments[0] : ((arguments[0].indexOf(".") > -1) ? parseFloat(arguments[0]) : parseInt(arguments[0]));
              //return definitions[identifier];
              break;
            case BlockType.DEFINEFUNC:
              functions[parameters[0]] = {"parameters": parameters.slice(1,parameters.length), "body": arguments[0]};
              break;
            case BlockType.BUILTINBIN:
              console.log("PRBin 328" + operator + "+++" + arguments); return processBuiltInBin(operator, arguments);
              break;
            case BlockType.BUILTININF:
              console.log("PRInf 331" + operator + "+++" + arguments); return processBuiltInInf(operator, arguments);
              break;
            case BlockType.FUNC:
              
              addStep(frontTxt + block + backTxt, firstStep); //console.log("Al 333"+frontTxt + block + backTxt, firstStep);
              
              var rawBody = functions[operator]["body"];
              var funcArgs = functions[operator]["parameters"];
              
              //console.log("ASDFASDF"+rawBody);
              for (var j=0; j<funcArgs.length; j++) {
                var reg = new RegExp("([( ])"+funcArgs[j]+"([ )])", "g");
                rawBody = rawBody.replace(reg, "$1"+arguments[j]+"$2");
              }
              //console.log("LKJHKJH"+rawBody);
              
              addStep(frontTxt + rawBody + backTxt, firstStep); //console.log("Al 345"+frontTxt + rawBody + backTxt, firstStep);
              
              console.log("PR 349" + rawBody + "+++" + frontTxt + "+++" + backTxt + "+++" + steps.length-1); return process(rawBody, frontTxt, backTxt, steps.length-1);
              break;
            case BlockType.LIST:
              
              return constructList(arguments);
              break;
            case BlockType.LISTFUNC:
              console.log("PR list func 356" + operator+"+++++++"+arguments[0]); return processListFunc(operator, arguments[0]);
              break;  
            case BlockType.BUILTINUNO:
              console.log("PR list func 359" + operator+"+++++++"+arguments[0]); return processUno(operator, arguments[0]);
              break;
          }
        }
        break;
      default:
        break;
    }
    
    if (shouldExit) break;
  }
  
  
}
function processBuiltInBin(operator, arguments){
  if (operator == "remainder"){
    var a00 = parseInt(arguments[0]);
    var a10 = parseInt(arguments[1]);
    var a01 = parseFloat(arguments[0]);
    var a11 = parseFloat(arguments[1]);
    if (!isNaN(arguments[0]) && !isNaN(arguments[1]) && a00 == a01 && a10 == a11){
      if (a1 == 0){
        throw "Division By Zero";
      } else {
         return arguments[0]%arguments[1];
      }
    } else {
      throw "Invalid Arguments";
    }
    
  } else if (operator == "quotient"){
    var a00 = parseInt(arguments[0]);
    var a10 = parseInt(arguments[1]);
    var a01 = parseFloat(arguments[0]);
    var a11 = parseFloat(arguments[1]);
    if (!isNaN(arguments[0]) && !isNaN(arguments[1]) && a00 == a01 && a10 == a11){
      if (a1 == 0){
        throw "Division By Zero";
      } else {
         return Math.floor(arguments[0]/arguments[1]);
      }
    } else {
      throw "Invalid Arguments";
    }
  }
}
function processBuiltInInf(operator, arguments){

  if (operator == "+") {
    var base = 0;
    for (var i = 0; i < arguments.length; i++){
      var af = parseFloat(arguments[i]);
      if (!isNaN(arguments[i])){
        base += af;
      } else{
        throw "Invalid Argument Type "+arguments[i];
      }
    }
    return base;
  }
  else if (operator == "-") {
    
    var base = 0;
    
    if (arguments.length==0) {
      throw "- expects at least 1 argument";
    } else if (arguments.length==1) {
      if (isNaN(arguments[0])) {
        throw "Not a number";
      }
      return -parseFloat(arguments[0]);
    }
    
    for (var i = 0; i < arguments.length; i++) {
      if (isNaN(arguments[i])) {
        throw "Not a number"
      }
      
      var ai = parseFloat(arguments[i]);
      
      if (i==0) {
        base = ai;
      } else {
        base -= ai;
      }
    }
    
    return base;
  }
  else if (operator == "*") {
    var base = 1;
    for (var i = 0; i < arguments.length; i++){
      //console.log("CRAZYTHING "+ arguments[i]+ " " + typeof(arguments[i]));
      if (typeof(arguments[i]) === 'string'){
        console.log("PR 453 "+arguments[i]+"+++ +++ ");arguments[i] = process(arguments[i], "", "",steps.length-1);
      }
      //console.log("CRAZYTHINGAFTER "+ arguments[i]);
      var af = parseFloat(arguments[i]);
      if (!isNaN(arguments[i])){
        base *= af;
      } else{
        throw "Invalid Argument Type" + arguments[i];
      }
    }
    return base;
  }
  else if (operator == "/") {
    
    var base = 1;
    
    
    if (arguments.length==0) {
      throw "/ expects at least 1 argument";
    }
    else if (arguments.length==1) {
      if (isNaN(arguments[0])) {
        throw "Not a number";
      } else if (parseFloat(arguments[0])==0) {
        throw "Division By Zero";
      }
      return base/parseFloat(arguments[0]);
    }
    
    for (var i = 0; i < arguments.length; i++) {
      if (isNaN(arguments[i])) {
        throw "Not a number"
      }
      
      var ai = parseFloat(arguments[i]);
      
      if (i==0) {
        base = ai;
      } else {
        if (ai==0) {
          throw "Division By Zero";
        }
        base = base/ai;
      }
    }
    
    return base;
  }
}
function processUno(operator, elem){
  if (operator == "zero?"){
    if (parseFloat(elem) == 0){
      return true;
    } else return false;
  }
}
function processListFunc(operator, list){
  var numOpenBrack = 0;
  var currentElem = 0;
  var elements=[]; //First element has to be list
  if (operator in listFuncMap){
    for (var i = 1; i < list.length-1; i++){
      if (currentElem == elements.length){
        elements[currentElem] = "";
      }
      var c = list[i];
      if (c == " "){
        if (elements[currentElem].length == 0){
          continue;
        } else if (numOpenBrack == 0){
          if (currentElem == listFuncMap[operator]){
            return elements[listFuncMap[operator]];
          }
          currentElem++;
        } else {
          elements[currentElem] += c;
        }
      }else if ( c == "("){
        elements[currentElem] += c;
        numOpenBrack++;
      }else if (c == ")"){
        numOpenBrack--;
        elements[currentElem] += c;
        if (i == list.length-2){
          if (numOpenBrack != 0){
            throw "Syntax Error";
          } else {
            if (elements.length <= listFuncMap[operator]){
              throw "insufficient number of elements";
            } else {
              return elements[listFuncMap[operator]];
            }
          }
        }
      }else {
        elements[currentElem] += c;
        if (i == list.length-2){
          if (elements.length <= listFuncMap[operator]){
            throw "Insufficient number of elements";
          } else {
            return elements[listFuncMap[operator]];
          }
        }
      }
    }
    throw "Insufficient number of elements";
  } else if (operator == "rest"){
    for (var i = 1; i < list.length-1; i++){
      if (currentElem == elements.length){
        elements[currentElem] = "";
      }
      var c = list[i];
      if (c == " "){
        if (elements[currentElem].length == 0){
          continue;
        } else if (numOpenBrack == 0){
          if (currentElem == 1){
            return "(list" + list.substring(i);
          }
          currentElem++;
        } else {
          elements[currentElem] += c;
        }
      }else if ( c == "("){
        elements[currentElem] += c;
        numOpenBrack++;
      }else if (c == ")"){
        numOpenBrack--;
        elements[currentElem] += c;
        if (i == list.length-2){
          if (numOpenBrack != 0){
            throw "Syntax Error";
          } else {
            if (elements.length == 1){
              throw "insufficient number of elements";
            } else {
              return "(list)";
            }
          }
        }
      }else {
        elements[currentElem] += c;
        if (i == list.length-2){
          if (elements.length == 1){
            throw "first list given empty";
          } else {
            return "(list)";
          }
        }
      }
    }
    throw "Insufficient number of elements";
  }else if (operator == "empty?"){
    if (list == "(list)"){
      return true;
    }
    return false;
  }
}
function processCond(qa, frontTxt, backTxt){
  var numOpenBrack = 0;
  var asked = false;
  
  var question = "";
  var answer = "";
  //console.log("QA= "+ qa);
  for (var i = 1; i < qa.length-1; i++){
    //console.log(question + " " + answer + " " + i);
    var c = qa[i];
    if (c == " "){
      if (!asked){
        if (question.length == 0){
          continue;
        } else {
          if (numOpenBrack == 0){
            asked = true;
            //console.log("question "+question);
            console.log("PR 630 "+question+"++++++"+frontTxt+"("+"++++"+qa.substring(i)+backTxt);var result = process(question, frontTxt+"(", qa.substring(i)+backTxt,steps.length-1);
            if (result === true){
              continue;
            } else if (result === false){
              
              addStep(frontTxt+"(false "+ qa.substring(i+1)+backTxt); //console.log("Al 633"+frontTxt+"(false "+ qa.substring(i+1)+backTxt);
              throw "false question";
            } else {
              throw "not boolean";
            }
          } else {
            question += c;
          }
        }
      } else {
        //console.log("hello1");
        if (answer.length == 0){
          continue;
        } else {
          if (numOpenBrack == 0){
            //console.log("QUESTASDF " + question);
            if (question == "else"){
              //addStep(frontTxt.substring(0, frontTxt.length-6)+"(else "+answer+qa.substring(i+1)+backTxt.substring(1, backTxt.length)); //console.log("Al 650"+frontTxt.substring(0, frontTxt.length-6)+"(else "+answer+qa.substring(i+1)+backTxt.substring(1, backTxt.length));
              console.log("AAA "+ answer); return answer;
            } else {
              //addStep(frontTxt+answer+qa.substring(i+1)+backTxt); //console.log("Al 653"+frontTxt+answer+qa.substring(i+1)+backTxt);
              console.log("AAA "+ answer); return answer;
            }
          } else {
            answer += c;
          }
        }
      }
    }else if (c == "("){
      if (!asked){
        question += c;
        numOpenBrack++;
      } else {
        answer += c;
        numOpenBrack++;
      }
    } else if (c == ")"){
      if (!asked){
        question += c;
        numOpenBrack--;
        if (numOpenBrack == 0){
          asked = true;
          //console.log("question " + question);
          console.log("PR 678 "+question+"++++"+frontTxt+"("+"+++++"+qa.substring(i+1)+backTxt);var result = process(question, frontTxt+"(", qa.substring(i+1)+backTxt,steps.length-1);
            if (result === true){
              continue; 
            } else if (result === false){
              addStep(frontTxt+"(false "+qa.substring(i+2)+backTxt);  //console.log("Al 680"+frontTxt+"(false "+qa.substring(i+2)+backTxt);
              throw "false question";
            } else {
              throw "not boolean";
            }
        }
      } else {
        //console.log("hello");
        answer += c;
        numOpenBrack--;
        if (numOpenBrack == 0){
          //console.log("questsadf " + question);
          if (question == "else"){
              //addStep(frontTxt.substring(0, frontTxt.length-6)+"(else "+answer+backTxt.substring(1, backTxt.length)); //console.log("Al 693"+frontTxt.substring(0, frontTxt.length-6)+"(else "+answer+backTxt.substring(1, backTxt.length));
              console.log("AAA "+ answer); return answer;
          }else{
              //addStep(frontTxt.substring(0, frontTxt.length-6)+answer+backTxt.substring(1, backTxt.length)); //console.log("Al 698"+frontTxt.substring(0, frontTxt.length-6)+answer+backTxt.substring(1, backTxt.length));
              console.log("AAA "+ answer); return answer;
          }
          
        }
      }
    } else {
        if (!asked){
          question += c;
        }else {
          answer += c;
          if (i == qa.length-2){
            if (question == "else"){
              //addStep(frontTxt.substring(0, frontTxt.length-6)+"(else "+answer+qa.substring(i+1)+backTxt.substring(1, backTxt.length)); //console.log("Al 709"+frontTxt.substring(0, frontTxt.length-6)+"(else "+answer+qa.substring(i+1)+backTxt.substring(1, backTxt.length));
              console.log("AAA "+ answer); return answer;
            }else{
              //addStep(frontTxt.substring(0, frontTxt.length-6)+answer+removeUntilCloseBrac(backTxt)); //console.log("Al 712"+frontTxt.substring(0, frontTxt.length-6)+answer+removeUntilCloseBrac(backTxt));
              console.log("AAA "+ answer); return answer;
            }
          }
        }
    }
  }
}
  
function removeUntilCloseBrac(str) {
  var numOpenBrack = 0;
  for (var i = 0; i < str.length; i++){
    var c = str[i];
    if (c == "("){
      numOpenBrack++;
    } else if (c == ")"){
      if (numOpenBrack == 0){
        return str.substring(i+1);
      } else {
        numOpenBrack--;
      }
    }
  }
}
// consumes a variable and finds value associated with varialbe
// if variable's not found, throws error
// if variable has bad syntax, throws error
function processDefinition(block){
  var def ="";
  var seenBlank = false;
  if (!isNaN(block)){
    return block;
  }
  for (var i = 0; i < block.length; i++){
    c = block[i];
    if (c == " ") seenBlank = true;
    else{
      if (seenBlank){
        throw "Syntax Error";
      }
      else{
        def += c;
      }
    }
  }
  if (def in definitions){
    //console.log("def= " + def);
    return definitions[def];
  }
  else {
    throw "Undefined Variable "+def;
  }
}

function constructIdentifier (parameters) {
  var str = "(";
  for (var i=0; i<parameters.length; i++) {
    str += parameters[i] + " ";
  }
  str = str.substring(0, str.length-1);
  str += ")";
  return str;
}
// construct the function def'n until the arg that you're processing
function constructFront (operator, ident, arg){
  var str = "";
  if (ident == ""){
    str = "(" + operator + " ";
    for (var i = 0; i < arg.length; i++){
      str += arg[i] + " ";
    }
  }
  else{
    str = "(" + operator + " " + ident + " ";
    for (var i = 0; i < arg.length; i++){
      str += arg[i] + " ";
    }
  }
  return str;
}
// logs the step; if step is present previously, does not log
function addStep (step, firstStep){
  console.log("steps" + step + " " + "FIRSTSTEP: "+firstStep);
  if (steps.length == 0){
    steps.push(step);
  }
  else if (steps[firstStep] != step && steps[steps.length-1] != step){
    steps.push(step);
  }
}
function constructList(arguments){
  var str = "(list ";
  for (var i = 0; i < arguments.length; i++){
    str += arguments[i] + " ";
  }
  str = str.substring(0, str.length-1);
  return str+")";
}