// returns the graph structure from an edge file with similarity
// over AJAX
//

function LoadGraph(filename, w, h) {
    var dfdGraph = $.Deferred();
    var graph;

    $.ajax({
        url: "/data/" + filename,
        dataType: 'JSON',
        success: function(data) {
            var nodeId = 0;
            var nodeMap = {};
            var distances = {};
            
            data.forEach(function(edge) {
                var n1 = edge[0];
                var n2 = edge[1];
                var sim = edge[2];

                // remember the nodes
                if(! nodeMap[n1]) nodeMap[n1] = nodeId ++;
                if(! nodeMap[n2]) nodeMap[n2] = nodeId ++;

                // update the distance lookup
                if(n1 > n2) {
                    var n = n1;
                    n1 = n2;
                    n2 = n1;
                }

                if(! distances[n1]) distances[n1] = {};
                distances[n1][n2] = sim;
            });

            // convert the nodeMap to an array of nodes
            var nodes = [];
            for(var n in nodeMap) {
                nodes.push({
                    id: nodeMap[n],
                    label: n,
                    x: (0.4 + 0.2*Math.random()) * w,
                    y: (0.4 + 0.2*Math.random()) * h,
                    r: 20,
                });
            }

            graph = Graph(filename, nodes, w, h);
            // Connect the nodes
            data.forEach(function(e) {
                var id1 = nodeMap[e[0]],
                    id2 = nodeMap[e[1]];
                graph.connect(id1, id2, true);
            });

            dfdGraph.resolve(graph);
        },
        error: function() {
            graph = {name: "Error"};
            dfdGraph.resolve(graph);
        },
    });

    return dfdGraph;
}
