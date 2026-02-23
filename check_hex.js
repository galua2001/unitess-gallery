const ops = {
    't': [1, 0, 0, 1],
    'c': [-1, 0, 0, -1],
    'y': [-1, 0, 0, 1],
    'x': [1, 0, 0, -1],
    '1': [-0.5, -Math.sqrt(3) / 2, -Math.sqrt(3) / 2, 0.5],
    '-1': [-0.5, Math.sqrt(3) / 2, Math.sqrt(3) / 2, 0.5],
    '2': [0.5, -Math.sqrt(3) / 2, -Math.sqrt(3) / 2, -0.5],
    '-2': [0.5, Math.sqrt(3) / 2, Math.sqrt(3) / 2, -0.5]
};

const angles = { 'a': -90, 'b': -30, 'c': 30, 'd': 90, 'e': 150, 'f': -150 };
const edgeByAngle = {};
for (let k in angles) edgeByAngle[angles[k]] = k;

const mult = (A, B) => [
    A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
    A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]
];

const patterns = {
    1: { a: 't', f: 'c', e: 'c', d: 't', c: 'y', b: 'y' }, // H1
    2: { a: '-2', f: 't', e: 'c', d: 'c', c: 't', b: '-2' }, // H2
    3: { a: '2', f: '2', e: 't', d: 'c', c: 'c', b: 't' }, // H3
    4: { a: 'c', f: 'c', e: 't', d: '2', c: '2', b: 't' }, // H4
    5: { a: 'c', f: 'c', e: 't', d: '2', c: '2', b: 't' }, // H5
    6: { a: 'c', f: 't', e: '-2', d: '-2', c: 't', b: 'c' }  // H6
};

// Check if a pattern is valid: For any edge A, the operation must map the adjacent edge correctly so that crossing A then returning crosses the inverse edge and gives Identity.
// And going around a vertex (3 tiles) must give Identity.
// Vertex 1: between b and c (right corner)
// Path: from 0 across 'c' -> tile 1. Tile 1 has local edges.
function checkPattern(id, patternRules) {
    console.log(`\n--- Checking Pattern H${id} ---`);

    function step(state, worldEdge) {
        const worldAngle = angles[worldEdge] * Math.PI / 180;
        const vx = Math.cos(worldAngle);
        const vy = Math.sin(worldAngle);

        const invState = [state[0], state[2], state[1], state[3]];
        const lv_x = invState[0] * vx + invState[1] * vy;
        const lv_y = invState[2] * vx + invState[3] * vy;

        let lAngle = Math.atan2(lv_y, lv_x) * 180 / Math.PI;
        lAngle = Math.round(lAngle / 30) * 30;
        if (lAngle <= -180) lAngle += 360;
        if (lAngle > 180) lAngle -= 360;

        const localEdge = edgeByAngle[lAngle];
        const rule = patternRules[localEdge] || 't';
        const opMatrix = ops[rule];
        return mult(state, opMatrix);
    }

    function compareObj(A, B) {
        return Math.abs(A[0] - B[0]) < 0.001 && Math.abs(A[1] - B[1]) < 0.001 &&
            Math.abs(A[2] - B[2]) < 0.001 && Math.abs(A[3] - B[3]) < 0.001;
    }

    let statesByCoord = {};
    let errors = 0;

    // BFS to populate states and check for inconsistencies
    let queue = [{ q: 0, r: 0, state: [1, 0, 0, 1] }];
    statesByCoord["0,0"] = [1, 0, 0, 1];

    let visitedCount = 0;

    while (queue.length > 0 && visitedCount < 100) {
        let curr = queue.shift();
        visitedCount++;

        // neighbors:
        // b: q+1, r-1
        // c: q+1, r
        // d: q, r+1
        // e: q-1, r+1
        // f: q-1, r
        // a: q, r-1

        const moves = [
            { edge: 'a', dq: 0, dr: -1 },
            { edge: 'b', dq: 1, dr: -1 },
            { edge: 'c', dq: 1, dr: 0 },
            { edge: 'd', dq: 0, dr: 1 },
            { edge: 'e', dq: -1, dr: 1 },
            { edge: 'f', dq: -1, dr: 0 }
        ];

        for (let m of moves) {
            let nextQ = curr.q + m.dq;
            let nextR = curr.r + m.dr;
            let key = `${nextQ},${nextR}`;

            let nextState = step(curr.state, m.edge);

            if (statesByCoord[key]) {
                if (!compareObj(statesByCoord[key], nextState)) {
                    // console.log(`Inconsistency at ${key}! Path gives `, nextState, ` but previously `, statesByCoord[key]);
                    errors++;
                }
            } else {
                statesByCoord[key] = nextState;
                queue.push({ q: nextQ, r: nextR, state: nextState });
            }
        }
    }

    if (errors > 0) {
        console.log(`WARNING: Found ${errors} path inconsistencies! The tessellation does not mesh perfectly.`);
    } else {
        console.log(`SUCCESS: Pattern perfectly meshes. Zero errors in path finding.`);
    }
}

for (let p in patterns) {
    checkPattern(p, patterns[p]);
}
