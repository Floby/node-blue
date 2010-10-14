Blue is a simple JSP-like, streamed template engine for [NodeJS](http://github.com/ry/node).

## Setup

### Git

	git clone http://github.com/Floby/node-blue.git

### Npm
[npm](http://github.com/isaacs/npm) is a package manager for node

	npm install blue

## Using

### Example

blue exports a `Template` class which you'll need to instanciate

	var Template = require('blue').Template;
	var template = new Template('mytemplate.tpl', {dummy='dummy'})
	template.on('data', function(data) {
	  sys.print(data);
	})
	template.run();

the Template class follow more or less the Stream interface (I plan on fully implementing it very soon).

### Methods
* `data([object])` : Getter/Setter on the data that will be passed to the template
* `sandbox(object)` : Sets the template to be sandboxed when run. See `Script`
* `sandbox(false)` : Unsets the sandbox behavior if set previously
* `run()` : Runs the template
