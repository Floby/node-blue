<html>
    <head>
	<title>Coucou</title>
    </head>
    <body>
	<%= "oui" %>
	<%= data.require('sys') %>
	<%@ "paragraphe.tpl" %>
	<%@ "div.tpl" %>
	<div>
	    <%
		for(var i=0 ; i<10 ; ++i) {
		    print(i + "\n");
		}
	    %>
	</div>
    </body>
</html>
