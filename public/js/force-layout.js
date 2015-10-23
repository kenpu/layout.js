"use strict";

function Verlet_Simulate1(graph, draw, prop) {
    prop = $.extend({
        totaliter: 100,
        delay: 100,
        damping: 0,
        dt: 0.1,
        L0: 10,
        K: 1/100,
        C: 0,
    }, prop);

    var iter = 0;

    // Track the necessary state
    var state = {};
    for(var id in graph.all) {
        var p = graph.node(id);
        state[id] = {
            x: p.x,
            y: p.y,
            xp: p.x,
            yp: p.y,
        };
    }

    // Single epoch
    var step = function() {
        iter += 1;
        console.debug("iter:", iter);
        draw(iter);
        if(iter < prop.totaliter) {
            Verlet_Update(graph, state, prop);
            Verlet_SolveConstraints(graph, state);
            setTimeout(step, prop.delay);
        }
    };

    step();
}

function Verlet_Update(graph, state, prop) {
    for(var id in graph.all) {
        Verlet_PointUpdate(id, graph, state, prop);
    }
}

function Verlet_PointUpdate(id, graph, state, prop) {
    var dt  = prop.dt,
        L0  = prop.L0,
        K   = prop.K,
        C   = prop.C,
        dmp = prop.damping;

    if(isNaN(dt + L0 + K)) {
        console.error("Verlet_PointUpdate:", dt, L0, K);
        throw "Verlet_PointUpdate";
    }
    var p = graph.node(id);

    var neighbours = graph.neighbours(id, true);

    var f = null;
    neighbours.forEach(function(q) {
        var fpq = _spring(p, q, L0, K);
        f = (f == null) ? fpq : _add(f, fpq);
    });

    graph.nodes.forEach(function(q) {
        if(p.id != q.id) {
            var fpq = _repel(p, q, C);
            f = (f == null) ? fpq : _add(f, fpq);
        }
    });

    var x  = state[id].x,
        xp = state[id].xp,
        y  = state[id].y,
        yp = state[id].yp;

    var ax = f.x,
        ay = f.y;

    p.x = (2-dmp)*x - (1-dmp)*xp + ax*dt*dt,
    p.y = (2-dmp)*y - (1-dmp)*yp + ay*dt*dt;

    // update state
    state[id].xp = x;
    state[id].yp = y;
    state[id].x = p.x;
    state[id].y = p.y;
}

// force acting on p by q via the spring (L0, K)
function _spring(p, q, L0, K) {
    var dx = p.x - q.x;
    var dy = p.y - q.y;
    var L = Math.sqrt(dx*dx + dy*dy);
    var dL = L - L0;
    var F = K * dL * dL;
    var Fx = F * dx / L;
    var Fy = F * dy / L;
    var sgn = (dL < 0) ? 1 : -1;

    var dir = _unit(dx, dy, L);
    // var factor = (dL < 0) ? K * dL * dL : - K * dL * dL;
    var force = {
        x: sgn * Fx,
        y: sgn * Fy,
    }

    return force;
}

// force acting on p by q via repulsion
function _repel(p, q, C) {
    var dx = p.x - q.x;
    var dy = p.y - q.y;
    var L2 = (dx*dx + dy*dy);
    var L = Math.sqrt(L2);

    var F = C / L2;
    var Fx = F * dx / L,
        Fy = F * dy / L;

    return {
        x: Fx,
        y: Fy,
    }
}

// make the unit vector from dx, dy.
// If the norm is too close to zero, return randomized.
function _unit(dx, dy, L) {
    if(L < 0.01) {
        var theta = Math.random() * 2 * Math.PI;
        return {
            x: Math.cos(theta),
            y: Math.sin(theta),
        }
    } else {
        return {
            x: dx / L,
            y: dy / L,
        }
    }
}

function _add(f1, f2) {
    f1.x += f2.x;
    f1.y += f2.y;

    return f1;
}

// TODO: should have a flag to enable different types of constraints
function Verlet_SolveConstraints(graph, state) {
    _solveBoundary(graph, state);
    // _solveCollision(graph, state);
}


function _solveBoundary(graph, state) {
    var DAMPING = 0.5;
    graph.nodes.forEach(function(node) {
        var vx, vy, px, py;
        var s = state[node.id];

        if(node.x - node.r < 0) {
            px = state[node.id].x;
            vx = (px - node.x) * DAMPING;
            s.x = node.x = node.r;
            s.xp = s.x - vx;
        } else if(node.x + node.r > graph.width) {
            px = state[node.id].x;
            vx = (px - node.x) * DAMPING;
            s.x = node.x = graph.width - node.r;
            s.xp = s.x - vx;
        }

        if(node.y - node.r < 0) {
            py = state[node.id].y;
            vy = (py - node.y) * DAMPING;
            s.y = node.y = node.r;
            s.yp = s.y - vy;
        } else if(node.y + node.r > graph.height) {
            py = state[node.id].y;
            vy = (py - node.y) * DAMPING;
            s.y = node.y = graph.height - node.r;
            s.yp = s.y - vy;
        }
    });
}

function _solveCollision(graph, state) {
    var DAMPING = 0.8;
    for(var i=0; i < graph.nodes.length; i++) {
        var p1 = graph.nodes[i];
        var s1 = state[p1.id];
        for(var j=i+1; j < graph.nodes.length; j++) {
            var p2 = graph.nodes[j];
            var s2 = state[p2.id];

            var x = p1.x - p2.x;
            var y = p1.y - p2.y;
            var ll = x*x + y*y;
            var length = Math.sqrt(ll);
            var target  = p1.r + p2.r;

            if(length < target) {
                var v1x = p1.x - s1.x;
                var v1y = p1.y - s1.y;
                var v2x = p2.x - s2.x;
                var v2y = p2.y - s2.y;
                var factor = (length - target) / length;

                // move them apart
                p1.x -= x * factor * 0.5;
                p2.x += x * factor * 0.5;
                p1.y -= y * factor * 0.5;
                p2.y += y * factor * 0.5;

                // adjust the velocities to implement
                // inertia transfer
                var f1 = DAMPING * (x*v1x + y*v1y) / ll;
                var f2 = DAMPING * (x*v2x + y*v2y) / ll;
                v1x += f2*x - f1*x;
                v2x += f1*x - f2*x;
                v1y += f2*y - f1*y;
                v2y += f1*y - f2*y;

                // adjust previous positions
                s1.x = p1.x;
                s2.x = p2.x;
                s1.y = p1.y;
                s2.y = p2.y;

                s1.xp = p1.x - v1x;
                s2.xp = p2.x - v2x;
                s1.yp = p1.y - v1y;
                s2.yp = p2.y - v2y;
            }
        }
    }
}

