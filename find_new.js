const ops = {
    't': [1, 0, 0, 1], 'c': [-1, 0, 0, -1],
    'y': [-1, 0, 0, 1], 'x': [1, 0, 0, -1],
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

function check(p) {
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

        const rule = p[localEdge];
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
            { edge: 'a', dq: 0, dr: -1 }, { edge: 'b', dq: 1, dr: -1 },
            { edge: 'c', dq: 1, dr: 0 }, { edge: 'd', dq: 0, dr: 1 },
            { edge: 'e', dq: -1, dr: 1 }, { edge: 'f', dq: -1, dr: 0 }
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

const symbols = ['120', '240', 'y', 'x', '1', '-1', '2', '-2'];

const existing = new Set([
    "ttttt", "c", "y", "x"
]); // I'll skip building the whole set, just find ONE completely new string.

out:
for (let a of symbols)
    for (let f of symbols)
        for (let e of symbols)
            for (let d of symbols)
                for (let c of symbols)
                    for (let b of symbols) {
                        if (a !== f && a !== e && a !== d) { // heuristic for interesting mixed patterns
                            let rule = { a, f, e, d, c, b };
                            let str = a + f + e + d + c + b;
                            if (check(rule)) {
                                console.log("FOUND: " + str);
                                break out;
                            }
                        }
                    }
