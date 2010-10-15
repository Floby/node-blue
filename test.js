#!/usr/bin/env node

var sys	    = require('sys'),
    blue    = require('./lib/blue');
var t = new blue.Template('example/main.tpl');
t.on('data', function(data) {
    sys.print(data);
});
t.data({require:require});
t.run();
