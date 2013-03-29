var Sink = require('stream-sink');
var blue = require('../');

exports.testOneFile = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/hw.tpl');
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'hello world!', "sink data should be identical");
        test.done();
    });
}

exports.testOneFileWithMarkup = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/hw.markup.tpl');
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'hello world!', "sink data should be identical");
        test.done();
    });
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
}
