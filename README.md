# 🔧 Coffee Lottery - 총무팀 커피내기 게임

총무팀을 위한 **완전 오프라인** 커피내기 추첨 게임입니다. 
팀 미팅이나 회의 후에서 "누가 커피를 살까?" 논쟁을 **30초 안에** 해결해보세요!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.3+-green.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3+-blue.svg)

## 🎯 주요 기능

- **🔧 사다리 게임**: 클래식한 사다리타기로 커피내기 결정
- **🔨 공 떨어뜨리기**: 실시간 카운터 감소로 스릴 만점
- **🛠️ 총무팀 디자인**: 공구 테마와 작업장 감성
- **⚡ 30초 결정**: 빠른 의사결정으로 시간 절약
- **📱 완전 오프라인**: 인터넷 없이도 사용 가능
- **📊 세션 통계**: 게임 중 승/패 통계 추적

## 🚀 빠른 시작

### 요구사항
- Node.js 16+ 
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🎮 게임 방법

### 1️⃣ 총무팀 사다리 게임
1. 총무팀원 이름을 2~20명 입력
2. "커피내기 사다리 시작" 클릭
3. 사다리가 자동 생성되고 애니메이션 실행
4. 한 명의 커피사는 사람이 결정됨!

### 2️⃣ 총무팀 공 떨어뜨리기
1. 총무팀원 이름을 2~20명 입력
2. "커피내기 핀볼 시작" 클릭
3. 각자 공이 실시간으로 떨어짐
4. 마지막에 골인하는 사람이 커피를 사요!

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: `#1E40AF` (버튼, 포커스)
- **Accent**: `#FF6B35` (오렌지, 공구 테마)
- **Background**: `#1A1A1A` (메인 배경)
- **Card**: `#2A2A2A` (카드 배경)

### 타이포그래피
- **Main Font**: Courier New (작업장 감성)
- **Tool Effect**: 오렌지 글로우 사용

## 🛠️ 기술 스택

- **Frontend**: Vue 3 (Composition API)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Canvas**: HTML5 Canvas (사다리 그리기)
- **Audio**: Web Audio API (효과음)

## 📁 프로젝트 구조

```
my/
├── DOC/                    # 프로젝트 문서
│   ├── 1)PRD.MD           # 제품 요구사항
│   ├── 2)IA.MD            # 정보 아키텍처
│   ├── 3)usecase.md       # 사용 사례
│   └── 4)design.md        # 디자인 시스템
├── src/
│   ├── components/        # Vue 컴포넌트
│   │   ├── icons/         # 공구 아이콘 컴포넌트
│   │   ├── TopBar.vue     # 상단 네비게이션
│   │   ├── ConfirmModal.vue
│   │   └── ResultModal.vue
│   ├── views/             # 페이지 컴포넌트
│   │   ├── HomeView.vue   # 메인 홈
│   │   ├── LadderView.vue # 사다리 게임
│   │   └── FallingBallsView.vue # 공 게임
│   ├── App.vue            # 메인 앱
│   ├── main.js            # 엔트리 포인트
│   └── style.css          # 글로벌 스타일
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 사용 시나리오

### 📍 회의 후 커피 결정
팀 미팅 종료 직후 → 총무 노트북으로 실행 → 15초 내 커피사는 사람 확정 → 카페 출발

### ☕ 오후 커피타임 내기  
5명 총무팀 → 핀볼 모드 → 30초 내 커피사는 사람 결정 → 커피 주문

### 🎉 팀 빌딩 이벤트
신입 환영 게임으로 사다리 3연전 실시 → 승/패 애니메이션으로 분위기 환기

## 🔧 커스터마이징

### 테마 컬러 변경
`tailwind.config.js`에서 컬러 팔레트 수정:

```javascript
colors: {
  primary: {
    500: '#YOUR_COLOR', // 메인 컬러 변경
  },
  accent: {
    400: '#FF6B35', // 공구 테마 오렌지
  }
}
```

### 게임 설정 변경
`src/main.js`에서 글로벌 설정 수정:

```javascript
app.config.globalProperties.$gameConfig = {
  maxParticipants: 20,    // 최대 참가자 수
  minParticipants: 2,     // 최소 참가자 수
  gameTimeout: 30000,     // 게임 타임아웃 (30초)
  animationDuration: 2000 // 애니메이션 시간 (2초)
}
```

## 🚀 배포 방법

### Vercel 배포
```bash
npm run build
vercel --prod
```

### Netlify 배포
```bash
npm run build
# dist 폴더를 Netlify에 드래그 앤 드롭
```

### 🖥️ 데스크톱 실행파일 (.exe)
```bash
# Electron 의존성 설치
npm install

# 데스크톱 실행파일 생성
npm run dist

# 또는 간편 빌드 (Windows)
build-electron.bat
```

**빌드 결과물:**
- `dist-electron/총무팀 커피내기 게임 Setup 1.0.0.exe` (설치 프로그램)
- `dist-electron/win-unpacked/총무팀 커피내기 게임.exe` (바로 실행 가능)

**사용법:**
1. `build-electron.bat` 더블클릭 (가장 쉬운 방법)
2. 또는 PowerShell에서 `npm run dist` 실행
3. 생성된 exe 파일을 다른 PC에 복사하여 사용

**주의사항:**
- 첫 빌드 시 Electron 다운로드로 시간 소요
- Windows Defender 경고는 정상 (서명되지 않은 앱)

## 📈 성능 최적화

- ⚡ Vite의 번들링 최적화
- 🎨 Tailwind CSS의 Purge CSS
- 🖼️ 이미지 최적화 (WebP 지원)
- 📱 모바일 반응형 (1366px+ 권장)

## 🛠️ 공구 아이콘 가이드

프로젝트에 포함된 공구 아이콘들:
- 🔧 **DrillIcon**: 사다리 게임 표시
- 🔨 **HammerIcon**: 공 떨어뜨리기 표시
- 📏 **RulerIcon**: 통계 표시
- 🧰 **ToolboxIcon**: 메인 제목
- 🔩 **ScrewdriverIcon**: 참가자 번호
- 🔧 **WrenchIcon**: 참가자 등록

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)  
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

**총무팀의 커피내기 고민, 이제 30초면 해결! ☕🔧** 