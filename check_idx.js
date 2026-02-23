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

function mult(A, B) {
    return [
        A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
        A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]
    ];
}
function inv(S) { return [S[0], S[2], S[1], S[3]]; }

function getLocalEdge(S, worldAngle) {
    let lx = Math.cos(worldAngle * Math.PI / 180);
    let ly = Math.sin(worldAngle * Math.PI / 180);
    let invS = inv(S);
    let x = invS[0] * lx + invS[1] * ly;
    let y = invS[2] * lx + invS[3] * ly;
    let a = Math.atan2(y, x) * 180 / Math.PI;
    a = Math.round(a / 30) * 30;
    if (a <= -180) a += 360;
    if (a > 180) a -= 360;
    for (let k in angles) if (angles[k] === a) return k;
    return null;
}
function compare(A) {
    return Math.abs(A[0] - 1) < 0.001 && Math.abs(A[1] - 0) < 0.001 &&
        Math.abs(A[2] - 0) < 0.001 && Math.abs(A[3] - 1) < 0.001;
}

const symbols = ["1", "2", "60", "120", "240", "300", "t", "c", "y", "x", "-1", "-2"];
const i = 2231036 - 1;
let rest = i;
const b_idx = rest % 12; rest = Math.floor(rest / 12);
const c_idx = rest % 12; rest = Math.floor(rest / 12);
const d_idx = rest % 12; rest = Math.floor(rest / 12);
const e_idx = rest % 12; rest = Math.floor(rest / 12);
const f_idx = rest % 12; rest = Math.floor(rest / 12);
const a_idx = rest % 12;

const P = { a: symbols[a_idx], f: symbols[f_idx], e: symbols[e_idx], d: symbols[d_idx], c: symbols[c_idx], b: symbols[b_idx] };
console.log("Testing Pattern:", P);

let s1 = ops[P.b];
let leX = getLocalEdge(s1, -150);
let s2 = mult(s1, ops[P[leX]]);
let leY = getLocalEdge(s2, 90);
let s3 = mult(s2, ops[P[leY]]);
let valid1 = compare(s3);

let s4 = ops[P.c];
let leZ = getLocalEdge(s4, -90);
let s5 = mult(s4, ops[P[leZ]]);
let leW = getLocalEdge(s5, 150);
let s6 = mult(s5, ops[P[leW]]);
let valid2 = compare(s6);

console.log("Valid:", valid1 && valid2);
