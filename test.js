#!/usr/bin/env node

var util = require('util'),
    blue    = require('./lib/blue');
var t = new blue.Template('example/main.tpl');
t.on('data', function(data) {
    util.print(data);
});
t.data({require:require});
t.run();
t.on('error', function(err) {
  console.log(err.message);
  console.log(err.stack);
});
