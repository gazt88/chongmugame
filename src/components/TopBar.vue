<template>
  <header class="flex justify-between items-center h-14 bg-white px-4 border-b border-gray-200 shadow-sm">
    <!-- 타이틀 (중앙) -->
    <div class="flex-1 text-center">
      <h1 class="text-xl font-bold text-primary-500 flex items-center justify-center gap-2">
        <WrenchIcon class="w-6 h-6" />
        총무팀 커피내기
        <CoffeeIcon class="w-6 h-6 text-accent-400" />
      </h1>
    </div>
    
    <!-- 컨트롤 버튼들 -->
    <div class="flex items-center gap-2">
      <!-- 사운드 토글 -->
      <button
        @click="$emit('toggle-sound')"
        class="p-2 rounded hover:bg-accent-200 transition-colors"
        :title="soundEnabled ? '사운드 끄기' : '사운드 켜기'"
      >
        <SoundOnIcon v-if="soundEnabled" class="w-5 h-5 text-accent-400" />
        <SoundOffIcon v-else class="w-5 h-5 text-gray-400" />
      </button>
      
      <!-- 홈 버튼 -->
      <button
        v-if="currentView !== 'home'"
        @click="$emit('change-view', 'home')"
        class="p-2 rounded hover:bg-primary-300 hover:text-fg-invert transition-colors"
        title="홈으로"
      >
        <HomeIcon class="w-5 h-5 text-primary-500" />
      </button>
      
      <!-- 종료 버튼 -->
      <button
        @click="$emit('exit-game')"
        class="p-2 rounded hover:bg-red-500 hover:text-white transition-colors"
        title="게임 종료"
      >
        <ExitIcon class="w-5 h-5 text-red-500" />
      </button>
    </div>
  </header>
</template>

<script>
import { 
  WrenchIcon,
  CoffeeIcon,
  SoundOnIcon, 
  SoundOffIcon, 
  HomeIcon, 
  ExitIcon 
} from './icons/GameIcons.vue'

export default {
  name: 'TopBar',
  components: {
    WrenchIcon,
    CoffeeIcon,
    SoundOnIcon,
    SoundOffIcon,
    HomeIcon,
    ExitIcon
  },
  props: {
    currentView: {
      type: String,
      required: true
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change-view', 'toggle-sound', 'exit-game']
}
</script>

<style scoped>
/* 버튼 호버 효과 */
button:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* 반응형 */
@media (max-width: 768px) {
  h1 {
    font-size: 1.125rem;
  }
  
  .w-6 {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style> 