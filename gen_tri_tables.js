
const ROWS = 4;
function getIdx(r, i) {
    let base = 0;
    for (let k = 0; k < r; k++) base += (2 * k + 1);
    return base + i;
}

// Group composition: (m, r) -> R(r) * My^m
// Composition A * B (apply B then A): 
// (ma, ra) * (mb, rb)
// If ma=0: R(ra) * R(rb) * My^mb = R(ra+rb) * My^mb -> (mb, ra+rb)
// If ma=1: R(ra) * My * R(rb) * My^mb = R(ra) * R(-rb) * My * My^mb = R(ra-rb) * My^(1+mb) -> (1-mb, ra-rb)
function mul(a, b) {
    if (a.m === 0) return { m: b.m, r: (a.r + b.r + 360) % 360 };
    return { m: 1 - b.m, r: (a.r - b.r + 360) % 360 };
}

const ID = { m: 0, r: 0 };
// Reflection across angle theta: (1, 180 + 2*theta)
const S_B = { m: 1, r: 180 };    // theta = 0
const S_R = { m: 1, r: 300 };    // theta = 60
const S_L = { m: 1, r: 60 };     // theta = 120

function solve(lType, rType, bType) {
    const states = new Array(16).fill(null);
    const startIdx = getIdx(2, 2); // 7번 (idx 6)
    const queue = [{ r: 2, i: 2, s: ID }];
    states[startIdx] = ID;

    let head = 0;
    while (head < queue.length) {
        const curr = queue[head++];
        const { r, i, s } = curr;
        const isInverted = i % 2 === 1;

        // Operations crossing edges:
        // C-edge: Multiply by ID (Identity) because physical grid already does the 180 rotation
        // G-edge: Multiply by the corresponding Reflection operator
        const opL = lType === 'C' ? ID : S_L;
        const opR = rType === 'C' ? ID : S_R;
        const opB = bType === 'C' ? ID : S_B;

        const neighbors = isInverted ? [
            { nr: r - 1, ni: i - 1, op: opB }, // Top neighbor via Bottom edge
            { nr: r, ni: i - 1, op: opR },   // Left neighbor via Right edge
            { nr: r, ni: i + 1, op: opL }    // Right neighbor via Left edge
        ] : [
            { nr: r, ni: i - 1, op: opL },   // Left neighbor via Left edge
            { nr: r, ni: i + 1, op: opR },   // Right neighbor via Right edge
            { nr: r + 1, ni: i + 1, op: opB }  // Bottom neighbor via Bottom edge
        ];

        for (const n of neighbors) {
            if (n.nr < 0 || n.nr >= ROWS || n.ni < 0 || n.ni >= (2 * n.nr + 1)) continue;
            const idx = getIdx(n.nr, n.ni);
            if (states[idx]) continue;

            states[idx] = mul(s, n.op);
            queue.push({ r: n.nr, i: n.ni, s: states[idx] });
        }
    }
    return states;
}

const results = {
    // CGG: Left=C, Right=G, Bottom=G
    t2: solve('C', 'G', 'G'),
    // CGG(1): Right=C, Left=G, Bottom=G
    t3: solve('G', 'C', 'G'),
    // CGG(2): Bottom=C, Left=G, Right=G
    t4: solve('G', 'G', 'C')
};

// Convert to simple array format for script.js
const out = {};
for (const k in results) {
    out[k] = results[k].map(s => [s.m, s.r]);
}
console.log(JSON.stringify(out, null, 2));
