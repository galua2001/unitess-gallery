class UnitessGalleryApp {
    constructor() {
        this.viewport = document.getElementById('gallery-viewport');
        this.container = document.getElementById('gallery-container');
        this.masterCanvas = document.getElementById('master-canvas');
        this.masterCtx = this.masterCanvas.getContext('2d');

        this.strokes = [];
        this.learnStrokes = []; // 학습 모드 전용 드로잉 배열 추가

        // Learn Mode View State (Zoom/Pan)
        this.learnScale = 1.0;
        this.learnOffsetX = 0;
        this.learnOffsetY = 0;
        this.isLearnPanning = false;
        this.learnLastMouseX = 0;
        this.learnLastMouseY = 0;
        this.learnInitialTouchDist = null;
        this.learnInitialScale = 1;
        this.isDrawing = false;

        // View State (Zoom/Pan)
        this.scale = 0.9; // 시작 시 화면을 더 꽉 채우도록 변경
        this.offsetX = 0;
        this.offsetY = 0;
        this.isPanning = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.grids = [];
        this.strokeWidth = 2;
        this.masterStrokeColor = '#ff0000';
        this.showLabels = true;
        this.showCanvasGrid = true;
        this.currentLang = 'ko';
        this.currentPatternText = {
            13: "합성 변환을 통해 X축 대칭 무늬를 형성하는 복합 패턴입니다."
        };

        this.currentLearnRuleId = 1;
        this.learnTiles = [];
        this.isLearnMode = false;


        this.i18n = {
            en: {
                menu_settings: "Settings",
                menu_modes: "System Modes",
                mode_square: "Square",
                mode_triangle: "Triangle",
                mode_hexagon: "Hexagon",
                mode_quiz: "Quiz Game",
                mode_learn: "Learn",
                menu_stroke: "Stroke Style",
                label_width: "Width",
                label_color: "Color (Master)",
                menu_view: "View",
                btn_reset_view: "Reset View",
                btn_toggle_labels: "Toggle Grid Labels",
                btn_toggle_canvas_grid: "Toggle Canvas Grid",
                menu_actions: "Actions",
                btn_save_image: "Export Gallery PNG",
                btn_clear: "Clear",
                menu_learn: "Learn",
                menu_appearance: "Appearance",
                chat_title: "Community Chat",
                chat_placeholder: "Talk about your design...",
                label_tile_bg: "Tile Background",
                btn_show_guide: "Guide",
                btn_gallery_help: "Gallery Help",
                alert_mode_ready: " Mode is being prepared!",
                mode_falling: "Falling Game (Game 2)"
            },
            ko: {
                menu_settings: "설정",
                menu_modes: "시스템 모드",
                mode_square: "사각형",
                mode_triangle: "삼각형",
                mode_hexagon: "육각형",
                mode_quiz: "퀴즈게임",
                mode_learn: "학습",
                menu_stroke: "브러쉬 스타일",
                label_width: "굵기",
                label_color: "색상 (마스터)",
                menu_view: "보기 설정",
                btn_reset_view: "화면 초기화",
                btn_toggle_labels: "레이블 토글",
                btn_toggle_canvas_grid: "드로잉 그리드 토글",
                menu_actions: "작업",
                btn_save_image: "갤러리 이미지 저장",
                btn_clear: "지우기",
                menu_learn: "도움말",
                menu_appearance: "테마 설정",
                chat_title: "커뮤니티 채팅",
                chat_placeholder: "작품에 대해 대화해보세요...",
                label_tile_bg: "사각형 배경색",
                btn_show_guide: "설명",
                btn_gallery_help: "갤러리 설명",
                alert_mode_ready: " Mode 준비 중입니다!",
                mode_falling: "낙하 게임 (Game 2)"
            }
        };

        this.guideData = {
            ko: {
                title: "Unitess 테셀레이션 이론 가이드",
                section1: {
                    header: "8가지 변환 표시",
                    symbols: ["T, C0", "C1", "C", "C3", "G(y)", "G(x)", "G(y=x)", "G(y=-x)"]
                },
                section2: {
                    title: "패턴의 종류",
                    text: "9가지 기본변환마다 가운데 ⑨번 사각형 변환 8가지, ⑨번사각형 변의 대칭 4가지, 즉 8*4=32가지 중 중복없이 가능한 패턴이 26가지가 있다."
                },
                section3: {
                    title: "패턴 CCGG(C1 y=x)의 예 설명",
                    desc1: "앞의 C1은 가운데 ⑨번 사각형 변환",
                    desc2: "뒤의 y=x는 ⑨번사각형의 4변중 G변환에 해당하는 변환 설명",
                    formula1: "⑨=C1, (①②③④)=CCG(y=x)G(y=x)",
                    desc3: "⑨=C1인 사각형 4개변에 대한 변환표시",
                    desc4: "이웃한 사각형들의 변의 변환 합성의 결과",
                    formula2: "(⑤⑦)=C1*C*G(y=x)=G(x)",
                    desc5: "⑤는 C1(90도 회전시킨후) 다시 C(180도 회전시킨 것)에 G(y=x) y=x축에 데칭이동시킨 결과는 x축 대칭이다.",
                    formula3: "(⑥⑧)=C1*G(y=x)*G(y=x)=C1"
                },
                section4: {
                    title: "학습 팁",
                    tip: "※ TTTT 상태에서 다른 변환 버튼을 클릭하면 각 변환의 차이를 더 명확하게 확인할 수 있습니다. (Hint: 변의 빨간 중점을 연결한 곡선을 그려보세요!)"
                },
                galleryHelp: {
                    title: "Unitess 갤러리 활용 가이드",
                    content: `
                        <p class='modal-text'>사각형 안의 중점을 잇는 곡선을 그려보세요. 회전과 대칭이 조화롭게 어우러진 26가지 테셀레이션 패턴의 아름다움을 감상하실 수 있습니다.</p>
                        <p class='modal-text'>설정 메뉴를 통해 이를 더 자세히 배우는 <b>학습 모드</b>, 재미있는 <b>게임</b>, 그리고 확장된 <b>삼각형과 육각형 부록 갤러리</b>도 만나보세요.</p>
                        <p class='modal-text highlight-purple'>또한 만든 작품을 저장하거나 대화창에서 다른 사용자들과 자유롭게 이야기를 나누며 영감을 공유해보세요.</p>
                    `
                }
            },
            en: {
                title: "Unitess Tessellation Theory Guide",
                section1: {
                    header: "8 Transformation Symbols",
                    symbols: ["T, C0", "C1", "C", "C3", "G(y)", "G(x)", "G(y=x)", "G(y=-x)"]
                },
                section2: {
                    title: "Types of Patterns",
                    text: "For each of the 9 base transformations, there are 8 center (⑨) rotations and 4 edge symmetries. Out of 8*4=32 possibilities, 26 unique non-overlapping patterns exist."
                },
                section3: {
                    title: "Example Explanation: CCGG(C1 y=x)",
                    desc1: "The leading 'C1' refers to the center ⑨ square transformation.",
                    desc2: "The trailing 'y=x' describes the G-transformation applied to the 4 edges of square ⑨.",
                    formula1: "⑨=C1, (①②③④)=CCG(y=x)G(y=x)",
                    desc3: "Symmetry markers for the 4 edges of square ⑨=C1.",
                    desc4: "Result of composite transformations of neighboring squares.",
                    formula2: "(⑤⑦)=C1*C*G(y=x)=G(x)",
                    desc5: "⑤ is the result of rotating 90°(C1), then 180°(C), followed by reflection across y=x (G(y=x)), resulting in X-axis symmetry.",
                    formula3: "(⑥⑧)=C1*G(y=x)*G(y=x)=C1"
                },
                section4: {
                    title: "Learning Tip",
                    tip: "※ Clicking other transformation buttons starting from the TTTT state allows you to see the differences more clearly. (Hint: Try drawing a curve connecting the red midpoints of the sides!)"
                },
                galleryHelp: {
                    title: "Unitess Gallery Guide",
                    content: `
                        <p class='modal-text'>Try drawing curves that connect the midpoints of the square. Discover the beauty of 26 unique tessellation patterns created through harmonious rotations and symmetries.</p>
                        <p class='modal-text'>Explore the <b>Learn Mode</b>, play <b>Games</b>, or visit the expanded <b>Triangle and Hexagon appendix galleries</b> via the settings menu.</p>
                        <p class='modal-text highlight-blue'>You can also save your patterns and share inspirations with others in the community chat.</p>
                    `
                }
            }
        };

        this.isQuizMode = false;
        this.quizScore = 0;
        this.currentQuiz = null;

        // 9대 핵심 대칭 그룹 정의
        this.quizGroups = {
            1: { name: "TTTT", label: "평행이동", symbol: "T", img: "symbol/TTTT.png", patterns: [1] },
            2: { name: "CCCC", label: "회전", symbol: "C", img: "symbol/CCCC.png", patterns: [2] },
            3: { name: "C3C1C3C1", label: "복합 회전", symbol: "C3C1", img: "symbol/C3C1C3C1(T).png", patterns: [3, 4] },
            4: { name: "TCTC", label: "이동+회전", symbol: "TC", img: "symbol/TCTC(T).png", patterns: [11, 12] },
            5: { name: "TGTG", label: "이동+글라이드", symbol: "TG", img: "symbol/tgtg(t x).png", patterns: [21, 22, 23, 24, 25, 26] },
            6: { name: "CGCG", label: "회전+글라이드", symbol: "CG", img: "symbol/cgcg(T x).png", patterns: [13, 14, 15, 16] },
            7: { name: "GGGG", label: "복합 글라이드", symbol: "GG", img: "symbol/gggg(T x).png", patterns: [7, 8, 9, 10] },
            8: { name: "CCGG", label: "복합 회전+대칭", symbol: "CCGG", img: "symbol/ccgg(T y=x).png", patterns: [17, 18, 19, 20] },
            9: { name: "XYXY", label: "축 대칭", symbol: "XY", img: "symbol/xyxy-A.png", patterns: [5, 6] }
        };

        // 퀴즈 문제 데이터 (실제 에셔 그림 파일 매칭)
        this.quizData = [
            { id: 1, escherNo: "Symmetry No.1", groupId: 1, img: "gameimage/tttt_1game.png", hint: "한 방향으로 미끄러지듯 이동하는 가장 기본적인 평행이동 패턴입니다." },
            { id: 2, escherNo: "Symmetry No.21", groupId: 2, img: "gameimage/cccc_1game.png", hint: "중심점을 기준으로 사방이 회전하며 맞물리는 구조입니다." },
            { id: 3, escherNo: "Symmetry No.3", groupId: 3, img: "gameimage/C3C1_1game.png", hint: "서로 다른 회전 중심이 섞여 있는 복합 회전 패턴입니다." },
            { id: 4, escherNo: "Symmetry No.11", groupId: 4, img: "gameimage/tctc_1game.png", hint: "평행이동과 회전이 조화롭게 섞여 있습니다." },
            { id: 5, escherNo: "Symmetry No.25", groupId: 5, img: "gameimage/tgtg_1game.png", hint: "옆으로 이동하면서 동시에 반사(거울)되는 글라이드 대칭입니다." },
            { id: 6, escherNo: "Symmetry No.45", groupId: 6, img: "gameimage/cgcg_1game.png", hint: "회전과 글라이드 대칭이 정교하게 결합되어 있습니다." },
            { id: 7, escherNo: "Symmetry No.7", groupId: 7, img: "gameimage/gggg_1game.png", hint: "여러 방향의 글라이드 대칭이 복합적으로 나타납니다." },
            { id: 8, escherNo: "Symmetry No.17", groupId: 8, img: "gameimage/ccgg_1game.png", hint: "회전과 반사가 모두 포함된 가장 복잡하고 완성도 높은 대칭군입니다." }
        ];

        // Game 2: Falling Squares State
        this.isFallingGameMode = false;
        this.fallingScore = 0;
        this.lastSpawnTime = 0;
        this.gameLoopActive = false;
        this.isFallingPaused = false;
        this.fallingLevel = 2; // Default: Normal
        this.fallingSpeedBase = 1.0;

        // Appendix Galleries State
        this.triangleStrokes = [];
        this.hexagonStrokes = [];
        this.triangleGrids = [];
        this.hexagonGrids = [];
        this.appendixStrokeWidth = 3;

        // Appendix Pattern Config (Colors matching the screenshot)
        this.appendixColors = {
            hex: [
                '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c', // 1-5 Red
                '#f1c40f', '#f1c40f', '#f1c40f', '#f1c40f', '#f1c40f', // 6-10 Yellow
                '#2ecc71', '#2ecc71', '#2ecc71', '#2ecc71', '#2ecc71', // 11-15 Green
                '#9b59b6', '#9b59b6', '#9b59b6', '#9b59b6', '#9b59b6', // 16-20 Purple
                '#3498db', '#3498db'                                   // 21-22 Blue
            ],
            tri: [
                '#000000', // 1 Black
                '#3498db', '#3498db', '#3498db', // 2-4 Blue
                '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c'  // 5-8 Red
            ]
        };

        this.init();
    }

    init() {
        this.setupMasterCanvas();
        this.createGallery();
        this.setupNavigation();
        this.setupMenu();
        this.setupChat();
        this.setupLearnMode();
        this.setupQuizMode();
        this.setupFallingGameMode();
        this.setupDrawingSystem();
        this.updateLanguage();
        this.setupAppendixGalleries();
        this.applyViewTransform();
        this.renderLoop();

        // Enable Zoom/Pan for all modes
        // Learn Mode
        this.enableZoomPan('learn-mode-overlay', '.learn-content', 'learn');
        // Quiz Mode
        this.enableZoomPan('quiz-mode-overlay', '.quiz-content', 'quiz');
        // Falling Game Mode
        this.enableZoomPan('falling-game-overlay', '#falling-game-board', 'falling');
        // Appendix Galleries
        this.enableZoomPan('triangle-gallery-overlay', '#triangle-gallery-overlay .appendix-content', 'triangle');
        this.enableZoomPan('hexagon-gallery-overlay', '#hexagon-gallery-overlay .appendix-content', 'hexagon');
    }

    setupMasterCanvas() {
        const resize = () => {
            const rect = this.masterCanvas.parentElement.getBoundingClientRect();
            this.masterCanvas.width = rect.width;
            this.masterCanvas.height = rect.height;
            if (this.learnMasterCanvas) this.syncLearnCanvas();
        };
        window.addEventListener('resize', resize);
        resize();
    }

    getSymbolById(gridId) {
        if (gridId === 1) return 'TTTT';
        if (gridId === 2) return 'CCCC';
        if (gridId === 3 || gridId === 4) return 'C3C1*2';
        if (gridId === 5 || gridId === 6) return 'XYXY';
        if (gridId >= 7 && gridId <= 10) return 'GGGG';
        if (gridId >= 11 && gridId <= 12) return 'TCTC';
        if (gridId >= 13 && gridId <= 16) return 'CGCG';
        if (gridId >= 17 && gridId <= 20) return 'CCGG';
        if (gridId >= 21 && gridId <= 26) return 'TGTG';
        return gridId;
    }

    createGallery() {
        const layout = [];
        for (let r = 0; r < 4; r++) { // 4행으로 변경
            for (let c = 0; c < 7; c++) { // 7열로 변경
                if (r === 0 && c === 0) continue; // Skip master position
                if (layout.length >= 26) break;   // Max 26 patterns
                layout.push({ r, c });
            }
        }

        layout.forEach((pos, index) => {
            const gridId = index + 1; // Sequential 1-26 for grouping

            const gridDiv = document.createElement('div');
            gridDiv.className = `mini-grid grid-item col-${pos.c}`;
            gridDiv.style.gridRow = pos.r + 1;
            gridDiv.style.gridColumn = pos.c + 1;

            // Add Pattern Label (Replacing Number)
            const label = document.createElement('div');
            label.className = 'grid-label';

            let symbol = this.getSymbolById(gridId);
            label.textContent = symbol;
            gridDiv.appendChild(label);

            const gridData = {
                element: gridDiv,
                tiles: [],
                col: pos.c,
                row: pos.r,
                ruleSet: gridId,
                symbol: symbol
            };

            // Create 6x6 tiles for each grid
            for (let tr = 0; tr < 6; tr++) {
                for (let tc = 0; tc < 6; tc++) {
                    const tileDiv = document.createElement('div');
                    tileDiv.className = 'mini-tile';
                    const canvas = document.createElement('canvas');
                    canvas.width = 50;
                    canvas.height = 50;
                    tileDiv.appendChild(canvas);
                    gridDiv.appendChild(tileDiv);

                    gridData.tiles.push({
                        canvas: canvas,
                        ctx: canvas.getContext('2d'),
                        row: tr,
                        col: tc,
                        rule: this.getTileRule(gridData.ruleSet, tr, tc)
                    });
                }
            }

            this.container.appendChild(gridDiv);
            this.grids.push(gridData);
        });
    }

    getLearnTileRule(id, r, c) {
        // 사용자님께서 주신 3x3 번호 체계 매핑
        const mapping = [
            [5, 4, 8],
            [1, 9, 3],
            [6, 2, 7]
        ];
        const num = mapping[r][c];

        let type = 'T';

        switch (id) {
            case 2: { // CCCC
                const c_list = [1, 2, 3, 4];
                if (c_list.includes(num)) type = 'C';
                else type = 'T';
                break;
            }
            case 3: { // C3C1C3C1(0)
                const c3_list = [1, 3];
                const c1_list = [2, 4];
                const c_list = [5, 6, 7, 8];
                if (c3_list.includes(num)) type = 'C3';
                else if (c1_list.includes(num)) type = 'C1';
                else if (c_list.includes(num)) type = 'C';
                else type = 'T';
                break;
            }
            case 4: { // C3C1C3C1(90)
                const t_list = [1, 3];
                const c_list = [2, 4];
                const c3_list = [5, 6, 7, 8];
                if (t_list.includes(num)) type = 'T';
                else if (c_list.includes(num)) type = 'C';
                else if (c3_list.includes(num)) type = 'C3';
                else if (num === 9) type = 'C1';
                else type = 'T';
                break;
            }
            case 5: { // XYXY-A
                const c_list = [5, 6, 7, 8];
                const x_list = [1, 3];
                const y_list = [2, 4];
                if (c_list.includes(num)) type = 'C';
                else if (x_list.includes(num)) type = 'X';
                else if (y_list.includes(num)) type = 'Y';
                else type = 'T';
                break;
            }
            case 6: { // XYXY-B
                const c_list = [5, 6, 7, 8];
                const y_list = [1, 3];
                const x_list = [2, 4];
                if (c_list.includes(num)) type = 'C';
                else if (y_list.includes(num)) type = 'Y';
                else if (x_list.includes(num)) type = 'X';
                else type = 'T';
                break;
            }
            case 7: { // GGGG(0 y=x)
                const yx_list = [1, 2, 3, 4];
                if (yx_list.includes(num)) type = 'Y=X';
                else type = 'T';
                break;
            }
            case 8: { // GGGG(0 y=-x)
                const ynx_list = [1, 2, 3, 4];
                if (ynx_list.includes(num)) type = 'Y=-X';
                else type = 'T';
                break;
            }
            case 9: { // GGGG(0 x)
                const x_list = [1, 2, 3, 4];
                if (x_list.includes(num)) type = 'X';
                else type = 'T';
                break;
            }
            case 10: { // GGGG(0 y)
                const y_list = [1, 2, 3, 4];
                if (y_list.includes(num)) type = 'Y';
                else type = 'T';
                break;
            }
            case 11: { // TCTC(0)
                const c_list = [2, 4, 5, 6, 7, 8];
                const t_list = [1, 3];
                if (c_list.includes(num)) type = 'C';
                else if (t_list.includes(num)) type = 'T';
                else type = 'T';
                break;
            }
            case 12: { // TCTC(90)
                const c3_list = [2, 4, 5, 6, 7, 8];
                const c1_list = [1, 3, 9];
                if (c3_list.includes(num)) type = 'C3';
                else if (c1_list.includes(num)) type = 'C1';
                else type = 'T';
                break;
            }
            case 13: { // CGCG (0 y)
                const c_list = [1, 3];
                const y_list = [2, 4];
                const x_list = [5, 6, 7, 8];

                if (c_list.includes(num)) type = 'C';
                else if (y_list.includes(num)) type = 'Y';
                else if (x_list.includes(num)) type = 'X';
                else type = 'T'; // 9번 마스터
                break;
            }
            case 14: { // CGCG (0 x)
                const c_list = [1, 3];
                const x_list = [2, 4];
                const y_list = [5, 6, 7, 8];

                if (c_list.includes(num)) type = 'C';
                else if (x_list.includes(num)) type = 'X';
                else if (y_list.includes(num)) type = 'Y';
                else type = 'T';
                break;
            }
            case 15: { // CGCG (90 x)
                const c3_list = [1, 3];
                const yx_list = [2, 4];
                const ynx_list = [5, 6, 7, 8];

                if (c3_list.includes(num)) type = 'C3';
                else if (yx_list.includes(num)) type = 'Y=X';
                else if (ynx_list.includes(num)) type = 'Y=-X';
                else if (num === 9) type = 'C1';
                else type = 'T';
                break;
            }
            case 16: { // CGCG (90 y)
                const c3_list = [1, 3];
                const ynx_list = [2, 4];
                const yx_list = [5, 6, 7, 8];

                if (c3_list.includes(num)) type = 'C3';
                else if (ynx_list.includes(num)) type = 'Y=-X';
                else if (yx_list.includes(num)) type = 'Y=X';
                else if (num === 9) type = 'C1';
                else type = 'T';
                break;
            }
            case 17: { // CCGG(0 y=x)
                if ([1, 4].includes(num)) type = 'C';
                else if ([2, 3].includes(num)) type = 'Y=X';
                else if ([6, 8].includes(num)) type = 'T';
                else if ([5, 7].includes(num)) type = 'Y=-X';
                else type = 'T';
                break;
            }
            case 18: { // CCGG(y y=x)
                if ([1, 4].includes(num)) type = 'X';
                else if ([2, 3].includes(num)) type = 'C1';
                else if ([5, 7].includes(num)) type = 'C3';
                else if ([6, 8, 9].includes(num)) type = 'Y';
                else type = 'T';
                break;
            }
            case 19: { // CCGG(90 y=x)
                if ([1, 4].includes(num)) type = 'C3';
                else if ([2, 3].includes(num)) type = 'Y';
                else if ([5, 7].includes(num)) type = 'X';
                else if ([6, 8, 9].includes(num)) type = 'C1';
                else type = 'T';
                break;
            }
            case 20: { // CCGG(y=x y=x)
                if ([1, 4].includes(num)) type = 'Y=-X';
                else if ([2, 3].includes(num)) type = 'T';
                else if ([5, 7].includes(num)) type = 'C';
                else if ([6, 8, 9].includes(num)) type = 'Y=X';
                else type = 'T';
                break;
            }
            case 21: { // TGTG(0 y=-x)
                if ([1, 3, 9].includes(num)) type = 'T';
                else type = 'Y=-X';
                break;
            }
            case 22: { // TGTG(0 y=x)
                if ([1, 3, 9].includes(num)) type = 'T';
                else type = 'Y=X';
                break;
            }
            case 23: { // TGTG(0 y)
                if ([1, 3, 9].includes(num)) type = 'T';
                else type = 'Y';
                break;
            }
            case 24: { // TGTG(0 x)
                if ([1, 3, 9].includes(num)) type = 'T';
                else type = 'X';
                break;
            }
            case 25: { // TGTG(90 x)
                if ([1, 3, 9].includes(num)) type = 'C1';
                else type = 'Y=X';
                break;
            }
            case 26: { // TGTG(90 y)
                if ([1, 3, 9].includes(num)) type = 'C1';
                else type = 'Y=-X';
                break;
            }
            default: {
                if (num === 9) type = 'T';
                else type = 'T';
            }
        }

        const trans = this.getTransform(type);
        return { rotation: trans.rotation, scaleX: trans.sx, scaleY: trans.sy };
    }

    getRuleForGrid(r, c, index) {
        return index; // Simply use index 0-25
    }

    // 8가지 기본 변환 정의 (사용자 정의 기호)
    getTransform(type) {
        switch (type) {
            case 'T': return { rotation: 0, sx: 1, sy: 1 };    // 방향 (Identity)
            case 'C': return { rotation: 180, sx: 1, sy: 1 };  // 180도 회전
            case 'C1': return { rotation: 90, sx: 1, sy: 1 };   // 90도 회전
            case 'C3': return { rotation: 270, sx: 1, sy: 1 };  // 270도 회전
            case 'X': return { rotation: 0, sx: 1, sy: -1 };   // 상하 뒤집기
            case 'Y': return { rotation: 0, sx: -1, sy: 1 };   // 좌우 뒤집기
            case 'Y=X': return { rotation: 90, sx: -1, sy: 1 };  // 대각선 대칭
            case 'Y=-X': return { rotation: 270, sx: -1, sy: 1 }; // 반대 대각선 대칭
            default: return { rotation: 0, sx: 1, sy: 1 };
        }
    }

    getTileRule(id, r, c) {
        // id: 1-26 (사용자 지정 번호)
        // r, c: 0-4 (5x5 그리드 내 좌표)
        switch (id) {
            case 1: // [1번] 예시: 모두 T
                const t1 = this.getTransform('T');
                return { rotation: t1.rotation, scaleX: t1.sx, scaleY: t1.sy };

            case 2: {
                const num = r * 6 + c + 1;
                let t2_type = 'C';
                const t_list = [1, 3, 8, 13, 5, 10, 15, 20, 25, 12, 17, 22, 27, 32, 24, 29, 34, 36];
                if (t_list.includes(num)) t2_type = 'T';
                const t2 = this.getTransform(t2_type);
                return { rotation: t2.rotation, scaleX: t2.sx, scaleY: t2.sy };
            }

            case 3: {
                const num = r * 6 + c + 1;
                let t3_type = 'T';
                const c1_list = [1, 3, 5, 13, 15, 17, 25, 27, 29];
                const c_list = [2, 4, 6, 14, 16, 18, 26, 28, 30];
                const t_list = [7, 9, 11, 19, 21, 23, 31, 33, 35];
                const c3_list = [8, 10, 12, 20, 22, 24, 32, 34, 36];

                if (c1_list.includes(num)) t3_type = 'C1';
                else if (c_list.includes(num)) t3_type = 'C';
                else if (t_list.includes(num)) t3_type = 'T';
                else if (c3_list.includes(num)) t3_type = 'C3';

                const t3 = this.getTransform(t3_type);
                return { rotation: t3.rotation, scaleX: t3.sx, scaleY: t3.sy };
            }
            case 4: {
                const num = r * 6 + c + 1;
                let t4_type = 'T';
                const c3_list = [1, 3, 5, 13, 15, 17, 25, 27, 29];
                const c_list = [2, 4, 6, 14, 16, 18, 26, 28, 30];
                const t_list = [7, 9, 11, 19, 21, 23, 31, 33, 35];
                const c1_list = [8, 10, 12, 20, 22, 24, 32, 34, 36];

                if (c3_list.includes(num)) t4_type = 'C3';
                else if (c_list.includes(num)) t4_type = 'C';
                else if (t_list.includes(num)) t4_type = 'T';
                else if (c1_list.includes(num)) t4_type = 'C1';

                const t4 = this.getTransform(t4_type);
                return { rotation: t4.rotation, scaleX: t4.sx, scaleY: t4.sy };
            }
            case 5: {
                const num = r * 6 + c + 1;
                let t5_type = 'T';
                const x_list = [1, 3, 5, 13, 15, 17, 25, 27, 29];
                const c_list = [2, 4, 6, 14, 16, 18, 26, 28, 30];
                const t_list = [7, 9, 11, 19, 21, 23, 31, 33, 35];
                const y_list = [8, 10, 12, 20, 22, 24, 32, 34, 36];

                if (x_list.includes(num)) t5_type = 'X';
                else if (c_list.includes(num)) t5_type = 'C';
                else if (t_list.includes(num)) t5_type = 'T';
                else if (y_list.includes(num)) t5_type = 'Y';

                const t5 = this.getTransform(t5_type);
                return { rotation: t5.rotation, scaleX: t5.sx, scaleY: t5.sy };
            }
            case 6: {
                const num = r * 6 + c + 1;
                let t6_type = 'T';
                const y_list = [1, 3, 5, 13, 15, 17, 25, 27, 29];
                const c_list = [2, 4, 6, 14, 16, 18, 26, 28, 30];
                const t_list = [7, 9, 11, 19, 21, 23, 31, 33, 35];
                const x_list = [8, 10, 12, 20, 22, 24, 32, 34, 36];

                if (y_list.includes(num)) t6_type = 'Y';
                else if (c_list.includes(num)) t6_type = 'C';
                else if (t_list.includes(num)) t6_type = 'T';
                else if (x_list.includes(num)) t6_type = 'X';

                const t6 = this.getTransform(t6_type);
                return { rotation: t6.rotation, scaleX: t6.sx, scaleY: t6.sy };
            }
            case 7: {
                const num = r * 6 + c + 1;
                let t7_type = 'T';
                const yx_list = [1, 3, 8, 13, 5, 10, 15, 20, 25, 12, 17, 22, 27, 32, 24, 29, 34, 36];
                if (yx_list.includes(num)) t7_type = 'Y=X';
                const t7 = this.getTransform(t7_type);
                return { rotation: t7.rotation, scaleX: t7.sx, scaleY: t7.sy };
            }
            case 8: {
                const num = r * 6 + c + 1;
                let t8_type = 'T';
                const ynx_list = [1, 3, 8, 13, 5, 10, 15, 20, 25, 12, 17, 22, 27, 32, 24, 29, 34, 36];
                if (ynx_list.includes(num)) t8_type = 'Y=-X';
                const t8 = this.getTransform(t8_type);
                return { rotation: t8.rotation, scaleX: t8.sx, scaleY: t8.sy };
            }
            case 9: {
                const num = r * 6 + c + 1;
                let t9_type = 'T';
                const y_list = [1, 3, 8, 13, 5, 10, 15, 20, 25, 12, 17, 22, 27, 32, 24, 29, 34, 36];
                if (y_list.includes(num)) t9_type = 'Y';
                const t9 = this.getTransform(t9_type);
                return { rotation: t9.rotation, scaleX: t9.sx, scaleY: t9.sy };
            }
            case 10: {
                const num = r * 6 + c + 1;
                let t10_type = 'T';
                const x_list = [1, 3, 8, 13, 5, 10, 15, 20, 25, 12, 17, 22, 27, 32, 24, 29, 34, 36];
                if (x_list.includes(num)) t10_type = 'X';
                const t10 = this.getTransform(t10_type);
                return { rotation: t10.rotation, scaleX: t10.sx, scaleY: t10.sy };
            }
            case 11: {
                const num = r * 6 + c + 1;
                let t11_type = 'T';
                if ((num >= 1 && num <= 6) || (num >= 13 && num <= 18) || (num >= 25 && num <= 30)) {
                    t11_type = 'C';
                }
                const t11 = this.getTransform(t11_type);
                return { rotation: t11.rotation, scaleX: t11.sx, scaleY: t11.sy };
            }
            case 12: {
                const num = r * 6 + c + 1;
                let t12_type = 'C1';
                if ((num >= 1 && num <= 6) || (num >= 13 && num <= 18) || (num >= 25 && num <= 30)) {
                    t12_type = 'C3';
                }
                const t12 = this.getTransform(t12_type);
                return { rotation: t12.rotation, scaleX: t12.sx, scaleY: t12.sy };
            }
            case 13: {
                const num = r * 6 + c + 1;
                let t13_type = 'T';
                const ynx_list = [1, 3, 5, 13, 15, 17, 25, 27, 29];
                const yx_list = [2, 4, 6, 14, 16, 18, 26, 28, 30];
                const c1_list = [7, 9, 11, 19, 21, 23, 31, 33, 35];
                const c3_list = [8, 10, 12, 20, 22, 24, 32, 34, 36];

                if (ynx_list.includes(num)) t13_type = 'Y=-X';
                else if (yx_list.includes(num)) t13_type = 'Y=X';
                else if (c1_list.includes(num)) t13_type = 'C1';
                else if (c3_list.includes(num)) t13_type = 'C3';

                const t13 = this.getTransform(t13_type);
                return { rotation: t13.rotation, scaleX: t13.sx, scaleY: t13.sy };
            }
            case 14: {
                const num = r * 6 + c + 1;
                let t14_type = 'T';
                const yx_list = [1, 3, 5, 13, 15, 17, 25, 27, 29];
                const ynx_list = [2, 4, 6, 14, 16, 18, 26, 28, 30];
                const c1_list = [7, 9, 11, 19, 21, 23, 31, 33, 35];
                const c3_list = [8, 10, 12, 20, 22, 24, 32, 34, 36];

                if (yx_list.includes(num)) t14_type = 'Y=X';
                else if (ynx_list.includes(num)) t14_type = 'Y=-X';
                else if (c1_list.includes(num)) t14_type = 'C1';
                else if (c3_list.includes(num)) t14_type = 'C3';

                const t14 = this.getTransform(t14_type);
                return { rotation: t14.rotation, scaleX: t14.sx, scaleY: t14.sy };
            }
            case 15: {
                const num = r * 6 + c + 1;
                let t15_type = 'T';
                const y_list = [1, 3, 5, 13, 15, 17, 25, 27, 29];
                const x_list = [2, 4, 6, 14, 16, 18, 26, 28, 30];
                const t_list = [7, 9, 11, 19, 21, 23, 31, 33, 35];
                const c_list = [8, 10, 12, 20, 22, 24, 32, 34, 36];

                if (y_list.includes(num)) t15_type = 'Y';
                else if (x_list.includes(num)) t15_type = 'X';
                else if (t_list.includes(num)) t15_type = 'T';
                else if (c_list.includes(num)) t15_type = 'C';

                const t15 = this.getTransform(t15_type);
                return { rotation: t15.rotation, scaleX: t15.sx, scaleY: t15.sy };
            }
            case 16: {
                const num = r * 6 + c + 1;
                let t16_type = 'T';
                const x_list = [1, 3, 5, 13, 15, 17, 25, 27, 29];
                const y_list = [2, 4, 6, 14, 16, 18, 26, 28, 30];
                const t_list = [7, 9, 11, 19, 21, 23, 31, 33, 35];
                const c_list = [8, 10, 12, 20, 22, 24, 32, 34, 36];

                if (x_list.includes(num)) t16_type = 'X';
                else if (y_list.includes(num)) t16_type = 'Y';
                else if (t_list.includes(num)) t16_type = 'T';
                else if (c_list.includes(num)) t16_type = 'C';

                const t16 = this.getTransform(t16_type);
                return { rotation: t16.rotation, scaleX: t16.sx, scaleY: t16.sy };
            }
            case 17: {
                const num = r * 6 + c + 1;
                let t17_type = 'T';
                const c3_list = [1, 5, 10, 15, 20, 25, 24, 29, 34, 35];
                const c1_list = [2, 7, 6, 11, 16, 21, 26, 31, 30];
                const y_list = [3, 8, 13, 12, 17, 22, 27, 32, 36];
                const x_list = [4, 9, 14, 19, 18, 23, 28, 33];

                if (c3_list.includes(num)) t17_type = 'C3';
                else if (c1_list.includes(num)) t17_type = 'C1';
                else if (y_list.includes(num)) t17_type = 'Y';
                else if (x_list.includes(num)) t17_type = 'X';

                const t17 = this.getTransform(t17_type);
                return { rotation: t17.rotation, scaleX: t17.sx, scaleY: t17.sy };
            }
            case 18: {
                const num = r * 6 + c + 1;
                let t18_type = 'T';
                const x_list = [1, 5, 10, 15, 20, 25, 24, 29, 34, 35];
                const y_list = [2, 7, 6, 11, 16, 21, 26, 31, 30];
                const c1_list = [3, 8, 13, 12, 17, 22, 27, 32, 36];
                const c3_list = [4, 9, 14, 19, 18, 23, 28, 33];

                if (x_list.includes(num)) t18_type = 'X';
                else if (y_list.includes(num)) t18_type = 'Y';
                else if (c1_list.includes(num)) t18_type = 'C1';
                else if (c3_list.includes(num)) t18_type = 'C3';

                const t18 = this.getTransform(t18_type);
                return { rotation: t18.rotation, scaleX: t18.sx, scaleY: t18.sy };
            }
            case 19: {
                const num = r * 6 + c + 1;
                let t19_type = 'T';
                const c_list = [1, 5, 10, 15, 20, 25, 24, 29, 34, 35];
                const t_list = [2, 7, 6, 11, 16, 21, 26, 31, 30];
                const yx_list = [3, 8, 13, 12, 17, 22, 27, 32, 36];
                const ynx_list = [4, 9, 14, 19, 18, 23, 28, 33];

                if (c_list.includes(num)) t19_type = 'C';
                else if (t_list.includes(num)) t19_type = 'T';
                else if (yx_list.includes(num)) t19_type = 'Y=X';
                else if (ynx_list.includes(num)) t19_type = 'Y=-X';

                const t19 = this.getTransform(t19_type);
                return { rotation: t19.rotation, scaleX: t19.sx, scaleY: t19.sy };
            }
            case 20: {
                const num = r * 6 + c + 1;
                let t20_type = 'T';
                const yx_list = [1, 5, 10, 15, 20, 25, 24, 29, 34, 35];
                const t_list = [2, 7, 6, 11, 16, 21, 26, 31, 30];
                const c_list = [3, 8, 13, 12, 17, 22, 27, 32, 36];
                const ynx_list = [4, 9, 14, 19, 18, 23, 28, 33];

                if (yx_list.includes(num)) t20_type = 'Y=X';
                else if (t_list.includes(num)) t20_type = 'T';
                else if (c_list.includes(num)) t20_type = 'C';
                else if (ynx_list.includes(num)) t20_type = 'Y=-X';

                const t20 = this.getTransform(t20_type);
                return { rotation: t20.rotation, scaleX: t20.sx, scaleY: t20.sy };
            }
            case 21: {
                const num = r * 6 + c + 1; // 1-36 번호 체계
                let t21_type = 'Y=-X'; // 기본값

                // 사용자 지시 사항 반영
                if (num >= 19 && num <= 24) t21_type = 'T';
                else if (num >= 25 && num <= 30) t21_type = 'Y=-X';
                else if (num >= 31 && num <= 36) t21_type = 'T';
                else {
                    // 1~18번은 기존의 rr % 3 로직의 일관성을 위해 유지 (rr=1일 때 T)
                    if ((r % 3) === 1) t21_type = 'T';
                }

                const t21 = this.getTransform(t21_type);
                return { rotation: t21.rotation, scaleX: t21.sx, scaleY: t21.sy };
            }
            case 22: {
                const num = r * 6 + c + 1;
                let t22_type = 'Y=X';
                if (num >= 19 && num <= 24) t22_type = 'T';
                else if (num >= 25 && num <= 30) t22_type = 'Y=X';
                else if (num >= 31 && num <= 36) t22_type = 'T';
                else {
                    if ((r % 3) === 1) t22_type = 'T';
                }
                const t22 = this.getTransform(t22_type);
                return { rotation: t22.rotation, scaleX: t22.sx, scaleY: t22.sy };
            }
            case 23: {
                const num = r * 6 + c + 1;
                let t23_type = 'Y';
                if (num >= 19 && num <= 24) t23_type = 'T';
                else if (num >= 25 && num <= 30) t23_type = 'Y';
                else if (num >= 31 && num <= 36) t23_type = 'T';
                else {
                    if ((r % 3) === 1) t23_type = 'T';
                }
                const t23 = this.getTransform(t23_type);
                return { rotation: t23.rotation, scaleX: t23.sx, scaleY: t23.sy };
            }
            case 24: {
                const num = r * 6 + c + 1;
                let t24_type = 'X';
                if (num >= 19 && num <= 24) t24_type = 'T';
                else if (num >= 25 && num <= 30) t24_type = 'X';
                else if (num >= 31 && num <= 36) t24_type = 'T';
                else {
                    if ((r % 3) === 1) t24_type = 'T';
                }
                const t24 = this.getTransform(t24_type);
                return { rotation: t24.rotation, scaleX: t24.sx, scaleY: t24.sy };
            }
            case 25: {
                const num = r * 6 + c + 1;
                let t25_type = 'Y=X';
                if (num >= 19 && num <= 24) t25_type = 'C1'; // 90
                else if (num >= 25 && num <= 30) t25_type = 'Y=X';
                else if (num >= 31 && num <= 36) t25_type = 'C1'; // 90
                else {
                    if ((r % 3) === 1) t25_type = 'C1';
                }
                const t25 = this.getTransform(t25_type);
                return { rotation: t25.rotation, scaleX: t25.sx, scaleY: t25.sy };
            }
            case 26: // [26번] 25번 패턴에서 Y=X를 Y=-X로 변경 (복구)
                const num26 = r * 6 + c + 1;
                let t26_type = 'Y=-X';
                if ((num26 >= 1 && num26 <= 6) || (num26 >= 13 && num26 <= 18) || (num26 >= 25 && num26 <= 30)) {
                    t26_type = 'C1';
                }

                const t26 = this.getTransform(t26_type);
                return { rotation: t26.rotation, scaleX: t26.sx, scaleY: t26.sy };
            default: return { rotation: 0, scaleX: 1, scaleY: 1 };
        }
    }

    setupNavigation() {
        // Zoom with Scroll (Desktop)
        this.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.001;
            const delta = e.deltaY;
            this.scale -= delta * zoomSpeed;
            this.scale = Math.min(Math.max(0.1, this.scale), 3);
            this.applyViewTransform();
        }, { passive: false });

        // Touch Variables for Mobile
        let initialTouchDist = null;
        let initialScale = 1;

        // Pan with mouse (Desktop)
        this.viewport.addEventListener('mousedown', (e) => {
            if (e.target.closest('#master-square')) return; // Drawing area
            this.isPanning = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.viewport.style.cursor = 'grabbing';
        });

        // Touch Navigation (Mobile)
        this.viewport.addEventListener('touchstart', (e) => {
            // 마스터 캔버스나 그 자식 요소(드로잉 영역) 터치 시 내비게이션 중단
            if (e.target.closest('#master-square')) {
                this.isPanning = false;
                return;
            }

            if (e.touches.length === 1) {
                this.isPanning = true;
                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                this.isPanning = false;
                initialTouchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialScale = this.scale;
            }
        }, { passive: false });

        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.offsetX += dx;
                this.offsetY += dy;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.applyViewTransform();
            }
        });

        window.addEventListener('touchmove', (e) => {
            // 드로잉 중이거나 마스터 캔버스 위라면 내비게이션 무시
            if (this.isDrawing || e.target.closest('#master-square')) return;

            if (e.touches.length === 1 && this.isPanning) {
                const dx = e.touches[0].clientX - this.lastMouseX;
                const dy = e.touches[0].clientY - this.lastMouseY;
                this.offsetX += dx;
                this.offsetY += dy;
                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
                this.applyViewTransform();
                if (e.cancelable) e.preventDefault();
            } else if (e.touches.length === 2 && initialTouchDist) {
                const currentDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const zoomFactor = currentDist / initialTouchDist;
                this.scale = Math.min(Math.max(0.1, initialScale * zoomFactor), 4); // 최대 줌 4배로 확장
                this.applyViewTransform();
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });

        window.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.viewport.style.cursor = 'grab';
        });

        window.addEventListener('touchend', () => {
            this.isPanning = false;
            initialTouchDist = null;
        });

        this.viewport.addEventListener('contextmenu', e => e.preventDefault());
    }

    applyViewTransform() {
        this.container.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
    }

    setupDrawingSystem() {
        this.isDrawing = false;
        this.strokes = [];

        const getPos = (e) => {
            const activeCanvas = this.isLearnMode ? this.learnMasterCanvas : this.masterCanvas;
            if (!activeCanvas) return { x: 0, y: 0 };
            const rect = activeCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) / rect.width,
                y: (clientY - rect.top) / rect.height
            };
        };

        const startDrawing = (e) => {
            const activeCanvas = this.isLearnMode ? this.learnMasterCanvas : this.masterCanvas;
            if (e.currentTarget !== activeCanvas) return;

            if (e.type === 'mousedown' && e.button !== 0) return;

            // Multi-touch guard: If more than 1 finger, don't draw (allow pinch zoom)
            if (e.touches && e.touches.length > 1) return;

            if (e.type === 'touchstart') e.preventDefault();

            this.isDrawing = true;
            const pos = getPos(e);
            const targetStrokes = this.isLearnMode ? this.learnStrokes : this.strokes;
            targetStrokes.push({ points: [pos] });
        };

        const moveDrawing = (e) => {
            if (!this.isDrawing) return;
            if (e.type === 'touchmove') e.preventDefault();
            const pos = getPos(e);
            const targetStrokes = this.isLearnMode ? this.learnStrokes : this.strokes;
            targetStrokes[targetStrokes.length - 1].points.push(pos);
        };

        const stopDrawing = () => {
            this.isDrawing = false;
        };

        this.masterCanvas.addEventListener('mousedown', startDrawing);
        this.learnMasterCanvas.addEventListener('mousedown', startDrawing);
        window.addEventListener('mousemove', moveDrawing);
        window.addEventListener('mouseup', stopDrawing);

        this.masterCanvas.addEventListener('touchstart', startDrawing, { passive: false });
        this.learnMasterCanvas.addEventListener('touchstart', startDrawing, { passive: false });
        window.addEventListener('touchmove', moveDrawing, { passive: false });
        window.addEventListener('touchend', stopDrawing);

        // Clear buttons
        document.getElementById('floating-clear').onclick = (e) => {
            e.stopPropagation();
            this.strokes = [];
        };
        document.getElementById('learn-clear').onclick = (e) => {
            e.stopPropagation();
            this.learnStrokes = [];
        };
    }

    renderLoop() {
        this.masterCtx.clearRect(0, 0, this.masterCanvas.width, this.masterCanvas.height);
        if (this.showCanvasGrid) this.drawCanvasGrid(this.masterCtx, this.masterCanvas.width, this.masterCanvas.height);
        this.drawMidpointGuides(this.masterCtx, this.masterCanvas.width, this.masterCanvas.height);
        this.drawStrokes(this.masterCtx, this.masterCanvas.width, this.masterCanvas.height, 'red');

        // Learn Mode Render
        if (this.isLearnMode) {
            this.learnMasterCtx.clearRect(0, 0, this.learnMasterCanvas.width, this.learnMasterCanvas.height);
            this.drawCanvasGrid(this.learnMasterCtx, this.learnMasterCanvas.width, this.learnMasterCanvas.height);
            this.drawStrokes(this.learnMasterCtx, this.learnMasterCanvas.width, this.learnMasterCanvas.height, this.masterStrokeColor, true); // true for learnStrokes
            this.drawMidpointGuides(this.learnMasterCtx, this.learnMasterCanvas.width, this.learnMasterCanvas.height);

            const lerp = (c, t, f) => {
                if (Math.abs(t - c) < 0.01) return t;
                return c + (t - c) * f;
            };
            const f = 0.1; // Animation speed

            this.learnTiles.forEach(tile => {
                const ctx = tile.ctx;
                const cw = tile.canvas.width;
                const ch = tile.canvas.height;
                ctx.clearRect(0, 0, cw, ch);

                // Rotation wrap-around logic
                let targetRot = tile.targetRule.rotation;
                let currentRot = tile.rule.rotation;
                let diff = targetRot - currentRot;
                while (diff > 180) { targetRot -= 360; diff = targetRot - currentRot; }
                while (diff < -180) { targetRot += 360; diff = targetRot - currentRot; }

                tile.rule.rotation = lerp(currentRot, targetRot, f);
                // Keep values within reasonable bounds
                if (tile.rule.rotation > 360) tile.rule.rotation -= 360;
                if (tile.rule.rotation < 0) tile.rule.rotation += 360;

                tile.rule.scaleX = lerp(tile.rule.scaleX, tile.targetRule.scaleX, f);
                tile.rule.scaleY = lerp(tile.rule.scaleY, tile.targetRule.scaleY, f);

                ctx.save();
                ctx.translate(cw / 2, ch / 2);
                ctx.rotate(tile.rule.rotation * Math.PI / 180);
                ctx.scale(tile.rule.scaleX, tile.rule.scaleY);
                ctx.translate(-cw / 2, -ch / 2);
                this.drawStrokes(ctx, cw, ch, '#fff', true); // true for learnStrokes
                ctx.restore();
            });
        }

        // Always render gallery grids in background or if not in learn mode
        this.grids.forEach(grid => {
            let groupColor = '#ffffff';
            const id = grid.ruleSet;
            if (id === 1) groupColor = '#FF5555';
            else if (id === 2) groupColor = '#55FF55';
            else if (id >= 3 && id <= 4) groupColor = '#5555FF';
            else if (id >= 5 && id <= 6) groupColor = '#FFFF55';
            else if (id >= 7 && id <= 10) groupColor = '#FF55FF';
            else if (id >= 11 && id <= 12) groupColor = '#55FFFF';
            else if (id >= 13 && id <= 16) groupColor = '#FFAA00';
            else if (id >= 17 && id <= 20) groupColor = '#AA55FF';
            else if (id >= 21 && id <= 26) groupColor = '#00FF99';

            grid.tiles.forEach(tile => {
                const ctx = tile.ctx;
                const cw = tile.canvas.width;
                const ch = tile.canvas.height;
                ctx.clearRect(0, 0, cw, ch);
                ctx.save();
                ctx.translate(cw / 2, ch / 2);
                ctx.rotate(tile.rule.rotation * Math.PI / 180);
                ctx.scale(tile.rule.scaleX, tile.rule.scaleY);
                ctx.translate(-cw / 2, -ch / 2);
                this.drawStrokes(ctx, cw, ch, groupColor);
                ctx.restore();
            });
        });

        requestAnimationFrame(() => this.renderLoop());
    }

    setupMenu() {
        const menu = document.getElementById('side-menu');
        const toggleBtn = document.getElementById('menu-toggle');
        const closeBtn = document.getElementById('close-menu');

        toggleBtn.onclick = () => menu.classList.toggle('hidden');
        closeBtn.onclick = () => menu.classList.add('hidden');

        // Close menu on ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') menu.classList.add('hidden');
        });

        // System Modes Navigation
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            card.onclick = () => {
                modeCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                const mode = card.dataset.mode;
                console.log(`Navigating to ${mode} mode...`);

                // Placeholder for actual navigation or module loading
                // Learn Mode Activation
                if (mode === 'learn') {
                    this.isLearnMode = true;
                    document.getElementById('learn-mode-overlay').classList.remove('hidden');
                    this.syncLearnCanvas();
                } else if (mode === 'quiz') {
                    this.isQuizMode = true;
                    this.startNewQuiz();
                    document.getElementById('quiz-mode-overlay').classList.remove('hidden');
                } else if (mode === 'triangle') {
                    document.getElementById('triangle-gallery-overlay').classList.remove('hidden');
                    this.syncAppendixCanvases('triangle');
                } else if (mode === 'hexagon') {
                    document.getElementById('hexagon-gallery-overlay').classList.remove('hidden');
                    this.syncAppendixCanvases('hexagon');
                } else if (mode === 'falling') {
                    this.startFallingGame();
                } else if (mode !== 'square') {
                    alert(`${mode.charAt(0).toUpperCase() + mode.slice(1)} ${this.i18n[this.currentLang].alert_mode_ready}`);
                }
            };
        });

        const exitLearn = document.getElementById('exit-learn');
        if (exitLearn) exitLearn.onclick = () => {
            this.isLearnMode = false;
            document.getElementById('learn-mode-overlay').classList.add('hidden');
        };

        const exitTriangle = document.getElementById('exit-triangle');
        if (exitTriangle) exitTriangle.onclick = () => {
            document.getElementById('triangle-gallery-overlay').classList.add('hidden');
        };

        const exitHexagon = document.getElementById('exit-hexagon');
        if (exitHexagon) exitHexagon.onclick = () => {
            document.getElementById('hexagon-gallery-overlay').classList.add('hidden');
        };

        const exitQuiz = document.getElementById('exit-quiz');
        if (exitQuiz) exitQuiz.onclick = () => {
            this.isQuizMode = false;
            document.getElementById('quiz-mode-overlay').classList.add('hidden');
        };

        const exitFalling = document.getElementById('exit-falling');
        if (exitFalling) exitFalling.onclick = () => {
            this.stopFallingGame();
        };


        // Stroke Style
        document.getElementById('lineWidth').oninput = (e) => {
            this.strokeWidth = parseInt(e.target.value);
        };
        document.getElementById('strokeColor').oninput = (e) => {
            this.masterStrokeColor = e.target.value;
        };

        // View Controls
        document.getElementById('reset-view').onclick = () => {
            this.scale = 0.9;
            this.offsetX = 0;
            this.offsetY = 0;
            this.applyViewTransform();
        };

        document.getElementById('toggle-grid').onclick = () => {
            this.showLabels = !this.showLabels;
            document.body.classList.toggle('labels-hidden', !this.showLabels);
        };

        document.getElementById('toggle-canvas-grid').onclick = () => {
            this.showCanvasGrid = !this.showCanvasGrid;
        };

        // Appearance
        document.getElementById('tileBgColor').oninput = (e) => {
            document.documentElement.style.setProperty('--tile-bg', e.target.value);
            // Master square is also white by default, let's update it too
            document.querySelector('.master-square').style.backgroundColor = e.target.value;
        };

        // Actions
        document.getElementById('save-btn').onclick = () => {
            this.saveGalleryImage();
        };

        // Floating Clear Button (Moved to setupDrawingSystem)

        // Language Selection
        document.getElementById('lang-select').onchange = (e) => {
            this.currentLang = e.target.value;
            this.updateLanguage();
        };

        // Gallery Guide Button
        const galleryHelpBtn = document.getElementById('gallery-guide-btn');
        if (galleryHelpBtn) {
            galleryHelpBtn.onclick = () => this.showGalleryHelp();
        }
    }

    setupChat() {
        const chatPanel = document.getElementById('chat-panel');
        const chatToggle = document.getElementById('chat-toggle');
        const closeChat = document.getElementById('close-chat');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-chat');
        const shareBtn = document.getElementById('share-canvas');

        chatToggle.onclick = () => chatPanel.classList.toggle('chat-hidden');
        closeChat.onclick = () => chatPanel.classList.add('chat-hidden');

        const sendMessage = () => {
            const text = chatInput.value.trim();
            if (!text) return;

            // Add user message to UI
            this.appendMessage('sent', text);
            chatInput.value = '';
        };

        const shareDrawing = () => {
            const dataUrl = this.masterCanvas.toDataURL();
            this.appendMessage('sent', '', dataUrl);
        };

        sendBtn.onclick = sendMessage;
        shareBtn.onclick = shareDrawing;
        chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    }

    appendMessage(type, text, imageUrl = null) {
        const container = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;

        if (text) {
            const textSpan = document.createElement('span');
            textSpan.textContent = text;
            msgDiv.appendChild(textSpan);
        }

        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            msgDiv.appendChild(img);
        }

        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }

    updateLanguage() {
        const langData = this.i18n[this.currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (langData[key]) {
                el.textContent = langData[key];
            }
        });
    }

    saveGalleryImage() {
        const gridSize = 400; // Size per pattern (high res)
        const gap = 20;       // Gap between patterns
        const cols = 7;
        const rows = 4;
        const tileSize = gridSize / 6;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = cols * gridSize + (cols - 1) * gap + 40;
        exportCanvas.height = rows * gridSize + (rows - 1) * gap + 40;
        const eCtx = exportCanvas.getContext('2d');

        // 1. Fill entire background
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#f1f8e9';
        eCtx.fillStyle = bgColor;
        eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        const tileBg = getComputedStyle(document.documentElement).getPropertyValue('--tile-bg').trim() || '#ffffff';

        // 2. Draw Master Drawing (at position 0,0)
        const masterX = 20;
        const masterY = 20;
        eCtx.fillStyle = tileBg;
        eCtx.fillRect(masterX, masterY, gridSize, gridSize);

        eCtx.save();
        eCtx.translate(masterX, masterY);
        const masterScale = gridSize / this.masterCanvas.width;
        eCtx.scale(masterScale, masterScale);
        this.drawStrokes(eCtx, this.masterCanvas.width, this.masterCanvas.height, this.masterStrokeColor);
        eCtx.restore();

        // 3. Draw 26 patterns
        this.grids.forEach(grid => {
            const gx = 20 + grid.col * (gridSize + gap);
            const gy = 20 + grid.row * (gridSize + gap);

            // Determine pattern group color
            let groupColor = '#ffffff';
            const id = grid.ruleSet;
            if (id === 1) groupColor = '#FF5555';
            else if (id === 2) groupColor = '#55FF55';
            else if (id >= 3 && id <= 4) groupColor = '#5555FF';
            else if (id >= 5 && id <= 6) groupColor = '#FFFF55';
            else if (id >= 7 && id <= 10) groupColor = '#FF55FF';
            else if (id >= 11 && id <= 12) groupColor = '#55FFFF';
            else if (id >= 13 && id <= 16) groupColor = '#FFAA00';
            else if (id >= 17 && id <= 20) groupColor = '#AA55FF';
            else if (id >= 21 && id <= 26) groupColor = '#00FF99';

            // Tile background
            eCtx.fillStyle = tileBg;
            eCtx.fillRect(gx, gy, gridSize, gridSize);

            // Draw 6x6 tiles for this pattern
            grid.tiles.forEach(tile => {
                const tx = gx + tile.col * tileSize;
                const ty = gy + tile.row * tileSize;

                eCtx.save();
                eCtx.translate(tx + tileSize / 2, ty + tileSize / 2);
                eCtx.rotate(tile.rule.rotation * Math.PI / 180);
                eCtx.scale(tile.rule.scaleX, tile.rule.scaleY);
                eCtx.translate(-tileSize / 2, -tileSize / 2);

                // Draw strokes for this tile
                this.drawStrokes(eCtx, tileSize, tileSize, groupColor);
                eCtx.restore();
            });

            // Optional: Draw pattern label
            if (this.showLabels) {
                eCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                // Reduced font size slightly for long symbols
                eCtx.font = `bold ${gridSize * 0.08}px sans-serif`;
                eCtx.textAlign = 'center';
                eCtx.fillText(grid.symbol, gx + gridSize / 2, gy + gridSize / 2 + 10);
            }
        });

    }

    explanationData = {
        1: {
            ko: { title: "TTTT", text: "", imageHTML: `<img src="symbol/TTTT.png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TTTT", text: "", imageHTML: `<img src="symbol/TTTT.png?v=${Date.now()}" alt="Diagram">` }
        },
        2: {
            ko: { title: "CCCC", text: "", imageHTML: `<img src="symbol/CCCC.png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CCCC", text: "", imageHTML: `<img src="symbol/CCCC.png?v=${Date.now()}" alt="Diagram">` }
        },
        3: {
            ko: { title: "C3C1C3C1(T)", text: "", imageHTML: `<img src="symbol/C3C1C3C1(T).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "C3C1C3C1(T)", text: "", imageHTML: `<img src="symbol/C3C1C3C1(T).png?v=${Date.now()}" alt="Diagram">` }
        },
        4: {
            ko: { title: "C3C1C3C1(C1)", text: "", imageHTML: `<img src="symbol/C3C1C3C1(C1).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "C3C1C3C1(C1)", text: "", imageHTML: `<img src="symbol/C3C1C3C1(C1).png?v=${Date.now()}" alt="Diagram">` }
        },
        11: {
            ko: { title: "TCTC(T)", text: "", imageHTML: `<img src="symbol/TCTC(T).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TCTC(T)", text: "", imageHTML: `<img src="symbol/TCTC(T).png?v=${Date.now()}" alt="Diagram">` }
        },
        12: {
            ko: { title: "TCTC(C1)", text: "", imageHTML: `<img src="symbol/TCTC(C1).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TCTC(C1)", text: "", imageHTML: `<img src="symbol/TCTC(C1).png?v=${Date.now()}" alt="Diagram">` }
        },
        5: {
            ko: { title: "XYXY-A", text: "", imageHTML: `<img src="symbol/xyxy-A.png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "XYXY-A", text: "", imageHTML: `<img src="symbol/xyxy-A.png?v=${Date.now()}" alt="Diagram">` }
        },
        6: {
            ko: { title: "XYXY-B", text: "", imageHTML: `<img src="symbol/xyxy-B.png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "XYXY-B", text: "", imageHTML: `<img src="symbol/xyxy-B.png?v=${Date.now()}" alt="Diagram">` }
        },
        13: {
            ko: { title: "CGCG (T y)", text: "", imageHTML: `<img src="symbol/cgcg(T%20y).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CGCG (T y)", text: "", imageHTML: `<img src="symbol/cgcg(T%20y).png?v=${Date.now()}" alt="Diagram">` }
        },
        14: {
            ko: { title: "CGCG (T x)", text: "", imageHTML: `<img src="symbol/cgcg(T%20x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CGCG (T x)", text: "", imageHTML: `<img src="symbol/cgcg(T%20x).png?v=${Date.now()}" alt="Diagram">` }
        },
        15: {
            ko: { title: "CGCG (C1 x)", text: "", imageHTML: `<img src="symbol/cgcg(C1%20x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CGCG (C1 x)", text: "", imageHTML: `<img src="symbol/cgcg(C1%20x).png?v=${Date.now()}" alt="Diagram">` }
        },
        16: {
            ko: { title: "CGCG (C1 y)", text: "", imageHTML: `<img src="symbol/cgcg(C1%20y=-x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CGCG (C1 y)", text: "", imageHTML: `<img src="symbol/cgcg(C1%20y=-x).png?v=${Date.now()}" alt="Diagram">` }
        },
        7: {
            ko: { title: "GGGG(T y=x)", text: "", imageHTML: `<img src="symbol/gggg(T%20y=x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "GGGG(T y=x)", text: "", imageHTML: `<img src="symbol/gggg(T%20y=x).png?v=${Date.now()}" alt="Diagram">` }
        },
        8: {
            ko: { title: "GGGG(T y=-x)", text: "", imageHTML: `<img src="symbol/gggg(T%20y=-x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "GGGG(T y=-x)", text: "", imageHTML: `<img src="symbol/gggg(T%20y=-x).png?v=${Date.now()}" alt="Diagram">` }
        },
        9: {
            ko: { title: "GGGG(T x)", text: "", imageHTML: `<img src="symbol/gggg(T%20x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "GGGG(T x)", text: "", imageHTML: `<img src="symbol/gggg(T%20x).png?v=${Date.now()}" alt="Diagram">` }
        },
        10: {
            ko: { title: "GGGG(T y)", text: "", imageHTML: `<img src="symbol/gggg(T%20y).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "GGGG(T y)", text: "", imageHTML: `<img src="symbol/gggg(T%20y).png?v=${Date.now()}" alt="Diagram">` }
        },
        21: {
            ko: { title: "TGTG(T y=-x)", text: "", imageHTML: `<img src="symbol/tgtg(t%20y=-x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TGTG(T y=-x)", text: "", imageHTML: `<img src="symbol/tgtg(t%20y=-x).png?v=${Date.now()}" alt="Diagram">` }
        },
        22: {
            ko: { title: "TGTG(T y=x)", text: "", imageHTML: `<img src="symbol/tgtg(t%20y=x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TGTG(T y=x)", text: "", imageHTML: `<img src="symbol/tgtg(t%20y=x).png?v=${Date.now()}" alt="Diagram">` }
        },
        23: {
            ko: { title: "TGTG(T y)", text: "", imageHTML: `<img src="symbol/tgtg(t%20y).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TGTG(T y)", text: "", imageHTML: `<img src="symbol/tgtg(t%20y).png?v=${Date.now()}" alt="Diagram">` }
        },
        24: {
            ko: { title: "TGTG(T x)", text: "", imageHTML: `<img src="symbol/tgtg(t%20x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TGTG(T x)", text: "", imageHTML: `<img src="symbol/tgtg(t%20x).png?v=${Date.now()}" alt="Diagram">` }
        },
        25: {
            ko: { title: "TGTG(C1 x)", text: "", imageHTML: `<img src="symbol/tgtg(C1%20y=x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TGTG(C1 x)", text: "", imageHTML: `<img src="symbol/tgtg(C1%20y=x).png?v=${Date.now()}" alt="Diagram">` }
        },
        26: {
            ko: { title: "TGTG(C1 y)", text: "", imageHTML: `<img src="symbol/tgtg(C1%20y=-x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "TGTG(C1 y)", text: "", imageHTML: `<img src="symbol/tgtg(C1%20y=-x).png?v=${Date.now()}" alt="Diagram">` }
        },
        17: {
            ko: { title: "CCGG(T y=x)", text: "", imageHTML: `<img src="symbol/ccgg(T%20y=x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CCGG(T y=x)", text: "", imageHTML: `<img src="symbol/ccgg(T%20y=x).png?v=${Date.now()}" alt="Diagram">` }
        },
        18: {
            ko: { title: "CCGG(y y=x)", text: "", imageHTML: `<img src="symbol/ccgg(y%20y=x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CCGG(y y=x)", text: "", imageHTML: `<img src="symbol/ccgg(y%20y=x).png?v=${Date.now()}" alt="Diagram">` }
        },
        19: {
            ko: { title: "CCGG(C1 y=x)", text: "", imageHTML: `<img src="symbol/ccgg(C1%20y=x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CCGG(C1 y=x)", text: "", imageHTML: `<img src="symbol/ccgg(C1%20y=x).png?v=${Date.now()}" alt="Diagram">` }
        },
        20: {
            ko: { title: "CCGG(y=x y=x)", text: "", imageHTML: `<img src="symbol/ccgg(y=x%20y=x).png?v=${Date.now()}" alt="Diagram">` },
            en: { title: "CCGG(y=x y=x)", text: "", imageHTML: `<img src="symbol/ccgg(y=x%20y=x).png?v=${Date.now()}" alt="Diagram">` }
        }
    };

    openModal(title, bodyHTML) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHTML;
        document.getElementById('explanation-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('explanation-modal').classList.add('hidden');
    }

    showPatternExplain(id) {
        const lang = this.currentLang;
        const data = this.explanationData[id] ? this.explanationData[id][lang] : null;
        const panel = document.getElementById('pattern-detail-panel');
        const titleEl = document.getElementById('detail-title');
        const contentEl = document.getElementById('detail-content');

        if (!data) {
            panel.classList.add('detail-hidden');
            return;
        }

        titleEl.textContent = data.title;
        contentEl.innerHTML = `
            ${data.imageHTML || ''}
            <div class="detail-text">${data.text || ''}</div>
        `;
        panel.classList.remove('detail-hidden');
    }

    showGalleryHelp() {
        const lang = this.currentLang;
        const data = this.guideData[lang].galleryHelp;
        this.openModal(data.title, data.content);
    }

    showGeneralGuide() {
        const lang = this.currentLang;
        const data = this.guideData[lang];
        const title = data.title;

        let html = `
            <div class="guide-container">
                <div class="modal-section symbol-table-section">
                    <h3>${data.section1.header}</h3>
                    <div class="symbol-grid-wrapper">
                        <img src="symbol/explain_1.png?v=${Date.now()}" class="guide-bg-image" alt="Symbols Diagram">
                    </div>
                </div>

                <div class="guide-two-col">
                    <div class="modal-section">
                        <h3>${data.section2.title}</h3>
                        <p class="modal-text">${data.section2.text}</p>
                        <div class="pattern-types-img">
                            <img src="symbol/explain_2.png?v=${Date.now()}" class="guide-bg-image" alt="Pattern Grid">
                        </div>
                    </div>
                    <div class="modal-section">
                        <h3>${data.section3.title}</h3>
                        <p class="modal-text highlight-red">${data.section3.desc1}</p>
                        <p class="modal-text highlight-red">${data.section3.desc2}</p>
                        <div class="modal-formula">${data.section3.formula1}</div>
                        <p class="modal-text highlight-red">${data.section3.desc3}</p>
                        
                        <p class="modal-text highlight-purple">${data.section3.desc4}</p>
                        <div class="modal-formula">${data.section3.formula2}</div>
                        <p class="modal-text small-desc">${data.section3.desc5}</p>
                        <div class="modal-formula">${data.section3.formula3}</div>
                    </div>
                </div>

                <div class="modal-section tip-section">
                    <h3>${data.section4.title}</h3>
                    <p class="modal-text"><b>${data.section4.tip}</b></p>
                </div>
            </div>
        `;
        this.openModal(title, html);
    }

    setupLearnMode() {
        this.learnMasterCanvas = document.getElementById('learn-master-canvas');
        this.learnMasterCtx = this.learnMasterCanvas.getContext('2d');
        const previewGrid = document.getElementById('preview-grid-3x3');

        // Initialize 3x3 Preview Tiles
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const tileDiv = document.createElement('div');
                tileDiv.className = 'preview-tile';
                const canvas = document.createElement('canvas');
                canvas.width = 150;
                canvas.height = 150;
                tileDiv.appendChild(canvas);
                previewGrid.appendChild(tileDiv);

                const rule = this.getLearnTileRule(this.currentLearnRuleId, r, c);
                this.learnTiles.push({
                    canvas: canvas,
                    ctx: canvas.getContext('2d'),
                    row: r,
                    col: c,
                    rule: { ...rule }, // Initial state
                    targetRule: { ...rule } // Target state for animation
                });
            }
        }

        // Rule Selection Logic
        const ruleBtns = document.querySelectorAll('.rule-btn');
        ruleBtns.forEach(btn => {
            btn.onclick = () => {
                ruleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.currentLearnRuleId = parseInt(btn.dataset.id);
                document.getElementById('current-pattern-id').textContent = btn.textContent;
                // Update target rule for animation
                this.learnTiles.forEach(tile => {
                    tile.targetRule = this.getLearnTileRule(this.currentLearnRuleId, tile.row, tile.col);
                });
            };
        });

        // Info/Popup Buttons Logic
        const infoBtns = document.querySelectorAll('.info-btn');
        infoBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.showPatternExplain(id);
            };
        });

        // Modal/Guide Controls
        document.getElementById('show-general-explain').onclick = () => this.showGeneralGuide();
        document.getElementById('close-modal').onclick = () => this.closeModal();
        document.getElementById('close-detail').onclick = () => {
            document.getElementById('pattern-detail-panel').classList.add('detail-hidden');
        };
        window.onclick = (e) => {
            if (e.target === document.getElementById('explanation-modal')) this.closeModal();
        };

        // Initial text display
        const activeBtn = document.querySelector('.rule-btn.active');
        if (activeBtn) document.getElementById('current-pattern-id').textContent = activeBtn.textContent;


    }

    enableZoomPan(overlayId, contentSelector, stateKey) {
        const overlay = document.getElementById(overlayId);
        const content = document.querySelector(contentSelector);
        if (!overlay || !content) return;

        // Initialize state if not exists
        const scaleKey = stateKey + 'Scale';
        const offsetXKey = stateKey + 'OffsetX';
        const offsetYKey = stateKey + 'OffsetY';
        const isPanningKey = 'is' + stateKey.charAt(0).toUpperCase() + stateKey.slice(1) + 'Panning';
        const lastMouseXKey = stateKey + 'LastMouseX';
        const lastMouseYKey = stateKey + 'LastMouseY';
        const initDistKey = stateKey + 'InitialTouchDist';
        const initScaleKey = stateKey + 'InitialScale';

        if (this[scaleKey] === undefined) {
            this[scaleKey] = 1.0;
            this[offsetXKey] = 0;
            this[offsetYKey] = 0;
            this[isPanningKey] = false;
        }

        // Ensure properties exist on instance (for Learn mode which might have them, others need defaulting)
        if (this[lastMouseXKey] === undefined) this[lastMouseXKey] = 0;
        if (this[lastMouseYKey] === undefined) this[lastMouseYKey] = 0;

        content.style.transformOrigin = 'center top';
        overlay.style.touchAction = 'none';

        const applyTransform = () => {
            content.style.transform = `translate(${this[offsetXKey]}px, ${this[offsetYKey]}px) scale(${this[scaleKey]})`;
        };

        // Wheel Zoom
        overlay.addEventListener('wheel', (e) => {
            if (overlay.classList.contains('hidden')) return;
            e.preventDefault();
            const zoomSpeed = 0.001;
            this[scaleKey] -= e.deltaY * zoomSpeed;
            this[scaleKey] = Math.min(Math.max(0.5, this[scaleKey]), 3.0);
            applyTransform();
        }, { passive: false });

        // Mouse Pan
        overlay.addEventListener('mousedown', (e) => {
            if (overlay.classList.contains('hidden')) return;
            // Exclude interactive elements
            if (e.target.closest('canvas') || e.target.closest('button') || e.target.closest('.rule-btn') || e.target.closest('.info-btn') || e.target.closest('.falling-square') || e.target.closest('input')) return;

            this[isPanningKey] = true;
            this[lastMouseXKey] = e.clientX;
            this[lastMouseYKey] = e.clientY;
            overlay.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (overlay.classList.contains('hidden') || !this[isPanningKey]) return;
            e.preventDefault();
            const dx = e.clientX - this[lastMouseXKey];
            const dy = e.clientY - this[lastMouseYKey];
            this[offsetXKey] += dx;
            this[offsetYKey] += dy;
            this[lastMouseXKey] = e.clientX;
            this[lastMouseYKey] = e.clientY;
            applyTransform();
        });

        window.addEventListener('mouseup', () => {
            // We don't check hidden here because mouseup can happen anywhere
            if (this[isPanningKey]) {
                this[isPanningKey] = false;
                overlay.style.cursor = 'default';
            }
        });

        // Touch Navigation
        overlay.addEventListener('touchstart', (e) => {
            if (overlay.classList.contains('hidden')) return;

            if (e.touches.length === 1) {
                if (e.target.closest('canvas') || e.target.closest('button') || e.target.closest('.rule-btn') || e.target.closest('.falling-square') || e.target.closest('input')) return;
                this[isPanningKey] = true;
                this[lastMouseXKey] = e.touches[0].clientX;
                this[lastMouseYKey] = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                this[isPanningKey] = false;
                this[initDistKey] = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                this[initScaleKey] = this[scaleKey];
            }
        }, { passive: false });

        overlay.addEventListener('touchmove', (e) => {
            if (overlay.classList.contains('hidden')) return;

            if (e.target.closest('canvas') && e.touches.length === 1) return;

            if (e.touches.length === 1 && this[isPanningKey]) {
                if (e.cancelable) e.preventDefault();
                const dx = e.touches[0].clientX - this[lastMouseXKey];
                const dy = e.touches[0].clientY - this[lastMouseYKey];
                this[offsetXKey] += dx;
                this[offsetYKey] += dy;
                this[lastMouseXKey] = e.touches[0].clientX;
                this[lastMouseYKey] = e.touches[0].clientY;
                applyTransform();
            } else if (e.touches.length === 2 && this[initDistKey]) {
                if (e.cancelable) e.preventDefault();
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const zoomFactor = dist / this[initDistKey];
                this[scaleKey] = Math.min(Math.max(0.5, this[initScaleKey] * zoomFactor), 3.0);
                applyTransform();
            }
        }, { passive: false });

        overlay.addEventListener('touchend', () => {
            this[isPanningKey] = false;
            this[initDistKey] = null;
        });
    }

    setupQuizMode() {
        const optionsContainer = document.getElementById('quiz-options-container');
        if (!optionsContainer) return;

        optionsContainer.innerHTML = '';
        optionsContainer.className = 'quiz-grid-9';

        this.quizButtonCanvases = [];

        Object.keys(this.quizGroups).forEach(groupId => {
            const group = this.quizGroups[groupId];
            const card = document.createElement('div');
            card.className = 'quiz-group-card';

            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 120;
            canvas.className = 'quiz-button-canvas';

            card.innerHTML = `
                <div class="group-img-wrapper">
                    <!-- Canvas will be appended here -->
                </div>
                <div class="group-info">
                    <span class="group-name">${group.name}</span>
                    <span class="group-symbol">${group.symbol}</span>
                </div>
            `;

            const wrapper = card.querySelector('.group-img-wrapper');
            wrapper.appendChild(canvas);

            this.quizButtonCanvases.push({
                groupId: parseInt(groupId),
                canvas: canvas,
                ctx: canvas.getContext('2d')
            });

            card.onclick = () => this.checkQuizAnswer(parseInt(groupId));
            optionsContainer.appendChild(card);
        });

        this.renderQuizButtons();
    }

    renderQuizButtons() {
        if (!this.quizButtonCanvases) return;

        const strokesToDraw = JSON.parse(JSON.stringify(this.learnStrokes));

        this.quizButtonCanvases.forEach(item => {
            const group = this.quizGroups[item.groupId];
            const ctx = item.ctx;
            const cw = item.canvas.width;
            const ch = item.canvas.height;
            const tileSize = cw / 3;

            ctx.clearRect(0, 0, cw, ch);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, cw, ch);

            const samplePatternId = group.patterns[0];

            // Draw 3x3 Grid
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const rule = this.getLearnTileRule(samplePatternId, r, c);
                    const tx = c * tileSize;
                    const ty = r * tileSize;

                    ctx.save();
                    ctx.translate(tx + tileSize / 2, ty + tileSize / 2);
                    ctx.rotate(rule.rotation * Math.PI / 180);
                    ctx.scale(rule.scaleX, rule.scaleY);
                    ctx.translate(-tileSize / 2, -tileSize / 2);

                    // Draw with thinner lines for the small 3x3 tiles
                    this.drawStrokesOntoCanvas(ctx, tileSize, tileSize, strokesToDraw, this.masterStrokeColor, 2);
                    ctx.restore();

                    // Sub-grid lines
                    ctx.strokeStyle = '#eeeeee';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(tx, ty, tileSize, tileSize);
                }
            }

            // Outer border
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, cw, ch);
        });
    }

    drawStrokesOntoCanvas(ctx, w, h, strokes, color, weight = 4) {
        if (!strokes || strokes.length === 0) return;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = weight;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);
            for (let i = 1; i < stroke.points.length - 1; i++) {
                const xc = (stroke.points[i].x * w + stroke.points[i + 1].x * w) / 2;
                const yc = (stroke.points[i].y * h + stroke.points[i + 1].y * h) / 2;
                ctx.quadraticCurveTo(stroke.points[i].x * w, stroke.points[i].y * h, xc, yc);
            }
            const last = stroke.points[stroke.points.length - 1];
            ctx.lineTo(last.x * w, last.y * h);
            ctx.stroke();
        });
        ctx.restore();
    }

    startNewQuiz() {
        this.quizScore = 0;
        const scoreEl = document.getElementById('quiz-score');
        if (scoreEl) scoreEl.textContent = this.quizScore;
        this.setupQuizMode();
        this.loadNextQuestion();
    }

    loadNextQuestion() {
        const randomIndex = Math.floor(Math.random() * this.quizData.length);
        this.currentQuiz = this.quizData[randomIndex];

        const contentArea = document.getElementById('quiz-question-content');
        const feedback = document.getElementById('quiz-feedback');
        const questionText = document.getElementById('quiz-question-text');

        if (feedback) feedback.classList.add('hidden');
        if (questionText) questionText.innerHTML = `Q. 에셔의 작품 <b style="color:#f1c40f">${this.currentQuiz.escherNo}</b> 에 사용된 대칭 그룹은?`;

        if (contentArea) {
            contentArea.innerHTML = `
                <img src="${this.currentQuiz.img}?v=${Date.now()}" alt="Escher Quiz" style="max-width:100%; max-height:100%; object-fit:contain;">
            `;
        }

        const hintEl = document.getElementById('quiz-hint-text');
        if (hintEl) hintEl.innerHTML = `<b>Hint:</b> ${this.currentQuiz.hint}`;
    }

    checkQuizAnswer(selectedGroupId) {
        const feedback = document.getElementById('quiz-feedback');
        if (!feedback) return;

        feedback.classList.remove('hidden');

        if (selectedGroupId === this.currentQuiz.groupId) {
            feedback.textContent = "정답입니다! ✨ 다음 문제로 넘어갑니다.";
            feedback.className = "quiz-feedback correct";
            this.quizScore += 10;
            const scoreEl = document.getElementById('quiz-score');
            if (scoreEl) scoreEl.textContent = this.quizScore;

            setTimeout(() => this.loadNextQuestion(), 1500);
        } else {
            feedback.textContent = "아쉽습니다! 다시 한번 생각해보세요. ❌";
            feedback.className = "quiz-feedback wrong";

            // 오답일 때는 다음 문제로 바로 넘어가지 않고, 피드백만 잠깐 보여줌
            setTimeout(() => {
                feedback.classList.add('hidden');
            }, 1000);
        }
    }

    // --- GAME 2: FALLING SQUARES LOGIC ---

    setupFallingGameMode() {
        this.fallingSquares = [];

        const startBtn = document.getElementById('start-falling-btn');
        const pauseBtn = document.getElementById('pause-falling-btn');
        const stopBtn = document.getElementById('stop-falling-btn');

        if (startBtn) {
            startBtn.onclick = () => this.beginFallingPlay();
        }

        if (pauseBtn) {
            pauseBtn.onclick = () => {
                this.isFallingPaused = !this.isFallingPaused;
                pauseBtn.textContent = this.isFallingPaused ? 'Resume' : 'Pause';
                pauseBtn.style.background = this.isFallingPaused ? '#27ae60' : '#f39c12';
            };
        }

        if (stopBtn) {
            stopBtn.onclick = () => this.resetFallingGame();
        }

        const speedSlider = document.getElementById('falling-speed-slider');
        if (speedSlider) {
            speedSlider.oninput = (e) => {
                this.fallingLevel = parseInt(e.target.value);
            };
        }
    }

    startFallingGame() {
        this.isFallingGameMode = true;
        this.fallingScore = 0;
        this.isFallingPaused = false;

        // UI 초기화: Start 버튼만 노출
        const startBtn = document.getElementById('start-falling-btn');
        const pauseBtn = document.getElementById('pause-falling-btn');
        const stopBtn = document.getElementById('stop-falling-btn');

        if (startBtn) startBtn.classList.remove('hidden');
        if (pauseBtn) {
            pauseBtn.classList.add('hidden');
            pauseBtn.textContent = 'Pause';
            pauseBtn.style.background = '#f39c12';
        }
        if (stopBtn) stopBtn.classList.add('hidden');

        this.stopFallingGameLoop();
        this.clearFallingSquares();
        this.lastSpawnTime = 0;
        this.lastPauseCheck = 0;

        const scoreEl = document.getElementById('falling-score');
        if (scoreEl) scoreEl.textContent = '0';

        const overlay = document.getElementById('falling-game-overlay');
        if (overlay) overlay.classList.remove('hidden');
    }

    beginFallingPlay() {
        this.gameLoopActive = true;
        this.lastSpawnTime = 0;
        this.lastPauseCheck = performance.now();

        // UI 전환: Start 숨기고 Pause/Stop 노출
        document.getElementById('start-falling-btn')?.classList.add('hidden');
        document.getElementById('pause-falling-btn')?.classList.remove('hidden');
        document.getElementById('stop-falling-btn')?.classList.remove('hidden');

        this.fallingAnimationFrame = requestAnimationFrame((t) => this.fallingGameLoop(t));
    }

    resetFallingGame() {
        this.stopFallingGameLoop();
        this.startFallingGame(); // 처음 대기 상태로 회귀
    }

    clearFallingSquares() {
        this.fallingSquares = [];
        const board = document.getElementById('falling-game-board');
        if (board) board.innerHTML = '';
    }

    stopFallingGameLoop() {
        this.gameLoopActive = false;
        if (this.fallingAnimationFrame) {
            cancelAnimationFrame(this.fallingAnimationFrame);
            this.fallingAnimationFrame = null;
        }
    }

    beginFallingPlay() {
        this.stopFallingGameLoop(); // 중복 방지

        this.clearFallingSquares();
        this.gameLoopActive = true;
        this.isFallingPaused = false;
        this.lastSpawnTime = 0;
        this.lastPauseCheck = 0;

        // UI 전환: Start 숨기고 Pause/Stop 노출
        const startBtn = document.getElementById('start-falling-btn');
        const pauseBtn = document.getElementById('pause-falling-btn');
        const stopBtn = document.getElementById('stop-falling-btn');

        if (startBtn) startBtn.classList.add('hidden');
        if (pauseBtn) {
            pauseBtn.classList.remove('hidden');
            pauseBtn.textContent = 'Pause';
            pauseBtn.style.background = '#f39c12';
        }
        if (stopBtn) stopBtn.classList.remove('hidden');

        this.fallingAnimationFrame = requestAnimationFrame((t) => this.fallingGameLoop(t));
    }

    stopFallingGame() {
        this.isFallingGameMode = false;
        this.stopFallingGameLoop();
        this.clearFallingSquares();
        const overlay = document.getElementById('falling-game-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    fallingGameLoop(timestamp) {
        if (!this.gameLoopActive) return;

        if (this.isFallingPaused) {
            // 일시정지 중에는 lastSpawnTime을 멈춘 시간만큼 밀어줌
            if (this.lastPauseCheck > 0) {
                const pauseDuration = timestamp - this.lastPauseCheck;
                this.lastSpawnTime += pauseDuration;
            }
            this.lastPauseCheck = timestamp;
            this.fallingAnimationFrame = requestAnimationFrame((t) => this.fallingGameLoop(t));
            return;
        }
        this.lastPauseCheck = 0; // 정지 해제

        if (!this.lastSpawnTime) this.lastSpawnTime = timestamp;
        const elapsed = timestamp - this.lastSpawnTime;

        // 속도 조절 밸런싱 (1~5단계)
        const spawnIntervals = [4500, 3500, 2500, 1800, 1000];
        let spawnInterval = spawnIntervals[this.fallingLevel - 1] || 2500;

        if (elapsed > spawnInterval) {
            this.spawnFallingSquare();
            this.lastSpawnTime = timestamp;
        }

        this.updateFallingSquares();
        this.fallingAnimationFrame = requestAnimationFrame((t) => this.fallingGameLoop(t));
    }

    spawnFallingSquare() {
        const board = document.getElementById('falling-game-board');
        if (!board) return;

        // 낙하 속도 (안정화)
        const speeds = [0.4, 0.7, 1.2, 2.0, 3.2];
        let speedMultiplier = speeds[this.fallingLevel - 1] || 1.2;

        const square = {
            id: Date.now(),
            x: 50 + Math.random() * (board.clientWidth - 170),
            y: -150,
            rotation: (Math.floor(Math.random() * 4)) * 90, // 0, 90, 180, 270
            scaleX: Math.random() > 0.5 ? 1 : -1,
            speed: (1 + Math.random() * 1.5) * speedMultiplier,
            el: document.createElement('div')
        };

        // 만약 처음부터 정답인(T) 상태라면 하나를 무조건 비틀어줌
        if (square.rotation === 0 && square.scaleX === 1) {
            square.rotation = 90;
        }

        square.el.className = 'falling-square';
        square.el.style.left = `${square.x}px`;

        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        square.el.appendChild(canvas);

        // 마우스 이벤트 통합 (이중 조작 체계: 클릭 위치 분할 + 우클릭)
        square.el.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const rect = square.el.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const isRightSide = clickX > rect.width / 2;
            const isRightClick = (e.button === 2) || (e.which === 3);

            if (isRightClick || isRightSide) {
                // 오른쪽 클릭 또는 사각형의 오른쪽 절반 클릭: 대칭(반전)
                this.handleReflect(square);
            } else {
                // 사각형의 왼쪽 절반 클릭: 회전
                this.handleRotate(square);
            }
        };

        // 브라우저 기본 우측 메뉴 원천 차단
        square.el.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        board.appendChild(square.el);
        this.renderFallingSquare(square, canvas);
        this.fallingSquares.push(square);
    }

    handleRotate(square) {
        if (this.isFallingPaused) return;

        // 회전 효과 (시각적 피드백 - 파란색)
        square.el.style.borderColor = "#3498db";
        setTimeout(() => { if (square.el) square.el.style.borderColor = "transparent"; }, 150);

        square.rotation = (square.rotation + 90) % 360;
        this.finishFallingInteraction(square);
    }

    handleReflect(square) {
        if (this.isFallingPaused) return;

        // 보라색 섬광 피드백
        square.el.style.border = "4px solid #9b59b6";
        setTimeout(() => { if (square.el) square.el.style.border = "3px solid transparent"; }, 200);

        // Y축 대칭 (ScaleX 반전) - 무조건 좌우만 뒤집힘
        square.scaleX *= -1;
        this.finishFallingInteraction(square);
    }

    finishFallingInteraction(square) {
        // T 상태 체크
        if (square.rotation === 0 && square.scaleX === 1) {
            this.resolveFallingSquare(square);
        } else {
            const canvas = square.el.querySelector('canvas');
            if (canvas) this.renderFallingSquare(square, canvas);
        }
    }

    renderFallingSquare(square, canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        let strokes = JSON.parse(JSON.stringify(this.learnStrokes));

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(w / 2, h / 2);

        // [최종 수정] 사용자의 요청: "오른쪽 클릭 = Y축 대칭(좌우 반전)"
        // 사각형이 회전되어 있더라도 항상 화면상에서 좌우가 바뀌도록 Scale을 Rotate보다 '바깥'에 적용합니다. (코드상 위)
        ctx.scale(square.scaleX, 1); // 2. 최종적으로 화면 기준 좌우 반전 적용
        ctx.rotate(square.rotation * Math.PI / 180); // 1. 먼저 각도만큼 회전

        ctx.translate(-w / 2, -h / 2);

        // 만약 그린 무늬가 없다면 기본 캐릭터(비대칭 윙크 얼굴)를 그려줌
        if (strokes.length === 0) {
            ctx.strokeStyle = this.masterStrokeColor;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            // Face (Mouth)
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.55, w * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
            // Right Eye (Dot)
            ctx.beginPath();
            ctx.arc(w * 0.65, h * 0.35, 5, 0, 2 * Math.PI);
            ctx.fill();
            // Left Eye (Wink - V shape)
            ctx.beginPath();
            ctx.moveTo(w * 0.25, h * 0.3);
            ctx.lineTo(w * 0.35, h * 0.4);
            ctx.lineTo(w * 0.45, h * 0.3);
            ctx.stroke();
        } else {
            this.drawStrokesOntoCanvas(ctx, w, h, strokes, this.masterStrokeColor, 4);
        }
        ctx.restore();

        // Border
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, w, h);
    }

    updateFallingSquares() {
        const board = document.getElementById('falling-game-board');
        if (!board) return;

        const boardHeight = board.clientHeight;

        for (let i = this.fallingSquares.length - 1; i >= 0; i--) {
            const s = this.fallingSquares[i];
            s.y += s.speed;
            s.el.style.top = `${s.y}px`;

            // 바닥에 닿으면 제거 (실패)
            if (s.y > boardHeight) {
                s.el.remove();
                this.fallingSquares.splice(i, 1);
            }
        }
    }

    resolveFallingSquare(square) {
        square.el.style.transform = 'scale(1.2)';
        square.el.style.opacity = '0';
        square.el.style.transition = 'all 0.3s ease-out';

        this.fallingScore += 10;
        const scoreEl = document.getElementById('falling-score');
        if (scoreEl) scoreEl.textContent = this.fallingScore;

        setTimeout(() => {
            square.el.remove();
            this.fallingSquares = this.fallingSquares.filter(s => s.id !== square.id);
        }, 300);
    }


    // Drawing system already initialized in init()

    // Drawing in Learn Mode (Moved to setupDrawingSystem)

    syncLearnCanvas() {
        const rect = this.learnMasterCanvas.parentElement.getBoundingClientRect();
        this.learnMasterCanvas.width = rect.width;
        this.learnMasterCanvas.height = rect.height;
    }

    drawStrokes(ctx, w, h, color, isLearn = false) {
        ctx.save();
        const sourceStrokes = isLearn ? this.learnStrokes : this.strokes;
        if (!sourceStrokes || sourceStrokes.length === 0) {
            ctx.restore();
            return;
        }

        ctx.strokeStyle = (ctx === this.masterCtx || ctx === this.learnMasterCtx || color === this.masterStrokeColor) ? this.masterStrokeColor : color;
        ctx.lineWidth = this.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        sourceStrokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h);

            for (let i = 1; i < stroke.points.length - 1; i++) {
                const xc = (stroke.points[i].x * w + stroke.points[i + 1].x * w) / 2;
                const yc = (stroke.points[i].y * h + stroke.points[i + 1].y * h) / 2;
                ctx.quadraticCurveTo(stroke.points[i].x * w, stroke.points[i].y * h, xc, yc);
            }

            const last = stroke.points[stroke.points.length - 1];
            ctx.lineTo(last.x * w, last.y * h);
            ctx.stroke();
        });
        ctx.restore();
    }

    drawMidpointGuides(ctx, w, h) {
        const size = 20;
        ctx.save();

        // Use master stroke color for guides
        ctx.strokeStyle = this.masterStrokeColor;
        ctx.globalAlpha = 0.4; // Make it semi-transparent
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        // Top midpoint
        ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, size); ctx.stroke();
        // Bottom midpoint
        ctx.beginPath(); ctx.moveTo(w / 2, h); ctx.lineTo(w / 2, h - size); ctx.stroke();
        // Left midpoint
        ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(size, h / 2); ctx.stroke();
        // Right midpoint
        ctx.beginPath(); ctx.moveTo(w, h / 2); ctx.lineTo(w - size, h / 2); ctx.stroke();

        // Optional: Larger dots for better visibility
        ctx.setLineDash([]);
        ctx.fillStyle = this.masterStrokeColor;
        ctx.globalAlpha = 0.6; // Slightly more opaque dots
        const dotSize = 6;
        ctx.beginPath(); ctx.arc(w / 2, 0, dotSize, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w / 2, h, dotSize, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, h / 2, dotSize, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w, h / 2, dotSize, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    drawCanvasGrid(ctx, w, h) {
        const gridCount = 10;
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'; // 진하게 수정 (0.05 -> 0.15)
        ctx.lineWidth = 1;

        for (let i = 1; i < gridCount; i++) {
            // Horizontal lines
            const y = (h / gridCount) * i;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();

            // Vertical lines
            const x = (w / gridCount) * i;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        ctx.restore();
    }

    // This is a global function, not a method of the class.
    // It's defined on the ctx object, which is unusual for a class method.
    // Assuming this is intended to be a helper function available on any context.
    // However, the subsequent `drawStrokesOntoCanvas` method calls `this.ctx.drawStrokesOntoCanvas`,
    // which implies `this.ctx` is the canvas context itself, which is not how it's typically used.
    // I will define it as a static helper or a method that takes ctx as an argument.
    // Given the instruction, I will define it as a method that takes ctx as an argument,
    // and then the class method `drawStrokesOntoCanvas` will call this new helper.
    // This is a bit of a workaround for the instruction's format.

    // Helper function for drawing strokes onto a canvas context
    static _drawStrokesOntoCanvasHelper(ctx, w, h, strokes, color, width) {
        if (!strokes || strokes.length === 0) return;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        strokes.forEach(stroke => {
            const pts = stroke.points || stroke;
            if (!pts || pts.length < 2) return;

            ctx.beginPath();
            // normalized mapping: [0, 1] -> [0, w] or centered
            // The drawing is intended to be centered around (0.5, 0.5)
            // but we just map [0,1] to [0,w] directly for simplicity in master.
            ctx.moveTo(pts[0].x * w, pts[0].y * h);
            for (let i = 1; i < pts.length - 1; i++) {
                const x1 = pts[i].x * w;
                const y1 = pts[i].y * h;
                const x2 = pts[i + 1].x * w;
                const y2 = pts[i + 1].y * h;
                const xc = (x1 + x2) / 2;
                const yc = (y1 + y2) / 2;
                ctx.quadraticCurveTo(x1, y1, xc, yc);
            }
            ctx.lineTo(pts[pts.length - 1].x * w, pts[pts.length - 1].y * h);
            ctx.stroke();
        });
        ctx.restore();
    }

    // Replace the earlier defined method to make it more universal
    // This method now calls the static helper.
    drawStrokesOntoCanvas(ctx, w, h, strokes, color, width) {
        UnitessGalleryApp._drawStrokesOntoCanvasHelper(ctx, w, h, strokes, color, width);
    }

    setupAppendixGalleries() {
        // 1. Triangle Gallery Setup
        const triCanvas = document.getElementById('triangle-master-canvas');
        const triGrid = document.getElementById('triangle-gallery-grid');
        this.setupAppendixShape(triCanvas, triGrid, 'triangle', 8); // 8 patterns

        // 2. Hexagon Gallery Setup
        const hexCanvas = document.getElementById('hexagon-master-canvas');
        const hexGrid = document.getElementById('hexagon-gallery-grid');
        this.setupAppendixShape(hexCanvas, hexGrid, 'hexagon', 22); // 22 patterns
    }

    syncAppendixCanvases(type) {
        const id = type === 'triangle' ? 'triangle-master-canvas' : 'hexagon-master-canvas';
        const canvas = document.getElementById(id);
        if (!canvas) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        if (rect.width > 0) {
            canvas.width = rect.width;
            canvas.height = rect.height;
            const strokes = type === 'triangle' ? this.triangleStrokes : this.hexagonStrokes;
            this.renderAppendixMaster(canvas, strokes, type);
        }
    }

    setupAppendixShape(canvas, gridContainer, type, count) {
        if (!canvas || !gridContainer) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Drawing Event
        let drawing = false;
        const strokes = type === 'triangle' ? this.triangleStrokes : this.hexagonStrokes;
        const grids = type === 'triangle' ? this.triangleGrids : this.hexagonGrids;

        const startDraw = (e) => {
            drawing = true;
            strokes.push({ points: [] });
            addPoint(e);
        };
        const endDraw = () => { drawing = false; };
        const addPoint = (e) => {
            if (!drawing) return;
            const r = canvas.getBoundingClientRect();
            // Normalize coordinates to 0-1 range
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            strokes[strokes.length - 1].points.push({ x, y });

            this.renderAppendixMaster(canvas, strokes, type);
            this.updateAppendixGallery(grids, strokes, type);
        };

        canvas.onmousedown = startDraw;
        window.addEventListener('mouseup', endDraw);
        canvas.onmousemove = addPoint;

        // Clear Drawing
        const clearBtnId = type === 'triangle' ? 'clear-triangle-draw' : 'clear-hexagon-draw';
        const clearBtn = document.getElementById(clearBtnId);
        if (clearBtn) {
            clearBtn.onclick = () => {
                strokes.length = 0; // Clear the array
                this.renderAppendixMaster(canvas, strokes, type);
                this.updateAppendixGallery(grids, strokes, type);
            };
        }

        // Create Grid Items
        for (let i = 1; i <= count; i++) {
            const item = document.createElement('div');
            item.className = 'shape-item';

            const previewBox = document.createElement('div');
            previewBox.className = 'shape-preview-box';
            const pCanvas = document.createElement('canvas');
            pCanvas.width = 180;
            pCanvas.height = 180;
            previewBox.appendChild(pCanvas);

            const tag = document.createElement('div');
            tag.className = 'shape-id-tag';
            tag.textContent = `Pattern ID: ${type.charAt(0).toUpperCase()}${i}`;

            item.appendChild(previewBox);
            item.appendChild(tag);
            gridContainer.appendChild(item);

            grids.push({ canvas: pCanvas, ctx: pCanvas.getContext('2d'), id: i });
        }

        this.renderAppendixMaster(canvas, strokes, type);
    }

    renderAppendixMaster(canvas, strokes, type) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // 1. Draw Background Grid (Removed as requested)
        // if (type === 'triangle') {
        //     this.drawMasterTriGrid(ctx, w, h);
        // } else {
        //     this.drawMasterHexGrid(ctx, w, h);
        // }

        // 2. Draw Base Shape Outline (Dashed) & Midpoints
        ctx.save();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        const midpoints = [];
        if (type === 'triangle') {
            const v1 = { x: w / 2, y: h * 0.1 };
            const v2 = { x: w * 0.9, y: h * 0.85 };
            const v3 = { x: w * 0.1, y: h * 0.85 };

            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.closePath();
            ctx.stroke();

            // Calculate midpoints
            midpoints.push({ x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 });
            midpoints.push({ x: (v2.x + v3.x) / 2, y: (v2.y + v3.y) / 2 });
            midpoints.push({ x: (v3.x + v1.x) / 2, y: (v3.y + v1.y) / 2 });
        } else {
            const radius = Math.min(w, h) * 0.45;
            const vertices = [];
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60 - 30) * Math.PI / 180;
                const x = w / 2 + radius * Math.cos(angle);
                const y = h / 2 + radius * Math.sin(angle);
                vertices.push({ x, y });
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();

            // Calculate midpoints of 6 sides
            for (let i = 0; i < 6; i++) {
                const v1 = vertices[i];
                const v2 = vertices[(i + 1) % 6];
                midpoints.push({ x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 });
            }
        }
        ctx.restore();

        // 3. Draw Midpoint Markers (Red dots)
        ctx.save();
        ctx.fillStyle = '#ff4757';
        midpoints.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fill();
            // Subtle glow
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(255, 71, 87, 0.5)';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        ctx.restore();

        // 4. Draw Strokes
        this.drawStrokesOntoCanvas(ctx, w, h, strokes, '#2c3e50', 4);
    }

    updateAppendixGallery(grids, strokes, type) {
        grids.forEach(grid => {
            const ctx = grid.ctx;
            const w = grid.canvas.width;
            const h = grid.canvas.height;
            const patternColor = (type === 'triangle' ? this.appendixColors.tri : this.appendixColors.hex)[grid.id - 1] || '#2c3e50';

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);

            let idCounter = 1;

            if (type === 'triangle') {
                const rows = 4;
                const totalW = w * 0.95;
                const size = totalW / rows;
                const triH = size * Math.sqrt(3) / 2;

                ctx.save();
                // Center the large triangle cluster
                ctx.translate(w / 2, h / 2 - (rows * triH) / 2 + triH / 3);

                let idCounterLocal = 0;
                for (let r = 0; r < rows; r++) {
                    const numTris = 2 * r + 1;
                    const rowStartX = -(r * size / 2);

                    for (let i = 0; i < numTris; i++) {
                        ctx.save();
                        const tx = rowStartX + i * (size / 2);
                        const isInverted = i % 2 === 1;
                        const ty = isInverted ? (r - 1 / 3) * triH : r * triH;

                        ctx.translate(tx, ty);

                        // Apply Pattern Symmetry
                        this.applyAppendixSymmetry(ctx, grid.id, type, idCounterLocal++, 0);

                        if (isInverted) {
                            ctx.rotate(Math.PI);
                        }

                        // 1. Draw Tile Content
                        ctx.save();
                        // Map Master Triangle (Normalized 0-1) to local Triangle space
                        // MT Bounds: X[0.1-0.9], Y[0.1-0.85] -> Width 0.8, Height 0.75
                        // Local Space: Centroid is (0,0). Tri apex (0, -2/3 triH), Base Y (1/3 triH)
                        const scaleFactorX = size / 0.8;
                        const scaleFactorY = triH / 0.75;
                        ctx.scale(scaleFactorX, scaleFactorY);
                        ctx.translate(-0.5, -0.6); // Align centroids (MT centroid is 0.5, 0.6)

                        // Draw strokes with adjusted line width
                        const scaledWidth = this.appendixStrokeWidth / ((scaleFactorX + scaleFactorY) / 2);
                        this.drawStrokesOntoCanvas(ctx, 1, 1, strokes, patternColor, scaledWidth);
                        ctx.restore();

                        // 2. Draw Faint Triangle Border
                        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(0, -triH * 2 / 3);
                        ctx.lineTo(size / 2, triH / 3);
                        ctx.lineTo(-size / 2, triH / 3);
                        ctx.closePath();
                        ctx.stroke();

                        // 3. Draw ID Label
                        ctx.fillStyle = "rgba(0,0,0,0.3)";
                        ctx.font = "bold 9px Arial";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(idCounterLocal, 0, 0);

                        ctx.restore();
                    }
                }
                ctx.restore();
            }
            else {
                // Modified Hexagon Grid: 19-hex cluster (Pointy-Top)
                const size = w / 9.5;
                ctx.save(); // CRITICAL: Stop translation accumulation
                ctx.translate(w / 2, h / 2);

                // Define axial coordinates for a radius-2 hexagon (19 tiles)
                const hexPositions = [];
                for (let r = -2; r <= 2; r++) {
                    for (let q = -2; q <= 2; q++) {
                        if (Math.abs(q + r) <= 2) {
                            hexPositions.push({ q, r });
                        }
                    }
                }

                // Sort positions to have a clean numbering: top-to-bottom, then left-to-right
                hexPositions.sort((a, b) => a.r - b.r || a.q - b.q);

                hexPositions.forEach((pos, idx) => {
                    ctx.save();
                    const tx = size * (Math.sqrt(3) * pos.q + Math.sqrt(3) / 2 * pos.r);
                    const ty = size * (1.5 * pos.r);
                    ctx.translate(tx, ty);

                    // 1. Draw Tile Content (Master drawing)
                    ctx.save();
                    ctx.translate(-size, -size);
                    this.drawStrokesOntoCanvas(ctx, size * 2, size * 2, strokes, patternColor, this.appendixStrokeWidth);
                    ctx.restore();

                    // 2. Draw Faint Hexagon Border
                    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * 60 - 30) * Math.PI / 180;
                        const px = size * Math.cos(angle);
                        const py = size * Math.sin(angle);
                        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.stroke();

                    // 3. Draw ID Label (1-19)
                    ctx.fillStyle = "rgba(0,0,0,0.3)";
                    ctx.font = "bold 9px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(idx + 1, 0, 0);

                    ctx.restore();
                });
                ctx.restore(); // Restore from initial translate(w/2, h/2)
            }

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for outer border
            ctx.strokeStyle = 'rgba(200,200,200,0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(0, 0, w, h);
            ctx.restore();
        });
    }

    applyAppendixSymmetry(ctx, patternId, type, tileIdx, subIdx) {
        if (type === 'triangle') {
            // Triangle Patterns (T1-T8)
            // Resetting to identity/basic state as requested "Concrete transformations later"
            // This ensures all 16-tri clusters look consistent structurally first.
            switch (patternId) {
                case 1: break;
                case 2: break;
                case 3: break;
                case 4: break;
                case 5: break;
                case 6: break;
                case 7: break;
                case 8: break;
            }
        } else {
            // Hexagon Patterns (H1-H22)
            const group = Math.floor((patternId - 1) / 5);
            const sub = (patternId - 1) % 5;

            switch (group) {
                case 0: // Basic rotations
                    ctx.rotate(tileIdx * sub * 60 * Math.PI / 180);
                    break;
                case 1: // Reflections
                    if (tileIdx % 2 === 1) ctx.scale(-1, 1);
                    ctx.rotate(sub * 30 * Math.PI / 180);
                    break;
                case 2: // Complex
                    ctx.rotate(tileIdx * 120 * Math.PI / 180);
                    if (sub > 2) ctx.scale(1, -1);
                    break;
                case 3: // Glide-like
                    ctx.translate(sub * 10, 0);
                    if (tileIdx % 3 === 0) ctx.rotate(180 * Math.PI / 180);
                    break;
                default:
                    ctx.rotate(tileIdx * 90 * Math.PI / 180);
                    break;
            }
            if (patternId % 7 === 0) ctx.scale(-1, 1);
        }
    }
    drawMasterTriGrid(ctx, w, h) {
        ctx.save();
        const centerX = w / 2;
        const centerY = h / 2;
        const side = Math.min(w, h) * 0.8;
        const triH = side * Math.sqrt(3) / 2;
        const gridCount = 6;
        const step = side / gridCount;

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;

        const startY = centerY - triH * 2 / 3;
        const startX = centerX;

        // Draw 3 directions of lines to form equilateral grid
        for (let i = 0; i <= gridCount; i++) {
            const hLineY = startY + (i / gridCount) * triH;
            const hLineHalfW = (i / gridCount) * (side / 2);

            // 1. Horizontal lines
            ctx.beginPath();
            ctx.moveTo(centerX - hLineHalfW, hLineY);
            ctx.lineTo(centerX + hLineHalfW, hLineY);
            ctx.stroke();

            // 2. Left-leaning lines
            const p1x = centerX - (i / gridCount) * (side / 2);
            const p1y = startY + (i / gridCount) * triH;
            const p2x = centerX + (side / 2) - (i / gridCount) * (side / 2);
            const p2y = startY + triH;
            ctx.beginPath();
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            ctx.stroke();

            // 3. Right-leaning lines
            const p3x = centerX + (i / gridCount) * (side / 2);
            const p3y = startY + (i / gridCount) * triH;
            const p4x = centerX - (side / 2) + (i / gridCount) * (side / 2);
            const p4y = startY + triH;
            ctx.beginPath();
            ctx.moveTo(p3x, p3y);
            ctx.lineTo(p4x, p4y);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawMasterHexGrid(ctx, w, h) {
        ctx.save();
        const centerX = w / 2;
        const centerY = h / 2;
        const mainRadius = Math.min(w, h) * 0.45;
        const gridSize = mainRadius / 5; // 5 rings of hexes

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;

        // Draw hexagonal grid within the master hexagon boundary
        for (let q = -6; q <= 6; q++) {
            for (let r = -6; r <= 6; r++) {
                if (Math.abs(q + r) > 6) continue;

                const tx = centerX + gridSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
                const ty = centerY + gridSize * (1.5 * r);

                // Only draw if the small hex center is roughly within the main hex
                const dist = Math.sqrt((tx - centerX) ** 2 + (ty - centerY) ** 2);
                if (dist > mainRadius + gridSize) continue;

                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * 60 - 30) * Math.PI / 180;
                    const px = tx + gridSize * Math.cos(angle);
                    const py = ty + gridSize * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

new UnitessGalleryApp();
