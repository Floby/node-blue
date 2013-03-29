var Sink = require('stream-sink');
var blue = require('../');

exports.testDataStream = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/data.tpl');
    var pt = new require('stream').PassThrough();
    t.data({
        str: pt
    })
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'hello world!', "sink data should be identical");
        test.done();
    });

    setTimeout(function() {
        pt.end('hello world!');
    }, 50);
}
