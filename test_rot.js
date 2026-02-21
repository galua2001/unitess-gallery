const ROWS = 5;

function getIdx(r, c) {
    let base = 0;
    for (let k = 0; k < r; k++) base += (2 * k + 1);
    return base + c;
}

function solve() {
    const states = new Array(25).fill(null);
    const startIdx = getIdx(2, 2); // 'aa' base is tile 7 (0-indexed 6)

    // Store visual states
    const visualStates = new Array(25).fill(null);
    visualStates[startIdx] = 0;

    const queue = [{ r: 2, c: 2, v: 0 }];

    let head = 0;
    while (head < queue.length) {
        const { r, c, v } = queue[head++];
        const isInverted = c % 2 === 1;

        let edges = [];
        if (!isInverted) { // Upward triangle like 'aa'
            edges.push({ nr: r + 1, nc: c + 1, d: 180 });     // Bottom edge (3) -> 180
            // User: "회전하는방향을 바꿔주고" -> so change direction from my previous guess.
            // Let's set Right edge (2) to -60 (300) and Left edge (1) to +60
            edges.push({ nr: r, nc: c + 1, d: 300 }); // Right edge
            edges.push({ nr: r, nc: c - 1, d: 60 });  // Left edge
        } else {           // Inverted triangle
            // Connections to Upward triangles
            edges.push({ nr: r - 1, nc: c - 1, d: 180 }); // Top edge -> connects to Bottom edge of upward (180)
            edges.push({ nr: r, nc: c - 1, d: 60 });    // Left edge -> connects to Right edge of upward (-(-60) = 60)
            edges.push({ nr: r, nc: c + 1, d: 300 });   // Right edge -> connects to Left edge of upward (-60 = 300)
        }

        for (const e of edges) {
            if (e.nr < 0 || e.nr >= ROWS || e.nc < 0 || e.nc >= (2 * e.nr + 1)) continue;
            const idx = getIdx(e.nr, e.nc);
            if (visualStates[idx] !== null) continue;

            const nextVisual = (v + e.d) % 360;
            visualStates[idx] = nextVisual;
            queue.push({ r: e.nr, c: e.nc, v: nextVisual });
        }
    }

    // Convert Visual back to Local (Local = Visual - 180 if inverted)
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < (2 * r + 1); c++) {
            const idx = getIdx(r, c);
            const isInverted = c % 2 === 1;
            const vis = visualStates[idx];
            states[idx] = (vis - (isInverted ? 180 : 0) + 360) % 360;
        }
    }

    return states;
}

console.log(JSON.stringify(solve()));
