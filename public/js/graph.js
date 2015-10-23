"use strict";

// a graph library
//

function Graph(name, nodes, width, height) {
    var all = {};
    var adjacency = {};

    nodes.forEach(function(p) {
        all[p.id] = p;
        adjacency[p.id] = [];
    });

    return {
        name: name,

        width: width,

        height: height,

        all: all,

        adjacency: adjacency,

        nodes: nodes,

        node: function(id) {
            return all[id];
        },

        connect: function(from, to, bidirectional) {
            adjacency[from].push(to);

            if(bidirectional)
                adjacency[to].push(from);

            return this;
        },

        neighbours: function(id, resolve) {
            if(! resolve) {
                return adjacency[id];
            } else {
                return adjacency[id].map(function(neighbourId) {
                    return all[neighbourId];
                });
            }
        },

        edges: function(undirected) {
            var edges = [];

            for(var id0 in adjacency) {
                adjacency[id0].forEach(function(id1) {
                    edges.push([id0, id1]);
                });
            }

            if(undirected)
                edges = edges.filter(function(edge) {
                    return edge[0] <= edge[1];
                });

            return edges;
        },

        sample: function() {
            for(var id in all) {
                return id;
            }
        },

    }
}



// Generate one random point
var pointID = 0;
function _randomPoint(w, h, r) {
    pointID += 1;
    return {
        id: pointID,
        label: pointID,
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * Math.random() * r + 5,
    }
}

// Generate n random points
function _randomPoints(n, w, h) {
    var points = [];

    for(var i=0; i < n; i++) {
        points.push(_randomPoint(w, h, 50));
    }

    return points;
}

function RandomGraph(n, w, h) {
    var deferred = $.Deferred();

    deferred.resolve(Graph("random" + n, _randomPoints(n, w, h), w, h));

    return deferred;
}

function DebugGraph(w, h) {
    var deferred = $.Deferred();
    var nodes = [
        {id: 1, x: 100, y: h / 2, r: 10},
        {id: 2, x: 200, y: h / 2, r: 10},
    ];

    deferred.resolve(Graph("Debug", nodes));

    return deferred;
}




// Some algorithms
function Euclidean(p1, p2) {
    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;
    return dx*dx + dy*dy;
}

function _shortestEdge(graph, dist, visited, remainder) {
    var dmin = null;
    var edge = null;

    for(var v in visited) {
        for(var r in remainder) {
            var d = dist(graph.node(v), graph.node(r));

            if(dmin === null) {
                dmin = d;
                edge = [v, r];
            } else {
                if(dmin > d) {
                    dmin = d;
                    edge = [v, r];
                }
            }
        }
    };
    return edge;
}

// MST using Prism's algorithm
function Prims(graph, dist) {
    var visited = {};
    var remainder = {};

    var root = graph.sample();

    for(var id in graph.all) {
        if(id == root)
            visited[id] = true;
        else 
            remainder[id] = true;
    }

    while(! $.isEmptyObject(remainder)) {
        var edge = _shortestEdge(graph, dist, visited, remainder);

        graph.connect(edge[0], edge[1], true);

        visited[edge[1]] = true;
        delete remainder[edge[1]];
    }

    return graph;
}
