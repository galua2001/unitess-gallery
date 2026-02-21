
const ROWS = 4;
function getIdx(r, i) {
    let base = 0;
    for (let k = 0; k < r; k++) base += (2 * k + 1);
    return base + i;
}

// Group element s = R(r) * Mx^m
// Composition a * b (apply b then a)
function mul(a, b) {
    if (a.m === 0) {
        return { m: b.m, r: (a.r + b.r + 360) % 360 };
    } else {
        return { m: 1 - b.m, r: (a.r - b.r + 360) % 360 };
    }
}

const ID = { m: 0, r: 0 };
const MX = { m: 1, r: 0 };
const R120_MX = { m: 1, r: 120 };
const RN120_MX = { m: 1, r: 240 };

function solve(lType, rType, bType) {
    const states = new Array(16).fill(null);
    const startIdx = 6; // ID 7 is index 6
    const queue = [{ r: 2, i: 2, s: ID }];
    states[startIdx] = ID;

    let head = 0;
    while (head < queue.length) {
        const curr = queue[head++];
        const { r, i, s } = curr;
        const isInverted = i % 2 === 1;

        // Edge connections for Upright (i even)
        // L: (r, i-1), R: (r, i+1), B: (r+1, i+1)
        // Edge connections for Inverted (i odd)
        // T: (r-1, i-1), L: (r, i-1), R: (r, i+1)

        // For G transformation, we reflect across the line connecting the midpoints
        // of the adjacent sides.
        // Let's use the exact physical angles.
        // For Upright triangle: Left Edge is 60 deg, Right Edge is -60 (300) deg, Bottom Edge is 0 deg.
        // The midpoint reflections are actually reflections along vectors parallel to the edges that are *not* the shared edge.
        // But simply put, the physical G operator on an upright triangle:
        // Left reflection: scale(-1, 1) + rotate(120) -> {m: 1, r: 120}
        // Right reflection: scale(-1, 1) + rotate(240) -> {m: 1, r: 240}
        // Bottom reflection: scale(-1, 1) + rotate(0) -> {m: 1, r: 0}

        const opL_G = { m: 1, r: 120 };
        const opR_G = { m: 1, r: 240 };
        const opB_G = { m: 1, r: 0 };

        const neighbors = isInverted ? [
            { nr: r - 1, ni: i - 1, type: bType, op: opB_G },       // Top edge is neighbor's Bottom
            { nr: r, ni: i - 1, type: rType, op: opL_G },    // Left edge is neighbor's Right
            { nr: r, ni: i + 1, type: lType, op: opR_G }    // Right edge is neighbor's Left
        ] : [
            { nr: r, ni: i - 1, type: lType, op: opL_G },
            { nr: r, ni: i + 1, type: rType, op: opR_G },
            { nr: r + 1, ni: i + 1, type: bType, op: opB_G }
        ];

        for (const n of neighbors) {
            if (n.nr < 0 || n.nr >= ROWS || n.ni < 0 || n.ni >= (2 * n.nr + 1)) continue;
            const idx = getIdx(n.nr, n.ni);
            if (states[idx]) continue;

            const trans = n.type === 'C' ? ID : n.op;
            states[idx] = mul(s, trans);
            queue.push({ r: n.nr, i: n.ni, s: states[idx] });
        }
    }
    return states;
}

const results = {
    // CGG: Left=C, others G
    t2: solve('C', 'G', 'G'),
    // CGG(1): Right=C, others G
    t3: solve('G', 'C', 'G'),
    // CGG(2): Bottom=C, others G
    t4: solve('G', 'G', 'C')
};

const out = {};
for (const k in results) {
    out[k] = results[k].map(s => [s.m, s.r]);
}
console.log(JSON.stringify(out, null, 2));
