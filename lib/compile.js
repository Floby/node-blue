var stream = require('stream');
var through = require('./through');

function substitute_affectation(str, p1, offset, s) {
    var split = p1.split('|');
    var str = split.shift();
    str = '(__printable('+str+'))';
    if(split.length == 0) {
        return '<%print('+ str +');%>';
    }
    var functions = [];
    var parenthesis = '';

    var filters = compile_template._filters;
    for (var i = 0; i < split.length; i++) {
        var name = split[i].trim();
        if(name == '') continue;
        if(filters[name]) {
            functions.push('filters.'+name);
            parenthesis += ')';
        }
    };
    var pipeline = functions.reduce(function(pipeline, e) {
        return pipeline + '.pipe(new '+e+'())';
    }, str);
    var result = "<% print("
        + pipeline
        + ');%>';
    return result;
}

function compile_template(template) {
    // simple substitution from <%= /* */ %> forms to <% echo() %>
    template = template.replace(/<%=([^>]*)%>/, substitute_affectation);
    // substition for includes
    template = template.replace(/<%@([^>]*)%>/g, "<% include($1); %>");
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

module.exports = compile_template;
compile_template._filters = {};
compile_template.registerFilter = function(name, func) {
    if(!/^[a-z0-9A-Z_]+$/.test(name))
        throw new Error("filter name should be [a-zA-Z0-9_]+");
    if(typeof(func) !== 'function')
        throw new TypeError("no function given when registering filter "+name);

    var filter = makeFilterStream(func, name);
    compile_template._filters[name] = filter;
};

function makeFilterStream (func, name) {
    if(func.prototype instanceof stream.Duplex) {
        return func;
    }

    return function FunctionFilter() {
        return through(function(data) {
            this.queue(func(data));
        });
    }
}

compile_template.registerFilter('lowercase', function(str) {
    return str.toLowerCase();
});

compile_template.registerFilter('uppercase', function(str) {
    return str.toUpperCase();
});
