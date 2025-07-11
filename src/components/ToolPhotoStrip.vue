<template>
  <section class="relative h-24 overflow-hidden bg-bg-light">
    <ul class="flex h-full">
      <!-- 공구 사진 1 -->
      <li class="relative flex-1">
        <img 
          src="/images/tools/wrench.jpg" 
          alt="렌치 도구"
          class="w-full h-full object-cover grayscale"
          @error="handleImageError"
        />
        <span class="absolute inset-0 bg-primary-50 mix-blend-multiply"></span>
      </li>
      
      <!-- 컬러 블록 1 -->
      <li class="w-16 bg-primary-500 flex items-center justify-center">
        <svg class="w-12 h-12 stroke-fg-invert" stroke-width="2" fill="none" viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </li>
      
      <!-- 공구 사진 2 -->
      <li class="relative flex-1">
        <img 
          src="/images/tools/hammer.jpg" 
          alt="해머 도구"
          class="w-full h-full object-cover grayscale"
          @error="handleImageError"
        />
        <span class="absolute inset-0 bg-primary-50 mix-blend-multiply"></span>
      </li>
      
      <!-- 컬러 블록 2 -->
      <li class="w-16 bg-accent-400 flex items-center justify-center">
        <svg class="w-12 h-12 stroke-fg-invert" stroke-width="2" fill="none" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </li>
      
      <!-- 공구 사진 3 -->
      <li class="relative flex-1">
        <img 
          src="/images/tools/screwdriver.jpg" 
          alt="스크류드라이버 도구"
          class="w-full h-full object-cover grayscale"
          @error="handleImageError"
        />
        <span class="absolute inset-0 bg-primary-50 mix-blend-multiply"></span>
      </li>
      
      <!-- 컬러 블록 3 -->
      <li class="w-16 bg-primary-500 flex items-center justify-center">
        <svg class="w-12 h-12 stroke-fg-invert" stroke-width="2" fill="none" viewBox="0 0 24 24">
          <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
        </svg>
      </li>
      
      <!-- 공구 사진 4 -->
      <li class="relative flex-1">
        <img 
          src="/images/tools/ruler.jpg" 
          alt="자 도구"
          class="w-full h-full object-cover grayscale"
          @error="handleImageError"
        />
        <span class="absolute inset-0 bg-primary-50 mix-blend-multiply"></span>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  name: 'ToolPhotoStrip',
  methods: {
    handleImageError(event) {
      // 이미지 로드 실패 시 기본 색상 배경으로 대체
      event.target.style.display = 'none'
      event.target.parentElement.style.backgroundColor = '#486B63'
    }
  }
}
</script>

<style scoped>
/* 미디어쿼리: 큰 화면에서 사진 슬라이드 효과 */
@media (min-width: 2560px) {
  .flex {
    animation: slidePhotos 6s infinite linear;
  }
  
  @keyframes slidePhotos {
    0% { transform: translateX(0); }
    100% { transform: translateX(-20%); }
  }
}

/* 호버 효과 */
li:hover .bg-primary-50 {
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

/* 컬러 블록 호버 효과 */
.bg-primary-500:hover,
.bg-accent-400:hover {
  filter: brightness(1.1);
  transition: filter 0.3s ease;
}
</style> 