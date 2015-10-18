var express = require('express');
var livereload = require('livereload');
var app = express();

var staticDir = __dirname + "/public";

app.use("/", express.static(staticDir));

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Serving static on http://%s:%s", host, port);
});

liveserver = livereload.createServer();
liveserver.watch(staticDir);
