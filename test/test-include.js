var Sink = require('./sink');
var blue = require('../');

exports.testSimpleInclude = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/hw.include.tpl');
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'hello world!', "sink data should be identical");
        test.done();
    });
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
}

exports.testDoubleInclude = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/hw.include.double.tpl');
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'hello world!\nhello world!', "sink data should be identical");
        test.done();
    });
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
}
