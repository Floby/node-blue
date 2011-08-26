var sys = require('util');
var Stream = require('stream').Stream;

function BufferStream () {
    Stream.apply(this);
    this._buffered = [];
}
sys.inherits(BufferStream, Stream);

BufferStream.prototype.end = function end(str) {
    Stream.prototype.end.apply(this, arguments);
    this.finished = true;
};
BufferStream.prototype.write = function write(str) {
    this._buffered.push(str);
};
BufferStream.prototype.getData = function getData(flush) {
    var res = this._buffered.join('');
    if(flush) this.flush();
    return res;
};
BufferStream.prototype.flush = function flush() {
    this._buffered = [];
};
BufferStream.prototype.isEmpty = function isEmpty() {
    return this._buffered.length == 0;
};


module.exports = BufferStream;
