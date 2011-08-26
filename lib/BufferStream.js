var sys = require('util');
var Stream = require('stream').Stream;

function BufferStream () {
    Stream.apply(this);
    this._buffered = [];
    this.finished = false;
    this.writable = true;
}
sys.inherits(BufferStream, Stream);

BufferStream.prototype.end = function end(str) {
    this.finished = true;
    this.emit('update');
};
BufferStream.prototype.write = function write(str) {
    this._buffered.push(str);
    this.emit('update');
    return true;
};
BufferStream.prototype.getData = function getData(do_flush) {
    var res = this._buffered.join('');
    if(do_flush) this.flush();
    return res;
};
BufferStream.prototype.flush = function flush() {
    this._buffered = [];
};
BufferStream.prototype.isEmpty = function isEmpty() {
    return this._buffered.length == 0;
};

module.exports = BufferStream;
