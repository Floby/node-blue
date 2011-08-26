var sys = require('util');
var Stream = require('streams').Stream;

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
    if(flush) this.flushData();
    return res;
};

module.exports = BufferStream;
