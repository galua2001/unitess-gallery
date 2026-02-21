const ROWS = 5;
function getIdx(r, i) {
    let base = 0;
    for (let k = 0; k < r; k++) base += (2 * k + 1);
    return base + i;
}

// User specified:
// Bottom edge (3번 변) = C -> 180도 회전 -> 로컬 좌표계 추가 회전 없음: r=0
const OP_B = { m: 0, r: 0 };

// Right edge (2번 변) = C6 -> 60도 회전 -> r=60
const OP_R = { m: 0, r: 60 };

// Left edge (1번 변) = C6 (with 180) -> User said "270" but likely meant 240 (180+60)
const OP_L = { m: 0, r: 240 };

function mul(a, b) {
    if (a.m === 0) {
        return { m: b.m, r: (a.r + b.r) % 360 };
    } else {
        return { m: 1 - b.m, r: (a.r - b.r + 360) % 360 };
    }
}

function solve() {
    const states = new Array(25).fill(null);
    const startIdx = getIdx(2, 2); // 7 is index 6
    const queue = [{ r: 2, i: 2, s: { m: 0, r: 0 } }];
    states[startIdx] = { m: 0, r: 0 };

    let head = 0;
    while (head < queue.length) {
        const curr = queue[head++];
        const { r, i, s } = curr;
        const isInverted = i % 2 === 1;

        const neighbors = isInverted ? [
            { nr: r - 1, ni: i - 1, op: OP_B },
            { nr: r, ni: i - 1, op: OP_R },
            { nr: r, ni: i + 1, op: OP_L }
        ] : [
            { nr: r, ni: i - 1, op: OP_L },
            { nr: r, ni: i + 1, op: OP_R },
            { nr: r + 1, ni: i + 1, op: OP_B }
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

console.log(JSON.stringify(solve().map(s => [s.m, s.r])));
