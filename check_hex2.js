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
    6: { a: 'y', f: 'c', e: 'x', d: 'y', c: 'x', b: 'c' }, // H6: ycxyxc
    7: { a: 'c', f: '-2', e: 'c', d: '1', c: '-2', b: '1' }, // H7: c-2c1-21
    8: { a: '-1', f: 'c', e: '2', d: 'c', c: '-1', b: '2' }, // H8: -1c2c-12
    9: { a: 'c', f: '-1', e: '2', d: '-1', c: 'c', b: '2' }, // H9: c-12-1c2

    10: { a: '1', f: '-2', e: '1', d: 'c', c: '-2', b: 'c' }, // 1-21c-2c

    14: { a: 't', f: 'y', e: 'y', d: 't', c: 'y', b: 'y' },
    15: { a: '2', f: '2', e: 't', d: '2', c: '2', b: 't' },
    16: { a: '-2', f: 't', e: '-2', d: '-2', c: 't', b: '-2' },
    17: { a: 't', f: 'x', e: 'x', d: 't', c: 'x', b: 'x' },
    18: { a: '1', f: 't', e: '1', d: '1', c: 't', b: '1' },
    19: { a: '-1', f: '-1', e: 't', d: '-1', c: '-1', b: 't' }
};

function checkPattern(id, patternRules) {
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
