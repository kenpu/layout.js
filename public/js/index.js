function DrawPoints(ctx, points) {
    points.forEach(function(point, i) {
        Circle(ctx, point);
    });
}

function DrawGraph(ctx, G) {
    var adj = G.adjacency;
    var all = G.points;

    for(var id in all) {
        var p0 = all[id];
        adj[id].forEach(function(p1) {
            Line(ctx, p0, p1);
        });
    }
}

//
// Start the simulation
//
var width = 800,
    height = 600,
    N = 200;

var canvas = Canvas($("#c1"), width, height).clear();
var graph = Prims(RandomGraph(N, width, height), Euclidean);
// var graph = Prims(DebugGraph(width, height), Euclidean);

var draw = function(iter) {
    canvas.clear();
    canvas.graph(graph);
}

Verlet_Simulate1(graph, draw, {
    totaliter: 200,
    dt: 0.1,
    delay: 10,
    damping: 0.01,
    L0: 10,
    K: 1/1000,
});
