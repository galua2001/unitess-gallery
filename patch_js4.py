import re

with open('c:/Users/user/unitess/unitess-final-gallery/script_v17.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_start = """            targetStrokes.push({ 
                points: [pos], 
                type: this.isEraserMode ? 'eraser' : 'stroke',
                width: this.isEraserMode ? this.strokeWidth * 3 : this.strokeWidth,
                color: this.masterStrokeColor  // 현재 선택된 색상 저장
            });"""
if old_start in text:
    pass
else:
    # Handle encoding or different spaces
    old_start = [line for line in text.split('\n') if "color: this.masterStrokeColor" in line and "points: [pos]" in text]
    
text = re.sub(
    r'targetStrokes\.push\(\{\s*points:\s*\[pos\],\s*type:\s*this\.isEraserMode\s*\?\s*\'eraser\'\s*:\s*\'stroke\',\s*width:\s*this\.isEraserMode\s*\?\s*this\.strokeWidth\s*\*\s*3\s*:\s*this\.strokeWidth,\s*color:\s*this\.masterStrokeColor[^\}]*\}\);',
    """targetStrokes.push({ 
                points: [pos], 
                type: this.isEraserMode ? 'eraser' : 'stroke',
                width: this.isEraserMode ? this.strokeWidth * 3 : this.strokeWidth,
                color: this.masterStrokeColor,
                mode: this.isEraserMode ? 'freehand' : this.drawMode
            });""", text)


text = re.sub(
    r'targetStrokes\[targetStrokes\.length - 1\]\.points\.push\(pos\);',
    """const stroke = targetStrokes[targetStrokes.length - 1];
            if ((stroke.mode === 'line' || stroke.mode === 'curve') && stroke.points.length >= 1) {
                stroke.points[1] = pos;
            } else {
                stroke.points.push(pos);
            }""", text)

with open('c:/Users/user/unitess/unitess-final-gallery/script_v17.js', 'w', encoding='utf-8') as f:
    f.write(text)
