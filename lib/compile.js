function compile_template(template) {
    // simple substitution from <%= /* */ %> forms to <% echo() %>
    var template = template.replace(/<%=(.*)%>/g, "<% print($1);  %>");
    // substition for includes
    template = template.replace(/<%@(.*)%>/g, "<% include($1); %>");
    var result = ""; ///< result string
    var current = 0; ///< current offset
    var finished = false; ///< is the compilation over
    /**
     * dummy Exception class
     */
    function FinishedTemplate() {
	// as you can see, this is dummy
    };
    /**
     * gets a pure text out of the template
     * until it encounters a <%
     */
    function getText() {
	var begin = current,
	    end = template.indexOf('<%', current);
	if(end == -1) {
	    finished = true;
	    end = template.length;
	}
	// extract content between boundaries
	var content = template.substring(begin, end);
	// split content by lines
	// for better error reporting
	// (keep orginal line numbers)
	var split = content.split(/\n\r|\n|\r/);
	// we keep the last one for later as it
	// can be an incomplete line
	var last = split.pop();
	for(var i=0 ; i<split.length ; ++i) {
	    result += "print("+ JSON.stringify(split[i]+"\n") +");\n";
	}
	if(last !== '') {
	    // note: no \n at the end
	    result += "print("+ JSON.stringify(last) +");"
	}
	current = end;
	if(finished) throw new FinishedTemplate();
    } 
    function getSource() {
	// the +2 is for ignoring the <%
	var begin = current + 2,
	    end = template.indexOf('%>', current);
	if(end == -1) {
	    finished = true;
	    end = template.length;
	}
	var content = template.substring(begin, end);
	result += content;
	// the +2 is for ignoring the %>
	current = end + 2;
	if(finished) throw new FinishedTemplate();
    }

    try {
	while(true) {
	    // this loops ends when the
	    // FinishedTemplate exception
	    // is thrown
	    getText();
	    getSource();
	}
    } catch (e) {
	if(e instanceof FinishedTemplate)
	    return result;
	else
	    throw e;
    }
}

//module.exports = process_template;
module.exports = compile_template;
