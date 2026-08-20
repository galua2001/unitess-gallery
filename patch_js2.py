import re

with open('c:/Users/user/unitess/unitess-final-gallery/script_v17.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update startDrawing (Square)
text = text.replace("""            this.strokes.push({
                points: [],
                type: this.isEraserMode ? 'eraser' : 'stroke',
                width: this.isEraserMode ? this.strokeWidth * 3 : this.strokeWidth,
                color: this.masterStrokeColor
            });""", """            this.strokes.push({
                points: [],
                type: this.isEraserMode ? 'eraser' : 'stroke',
                width: this.isEraserMode ? this.strokeWidth * 3 : this.strokeWidth,
                color: this.masterStrokeColor,
                mode: this.isEraserMode ? 'freehand' : this.drawMode
            });""")

# 2. Update moveDrawing (Square)
move_old = """            if (this.strokes.length > 0) {
                this.strokes[this.strokes.length - 1].points.push({ x: nx, y: ny });
                this.galleryNeedsUpdate = true;
            }"""
move_new = """            if (this.strokes.length > 0) {
                const stroke = this.strokes[this.strokes.length - 1];
                if ((stroke.mode === 'line' || stroke.mode === 'curve') && stroke.points.length >= 1) {
                    stroke.points[1] = { x: nx, y: ny };
                } else {
                    stroke.points.push({ x: nx, y: ny });
                }
                this.galleryNeedsUpdate = true;
            }"""
text = text.replace(move_old, move_new)

# 3. Update startDraw (Appendix)
text = text.replace("""            strokes.push({ 
                points: [], 
                type: this.isEraserMode ? 'eraser' : 'stroke',
                width: this.isEraserMode ? this.strokeWidth * 3 : this.strokeWidth,
                color: this.masterStrokeColor
            });""", """            strokes.push({ 
                points: [], 
                type: this.isEraserMode ? 'eraser' : 'stroke',
                width: this.isEraserMode ? this.strokeWidth * 3 : this.strokeWidth,
                color: this.masterStrokeColor,
                mode: this.isEraserMode ? 'freehand' : this.drawMode
            });""")

# 4. Update addPoint (Appendix)
add_old = """            if (strokes.length > 0) {
                strokes[strokes.length - 1].points.push({ x: nx, y: ny });
                if (type === 'triangle') this.triangleNeedsUpdate = true;
                else if (type === 'hexagon') this.hexagonNeedsUpdate = true;
            }"""
add_new = """            if (strokes.length > 0) {
                const stroke = strokes[strokes.length - 1];
                if ((stroke.mode === 'line' || stroke.mode === 'curve') && stroke.points.length >= 1) {
                    stroke.points[1] = { x: nx, y: ny };
                } else {
                    stroke.points.push({ x: nx, y: ny });
                }
                if (type === 'triangle') this.triangleNeedsUpdate = true;
                else if (type === 'hexagon') this.hexagonNeedsUpdate = true;
            }"""
text = text.replace(add_old, add_new)

with open('c:/Users/user/unitess/unitess-final-gallery/script_v17.js', 'w', encoding='utf-8') as f:
    f.write(text)
