# Unitess Gallery 🎨

> 기하학적 대칭과 테셀레이션 패턴을 탐구하고 직접 그려보는 인터랙티브 웹 갤러리입니다.

![Project Banner](./image.png)

## 🔗 접속 링크 (Live Demo)
👉 **[Unitess Gallery 바로가기](https://galua2001.github.io/unitess-gallery/)**

## 📝 프로젝트 소개
**Unitess Gallery**는 정사각형, 육각형, 삼각형 등 다양한 기하학적 타일의 대칭성을 활용하여 아름다운 패턴을 만들 수 있는 웹 애플리케이션입니다. 
사용자가 마스터 캔버스에 그림을 그리면, 선택한 대칭 규칙에 따라 실시간으로 타일이 복제되며 전체 패턴을 형성합니다.

### 주요 기능
- **다양한 기하학 모드**:
  - 🟥 **Square (정사각형)**: 26가지 벽지군(Wallpaper Group) 대칭 패턴
  - 🛑 **Hexagon (육각형)**: 22가지 육각형 테셀레이션 패턴
  - 🔺 **Triangle (삼각형)**: 8가지 삼각형 테셀레이션 패턴
- **실시간 드로잉 (Interactive Drawing)**:
  - 마우스 드래그 및 터치 지원
  - 실시간 대칭 반영 (Real-time Symmetry)
  - 마스터 캔버스 그리드 및 가이드라인
- **갤러리 & 학습 모드**:
  - **Learn Mode**: 3x3 그리드에서 기본 대칭 원리 학습
  - **Appendix**: 각 도형별 패턴 목록 및 예시 확인

## 🛠 기술 스택 (Tech Stack)
- **Core**: HTML5, CSS3, JavaScript (Vanilla)
- **Deploy**: GitHub Pages

## 🚀 설치 및 실행 방법
이 프로젝트는 별도의 빌드 과정 없이 바로 실행 가능합니다.

1. 리포지토리 클론:
   ```bash
   git clone https://github.com/galua2001/unitess-gallery.git
   ```
2. 폴더로 이동 후 `index.html` 파일을 브라우저에서 실행하세요.

## 📂 폴더 구조
```
unitess-gallery/
├── index.html       # 메인 진입점
├── script.js        # 핵심 로직 (드로잉, 대칭 처리)
├── style.css        # 스타일 시트
├── gameimage/       # 패턴 예시 이미지
└── assets/          # 기타 리소스
```

## 📅 업데이트 내역
- **2026-02-19**: 육각형/삼각형 갤러리 추가 및 GitHub 배포 완료
- **2026-02-14**: 모바일 터치 지원 및 마스터 캔버스 그리드 고도화

---
© 2026 Unitess Project. All rights reserved.
