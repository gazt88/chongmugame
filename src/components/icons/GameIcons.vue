<template>
  <!-- 이 파일은 아이콘 컴포넌트들을 정의합니다 -->
</template>

<script>
// 공구 테마 아이콘들
export const DrillIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 12h6l2-2h4l2 2h4"/>
      <circle cx="7" cy="12" r="2"/>
      <path d="M13 8l2-2h4l2 2"/>
      <path d="M13 16l2 2h4l-2-2"/>
    </svg>
  `
}

export const HammerIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/>
      <path d="M16 8L8 16"/>
      <path d="M15 7l4-4 3 3-4 4"/>
    </svg>
  `
}

export const RulerIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 3v18h18V3H3z"/>
      <path d="M7 3v4M11 3v2M15 3v4M19 3v2"/>
      <path d="M3 7h4M3 11h2M3 15h4M3 19h2"/>
    </svg>
  `
}

export const ScrewdriverIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 7l-4 4-4-4 4-4 4 4z"/>
      <path d="M10 11l-6 6h4l6-6"/>
      <path d="M14 3l4 4"/>
    </svg>
  `
}

export const WrenchIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  `
}

export const ToolboxIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
      <rect x="2" y="8" width="20" height="12" rx="2"/>
      <path d="M10 12h4"/>
      <path d="M6 12h2"/>
      <path d="M16 12h2"/>
    </svg>
  `
}

// 기존 아이콘들을 공구 테마로 변경
export const LadderIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 3v18M18 3v18M6 7h12M6 11h12M6 15h12"/>
      <circle cx="6" cy="3" r="1" fill="currentColor"/>
      <circle cx="18" cy="3" r="1" fill="currentColor"/>
    </svg>
  `
}

export const BallIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="8"/>
      <path d="M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8" fill="none" stroke="currentColor" stroke-width="1"/>
      <circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
  `
}

export const SoundOnIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  `
}

export const SoundOffIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <path d="M23 9l-6 6M17 9l6 6"/>
    </svg>
  `
}

export const HomeIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
      <path d="M12 2l-2 2h4l-2-2"/>
    </svg>
  `
}

export const ExitIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  `
}

export const AddIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
      <circle cx="12" cy="12" r="10" fill="none"/>
    </svg>
  `
}

export const RemoveIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <circle cx="12" cy="12" r="10" fill="none"/>
    </svg>
  `
}

export const PlayIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
}

export const RestartIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 4v6h6"/>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  `
}

// 커피 관련 아이콘들
export const CoffeeIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  `
}

export const CoffeeBeansIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="8" cy="10" rx="3" ry="5" transform="rotate(-20 8 10)"/>
      <ellipse cx="16" cy="14" rx="3" ry="5" transform="rotate(20 16 14)"/>
      <path d="M8 10c0-1 .5-2 1-2s1 1 1 2-.5 2-1 2-1-1-1-2z" fill="none" stroke="currentColor" stroke-width="1"/>
      <path d="M16 14c0-1 .5-2 1-2s1 1 1 2-.5 2-1 2-1-1-1-2z" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>
  `
}
</script> 