import re

with open('c:/Users/user/unitess/unitess-final-gallery/script_v17.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Initialize drawMode
if "this.isEraserMode = false;" in text and "this.drawMode = 'freehand';" not in text:
    text = text.replace("this.isEraserMode = false;", "this.isEraserMode = false;\n        this.drawMode = 'freehand';")

# 2. Add toggleDrawMode method
toggle_code = """
    toggleDrawMode() {
        if (this.drawMode === 'freehand') {
            this.drawMode = 'line';
        } else if (this.drawMode === 'line') {
            this.drawMode = 'curve';
        } else {
            this.drawMode = 'freehand';
        }
        
        const modeBtns = document.querySelectorAll('.draw-mode-btn');
        let icon = '✏️';
        let title = '그리기 모드: 자유곡선';
        if (this.drawMode === 'line') {
            icon = '📏';
            title = '그리기 모드: 직선';
        } else if (this.drawMode === 'curve') {
            icon = '〰️';
            title = '그리기 모드: 곡선';
        }
        
        modeBtns.forEach(btn => {
            btn.innerHTML = icon;
            btn.title = title;
        });
    }
"""
if "toggleDrawMode()" not in text:
    text = text.replace("toggleEraser() {", toggle_code + "\n    toggleEraser() {")

# 3. Hook event listeners
hook_code = """
        const drawModeBtns = document.querySelectorAll('.draw-mode-btn');
        drawModeBtns.forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.toggleDrawMode(); };
        });
"""
if "drawModeBtns.forEach" not in text:
    text = text.replace("const floatingEraser = document.getElementById('floating-eraser');", hook_code + "\n        const floatingEraser = document.getElementById('floating-eraser');")

with open('c:/Users/user/unitess/unitess-final-gallery/script_v17.js', 'w', encoding='utf-8') as f:
    f.write(text)
