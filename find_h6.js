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

function checkPattern(patternRules) {
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

    while (queue.length > 0 && visitedCount < 100) {
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

let chars = ['y', 'c', 'x'];
let foundH6 = false;

// We know the user wrote ycxycx. The question is permutation of the 3 pairs.
// Or maybe a,b,c,d,e,f map is different?
for (let i of chars) {
    for (let j of chars) {
        for (let k of chars) {
            // Check combinations that have y, c, x
            let s = [i, j, k, i, j, k];
            let pat = { a: s[0], f: s[1], e: s[2], d: s[3], c: s[4], b: s[5] };
            if (checkPattern(pat)) {
                console.log("Found valid H6:", s.join(''));
                foundH6 = true;
            }
        }
    }
}
if (!foundH6) console.log("No valid H6 found with y, c, x!");
