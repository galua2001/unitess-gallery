const ROWS = 4;
function getIdx(r, i) {
    let base = 0;
    for (let k = 0; k < r; k++) base += (2 * k + 1);
    return base + i;
}

// 0: Normal, 1: Flipped (scaleX -1)
function solve(opL, opR, opB) {
    const states = new Array(16).fill(null);
    const startIdx = getIdx(2, 2); // 1-based 7번, 0-based index 6
    const queue = [{ r: 2, i: 2, s: 0 }];
    states[startIdx] = 0;

    let head = 0;
    while (head < queue.length) {
        const curr = queue[head++];
        const { r, i, s } = curr;
        const isInverted = i % 2 === 1;

        // Transitions from Current to Neighbor
        // If current is Upright:
        //   Left neighbor (Inverted) via Upright Left Edge -> opL
        //   Right neighbor (Inverted) via Upright Right Edge -> opR
        //   Bottom neighbor (Inverted) via Upright Bottom Edge -> opB
        // If current is Inverted:
        //   Top neighbor (Upright) via Inverted Top Edge (= Upright Bottom) -> opB
        //   Left neighbor (Upright) via Inverted Left Edge (= Upright Right) -> opR
        //   Right neighbor (Upright) via Inverted Right Edge (= Upright Left) -> opL

        const neighbors = isInverted ? [
            { nr: r - 1, ni: i - 1, op: opB }, // Top neighbor
            { nr: r, ni: i - 1, op: opR },     // Left neighbor 
            { nr: r, ni: i + 1, op: opL }      // Right neighbor
        ] : [
            { nr: r, ni: i - 1, op: opL },     // Left neighbor
            { nr: r, ni: i + 1, op: opR },     // Right neighbor
            { nr: r + 1, ni: i + 1, op: opB }  // Bottom neighbor
        ];

        for (const n of neighbors) {
            if (n.nr < 0 || n.nr >= ROWS || n.ni < 0 || n.ni >= (2 * n.nr + 1)) continue;
            const idx = getIdx(n.nr, n.ni);
            if (states[idx] !== null) continue;

            states[idx] = s ^ n.op;
            queue.push({ r: n.nr, i: n.ni, s: states[idx] });
        }
    }
    return states;
}

// 1. 역삼각형의 물리적 특성: 제자리에서 그려질 때 회전(rotate)하지 않고 역삼각형 베이스 자체에 그립니다.
// 2. 180도 회전(C): 역삼각형에 그릴 방향을 뒤집지 않고 그대로(scaleX=1) 그리면 원본 이미지가 역삼각형 모양에 맞춰서 180도 뒤집어져 보이게 됩니다. 따라서 C = 0 (flipping 안함).
// 3. 선대칭(G): G연산을 수행하려면 역삼각형 상태에서 좌우를 한번 뒤집어 줘야 합니다. 따라서 G = 1 (flipX=1).
const results = {
    // T2: CGG -> Left=C (0), Right=G (1), Bottom=G (1)
    t2: solve(0, 1, 1),
    // T3: CGG(1) -> Left=G (1), Right=C (0), Bottom=G (1)
    t3: solve(1, 0, 1),
    // T4: CGG(2) -> Left=G (1), Right=G (1), Bottom=C (0)
    t4: solve(1, 1, 0)
};

console.log(JSON.stringify(results, null, 2));
