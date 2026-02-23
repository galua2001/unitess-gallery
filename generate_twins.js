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
const edges = ['a', 'f', 'e', 'd', 'c', 'b']; // CW order of edges! Wait, a is -90 (top). b is -30 (top right). So top to top-right is CW!

function check(p) {
    const mult = (A, B) => [
        A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
        A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]
    ];
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

const trans = {
    't': 't', 'c': 'c', '120': '120', '240': '240',
    'y': '-2', '-2': '2', '2': 'y',
    'x': '-1', '-1': '1', '1': 'x'
};

function rotatePattern(pStr) {
    // pStr is 6 chars e.g. "tcctyy" corresponding to a,f,e,d,c,b
    // CCW 60 rotation: edge 'a' (top, -90) goes to 'f' (top-left, -150).
    // So the rule that was on 'a' MOVES to 'f'.
    // If a=1, f=2, e=3, d=4, c=5, b=6.
    // array [1,2,3,4,5,6].
    // Shift right: [6,1,2,3,4,5]. So 'f' gets 'a'.
    let arr = [pStr[0], pStr[1], pStr[2], pStr[3], pStr[4], pStr[5]];
    // However, some symbols are multiple chars e.g. '-2'. We should pass rule sets as arrays.
}

function rotateRules(pArr) {
    // pArr = [ruleA, ruleF, ruleE, ruleD, ruleC, ruleB]
    // shift right: last element (ruleB) moves to ruleA
    let shifted = [pArr[5], pArr[0], pArr[1], pArr[2], pArr[3], pArr[4]];
    return shifted.map(s => trans[s]);
}

let seed1 = ['y', 'c', 'x', 'y', 'x', 'c']; // H9 ycxyxc
let base = seed1;
for (let i = 0; i < 6; i++) {
    let obj = { a: base[0], f: base[1], e: base[2], d: base[3], c: base[4], b: base[5] };
    let str = base.join('');
    console.log("Orange twin", i, ":", str, " Valid?", check(obj));
    base = rotateRules(base);
}

let seed2 = ['c', 'c', 't', 'c', 'c', 't']; // H16 cctcct
base = seed2;
for (let i = 0; i < 6; i++) {
    let obj = { a: base[0], f: base[1], e: base[2], d: base[3], c: base[4], b: base[5] };
    let str = base.join('');
    console.log("Yellow twin", i, ":", str, " Valid?", check(obj));
    base = rotateRules(base);
}

let seed3 = ['t', 'y', 'y', 't', 'y', 'y']; // H14 tyytyy
base = seed3;
for (let i = 0; i < 6; i++) {
    let obj = { a: base[0], f: base[1], e: base[2], d: base[3], c: base[4], b: base[5] };
    let str = base.join('');
    console.log("Green twin", i, ":", str, " Valid?", check(obj));
    base = rotateRules(base);
}

let seed4 = ['t', 'x', 'x', 't', 'x', 'x']; // txxtxx
base = seed4;
for (let i = 0; i < 6; i++) {
    let obj = { a: base[0], f: base[1], e: base[2], d: base[3], c: base[4], b: base[5] };
    let str = base.join('');
    console.log("Turquoise twin", i, ":", str, " Valid?", check(obj));
    base = rotateRules(base);
}
