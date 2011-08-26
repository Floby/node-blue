var fs = require('fs');
var path = require('path');
var sys = require('sys');
var Stream = require('stream').Stream;
var Script = process.binding('evals').Script;
var process_template = require('./compile');
var BufferStream = require('./BufferStream');

var Template = function Template(filename, data) {
    Stream.apply(this);
    this.filename = filename;
    this._buffers = [];
    this._data = data;
}
sys.inherits(Template, Stream);

Template.prototype.sandbox = function sandbox(object) {
    this.sandbox = object || {};
    if(object === false) delete this.sandbox;
};
Template.prototype.data = function(data) {
    if(!data) return this._data;
    this._data = data;
};

/**
 * returns the function which will print
 * to the correct output
 */
function make_print(tpl) {
    return function(str) {
        if(str instanceof Stream) return tpl.addStream(str);
        if(!tpl._current_buffer) {
            // no buffering
            return tpl._write(str);
        }
        var current = tpl._current_buffer;
        current.write(str);
        if(current === tpl._buffers[0]) tpl._newData();
    }
}

function make_include(tpl) {
    return function(filename) {
        if(filename[0] !== '/') 
            filename = path.normalize(tpl._directory + '/' + filename);

        // create a new template
        var template = new Template(filename);
        template.run();
        tpl.addStream(template);
    }
}

Template.prototype.addStream = function addStream(stream) {
    var self = this
    var buffer = new BufferStream;
    buffer.on('update', function() {
        self._newData();
    });
    buffer.on('error', function(err) {
        self.emit('error', err);
    });
    stream.setEncoding('utf8');
    stream.pipe(buffer);
    stream.resume();
    this._buffers.push(buffer);

    // prepare buffer steams for further printing of our own
    // template
    var buf = new BufferStream;
    this._buffers.push(buf);
    if(this._current_buffer) this._current_buffer.end();
    this._current_buffer = buf;
};


Template.prototype.run = function run() {
    var self = this;
    this._directory = path.dirname(this.filename);
    if(this._directory == '.') this._directory = process.cwd();
    fs.readFile(this.filename, 'utf8', function run(err, data) {
        if(err) {
            self.emit('error', err);
            return;
        }
        try {
            var tpl = process_template(data);
        } catch(e) {
            self.emit('error', e);
            return false;
        }
        var tpl = "(function compiled_template(print, include, data, filters) {" + tpl + "})";
        try {
            var script = new Script(tpl, self.filename);
        } catch(e) {
            self.emit('error', e);
            return false;
        }
        var f = self._sandbox ?	script.runInNewContext(self._sandbox) 
               : script.runInThisContext();
        /**
         * this function is called whenever 'print' is
         * called from the template
         */
        var print = make_print(self); // unested this code, see line 28
        var include = make_include(self); // same, see line 66
        try {
            // actually run the compiled template
            f(print, include, self._data, process_template._filters);
        } catch(e) {
            throw(e);
            self.emit('error', e);
            return false;
        }
        if(self._last_buffer) self._last_buffer.finished = true;
        self._finished = true;
        self._newData();
        return true;
    });
};
Template.prototype._newData = function _newData(logme) {
    //console.log(this._buffers);
    // flush all finished buffers
    while(this._buffers[0] && this._buffers[0].finished) {
        this._write(this._buffers[0].getData());
        this._buffers.shift();
    }
    
    // flush as much as possible from the
    // current buffer
    if(this._buffers[0] && !this._buffers[0].isEmpty()) {
        this._write(this._buffers[0].getData());
        this._buffers[0].flush();
    }
    
    // if there is no more data to be flushed
    // then we're done =]
    if(this._buffers.length == 0 && this._finished) {
        this.emit('end');
    }
};

Template.prototype._write = function _write(data) {
    this.emit('data', data);
};
Template.prototype.setEncoding = function setEncoding(encoding) {

};

module.exports = Template;
