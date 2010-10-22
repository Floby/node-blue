var EventEmitter = require('event').EventEmitter;
var sys = require('sys');
function Cache(options) {
    EventEmitter.apply(this);

    var default = {
    };
    this._options = options;
    this._options.__proto__ = default;
}
sys.inherits(Cache, EventEmitter);

Cache.prototype.set = function(key, value, data) {
    
};
