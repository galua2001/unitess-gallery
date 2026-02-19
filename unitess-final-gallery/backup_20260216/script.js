class UnitessGalleryApp {
    constructor() {
        this.viewport = document.getElementById('gallery-viewport');
        this.container = document.getElementById('gallery-container');
        this.masterCanvas = document.getElementById('master-canvas');
        this.masterCtx = this.masterCanvas.getContext('2d');

        this.strokes = [];
        this.learnStrokes = []; // 학습 모드 전용 드로잉 배열 추가
        this.isDrawing = false;

        // View State (Zoom/Pan)
        this.scale = 0.5; // Start zoomed out
        this.offsetX = 50;
        this.offsetY = 50;
        this.isPanning = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.grids = [];
        this.strokeWidth = 2;
        this.masterStrokeColor = '#ff0000';
        this.showLabels = true;
        this.showCanvasGrid = true;
        this.currentLang = 'ko';

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
                mode_quiz: "Quiz",
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
                menu_learn: "learn",
                menu_appearance: "Appearance",
                chat_title: "Community Chat",
                chat_placeholder: "Talk about your design...",
                label_tile_bg: "Tile Background"
            },
            ko: {
                menu_settings: "설정",
                menu_modes: "시스템 모드",
                mode_square: "사각형",
                mode_triangle: "삼각형",
                mode_hexagon: "육각형",
                mode_quiz: "퀴즈",
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
                label_tile_bg: "사각형 배경색"
            }
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
        this.setupDrawingSystem();
        this.updateLanguage();
        this.applyViewTransform();
        this.renderLoop();
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

            case 2: // [2번] CCCC 패턴
                const rr2 = r % 3;
                const cc2 = c % 3;
                let t2_type = 'T';
                if ((rr2 === 0 && cc2 === 1) || (rr2 === 1 && cc2 === 0) || (rr2 === 1 && cc2 === 2) || (rr2 === 2 && cc2 === 1)) {
                    t2_type = 'C';
                }
                const t2 = this.getTransform(t2_type);
                return { rotation: t2.rotation, scaleX: t2.sx, scaleY: t2.sy };

            case 3: // [3번] C3C1C3C1 패턴
                const rr3 = r % 3;
                const cc3 = c % 3;
                let t3_type = 'T';
                if ((rr3 === 1 && cc3 === 0) || (rr3 === 1 && cc3 === 2)) t3_type = 'C3';
                else if ((rr3 === 2 && cc3 === 1) || (rr3 === 0 && cc3 === 1)) t3_type = 'C1';
                else if ((rr3 === 0 && cc3 === 0) || (rr3 === 2 && cc3 === 0) || (rr3 === 2 && cc3 === 2) || (rr3 === 0 && cc3 === 2)) t3_type = 'C';

                const t3 = this.getTransform(t3_type);
                return { rotation: t3.rotation, scaleX: t3.sx, scaleY: t3.sy };
            case 4: // [4번] C3C1C3C1(90 270 y x) 패턴
                const rr4 = r % 3;
                const cc4 = c % 3;
                let t4_type = 'C3';
                if (rr4 === 1 && cc4 === 1) t4_type = 'C1';
                else if ((rr4 === 1 && cc4 === 0) || (rr4 === 1 && cc4 === 2)) t4_type = 'T';
                else if ((rr4 === 2 && cc4 === 1) || (rr4 === 0 && cc4 === 1)) t4_type = 'C';

                const t4 = this.getTransform(t4_type);
                return { rotation: t4.rotation, scaleX: t4.sx, scaleY: t4.sy };
            case 5: // [5번] XYXY(0 XY) 패턴
                const rr5 = r % 3;
                const cc5 = c % 3;
                let t5_type = 'T';
                if (rr5 === 1 && cc5 === 1) t5_type = 'C'; // 0 -> C (XY)
                else if ((rr5 === 1 && cc5 === 0) || (rr5 === 1 && cc5 === 1) || (rr5 === 1 && cc5 === 2)) {
                    // This logic is a bit overlapping, let's be precise
                }

                // Re-calculating based on user's 3x3 numbers:
                // 1(1,0), 3(1,2) = X
                // 5(0,0), 6(2,0), 7(2,2), 8(0,2) = C
                // 2(2,1), 4(0,1) = Y
                // 0(1,1) = C (XY)
                if ((rr5 === 1 && cc5 === 0) || (rr5 === 1 && cc5 === 2)) t5_type = 'X';
                else if ((rr5 === 0 && cc5 === 0) || (rr5 === 2 && cc5 === 0) || (rr5 === 2 && cc5 === 2) || (rr5 === 0 && cc5 === 2)) t5_type = 'C';
                else if ((rr5 === 2 && cc5 === 1) || (rr5 === 0 && cc5 === 1)) t5_type = 'Y';
                else if (rr5 === 1 && cc5 === 1) t5_type = 'C';

                const t5 = this.getTransform(t5_type);
                return { rotation: t5.rotation, scaleX: t5.sx, scaleY: t5.sy };
            case 6: // [6번] XYXY(0 YX) 패턴
                const rr6 = r % 3;
                const cc6 = c % 3;
                let t6_type = 'T';
                // 1(1,0), 3(1,2) = Y
                // 5(0,0), 6(2,0), 7(2,2), 8(0,2) = C
                // 2(2,1), 4(0,1) = X
                // 0(1,1) = T
                if ((rr6 === 1 && cc6 === 0) || (rr6 === 1 && cc6 === 2)) t6_type = 'Y';
                else if ((rr6 === 0 && cc6 === 0) || (rr6 === 2 && cc6 === 0) || (rr6 === 2 && cc6 === 2) || (rr6 === 0 && cc6 === 2)) t6_type = 'C';
                else if ((rr6 === 2 && cc6 === 1) || (rr6 === 0 && cc6 === 1)) t6_type = 'X';
                else if (rr6 === 1 && cc6 === 1) t6_type = 'T';

                const t6 = this.getTransform(t6_type);
                return { rotation: t6.rotation, scaleX: t6.sx, scaleY: t6.sy };
            case 7:
            case 8:
            case 9:
            case 10:
                const rrG = r % 3;
                const ccG = c % 3;
                let tG_type = 'T';
                if ((rrG === 1 && ccG === 0) || (rrG === 2 && ccG === 1) || (rrG === 1 && ccG === 2) || (rrG === 0 && ccG === 1)) {
                    if (id === 7) tG_type = 'Y=X';
                    else if (id === 8) tG_type = 'Y=-X';
                    else if (id === 9) tG_type = 'X';
                    else if (id === 10) tG_type = 'Y';
                }
                const tG = this.getTransform(tG_type);
                return { rotation: tG.rotation, scaleX: tG.sx, scaleY: tG.sy };
            case 11: // [11번] TCTC(0 180 x y) 패턴
                const rr11 = r % 3;
                const cc11 = c % 3;
                let t11_type = 'C'; // 기본 c (180회전)
                if (rr11 === 1) t11_type = 'T'; // 1(1,0), 0(1,1), 3(1,2) 가 모두 rr=1 경로에 있음

                const t11 = this.getTransform(t11_type);
                return { rotation: t11.rotation, scaleX: t11.sx, scaleY: t11.sy };
            case 12: // [12번] TCTC(90 270 y=x y=-x) 패턴
                const rr12 = r % 3;
                const cc12 = c % 3;
                let t12_type = 'C3'; // 나머지 = 270
                if (rr12 === 1) t12_type = 'C1'; // 1(1,0), 0(1,1), 3(1,2) = 90

                const t12 = this.getTransform(t12_type);
                return { rotation: t12.rotation, scaleX: t12.sx, scaleY: t12.sy };
            case 13:
            case 14:
            case 15:
                const rrCGCG = r % 3;
                const ccCGCG = c % 3;
                let tCGCG_type = 'T';
                if (id === 15 && rrCGCG === 1 && ccCGCG === 1) tCGCG_type = 'C1';
                else if ((rrCGCG === 1 && ccCGCG === 0) || (rrCGCG === 1 && ccCGCG === 2)) tCGCG_type = (id === 15) ? 'C3' : 'C';
                else if ((rrCGCG === 2 && ccCGCG === 1) || (rrCGCG === 0 && ccCGCG === 1)) {
                    if (id === 13) tCGCG_type = 'Y';
                    else if (id === 14) tCGCG_type = 'X';
                    else if (id === 15) tCGCG_type = 'Y=X';
                }
                else if ((rrCGCG === 0 && ccCGCG === 0) || (rrCGCG === 2 && ccCGCG === 0) || (rrCGCG === 2 && ccCGCG === 2) || (rrCGCG === 0 && ccCGCG === 2)) {
                    if (id === 13) tCGCG_type = 'Y'; // X에서 Y로 수정 (세로 대칭 흐름 일치)
                    else if (id === 14) tCGCG_type = 'Y';
                    else if (id === 15) tCGCG_type = 'Y=-X';
                }

                const tCGCG = this.getTransform(tCGCG_type);
                return { rotation: tCGCG.rotation, scaleX: tCGCG.sx, scaleY: tCGCG.sy };
            case 16: // [16번] CGCG(90 y, 270 y, y=x y, y=-x y) 패턴
                const rr16 = r % 3;
                const cc16 = c % 3;
                let t16_type = 'T';
                if (rr16 === 1 && cc16 === 1) t16_type = 'C1'; // 0 -> 90
                else if ((rr16 === 1 && cc16 === 0) || (rr16 === 1 && cc16 === 2)) t16_type = 'C3'; // 1, 3 -> 270
                else if ((rr16 === 2 && cc16 === 1) || (rr16 === 0 && cc16 === 1)) t16_type = 'Y=-X'; // 2, 4 -> y=-x
                else if ((rr16 === 0 && cc16 === 0) || (rr16 === 2 && cc16 === 0) || (rr16 === 2 && cc16 === 2) || (rr16 === 0 && cc16 === 2)) t16_type = 'Y=X'; // 5, 6, 7, 8 -> y=x

                const t16 = this.getTransform(t16_type);
                return { rotation: t16.rotation, scaleX: t16.sx, scaleY: t16.sy };
            case 17:
            case 18:
            case 19:
            case 20:
                const rrCCGG = r % 3;
                const ccCCGG = c % 3;
                let tCCGG_type = 'T';
                if ((rrCCGG === 1 && ccCCGG === 1) || (rrCCGG === 2 && ccCCGG === 0) || (rrCCGG === 0 && ccCCGG === 2)) {
                    if (id === 17) tCCGG_type = 'T';
                    else if (id === 18) tCCGG_type = 'Y';
                    else if (id === 19) tCCGG_type = 'Y=X';
                    else if (id === 20) tCCGG_type = 'C1';
                }
                else if ((rrCCGG === 1 && ccCCGG === 0) || (rrCCGG === 0 && ccCCGG === 1)) {
                    if (id === 17) tCCGG_type = 'C';
                    else if (id === 18) tCCGG_type = 'X';
                    else if (id === 19) tCCGG_type = 'Y=-X';
                    else if (id === 20) tCCGG_type = 'C3';
                }
                else if ((rrCCGG === 2 && ccCCGG === 1) || (rrCCGG === 1 && ccCCGG === 2)) {
                    if (id === 17) tCCGG_type = 'Y=X';
                    else if (id === 18) tCCGG_type = 'C1';
                    else if (id === 19) tCCGG_type = 'T';
                    else if (id === 20) tCCGG_type = 'Y';
                }
                else if ((rrCCGG === 0 && ccCCGG === 0) || (rrCCGG === 2 && ccCCGG === 2)) {
                    if (id === 17) tCCGG_type = 'Y=-X';
                    else if (id === 18) tCCGG_type = 'C3';
                    else if (id === 19) tCCGG_type = 'C';
                    else if (id === 20) tCCGG_type = 'X';
                }
                const tCCGG = this.getTransform(tCCGG_type);
                return { rotation: tCCGG.rotation, scaleX: tCCGG.sx, scaleY: tCCGG.sy };
            case 21: // [21번] TGTG(0 y=-x, ...) 패턴
                const rr21 = r % 3;
                const cc21 = c % 3;
                let t21_type = 'Y=-X'; // 그외 y=-x
                // 0(1,1), 1(1,0), 3(1,2) = t
                if (rr21 === 1) t21_type = 'T';

                const t21 = this.getTransform(t21_type);
                return { rotation: t21.rotation, scaleX: t21.sx, scaleY: t21.sy };
            case 22: // [22번] TGTG(0 y=x, ...) 패턴
                const rr22 = r % 3;
                const cc22 = c % 3;
                let t22_type = 'Y=X'; // 그외 y=x
                // 0(1,1), 1(1,0), 3(1,2) = t
                if (rr22 === 1) t22_type = 'T';

                const t22 = this.getTransform(t22_type);
                return { rotation: t22.rotation, scaleX: t22.sx, scaleY: t22.sy };
            case 23: // [23번] TGTG(0 y, 180 y, x y, y y) 패턴
                const rr23 = r % 3;
                const cc23 = c % 3;
                let t23_type = 'Y'; // 그외 y
                // 0(1,1), 1(1,0), 3(1,2) = t
                if (rr23 === 1) t23_type = 'T';

                const t23 = this.getTransform(t23_type);
                return { rotation: t23.rotation, scaleX: t23.sx, scaleY: t23.sy };
            case 24: // [24번] TGTG(0 x, 180 x, x x, y x) 패턴
                const rr24 = r % 3;
                const cc24 = c % 3;
                let t24_type = 'X'; // 그외 x
                // 0(1,1), 1(1,0), 3(1,2) = t
                if (rr24 === 1) t24_type = 'T';

                const t24 = this.getTransform(t24_type);
                return { rotation: t24.rotation, scaleX: t24.sx, scaleY: t24.sy };
            case 25: // [25번] TGTG(90 x, 270 x, y=x x, y=-x x) 패턴
                const rr25 = r % 3;
                const cc25 = c % 3;
                let t25_type = 'Y=X'; // 그외 y=x
                // 0(1,1), 1(1,0), 3(1,2) = 90
                if (rr25 === 1) t25_type = 'C1';

                const t25 = this.getTransform(t25_type);
                return { rotation: t25.rotation, scaleX: t25.sx, scaleY: t25.sy };
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
                } else if (mode !== 'square') {
                    alert(`${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode 준비 중입니다!`);
                }
            };
        });

        document.getElementById('exit-learn').onclick = () => {
            this.isLearnMode = false;
            document.getElementById('learn-mode-overlay').classList.add('hidden');
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
            this.scale = 0.5;
            this.offsetX = 50;
            this.offsetY = 50;
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

        // 4. Download
        const link = document.createElement('a');
        link.download = `unitess-gallery-${new Date().getTime()}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
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

                const rule = this.getTileRule(this.currentLearnRuleId, r, c);
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

                // Update target transformation rules for animation
                this.learnTiles.forEach(tile => {
                    tile.targetRule = this.getTileRule(this.currentLearnRuleId, tile.row, tile.col);
                });
            };
        });

        // Initial text display
        const activeBtn = document.querySelector('.rule-btn.active');
        if (activeBtn) document.getElementById('current-pattern-id').textContent = activeBtn.textContent;

        // Drawing system already initialized in init()
    }

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
}

new UnitessGalleryApp();
