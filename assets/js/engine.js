/*var PC = $('#pc');
var IR = $('#ir');
var R0 = $('#r0');
var R1 = $('#r1');
var R2 = $('#r2');
var R3 = $('#r3');
var R4 = $('#r4');
var R5 = $('#r5');
var R6 = $('#r6');
var R7 = $('#r7');
var R8 = $('#r8');
var R9 = $('#r9');
var R10 = $('#r10');
var R11 = $('#r11');
var R12 = $('#r12');
var R13 = $('#r13');
var R14 = $('#r14');
var R15 = $('#r15');
var R16 = $('#r16');
var R17 = $('#r17');
var R18 = $('#r18');
var R19 = $('#r19');
var R20 = $('#r20');
var R21 = $('#r21');
var R22 = $('#r22');
var R23 = $('#r23');
var R24 = $('#r24');
var R25 = $('#r25');
var R26 = $('#r26');
var R27 = $('#r27');
var R28 = $('#r28');
var R29 = $('#r29');
var R30 = $('#r30');
var R31 = $('#r31');
*/
var BASE = 10;
var INPUT_BASE = 10;
var VERBOSE = true;

function setVerbose() {
    VERBOSE = !VERBOSE;
}

function resetSimulator() {
    for (var i = 0; i < 32; i++) {
        $("#r"+i).text("0")
    }
    $("#ir").text("0")
    $("#pc").text("0")
    outputCode.setValue("");
    outputCode.clearHistory();
}

function setInputBinary(){
    INPUT_BASE = 2;
}

function setInputOctal(){
    INPUT_BASE = 8;
}

function setInputDecimal(){
    INPUT_BASE = 10;
}

function setInputHex(){
    INPUT_BASE = 16;
}

function setBaseBinary() {
    for (var i = 0; i < 32; i++) {
        text = getIntValue("#r"+i,BASE)
        n = convertBase(text,2)
        $("#r"+i).text(n+"")
    }
    text = getIntValue("#ir",BASE)
    n = convertBase(text,2)
    $("#ir").text(n+"")
    text = getIntValue("#pc",BASE)
    n = convertBase(text,2)
    $("#pc").text(n+"")
    BASE = 2;
}

function setBaseOctal() {
    for (var i = 0; i < 32; i++) {
        text = getIntValue("#r"+i,BASE)
        n = convertBase(text,8)
        $("#r"+i).text(n+"")
    }
    text = getIntValue("#ir",BASE)
    n = convertBase(text,8)
    $("#ir").text(n+"")
    text = getIntValue("#pc",BASE)
    n = convertBase(text,8)
    $("#pc").text(n+"")
    BASE = 8;
}

function setBaseDecimal() {
    for (var i = 0; i < 32; i++) {
        text = getIntValue("#r"+i,BASE)
        n = convertBase(text,10)
        $("#r"+i).text(n+"")
    }
    text = getIntValue("#ir",BASE)
    n = convertBase(text,10)
    $("#ir").text(n+"")
    text = getIntValue("#pc",BASE)
    n = convertBase(text,10)
    $("#pc").text(n+"")
    BASE = 10;
}

function setBaseHex() {
    for (var i = 0; i < 32; i++) {
        text = getIntValue("#r"+i,BASE)
        n = convertBase(text,16)
        $("#r"+i).text(n+"")
    }
    text = getIntValue("#ir",BASE)
    n = convertBase(text,16)
    $("#ir").text(n+"")
    text = getIntValue("#pc",BASE)
    n = convertBase(text,16)
    $("#pc").text(n+"")
    BASE = 16;
}


var errorRaised = false;
var stopRaised = false;
var memory = {};

function executeAssembly() {
    errorRaised = false;
    stopRaised = false;
    changeRegister("#pc","1");
    var code = assemblyCode.getValue().split("\n");

    while(parseInt($('#pc').text(),BASE)-1<code.length){
        if(errorRaised){
            appendToOutput("ERROR!")
            appendToOutput("ABORTING EXECUTION!")
            break;
        }
        if(stopRaised){
            break;
        }

        handleCode(code[parseInt($('#pc').text(),BASE)-1]);
    }
    // changeRegister("#pc",1);
}

function getFinalCode(operation,operands) {
    opCode = convertBase(getOpCode(operation),2)
    cmd = pad(opCode,6);
    c = operands.length;
    for(var i=0;i<c;i++){
        k = operands[i].replace("r","")
        dat = parseInt(k,INPUT_BASE)
        cmd += pad(convertBase(dat,2),6)
    }
    cmd = padR(cmd,32);
    if(cmd.length>32)
        appendToOutput("Warning : IR exceeds 32 bits! the command wont run on real machine!")

    if(BASE == 2)
        return cmd

    csd = parseInt(cmd,2)
    return convertBase(csd,BASE)

}

function getOpCode(operation) {
    switch (operation.toLowerCase()) {
        case "ld" : return 1;
        case "ldr" : return 2;
        case "la" : return 5;
        case "lar" : return 6;
        case "st" : return 3;
        case "str" : return 4;
        case "br" : return 8;
        case "brl" : return 9;
        case "add" : return 12;
        case "sub" : return 14;
        case "neg" : return 15;
        case "addi" : return 13;
        case "and" : return 20;
        case "andi" : return 21;
        case "or" : return 22;
        case "ori" : return 23;
        case "not" : return 24;
        case "shr" : return 26;
        case "shra" : return 27;
        case "shl" : return 28;
        case "shc" : return 29;
        case "nop" : return 0;
        case "stop" : return 31;
    }
}


function handleCode(line) {
    incrementPC();
    if(VERBOSE)
    appendToOutput("Fetching PC...");

    part = line.split(" ");
    operation = part[0];
    if(part.length>1)
        p = part[1];
    else
        p = ""
    operandsMeta = p
    if(p.includes(";"))
        operandsMeta = part[1].substring(0, part[1].indexOf(';'));

    if(operandsMeta.includes(","))
        operands = operandsMeta.split(",");
    else
        operands = operandsMeta;
    if(operands.length > 3 && !operation.startsWith("brl")){
        raiseError("Unsupported more than 3 bit addressing...");
    }
    pc = $('#pc').text()
    changeRegister('#ir',getFinalCode(operation,operands));

    //everything seems okay so far...
    handleCommand(operation,operands);
}


function changeRegister(registerId,value) {
    try {
        str = registerId.trim().replace("#", "").toUpperCase() + " = " + value;
        $(registerId).text(value)
        if(VERBOSE)
        appendToOutput(str)
    }catch (e) {
        appendToOutput("Error trying to change "+registerId.replace("#", "").toUpperCase())
    }
}

function changeRegisterCustom(registerId,value,message) {
    try {
        str = message.trim().replace("#", "").toUpperCase();
        $(registerId).text(value)
        appendToOutput(str)
    }catch (e) {
        appendToOutput("Error trying to change "+registerId.replace("#", "").toUpperCase())
    }
}

function raiseError(errorInfo) {
    errorRaised = true;
    appendToOutput(errorInfo);
}

function appendToOutput(string){

    if(string.toLowerCase().includes("branching"))
        if(VERBOSE)
            outputCode.replaceRange(string+"\n", CodeMirror.Pos(outputCode.lastLine()))
        else{}
    else
        outputCode.replaceRange(string+"\n", CodeMirror.Pos(outputCode.lastLine()))
}

function incrementPC() {
    val = parseInt($('#pc').text(),BASE) + 1

    changeRegister('#pc',convertBase(val,BASE))
}

function malfunctionCommand() {
    raiseError('Command not supported. Please check the cheat sheat given below');
}

function registerNotFound() {
    raiseError('Required register was not found');
}

function registerExists(id) {
    if(id === "pc")
        return true;
    if(id === "ir")
        return true;
    for (var i=0;i<32;i++)
        if(id === "r"+i)
            return true;
    return false;
}

function getIntValue(registerId,base) {
    return parseInt($(registerId).text(),base);
}


function handleCommand(command,operands) {


    if(command.toLowerCase().includes("br")){
        brOperation(command.toLowerCase(),operands)
        return
    }

    switch (command.toLowerCase()) {
        case "add" :
            addOperation(operands);
            break;
        case "addi" :
            addIOperation(operands);
            break;
        case "neg":
            negOperation(operands);
            break;
        case "sub":
            subOperation(operands);
            break;
        case "and":
            andOperation(operands);
            break;
        case "andi":
            andIOperation(operands);
            break;
        case "or":
            orOperation(operands);
            break;
        case "ori":
            orIOperation(operands);
            break;
        case "not":
            notOperation(operands);
            break;
        case "shr":
            shrOperation(operands);
            break;
        case "shra":
            shraOperation(operands);
            break;
        case "shl":
            shlOperation(operands);
            break;
        case "shc":
            shcOperation(operands);
            break;
        case "nop;":
        case "nop":
            nopOperation(operands);
            break;
        case "stop;":
        case "stop":
            stopOperation(operands);
            break;
        case "ld":
            ldOperation(operands);
            break;
        case "ldr":
            ldOperation(operands);
            break;
        case "la":
            laOperation(operands);
            break;
        case "lar":
            larOperation(operands);
            break;
        case "st":
            stOperation(operands);
            break;
        case "str":
            strOperation(operands);
            break;
        default:malfunctionCommand();
    }
}

function ldrOperation(operands) {
    if (operands.length < 3) {
        if (registerExists(operands[0])) {
            sum = parseInt(operands[1],INPUT_BASE)
            pc = getIntValue('#pc',BASE);
            content = memory[sum+pc]
            if (typeof content === 'undefined'){
                changeRegisterCustom('#' + operands[0], 0, operands[0] + ' = M[' + operands[1] +"+PC] <-- 0")
            }
            else {
                changeRegisterCustom('#' + operands[0], convertBase(content,BASE), operands[0] + ' = M[' + operands[1] +"+PC] <-- " + convertBase(content,BASE))
            }
        } else
            registerNotFound();
    } else {
        malfunctionCommand();

    }
}

function brOperation(command,operands) {
    console.log("Called br")
    if (operands.length <= 4) {

            if(command.includes("brl")){
                handleLinked(command,operands);
            }
            else{
                handleBranch(command,operands);
            }

    } else {
        malfunctionCommand();
    }
}

function handleLinked(command,operands) {
    intPCval = getIntValue("#pc",BASE);
    basePCval = convertBase(intPCval,BASE);
    if(operands.length==4){ //its that C command so check for C =_=
        branchAddress = getIntValue("#"+operands[1],BASE);
        cond = getIntValue("#"+operands[2],BASE);
        test = parseInt(operands[3],INPUT_BASE);
        if(test >= 0 && test <=5){
            switch (test) {
                case 0:
                    appendToOutput("branch never... should I do anything here??")

                    break;
                case 1:
                    changeRegister("#"+operands[0],basePCval)
                    changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+operands[1])
                    break;
                case 2:
                    if(cond==0) {
                        changeRegister("#"+operands[0],basePCval)
                        changeRegisterCustom("#pc", convertBase(branchAddress, BASE), "Branching to " + operands[1])
                    }
                    else
                        appendToOutput("Not branching as the condition is not met")
                    break;
                case 3:
                    if(cond!=0) {
                        changeRegister("#"+operands[0],basePCval)
                        changeRegisterCustom("#pc", convertBase(branchAddress, BASE), "Branching to " + operands[1])
                    }
                    else
                        appendToOutput("Not branching as the condition is not met")
                    break;
                case 4:
                    if(cond>=0 && cond<parseInt("10000000000000000000000000000000",2)) {
                        changeRegister("#"+operands[0],basePCval)
                        changeRegisterCustom("#pc", convertBase(branchAddress, BASE), "Branching to " + operands[1])
                    }
                    else
                        appendToOutput("Not branching as the condition is not met")
                case 5:
                    if(cond<0 || cond>=parseInt("10000000000000000000000000000000",2)) {
                        changeRegister("#"+operands[0],basePCval)
                        changeRegisterCustom("#pc", convertBase(branchAddress, BASE), "Branching to " + operands[1])
                    }
                    else
                        appendToOutput("Not branching as the condition is not met")
            }
        }else{
            raiseError("condition not found!")
        }

    }else{
        //phew people are using real thing now...
        branchAddress = ""
        outputN = ""

        if(typeof(operands)==="string") {
            branchAddress = getIntValue("#" + operands, BASE);
            outputN = operands
        }
        else {
            branchAddress = getIntValue("#" + operands[1], BASE);
            outputN = operands[1]
        }
        if(command.includes("nv")){
            appendToOutput("branch never... should I do anything here??")
        }else if(command.includes("zr")){
            cond = getIntValue("#"+operands[2],BASE)
            if(cond==0) {
                changeRegister("#"+operands[0],basePCval)
                changeRegisterCustom("#pc", convertBase(branchAddress, BASE), "Branching to " + outputN)
            }
            else
                appendToOutput("Not branching as the condition is not met")
        }else if(command.includes("nz")){
            cond = getIntValue("#"+operands[2],BASE)
            if(cond!=0) {
                changeRegister("#"+operands[0],basePCval)
                changeRegisterCustom("#pc", convertBase(branchAddress, BASE), "Branching to " + outputN)
            }
            else
                appendToOutput("Not branching as the condition is not met")
        }else if(command.includes("pl")){
            cond = getIntValue("#"+operands[2],BASE)
            if(cond>=0 && cond<parseInt("10000000000000000000000000000000",2)) {
                changeRegister("#"+operands[0],basePCval)
                changeRegisterCustom("#pc", convertBase(branchAddress, BASE), "Branching to " + outputN)
            }
            else
                appendToOutput("Not branching as the condition is not met")
        }else if(command.includes("mi")){
            cond = getIntValue("#"+operands[2],BASE)
            if(cond<0 || cond>=parseInt("10000000000000000000000000000000",2)) {
                changeRegister("#"+operands[0],basePCval)
                changeRegisterCustom("#pc", convertBase(branchAddress, BASE), "Branching to " + outputN)
            }
            else
                appendToOutput("Not branching as the condition is not met")
        }else if(command.trim()==="brl"){
            changeRegister("#"+operands[0],basePCval)
            changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+outputN)
        }

    }
}

function handleBranch(command,operands) {
    if(operands.length==3){ //its that C command so check for C =_=
        branchAddress = getIntValue("#"+operands[0],BASE);
        cond = getIntValue("#"+operands[1],BASE);
        test = parseInt(operands[2],INPUT_BASE);
        if(test >= 0 && test <=5){
            switch (test) {
                case 0:
                    appendToOutput("branch never... should I do anything here??")
                    break;
                case 1:
                    changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+operands[0])
                    break;
                case 2:
                    if(cond==0)
                        changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+operands[0])
                    else
                        appendToOutput("Not branching as the condition is not met")
                    break;
                case 3:
                    if(cond!=0)
                        changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+operands[0])
                    else
                        appendToOutput("Not branching as the condition is not met")
                    break;
                case 4:
                    if(cond>=0 && cond<parseInt("10000000000000000000000000000000",2))
                        changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+operands[0])
                    else
                        appendToOutput("Not branching as the condition is not met")
                case 5:
                    if(cond<0 || cond>=parseInt("10000000000000000000000000000000",2))
                        changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+operands[0])
                    else
                        appendToOutput("Not branching as the condition is not met")
            }
        }else{
            raiseError("condition not found!")
        }

    }else{
        //phew people are using real thing now...
        branchAddress = ""
        outputN = ""
        if(typeof(operands)==="string") {
            branchAddress = getIntValue("#" + operands, BASE);
            outputN = operands
        }
        else {
            branchAddress = getIntValue("#" + operands[0], BASE);
            outputN = operands[0]
        }
        if(command.includes("nv")){
            appendToOutput("branch never... should I do anything here??")
        }else if(command.includes("zr")){
            cond = getIntValue("#"+operands[1],BASE)
            if(cond==0)
                changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+outputN)
            else
                appendToOutput("Not branching as the condition is not met")
        }else if(command.includes("nz")){
            cond = getIntValue("#"+operands[1],BASE)
            if(cond!=0)
                changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+outputN)
            else
                appendToOutput("Not branching as the condition is not met")
        }else if(command.includes("pl")){
            cond = getIntValue("#"+operands[1],BASE)
            if(cond>=0 && cond<parseInt("10000000000000000000000000000000",2))
                changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+outputN)
            else
                appendToOutput("Not branching as the condition is not met")
        }else if(command.includes("mi")){
            cond = getIntValue("#"+operands[1],BASE)
            if(cond<0 || cond>=parseInt("10000000000000000000000000000000",2))
                changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+outputN)
            else
                appendToOutput("Not branching as the condition is not met")
        }else if(command.trim()==="br"){
            changeRegisterCustom("#pc",convertBase(branchAddress,BASE),"Branching to "+outputN)
        }

    }
}


function laOperation(operands) {
    if (operands.length < 3) {
        if (registerExists(operands[0])) {
            sum = parseInt(operands[1],INPUT_BASE)
            content = sum
            changeRegisterCustom('#' + operands[0], convertBase(content,BASE), operands[0] + ' = ' + operands[1] +" <-- " + convertBase(content,BASE))
        } else
            registerNotFound();
    } else {
        malfunctionCommand();

    }
}

function strOperation(operands) {
    if (operands.length < 3) {
        if (registerExists(operands[0])) {
            sum = parseInt(operands[1],INPUT_BASE)
            pc = getIntValue("#pc",BASE)
            memory[sum+pc]=getIntValue("#"+operands[0],BASE)
            k = sum+pc
            appendToOutput("M["+convertBase(sum,BASE)+"+PC] = "+convertBase(getIntValue('#'+operands[0],BASE),BASE))
        } else
            registerNotFound();
    } else {
        malfunctionCommand();

    }
}

function stOperation(operands) {
    if (operands.length < 3) {
        if (registerExists(operands[0])) {
            if(operands[1].includes("(")){
                newOp = operands[1].replace("("," ");
                newOp = newOp.replace(")","");
                newOp = newOp.split(" ");
                sum = getIntValue('#'+newOp[1],BASE)
                k = sum+parseInt(newOp[0],INPUT_BASE)
                memory[k] = getIntValue("#"+operands[0],BASE)
                appendToOutput("M["+convertBase(k,BASE)+"] = "+convertBase(getIntValue('#'+operands[0],BASE),BASE))
                return;
            }
            sum = parseInt(operands[1],INPUT_BASE)
            memory[sum]= getIntValue('#'+operands[0],BASE)
            appendToOutput("M["+convertBase(sum,BASE)+"] = "+convertBase(getIntValue('#'+operands[0],BASE),BASE))

        } else
            registerNotFound();
    } else {
        malfunctionCommand();

    }
}



function ldOperation(operands) {
    if (operands.length < 3) {
        if (registerExists(operands[0])) {
            if(operands[1].includes("(")){
                newOp = operands[1].replace("("," ");
                newOp = newOp.replace(")","");
                newOp = newOp.split(" ");
                sum = getIntValue('#'+newOp[1],BASE)
                content = memory[sum+parseInt(newOp[0],INPUT_BASE)];
                if (typeof content === 'undefined'){
                    changeRegisterCustom('#' + operands[0], 0, operands[0] + ' = M[' + newOp[0] +"+"+newOp[1]+"] <-- 0")
                }
                else {
                    changeRegisterCustom('#' + operands[0], convertBase(content,BASE), operands[0] + ' = M[' + newOp[0] +"+"+newOp[1]+"] <-- " + convertBase(content,BASE))
                }

                return;
            }
            sum = parseInt(operands[1],INPUT_BASE)
            content = memory[sum]
            if (typeof content === 'undefined'){
                changeRegisterCustom('#' + operands[0], 0, operands[0] + ' = M[' + operands[1] +"] <-- 0")
            }
            else {
                changeRegisterCustom('#' + operands[0], convertBase(content,BASE), operands[0] + ' = M[' + operands[1] +"] <-- " + convertBase(content,BASE))
            }
        } else
            registerNotFound();
    } else {
        malfunctionCommand();

    }
}


function nopOperation(operands) {
    appendToOutput("NOP!!!")
}
function stopOperation(operands) {
    stopRaised = true;
    appendToOutput("Stop met, Abort the program");
}



function shcOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1]) &&
            registerExists(operands[2])) {
            n = getIntValue('#' + operands[1],BASE);
            d = getIntValue('#' + operands[2],BASE);
            sum = (n << d)|(n >> (32 - d));
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '<<<>>>' + operands[2] + " <-- " + convertBase(sum,BASE))
        } else{
            p = parseInt(operands[2],BASE)
            if(!(typeof p == 'number')){
                registerNotFound();
            }
            else{
                n = getIntValue('#' + operands[1],BASE);
                d = p;
                sum = (n << d)|(n >> (32 - d));
                changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '<<<>>>' + operands[2] + " <-- " + convertBase(sum,BASE))
            }
        }
    }
}


function shrOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1]) &&
            registerExists(operands[2])) {
            sum = getIntValue('#' + operands[1],BASE) >>> getIntValue('#' + operands[2],BASE)
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '>>>' + operands[2] + " <-- " + convertBase(sum,BASE))
        } else {
            p = parseInt(operands[2],BASE)
            if(!(typeof p == 'number')){
                registerNotFound();
            }
            else{
                sum = getIntValue('#' + operands[1],BASE) >>> p
                changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '>>>' + operands[2] + " <-- " + convertBase(sum,BASE))
            }
        }
    }
}

function shlOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1]) &&
            registerExists(operands[2])) {
            sum = getIntValue('#' + operands[1],BASE) << getIntValue('#' + operands[2],BASE)
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '<<' + operands[2] + " <-- " + convertBase(sum,BASE))
        } else{
            p = parseInt(operands[2],BASE)
            if(!(typeof p == 'number')){
                registerNotFound();
            }
            else{
                sum = getIntValue('#' + operands[1],BASE) << p
                changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '<<' + operands[2] + " <-- " + convertBase(sum,BASE))
            }
        }
    }
}

function shraOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1]) &&
            registerExists(operands[2])) {
            sum = getIntValue('#' + operands[1],BASE) >> getIntValue('#' + operands[2],BASE)
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '>>' + operands[2] + " <-- " + convertBase(sum,BASE))
        } else {
            p = parseInt(operands[2],BASE)
            if(!(typeof p == 'number')){
                registerNotFound();
            }
            else{
                sum = getIntValue('#' + operands[1],BASE) >> p
                changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '>>' + operands[2] + " <-- " + convertBase(sum,BASE))
            }
        }
    }
}


function orOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1]) &&
            registerExists(operands[2])) {
            sum = getIntValue('#' + operands[1],BASE) | getIntValue('#' + operands[2],BASE)
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '|' + operands[2] + " <-- " + convertBase(sum,BASE))
        } else
            registerNotFound();
    }
}

function andOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1]) &&
            registerExists(operands[2])) {

            sum = getIntValue('#' + operands[1],BASE) & getIntValue('#' + operands[2],BASE)
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '&' + operands[2] + " <-- " + convertBase(sum,BASE))
        } else
            registerNotFound();
    }
}

function andIOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1])) {

            if(convertBase(parseInt(operands[2],INPUT_BASE),2).length>32
                || operands[2].length>32) {
                raiseError('Register/constant content exceed 32bits')
                return;
            }

            sum = getIntValue('#' + operands[1],BASE) & parseInt(operands[2],INPUT_BASE)
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '&' + operands[2] + " <-- " + convertBase(sum,BASE))
        } else
            registerNotFound();
    }
}

function orIOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1])) {

            if(convertBase(parseInt(operands[2],INPUT_BASE),2).length>32
                || operands[2].length>32) {
                raiseError('Register/constant content exceed 32bits')
                return;
            }



            sum = getIntValue('#' + operands[1],BASE) | parseInt(operands[2],INPUT_BASE)
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '|' + operands[2] + " <-- " + convertBase(sum,BASE))
        } else
            registerNotFound();
    }
}

function negOperation(operands) {
    if (operands.length < 3) {
        if (registerExists(operands[0]) && registerExists(operands[1])) {
            sum = twosComplement('#' + operands[1],BASE)

            if(sum.toString(2).length<=32)
                changeRegisterCustom('#' + operands[0], sum, operands[0] + ' = -' + operands[1] +" <-- " + sum)
            else
                raiseError("Negation exceeds 32bits");
        } else
            registerNotFound();
    } else {
        malfunctionCommand();

    }
}

function notOperation(operands) {
    if (operands.length < 3) {
        if (registerExists(operands[0]) && registerExists(operands[1])) {
            sum = ~getIntValue('#'+operands[1],INPUT_BASE)
            console.log("SUM "+sum)
            console.log(convertBase(sum,BASE));
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = !' + operands[1] +" <-- " + convertBase(sum,BASE))

        } else
            registerNotFound();
    } else {
        malfunctionCommand();

    }
}


function twosComplement(registerId,base) {
    bin = pad($(registerId).text(),32);
    console.log("bin = "+bin)
    if(base === 2){}
    else{
        bin = convertBase(bin,2);
    }
        return (~parseInt(bin,2) + 1 >>> 0).toString(base)

    //(~0b11111111111111111111111111111111 + 1 >>> 0).toString(10)
}

function twosComplementSTR(numSTR,base) {
    bin = pad(numSTR,32);
    console.log("bin = "+bin)
    if(base === 2){}
    else{
        bin = convertBase(bin,2);
    }
    return (~parseInt(bin,2) + 1 >>> 0).toString(base)

    //(~0b11111111111111111111111111111111 + 1 >>> 0).toString(10)
}

function addOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1]) &&
            registerExists(operands[2])) {

            sum = getIntValue('#' + operands[1],BASE) + getIntValue('#' + operands[2],BASE)

            if(sum.toString(2).length>32){
                raiseError("Sum exceeds 32bits");
                return;
            }
            changeRegisterCustom('#' + operands[0], convertBase(sum,BASE), operands[0] + ' = ' + operands[1] + '+' + operands[2] + " <-- " + convertBase(sum,BASE))

        } else
            registerNotFound();
    }
}

function addIOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1])) {

            if(convertBase(getIntValue('#' + operands[1],BASE),2).length>32
                || convertBase(parseInt(operands[2],INPUT_BASE),2).length>32
                || operands[2].length>32) {
                raiseError('Register/constant content exceed 32bits')
                return;
            }

            sum = getIntValue('#' + operands[1],BASE) + parseInt(operands[2],INPUT_BASE)
            if(sum.toString(2).length>32){
                raiseError("Sum exceeds 32bits");
                return;
            }
            sum = convertBase(sum,BASE)
            console.log(sum)
            changeRegisterCustom('#' + operands[0], sum+"", operands[0] + ' = ' + operands[1] + '+' + operands[2] + " <-- " + sum)
          } else
            registerNotFound();
    }
}

function addBin(a, b) {
    var dec = Number(parseInt(a, 2)) + Number(parseInt(b, 2));
    return dec.toString(2);
}

function subOperation(operands) {
    if (operands.length < 3) {
        malfunctionCommand();
    } else {
        if (registerExists(operands[0]) && registerExists(operands[1]) &&
            registerExists(operands[2])) {
            var twosCompStr = twosComplement('#' + operands[2],BASE);
            var newComp = convertBase(parseInt(twosCompStr,BASE),2);
            a = pad(convertBase(getIntValue('#' + operands[1],BASE),2),32);
            sum = addBin(a, newComp);
            if(sum.length === 33){

                //result is positive.
                sum=sum.substring(1,33);
                sum = parseInt(sum,2)
                sum = convertBase(sum,BASE)
                changeRegisterCustom('#' + operands[0], sum, operands[0] + ' = ' + operands[1] + '-' + operands[2] + " <-- " + sum)
            }
            else{
                //result is negative
                sum = parseInt(sum,2)
                sum = convertBase(sum,BASE)
                changeRegisterCustom('#' + operands[0], sum, operands[0] + ' = ' + operands[1] + '-' + operands[2] + " <-- " +sum)
            }
        } else
            registerNotFound();
    }
}

function convertBase(num,base){
    str = (num >>> 0).toString(base);
    return str;
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function padR(num, size) {
    var s = num+"";
    while (s.length < size) s = s+ "0" ;
    return s;
}