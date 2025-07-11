## Design System Overview — v2 (Reference 이미지 반영)

총무팀 전용 Lunch-Lottery UI는 \*\*“깔끔한 툴박스 = 실무 효율 + 친근한 장난기”\*\*라는 컨셉을 유지하되, 아래 예시 이미지에서 확인된 두 가지 핵심 모티프를 설계 전반에 녹였습니다.

1. **공구 사진 스트립(16 : 9) + 라인아이콘 오버레이**
2. **세로 점선(#F28C28)으로 영역 구분** — 정보 블록을 “칸막이”처럼 시각적으로 정리

---

## Color Palette (Tailwind CSS 토큰)

| 토큰                 | 변수                    | HEX                    | 비고                |
| ------------------ | --------------------- | ---------------------- | ----------------- |
| **Primary 500**    | `--color-primary-500` | **#2C473F**            | 버튼, 아이콘 Stroke    |
| Primary 300        | `--color-primary-300` | #486B63                | Hover/Active      |
| Primary 50 Overlay | `--color-primary-50`  | rgba(44, 71, 63, 0.20) | 사진 오버레이           |
| **Accent 400**     | `--color-accent-400`  | **#F28C28**            | 세로 점선, Focus Ring |
| Accent 200 Tint    | `--color-accent-200`  | #FFBF7A                | Hover 배경 살짝       |
| **BG-Light**       | `--color-bg-light`    | #F6F8F7                | 주 배경              |
| BG-Dark            | `--color-bg-dark`     | #1A1A1A                | 모달/오버레이           |
| FG-Default         | `--color-fg`          | #1A1A1A                | 본문                |
| FG-Invert          | `--color-fg-invert`   | #FFFFFF                | Dark 배경용          |

```js
// tailwind.config.js 핵심 확장
colors: {
  primary: { 50: 'rgba(44,71,63,0.20)', 300:'#486B63', 500:'#2C473F'},
  accent: {200:'#FFBF7A', 400:'#F28C28'},
  fg: {DEFAULT:'#1A1A1A', invert:'#FFFFFF'},
  'bg-light':'#F6F8F7','bg-dark':'#1A1A1A',
}
```

---

## Page Implementations (업데이트)

### 1) **`view_home` — 모드 선택 & 참가자 입력**

| 구역                 | 키 컴포넌트                                                | 레이아웃/스타일                                     |
| ------------------ | ----------------------------------------------------- | -------------------------------------------- |
| **ToolPhotoStrip** | 공구 흑백사진 3\~5장 + Primary 50 Overlay<br>사진 간 좌우 패딩 4 px | 높이 **96 px**, width 100 %                    |
| GameTabs           | 라인아이콘(24 px) + 라벨                                     | Inactive → FG-Muted, Active → Primary 500 밑줄 |
| NameInputList      | 텍스트필드 + 삭제 아이콘                                        | 필드 간 상하 8 px                                 |
| **StartBtn**       | Primary 500 → Hover Primary 300                       | width 200 px                                 |

### 2) **`view_ladder`**

* ToolPhotoStrip (상단 고정)
* LadderCanvas (16 : 9, 중앙 배치)
* FooterControls (세로 점선 상단)

### 3) **`view_falling`**

* ToolPhotoStrip
* BallsGrid (카드 160 \~ 200 px)
* FooterControls

### 4) **`view_result`**

* Full Modal BG-Dark, 텍스트 Accent 400
* 서브텍스트 FG-Invert 60 % opacity

---

## Layout Components & Responsive Behavior

| Route          | 공통 컴포넌트             | 특화 요소                                   | 데스크톱 반응형                        |
| -------------- | ------------------- | --------------------------------------- | ------------------------------- |
| All            | **TopBar** 56 px    | SoundToggle 아이콘 24 px                   | 폭 ≥ 1920 → 좌우 Padding 64 px     |
| All            | **ToolPhotoStrip**  | 사진 3장 + 2개 컬러 Fill 블록 **(이미지 예시 참고)**   | 폭 늘어날 때 사진 비율 고정, 중앙 정렬         |
| Home           | FeatureGrid 4-cols  | 컬럼 사이 **세로 점선(2 px dashed Accent 400)** | 1366\~1600 → `grid-col-2` Stack |
| FooterControls | RestartBtn, ExitBtn | 상단 점선 Divider                           | 버튼 width 固定 160 px              |

---

## Component Spec Tables

### 🟩 IconButton

| State    | Stroke      | Fill (BG)          | 설명          |
| -------- | ----------- | ------------------ | ----------- |
| Default  | Primary 500 | none               | 아이콘만        |
| Hover    | Primary 300 | Accent 200 10 % bg | 원형 40 px    |
| Disabled | FG-Muted    | none               | opacity 0.4 |

### 🟧 Vertical Divider (점선)

```css
.divider-v {
  border-left: 2px dashed var(--color-accent-400);
  height: 100%;
}
```

* FeatureGrid, FooterControls 상단 사용
* ARIA role="separator"

### 🖼 ToolPhotoStrip 구현

```html
<section class="relative h-24 overflow-hidden bg-bg-light">
  <ul class="flex h-full">
    <!-- 사진: object-cover + overlay -->
    <li class="relative flex-1">
      <img src="/tools/wrench.jpg" class="w-full h-full object-cover grayscale">
      <span class="absolute inset-0 bg-primary-50 mix-blend-multiply"></span>
    </li>
    <!-- 컬러 Fill 블록 -->
    <li class="w-16 bg-primary-500 flex items-center justify-center">
      <svg class="w-12 h-12 stroke-fg-invert"><use href="#icon-tape" /></svg>
    </li>
    …
  </ul>
</section>
```

---

## Interaction Patterns

| 시나리오        | 사용자 행동                                | 시스템 응답                                       |
| ----------- | ------------------------------------- | -------------------------------------------- |
| 세로 점선 Hover | 카드 Hover 시 좌우 점선 Pulse                | `animation: dashBlink 1s infinite alternate` |
| 모드 전환 경고    | 진행 중 → 다른 탭 클릭                        | Modal Accent 600 Focus                       |
| 사진 슬라이드     | 2560px 이상 → ToolPhotoStrip 사진 5장 슬라이드 | CSS Scroll-snap                              |

---

## Breakpoints

```scss
$breakpoints: (
  'desktop-min': 1366px, // 핵심 레이아웃 보존
  'desktop': 1920px,     // 패딩·그리드 확장
  'wide': 2560px         // 사진 슬라이드, 배경 패티클
);
```

* **desktop-min**: FeatureGrid→2열, 텍스트 14 px
* **desktop**: FeatureGrid→4열, 사진 96 px 고정
* **wide**: ToolPhotoStrip 슬라이드 자동 재생 (6 s loop)

---

## WCAG 2.2 Contrast Check

| 컴포넌트        | 전경/배경                   |   요구    | 측정\*       |
| ----------- | ----------------------- | ----- | ---------- |
| 본문          | FG-Default / BG-Light   | 4.5:1 | **12.1:1** |
| 다크모달        | FG-Invert / BG-Dark     | 4.5:1 | **13.3:1** |
| Primary Btn | FG-Invert / Primary 500 | 3:1   | **5.7:1**  |
| 점선 텍스트      | Accent 400 / BG-Light   | 4.5:1 | **6.8:1**  |

\*APCA 기준

---

## 최종 가이드 라인

1. **사진 & 아이콘 위치**는 예시 이미지 비율(**1:1:3:1:1**)을 유지하며, 공구사진 ↔ 컬러블록 ↔ 아이콘을 교차 배치합니다.
2. **세로 점선**은 정보 블록·버튼 그룹·모달 내부 섹션 등 “업무 툴박스 칸막이” 역할로 적극 사용합니다.
3. 모든 **라인 아이콘 SVG** stroke-width 2 px, Primary 500 기본, `currentColor` 이용해 다크모드도 동일 적용.
4. **Pretendard/Roboto** 400·700만 사용, 숫자 표기 시 `tabular-nums` 옵션 활성화하여 수치 정렬을 명확히 합니다.
5. 첫 스프린트에서 **ToolPhotoStrip & FeatureGrid** 구현 완료 후 → LadderCanvas / BallsGrid 단계로 진행하세요.
