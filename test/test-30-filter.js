var Sink = require('./sink');
var blue = require('../');

exports.testFilterData = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/filter.tpl');
    t.data({
        str: "hello world!"
    })
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'HELLO WORLD!', "sink data should be identical");
        test.done();
    });
}

exports.testFilterStream = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/filter.tpl');
    t.data({
        str: new blue.Template(__dirname + '/templates/hw.tpl')
    })
    t.on('error', function(err) {
        test.fail(err.message);
        test.done();
    });
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'HELLO WORLD!', "sink data should be identical");
        test.done();
    });
}
