function Canvas(element, width, height) {
    element.attr({
        width: width,
        height: height,
    });

    var ctx = element[0].getContext('2d');
    
    return {
        circle: function(point, prop) {
            prop = $.extend({
                color: '#582',
                opacity: 0.6,
            }, prop);

            ctx.save();
            ctx.globalAlpha = prop.opacity;
            ctx.fillStyle = prop.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.r, 0, 2*Math.PI);
            ctx.fill();

            if(point.label) {
                ctx.textAlign = "center";
                ctx.textBaseLine = "middle";
                ctx.fillStyle = "#333";
                ctx.font = "12pt Roboto";
                ctx.fillText(point.label, point.x, point.y);
            }
            ctx.restore();
            return this;
        },

        line: function(p0, p1, prop) {
            prop = $.extend({
                color: "#333",
                opacity: 0.6,
                width: 3,
            }, prop);

            ctx.save();
            ctx.globalAlpha = prop.opacity;
            ctx.strokeStyle = prop.color;
            ctx.lineWidth = prop.width;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
            ctx.restore();
            return this;
        },

        clear: function() {
            ctx.clearRect(0, 0, width, height);
            return this;
        },

        graph: function(graph, prop) {
            var canvas = this;
            prop = $.extend({}, prop);

            graph.nodes.forEach(function(node) {
                canvas.circle(node, prop);
            });

            graph.edges().forEach(function(edge) {
                canvas.line(
                    graph.node(edge[0]), graph.node(edge[1]), prop)
            });
        },
    }
};
