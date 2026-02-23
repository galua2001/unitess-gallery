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

const mult = (A, B) => [
    A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
    A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]
];

function checkPatternRules(patternRules) {
    function step(state, worldEdge) {
        let worldAngle = angles[worldEdge];
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

        const rule = patternRules[localEdge];
        return mult(state, ops[rule]);
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
    return errors === 0;
}

const symbols = ['c', 'y', 'x', '1', '-1', '2', '-2'];
// Let's test a specific pattern: cycycy
console.log("cycycy: ", checkPatternRules({ a: 'c', f: 'y', e: 'c', d: 'y', c: 'c', b: 'y' }));
console.log("cxcxcx: ", checkPatternRules({ a: 'c', f: 'x', e: 'c', d: 'x', c: 'c', b: 'x' }));
// Let's test ycycyc
console.log("ycycyc: ", checkPatternRules({ a: 'y', f: 'c', e: 'y', d: 'c', c: 'y', b: 'c' }));
// What about mix of 1 -1 and c?
console.log("c1c1c1: ", checkPatternRules({ a: 'c', f: '1', e: 'c', d: '1', c: 'c', b: '1' }));
console.log("tctctc: ", checkPatternRules({ a: 't', f: 'c', e: 't', d: 'c', c: 't', b: 'c' }));
// Let's try to brute force something cool: t, y, c
console.log("tyctyc: ", checkPatternRules({ a: 't', f: 'y', e: 'c', d: 't', c: 'y', b: 'c' }));
console.log("tyytcc: ", checkPatternRules({ a: 't', f: 'y', e: 'y', d: 't', c: 'c', b: 'c' }));
