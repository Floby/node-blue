var stream = require('stream');
var util = require('util');

function Through(modify) {
    if(!(this instanceof Through)) return new Through(modify);
    stream.Transform.call(this);
    this._modify = modify || function(data) { this.queue(data) };
}
util.inherits(Through, stream.Transform);

Through.prototype._transform = function _transform(chunk, encoding, callback) {
    this._modify(chunk.toString(encoding));
    callback();
};

Through.prototype._flush = function _flush(callback) {
    this.push(null);
    callback();
};

Through.prototype.queue = Through.prototype.push;

module.exports = Through;
