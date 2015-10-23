"use strict";

//
// Start the simulation
//
var width = 800,
    height = 600,
    N = 200;
var canvas = Canvas($("#c1"), width, height).clear();

// load the graph async

var graph;
var draw = function(iter) {
    canvas.clear();
    canvas.graph(graph);
};
function start() {
    $("#graph-name").html(graph.name);
    Verlet_Simulate1(graph, draw, {
        totaliter: 100,
        dt: 0.1,
        delay: 10,
        damping: 0.01,
        L0: 10,
        K: 1/1000,
    });
}


function StartFromRandom() {
    RandomGraph(N, width, height).then(function(g) {
        graph = Prims(g, Euclidean);
        start();
    });
}

function StartFromFile(filename) {
    LoadGraph(filename, width, height).then(function(g) {
        graph = g;
        start()
    });
}



// Start everything
var hash = window.location.hash;
if(hash.length > 0) {
    StartFromFile(hash.substr(1));
} else {
    StartFromRandom();
}


// Enable the buttons
$("button.load").on('click', function() {
    var button = $(this);
    var filename = button.text();

    StartFromFile(filename);
});
