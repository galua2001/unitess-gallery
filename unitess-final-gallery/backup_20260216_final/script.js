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
                label_tile_bg: "Tile Background",
                btn_show_guide: "Guide"
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
                label_tile_bg: "사각형 배경색",
                btn_show_guide: "설명"
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

    }

    explanationData = {
        1: {
            ko: { title: "TTTT 패턴 (평행이동)", text: "정사각형의 네 변이 모두 평행이동(Translation)을 통해 연결되는 기본형입니다. 원본 타일이 방향 전환 없이 모든 방향으로 반복됩니다.", tags: ["#평행이동", "#Basic"] },
            en: { title: "TTTT Pattern (Translation)", text: "All four sides repeat via translation. The original tile repeats indefinitely without any rotation or reflection.", tags: ["#Translation", "#Basic"] }
        },
        2: {
            ko: { title: "CCCC 패턴 (180도 회전)", text: "각 변의 중점을 기준으로 180도 회전(Center Rotation)하여 연결됩니다. 원본 타일이 점대칭 구조를 이루며 역동적인 회전 무늬를 만듭니다.", tags: ["#180도회전", "#점대칭"] },
            en: { title: "CCCC Pattern (180° Rotation)", text: "Sides repeat by rotating 180° around their midpoints. Creates a dynamic rotational rhythm based on point symmetry.", tags: ["#Rotation", "#PointSymmetry"] }
        },
        13: {
            ko: { title: "CGCG (0 y) 상세 설명", text: "이 패턴은 '앞의 변환(⑨번 타일)'과 '뒤의 변환(주변 타일)'의 합성입니다.\n공식: (⑤⑥⑦⑧) = C(0)*G(y)*C(180) = G(x)\n즉, 180도 회전과 Y축 대칭이 결합되어 최종적으로 X축 대칭 무늬를 형성하는 고난도 구조입니다.", tags: ["#합성변환", "#에셔스타일", "#CGCG"] },
            en: { title: "CGCG (0 y) Details", text: "A composite pattern combining 'Tile ⑨ Transformation' and 'Neighbor Transition'.\nFormula: (⑤⑥⑦⑧) = C(0)*G(y)*C(180) = G(x)\nCombines 180° rotation and Y-axis reflection to produce a final X-axis symmetry.", tags: ["#Composition", "#EscherStyle", "#CGCG"] }
        },
        17: {
            ko: { title: "CCGG 패턴 (회전+대칭)", text: "두 변은 회전(C)하고 두 변은 대칭(G) 조작을 거치는 혼합형입니다. 에셔의 복잡한 대칭 동물 문양의 기초가 되는 구조입니다.", tags: ["#회전과대칭", "#복합기하"] },
            en: { title: "CCGG Pattern (Rot+Ref)", text: "A mixed pattern where two sides rotate (C) and two sides reflect (G). Forms the geometric basis for many of Escher's tiling artworks.", tags: ["#Mixed", "#Geometry"] }
        },
        21: {
            ko: { title: "TGTG (0 y=-x) 패턴", text: "평행이동(T)과 대각선 대칭(G)이 결합된 패턴입니다. 한 방향으로는 패턴이 흐르듯 연결되고, 다른 방향으로는 날개를 편 듯 대칭되어 비상하는 문양을 만듭니다.", tags: ["#평행대칭", "#TGTG"] },
            en: { title: "TGTG (0 y=-x) Pattern", text: "Combines translation (T) and diagonal glide reflection (G). One axis flows infinitely while the other mirrors, creating a bird-like flight pattern.", tags: ["#Flight", "#TGTG"] }
        }
        // ... more can be added here
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

        if (!data) {
            const title = lang === 'ko' ? `패턴 ${id} 설명` : `Pattern ${id} Info`;
            const text = lang === 'ko' ? "이 패턴의 상세 설명이 곧 업데이트될 예정입니다." : "Detailed description for this pattern is coming soon.";
            this.openModal(title, `<p class='modal-text'>${text}</p>`);
            return;
        }

        let html = `
            <div class="modal-section">
                <p class="modal-text">${data.text.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="modal-tags">
                ${data.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
            </div>
        `;
        this.openModal(data.title, html);
    }

    showGeneralGuide() {
        const lang = this.currentLang;
        const title = lang === 'ko' ? "Unitess 테셀레이션 이론 가이드" : "Unitess Tessellation Theory Guide";

        let html = "";
        if (lang === 'ko') {
            html = `
                <div class="modal-section">
                    <h3>1. 합성 변환 원리 (Composite Transformation)</h3>
                    <p class="modal-text">Unitess의 26가지 패턴은 단순한 복제가 아니라, 수학적인 합성 변환의 결과입니다. ⑨번 마스터 타일의 변환과 인접 타일로 연결되는 변환이 하나로 합쳐져 전체 문양을 결정합니다.</p>
                    <div class="modal-formula">CGCG(0 y) 공식: (⑤⑥⑦⑧) = C(0)*G(y)*C(180) = G(x)</div>
                </div>
                <div class="modal-section">
                    <h3>2. 8가지 기본 대칭 조작</h3>
                    <p class="modal-text">T(평행), C(180도 회전), C1/C3(90/270도 회전), X/Y(축 대칭), G(글라이드 대칭) 등의 조작이 사각형의 네 변에 조화롭게 배치됩니다.</p>
                </div>
                <div class="modal-section">
                    <h3>3. 학습 팁 (Learn Tip)</h3>
                    <p class="modal-text">※ <b>TTTT</b> 버튼을 먼저 클릭하여 초기화한 후, 다른 변환 버튼을 클릭하면 각 조작이 원본에서 어떻게 분화되는지 더 명확하게 관찰할 수 있습니다.</p>
                </div>
            `;
        } else {
            html = `
                <div class="modal-section">
                    <h3>1. Composite Transformation Principle</h3>
                    <p class="modal-text">The 26 patterns in Unitess are results of mathematical composite transformations. The internal symmetry of Tile ⑨ and the transition rules between neighbors merge to define the final tessellation.</p>
                    <div class="modal-formula">CGCG(0 y) Formula: (⑤⑥⑦⑧) = C(0)*G(y)*C(180) = G(x)</div>
                </div>
                <div class="modal-section">
                    <h3>2. 8 Basic Symmetry Operations</h3>
                    <p class="modal-text">Operations like T (Translation), C (180° Rot), C1/C3 (90/270° Rot), X/Y (Mirror), and G (Glide) are arranged on the four edges of the square.</p>
                </div>
                <div class="modal-section">
                    <h3>3. Learning Tip</h3>
                    <p class="modal-text">※ Click <b>TTTT</b> first to reset, then click other pattern buttons to see how each transformation deviates from the simplest translation form.</p>
                </div>
            `;
        }
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
                // No automatic explanation update here anymore, only target rule for animation
                this.learnTiles.forEach(tile => {
                    tile.targetRule = this.getTileRule(this.currentLearnRuleId, tile.row, tile.col);
                });
            };
        });

        // New: Info/Popup Buttons Logic
        const infoBtns = document.querySelectorAll('.info-btn');
        infoBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.showPatternExplain(id);
            };
        });

        // New: General Guide Button Logic
        document.getElementById('show-general-explain').onclick = () => this.showGeneralGuide();
        document.getElementById('close-modal').onclick = () => this.closeModal();
        window.onclick = (e) => {
            if (e.target === document.getElementById('explanation-modal')) this.closeModal();
        };

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
