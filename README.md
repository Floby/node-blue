[![Build Status](https://secure.travis-ci.org/Floby/node-blue.png?branch=master)](http://travis-ci.org/Floby/node-blue)

> Blue is a simple JSP-like, streamed template engine for [NodeJS](http://github.com/ry/node).

## Setup

### Git

	git clone http://github.com/Floby/node-blue.git

### Npm
[npm](http://github.com/isaacs/npm) is a package manager for node

	npm install blue

## Using

### Plus

The major interest of Blue resides in its streamed nature. When working with templates, you
are very likely to include templates from templates which were included from other templates.
The Blue engine doesn't wait for an included file to be read, compiled and processed. It just
buffers the results of the current template until it can be sent.

### Example

blue exports a `Template` class which you'll need to instanciate

	var Template = require('blue').Template;
	var template = new Template('mytemplate.tpl', {dummy:'dummy'})
	template.on('data', function(data) {
	  sys.print(data);
	})
	template.run();

the Template class follow more or less the Readable Stream interface (I plan on fully implementing it very soon).

### Methods
* `data([object])` : Getter/Setter on the data that will be passed to the template
* `sandbox(object)` : Sets the template to be sandboxed when run. See `Script`
* `sandbox(false)` : Unsets the sandbox behavior if set previously
* `run()` : Runs the template

### Events
* `'data' : function(data)`  emitted when a new chunk of data is available
* `'end' : function()` emitted when the template has been fully processed
* `'error' : function(err)` emitter when some kind of error happens, most likely to be an exception that has been caught

### Template syntax

The template syntax is inspired by JSP. you can include javascript code in the middle of your
file if you put `<%` and `%>` around. by default the `print()` and `include()` function are available
from the template. Others may be available depending on the sandboxing behaviour. `print(data)` will
write `data` out and `include('filename')` will process `filename` as a template and insert the
result where the call was made. `filename` can be a relative or absolute path.

* `<%= {expression} %>` is a shortcut for print({expression}).
* `<%@ 'filename' %>` is a shortcut for include(filename). Note that if it is constant, quotes
must be used.


```jsp
<html>
  <head>
    <title> <%= data.title /* accessing passed in data */ %> </title>
  </head>
  <body>
    <ul>
      <% for(var i = 0 ; i<5 ; ++i) { %>
          <li> <%= i %> </li>
      <% } %>
    </ul>
    <%@ 'paragraph.tpl' %>
  </body>
</html>
```


