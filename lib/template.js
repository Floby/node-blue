var fs = require('fs');
var path = require('path');
var sys = require('sys');
var EventEmitter = require('events').EventEmitter;
var Script = process.binding('evals').Script;
var process_template = require('./compile');

var Template = function Template(filename, data) {
    EventEmitter.apply(this);
    this.filename = filename;
    this._buffers = [];
    this._data = data;
}

Template.prototype.__proto__ = EventEmitter.prototype;
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
        if(tpl._buffers.length) {
            //bufferize data
            // get the last buffer in the list
            var last_buffer = tpl._buffers[tpl._buffers.length -1];
            // if the last buffer is one from another file
            // then create a new buffer and push it at the end of the list
            if(last_buffer.filename !== null) {
                // mark our last buffer (if any) as finished
                if(tpl._last_buffer) tpl._last_buffer.finished = true;
                // create new buffer
                var buffer = {data:"", filename:null};
                // append new buffer at the end of the list
                tpl._buffers.push(buffer);
                // use this buffer for output coming from our file
                // in the future
                tpl._last_buffer = buffer;
                // append content to this buffer
                buffer.data += str;
            }
            else {
                // if our buffer is still active
                // append content to it
                last_buffer.data += str;
            }
            // notify that new data has been added
            tpl._newData();
        }
        else {
            // if no buffer exists, 
            // send directly to client
            tpl.emit('data', ""+str);
        }
    }
}

function make_include(tpl) {
    return function(filename) {
        if(filename[0] !== '/') 
            filename = path.normalize(tpl._directory + '/' + filename);

        // create a new template
        var template = new Template(filename);
        // create a new buffer for this template's output
        var buffer = {data: "", filename:filename};
        // append buffer to list
        tpl._buffers.push(buffer);
        // add listener on data
        template.on('data', function(data) {
            // add this data to this template's buffer
            buffer.data += data;
            // notify new data
            tpl._newData();
        });
        template.on('end', function() {
            // mark the buffer as finished
            buffer.finished = true;
            // notify new data
            tpl._newData();
        });
        template.on('errr', function(e) {
            tpl.emit('error', e);
        });
        // run main function
        template.run();
    }
}

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
        // to remove
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
Template.prototype._newData = function _newData() {
    // buffer data if no listener is there
    // to consume
    if(!this._events.data) return; 

    // flush all finished buffers
    while(this._buffers[0] && this._buffers[0].finished) {
        this.emit('data', this._buffers[0].data);
        this._buffers.shift();
    }
    // flush as much as possible from the
    // current buffer
    if(this._buffers[0] && this._buffers[0].data != '') {
        this.emit('data', this._buffers[0].data);
        this._buffers[0].data = "";
    }
    // if there is no more data to be flushed
    // then we're done =]
    if(this._buffers.length == 0 && this._finished) {
        this.emit('end');
    }
};

module.exports = Template;
