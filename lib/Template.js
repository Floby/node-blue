var path = require('path');
var stream = require('stream');
var StreamStream = require('stream-stream');
var fs = require('fs');
var util = require('util');
var process_template = require('./compile');
var Script = require('vm').Script;

function Template (filename, options) {
    stream.Readable.call(this, options);

    this._filename = path.resolve(process.cwd(), filename);
    this._directory = path.dirname(this._filename);
    this._data = {};

    // set up a stream stream that will hold
    // all the output
    this._output = new StreamStream();
    this._output.on('readable', function() {
        this.read(0);
    }.bind(this));
    this._output.on('end', function() {
        this._ended = true;
    }.bind(this));
}
util.inherits(Template, stream.Readable);

Template.prototype._read = function _read(size) {
    // read from our output, this is easy!
    var data = this._output.read(size);
    var res;
    if(data === null) {
        if(this._ended) res = this.push(null);
        else res = this.push('');
    }
    else {
        res = this.push(data);
    }
};

Template.prototype.pipe = function pipe() {
    this.run();
    return Template.super_.prototype.pipe.apply(this, arguments);
};

Template.prototype.run = function run() {
    if(this._running) return;
    this._running = true;

    var print = make_print(this);
    var include = make_include(this, print);
    this.getScript(function(err, script) {
        if(err) return self.emit(err);
        try {
            script.call(
                this.data(),
                print,
                include,
                this.data(),
                process_template._filters,
                printable
            );
            this._output.end();
            this._endPrintStream();
        }
        catch(e) {
            this.emit('error', e);
            return false;
        }
    });
};

Template.prototype.addStream = function addStream(s) {
    if(!(s instanceof stream.Stream)) {
        return this.emit('error', new TypeError('given parameter is not a stream'));
    }
    this._output.write(s);
    this.read(0);
};

/**
 * turns anything into a readable stream for printing
 * @param toPrint (mixed) what we want to print
 */
function printable (toPrint) {
    var res = new stream.PassThrough();
    if(toPrint === null || typeof toPrint === 'undefined') {
        res.end()
    }
    
    if(!(toPrint instanceof stream.Stream)) {
        res.end(toPrint);
    }
    else if(toPrint.readable) {
        res = toPrint;
    }

    return res;
}

function isPrintable (chunk) {
    switch(typeof chunk) {
        case 'undefined':
            return false;
        case 'object':
            return chunk !== null;
        default:
            return true;
    }
}

function make_print (template) {
    return function print(str) {
        if(!isPrintable(str)) return;
        
        var directPrint = false;
        if(typeof str === 'string') {
            var current = template._getPrintStream();
            if(!current) {
                current = new stream.PassThrough();
                template._setPrintStream(current);
            }
            current.write(str);
            directPrint = true;
            str = current;
        }

        if(!directPrint) template._endPrintStream();
        template.addStream(str);
    }
}

function make_include (template, print) {
    return function include(filename) {
        if(filename[0] !== '/')
            filename = path.normalize(template._directory + '/' + filename);
        var tpl = new Template(filename);
        print(tpl);
    }
}

Template.prototype._getPrintStream = function _getPrintStream() {
    return this._printStream;
};
Template.prototype._setPrintStream = function _setPrintStream(stream) {
    this._printStream = stream;
    return this;
}
Template.prototype._endPrintStream = function _endPrintStream() {
    var s = this._getPrintStream();
    if(s) s.end();
    this._setPrintStream(null);
};

Template.prototype.getScript = function getScript(cb) {
    if(this._script) return cb(null, script);
    this.once('script', cb);
    if(this._script === null) return;
    this._script = null;

    fs.readFile(this._filename, 'utf8', function(err, data) {
        if(err) {
            return this.emit('error', err);
        }
        try {
            var tpl = process_template(data);
            tpl = "(function compiled_template(print, include, data, filters, __printable) {"
                + tpl
                + "})";

            var script = new Script(tpl, this._filename);
            var f = this._sandbox ?	script.runInNewContext(this._sandbox)
                                  : script.runInThisContext();
        } catch(e) {
            this.emit('error', e);
            return false;
        }

        this.emit('script', null, this._script = f);
    }.bind(this));
};

Template.prototype.sandbox = function sandbox(object) {
    this.sandbox = object || {};
    if(object === false) delete this.sandbox;
};
Template.prototype.data = function(data) {
    if(!data) return this._data;
    this._data = data;
};

module.exports = Template;
