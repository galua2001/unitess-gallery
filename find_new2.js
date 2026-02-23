const ops = {
    't': [1, 0, 0, 1], 'c': [-1, 0, 0, -1],
    'y': [-1, 0, 0, 1], 'x': [1, 0, 0, -1],
    '1': [-0.5, -Math.sqrt(3) / 2, -Math.sqrt(3) / 2, 0.5],
    '-1': [-0.5, Math.sqrt(3) / 2, Math.sqrt(3) / 2, 0.5],
    '2': [0.5, -Math.sqrt(3) / 2, -Math.sqrt(3) / 2, -0.5],
    '-2': [0.5, Math.sqrt(3) / 2, Math.sqrt(3) / 2, -0.5],
    '120': [-0.5, -Math.sqrt(3) / 2, Math.sqrt(3) / 2, -0.5],
    '240': [-0.5, Math.sqrt(3) / 2, -Math.sqrt(3) / 2, -0.5],
    '60': [0.5, -Math.sqrt(3) / 2, Math.sqrt(3) / 2, 0.5],
    '300': [0.5, Math.sqrt(3) / 2, -Math.sqrt(3) / 2, 0.5]
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
        for (let k in angles) if (angles[k] === lAngle) localEdge = k;
        return mult(state, ops[p[localEdge]]);
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
            let nextQ = curr.q + m.dq; let nextR = curr.r + m.dr;
            let key = `${nextQ},${nextR}`;
            let nextState = step(curr.state, m.edge);

            if (statesByCoord[key]) {
                if (!compareObj(statesByCoord[key], nextState)) errors++;
            } else {
                statesByCoord[key] = nextState;
                queue.push({ q: nextQ, r: nextR, state: nextState });
            }
        }
    }
    return errors === 0;
}

const symbols = ['y', 'x', 'c', '1', '-1', '2', '-2', 't', '120', '240', '60', '300'];

const hexNames = [
    "tttttt", "240120240120240120", "120240120240120240",
    "tcctyy", "-2tcct-2", "22tcct", "cct22t", "ct-2-2tc",
    "ycxyxc", "c-2c1-21", "-1c2c-12", "c-12-1c2", "1-21c-2c",
    "tcctcc", "ctcctc", "cctcct", "tyytyy", "22t22t",
    "-2t-2-2t-2", "txxtxx", "1t11t1", "-1-1t-1-1t", "tyytcc"
];

let foundCount = 0;
// We can use a random shuffle to find unexpected ones quickly
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

for (let attempt = 0; attempt < 50000; attempt++) {
    let arr = [];
    for (let k = 0; k < 6; k++) arr.push(symbols[Math.floor(Math.random() * symbols.length)]);

    let a = arr[0], f = arr[1], e = arr[2], d = arr[3], c = arr[4], b = arr[5];
    let str = a + f + e + d + c + b;

    // Ignore if already in our set
    if (hexNames.includes(str)) continue;

    // Check it
    if (check({ a, f, e, d, c, b })) {
        console.log("NEW PATTERN FOUND:", str);
        foundCount++;
        hexNames.push(str);
        if (foundCount >= 5) break;
    }
}
