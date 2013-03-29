var Sink = require('./sink');
var blue = require('../');

exports.testOneFile = function(test) {
    var sink = Sink();
    var t = new blue.Template(__dirname + '/templates/data.tpl');
    t.data({
        str: "hello world!"
    })
    t.pipe(sink).on('data', function(data) {
        test.equal(data.trim(), 'hello world!', "sink data should be identical");
        test.done();
    });
}

