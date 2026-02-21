const ROWS = 6;
function getIdx(r, i) {
    let base = 0;
    for (let k = 0; k < r; k++) base += (2 * k + 1);
    return base + i;
}

const C_OP = { m: 0, r: 0 };
const G_OP = { m: 1, r: 120 };

function mul(a, b) {
    if (a.m === 0) {
        return { m: b.m, r: (a.r + b.r) % 360 };
    } else {
        return { m: 1 - b.m, r: (a.r - b.r + 360) % 360 };
    }
}

function solve(opL, opR, opB) {
    const states = new Array(36).fill(null);
    const startIdx = getIdx(2, 2); // 7 is index 6
    const queue = [{ r: 2, i: 2, s: { m: 0, r: 0 } }];
    states[startIdx] = { m: 0, r: 0 };

    let head = 0;
    while (head < queue.length) {
        const curr = queue[head++];
        const { r, i, s } = curr;
        const isInverted = i % 2 === 1;

        const neighbors = isInverted ? [
            { nr: r - 1, ni: i - 1, op: opB }, // Top neighbor uses opB (since its bottom edge is used)
            { nr: r, ni: i - 1, op: opR },     // Left neighbor uses opR (its right edge)
            { nr: r, ni: i + 1, op: opL }      // Right neighbor uses opL (its left edge)
        ] : [
            { nr: r, ni: i - 1, op: opL },
            { nr: r, ni: i + 1, op: opR },
            { nr: r + 1, ni: i + 1, op: opB }
        ];

        for (const n of neighbors) {
            if (n.nr < 0 || n.nr >= ROWS || n.ni < 0 || n.ni >= (2 * n.nr + 1)) continue;
            const idx = getIdx(n.nr, n.ni);
            if (states[idx] !== null) continue;

            const nextState = mul(s, n.op);
            states[idx] = nextState;
            queue.push({ r: n.nr, i: n.ni, s: nextState });
        }
    }
    return states;
}

const results = {
    // CGG = L:C, R:G, B:G
    cgg: solve(C_OP, G_OP, G_OP),
    // CGG(1) = L:G, R:C, B:G
    cgg1: solve(G_OP, C_OP, G_OP),
    // CGG(2) = L:G, R:G, B:C
    cgg2: solve(G_OP, G_OP, C_OP)
};

require('fs').writeFileSync('cgg_out.json', JSON.stringify({
    cgg: results.cgg.map(s => [s.m, s.r]),
    cgg1: results.cgg1.map(s => [s.m, s.r]),
    cgg2: results.cgg2.map(s => [s.m, s.r])
}, null, 2));
