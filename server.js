var express = require('express');
var fs = require('fs');

var livereload = require('livereload');
var app = express();

var staticDir = __dirname + "/public";
var dataDir = __dirname + "/data";

app.get(/data\/.*/, function(req, res) {
    var basename = req.path.substr(6).trimRight("/");
    var filename = dataDir + "/" + basename;

    try {
        var content = fs.readFileSync(filename, "utf8");
        res.send(content);
    } catch(e) {
        res.sendStatus(404);
    }
});

app.use("/", express.static(staticDir));

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Serving static on http://%s:%s", host, port);
});

liveserver = livereload.createServer();
liveserver.watch(staticDir);
