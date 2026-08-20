import re

with open('c:/Users/user/unitess/unitess-final-gallery/script_v17.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_render = """            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
            for (let i = 1; i < stroke.points.length - 1; i++) {
                const xc = (stroke.points[i].x * w + stroke.points[i + 1].x * w) / 2;
                const yc = (stroke.points[i].y * h + stroke.points[i + 1].y * h) / 2;
                ctx.quadraticCurveTo(stroke.points[i].x * w, stroke.points[i].y * h, xc, yc);
            }
            const last = stroke.points[stroke.points.length - 1];
            ctx.lineTo(last.x * w, last.y * h);"""

new_render = """            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
            if (stroke.mode === 'line') {
                const last = stroke.points[stroke.points.length - 1];
                ctx.lineTo(last.x * w, last.y * h);
            } else if (stroke.mode === 'curve') {
                const p0 = stroke.points[0];
                const p1 = stroke.points[stroke.points.length - 1];
                const dx = p1.x - p0.x;
                const dy = p1.y - p0.y;
                const cx = (p0.x + p1.x)/2 - dy * 0.5;
                const cy = (p0.y + p1.y)/2 + dx * 0.5;
                ctx.quadraticCurveTo(cx * w, cy * h, p1.x * w, p1.y * h);
            } else {
                for (let i = 1; i < stroke.points.length - 1; i++) {
                    const xc = (stroke.points[i].x * w + stroke.points[i + 1].x * w) / 2;
                    const yc = (stroke.points[i].y * h + stroke.points[i + 1].y * h) / 2;
                    ctx.quadraticCurveTo(stroke.points[i].x * w, stroke.points[i].y * h, xc, yc);
                }
                const last = stroke.points[stroke.points.length - 1];
                ctx.lineTo(last.x * w, last.y * h);
            }"""

text = text.replace(old_render, new_render)

with open('c:/Users/user/unitess/unitess-final-gallery/script_v17.js', 'w', encoding='utf-8') as f:
    f.write(text)
