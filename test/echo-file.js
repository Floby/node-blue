var blue = require('../');
var Template = blue.Template;
var fs = require('fs');
var stream = fs.createReadStream(__filename, {encoding:'utf8'});
var t = new Template(__dirname+'/echo-file.tpl');
t.data({stream:stream})
t.pipe(process.stdout);
t.run();
