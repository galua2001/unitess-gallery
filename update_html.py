import re

with open('c:/Users/user/unitess/unitess-final-gallery/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove rune buttons
text = re.sub(r'<div id="[^"]+-ai-rune"[^>]+>[^<]+</div>\n?', '', text)

# Add drawing mode buttons next to eraser
text = text.replace('<button id="floating-eraser" title="지우개 (Eraser)">🧽</button>', '<button id="floating-eraser" title="지우개 (Eraser)">🧽</button>\n                            <button id="floating-draw-mode" title="그리기 모드: 자유곡선" class="draw-mode-btn">✏️</button>')
text = text.replace('<button id="triangle-eraser" title="지우개 (Eraser)">🧽</button>', '<button id="triangle-eraser" title="지우개 (Eraser)">🧽</button>\n                            <button id="triangle-draw-mode" title="그리기 모드: 자유곡선" class="draw-mode-btn">✏️</button>')
text = text.replace('<button id="hexagon-eraser" title="지우개 (Eraser)">🧽</button>', '<button id="hexagon-eraser" title="지우개 (Eraser)">🧽</button>\n                            <button id="hexagon-draw-mode" title="그리기 모드: 자유곡선" class="draw-mode-btn">✏️</button>')

with open('c:/Users/user/unitess/unitess-final-gallery/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('HTML Updated')
