const ops = {
    't': [1, 0, 0, 1],
    'c': [-1, 0, 0, -1],
    'y': [-1, 0, 0, 1],
    'x': [1, 0, 0, -1],
    '1': [-0.5, -Math.sqrt(3) / 2, -Math.sqrt(3) / 2, 0.5],
    '-1': [-0.5, Math.sqrt(3) / 2, Math.sqrt(3) / 2, 0.5],
    '2': [0.5, -Math.sqrt(3) / 2, -Math.sqrt(3) / 2, -0.5],
    '-2': [0.5, Math.sqrt(3) / 2, Math.sqrt(3) / 2, -0.5],
    '120': [-0.5, -Math.sqrt(3) / 2, Math.sqrt(3) / 2, -0.5],
    '240': [-0.5, Math.sqrt(3) / 2, -Math.sqrt(3) / 2, -0.5]
};

const angles = { 'a': -90, 'b': -30, 'c': 30, 'd': 90, 'e': 150, 'f': -150 };
const edgeByAngle = {};
for (let k in angles) edgeByAngle[k] = k; // I'm fixing this temporary so I can just do edgeByAngle lookup via angle.

const mult = (A, B) => [
    A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
    A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]
];

const patterns = {
    20: { a: '120', f: '240', e: '120', d: '240', c: '120', b: '240' },
    21: { a: '240', f: '120', e: '240', d: '120', c: '240', b: '120' },
    22: { a: 't', f: 't', e: 't', d: 't', c: 't', b: 't' }
};

function checkPattern(id, patternRules) {
    function step(state, worldEdge) {
        let worldAngle = Object.keys(angles).find(k => angles[k] === angles[worldEdge]) ? angles[worldEdge] : 0;

        let localVectorX = Math.cos(worldAngle * Math.PI / 180);
        let localVectorY = Math.sin(worldAngle * Math.PI / 180);

        const invState = [state[0], state[2], state[1], state[3]];
        const lv_x = invState[0] * localVectorX + invState[1] * localVectorY;
        const lv_y = invState[2] * localVectorX + invState[3] * localVectorY;

        let lAngle = Math.atan2(lv_y, lv_x) * 180 / Math.PI;
        lAngle = Math.round(lAngle / 30) * 30;
        if (lAngle <= -180) lAngle += 360;
        if (lAngle > 180) lAngle -= 360;

        let localEdge = null;
        for (let k in angles) {
            if (angles[k] === lAngle) localEdge = k;
        }

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

    let queue = [{ q: 0, r: 0, state: [1, 0, 0, 1] }];
    statesByCoord["0,0"] = [1, 0, 0, 1];

    let visitedCount = 0;

    while (queue.length > 0 && visitedCount < 300) {
        let curr = queue.shift();
        visitedCount++;

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
                    errors++;
                }
            } else {
                statesByCoord[key] = nextState;
                queue.push({ q: nextQ, r: nextR, state: nextState });
            }
        }
    }

    if (errors > 0) {
        console.log(`H${id} Result: ERRORS FOUND (${errors})`);
    } else {
        console.log(`H${id} Result: SUCCESS (0 오류)`);
    }
}

for (let p in patterns) {
    checkPattern(p, patterns[p]);
}
