var assemblyCode;
var outputCode;

$(document).ready(function(){
	//code here...
	var code = $(".codemirror-textarea")[0];
    
    

	var code1 = $(".codemirror-textarea-output")[0];
	var editor = CodeMirror.fromTextArea(code, {
		lineNumbers : true
	});
	assemblyCode = editor;
    editor.setSize("30vh", "55vh");
    var r1=CodeMirror.fromTextArea(code1, {
        readOnly: true,
        cursorBlinkRate:-1,
		lineNumbers : true
	});
    outputCode = r1;
      r1.setSize("30vh", "55vh");
});