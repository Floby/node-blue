var Sink = require('stream-sink');
var blue = require('../');

exports.testDataString = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/data.tpl');
    t.data({
        str: "hello world!"
    })
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'hello world!', "sink data should be identical");
        test.done();
    });
}

exports.testDataUndefined = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/data.tpl');
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), '', "sink data should be identical");
        test.done();
    });
}

exports.testDataAsThis = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/data.this.tpl');
    t.data({
        str: "hello world!"
    })
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'hello world!', "sink data should be identical");
        test.done();
    });
}

