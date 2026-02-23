const fs = require('fs');
const lines = fs.readFileSync('all_valid_hex.txt', 'utf8').split('\n');

const hexNames = [
    "tttttt", "240,120,240,120,240,120", "120,240,120,240,120,240",
    "t,c,c,t,y,y", "-2,t,c,c,t,-2", "2,2,t,c,c,t", "c,c,t,2,2,t", "c,t,-2,-2,t,c",
    "y,c,x,y,x,c", "c,-2,c,1,-2,1", "-1,c,2,c,-1,2", "c,-1,2,-1,c,2", "1,-2,1,c,-2,c",
    "t,c,c,t,c,c", "c,t,c,c,t,c", "c,c,t,c,c,t", "t,y,y,t,y,y", "2,2,t,2,2,t",
    "-2,t,-2,-2,t,-2", "t,x,x,t,x,x", "1,t,1,1,t,1", "-1,-1,t,-1,-1,t", "t,y,y,t,c,c"
].map(s => s.replace(/,/g, ''));

for (let l of lines) {
    if (!l) continue;
    let parts = l.split(',');
    let str = parts.join('');

    // Condition 1: uses 60 and 300
    let uses60 = parts.includes('60') || parts.includes('300');
    // Condition 2: 3-fold symmetry (a=d, f=c, e=b)
    let sym3 = (parts[0] === parts[3] && parts[1] === parts[4] && parts[2] === parts[5]);
    // Uses reflection
    let usesRefs = parts.some(p => ['y', 'x', '1', '-1', '2', '-2'].includes(p));

    if (uses60 && sym3 && !usesRefs && !hexNames.includes(str)) {
        console.log("Found pure 60/300 3-fold:", l);
    }
}
