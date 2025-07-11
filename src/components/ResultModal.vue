<template>
  <div class="modal-overlay">
    <div class="modal-content max-w-lg">
      <div class="text-center">
        <!-- 결과 애니메이션 -->
        <div class="mb-6">
          <div v-if="result.loser" class="space-y-4">
            <!-- 패자 발표 -->
            <div class="animate-bounce">
              <div class="text-6xl mb-2">☕</div>
              <h2 class="text-3xl font-bold text-red-500 mb-2">커피사기!</h2>
              <p class="text-xl text-fg">
                <span class="font-bold text-accent-400">{{ result.loser }}</span>님이
              </p>
              <p class="text-lg text-gray-600">총무팀 커피를 사세요!</p>
            </div>
            
            <!-- 승자들 -->
            <div v-if="result.winners && result.winners.length > 0" class="mt-6">
              <h3 class="text-lg font-bold text-accent-400 mb-2">🎉 커피받기!</h3>
              <div class="flex flex-wrap justify-center gap-2">
                <span 
                  v-for="winner in result.winners" 
                  :key="winner"
                  class="px-3 py-1 bg-primary-500 text-fg-invert rounded-full text-sm"
                >
                  {{ winner }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 에러 케이스 -->
          <div v-else class="space-y-4">
            <div class="text-6xl mb-2">❓</div>
            <h2 class="text-2xl font-bold text-gray-600">결과 오류</h2>
            <p class="text-gray-600">게임 결과를 확인할 수 없습니다.</p>
          </div>
        </div>

        <!-- 게임 상세 정보 -->
        <div class="bg-white rounded-lg p-4 mb-6 text-left border border-gray-200">
          <h4 class="font-bold text-primary-500 mb-2">게임 정보</h4>
          <div class="space-y-1 text-sm text-gray-600">
            <div>모드: {{ result.gameMode === 'ladder' ? '🔧 총무팀 사다리' : '🔨 총무팀 핀볼' }}</div>
            <div>참가자: {{ result.totalParticipants }}명</div>
            <div>소요 시간: {{ formatDuration(result.duration) }}</div>
            <div v-if="result.timestamp">
              완료 시간: {{ formatTime(result.timestamp) }}
            </div>
          </div>
        </div>

        <!-- 버튼들 -->
        <div class="space-y-3">
          <button 
            @click="$emit('restart')"
            class="w-full py-3 text-lg font-bold bg-accent-400 text-fg-invert rounded hover:bg-accent-200 flex items-center justify-center gap-2 transition-all"
            ref="restartButton"
          >
            <RestartIcon class="w-5 h-5" />
            다시 시작
          </button>
          
          <button 
            @click="$emit('exit')"
            class="w-full py-2 bg-primary-500 text-fg-invert rounded hover:bg-primary-300 flex items-center justify-center gap-2 transition-all"
          >
            <ExitIcon class="w-4 h-4" />
            게임 종료
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { RestartIcon, ExitIcon } from './icons/GameIcons.vue'

export default {
  name: 'ResultModal',
  components: {
    RestartIcon,
    ExitIcon
  },
  props: {
    result: {
      type: Object,
      required: true,
      default: () => ({
        loser: '',
        winners: [],
        gameMode: 'ladder',
        totalParticipants: 0,
        duration: 0,
        timestamp: Date.now()
      })
    },
    soundEnabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['restart', 'exit'],
  setup(props, { emit }) {
    const restartButton = ref(null)

    // 시간 포맷팅
    const formatDuration = (ms) => {
      const seconds = Math.floor(ms / 1000)
      if (seconds < 60) {
        return `${seconds}초`
      } else {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}분 ${remainingSeconds}초`
      }
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 사운드 재생 (웹 오디오 API 사용)
    const playSound = (type) => {
      if (!props.soundEnabled) return

      // 간단한 비프음 생성
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (type === 'lose') {
        // 패자 사운드: 낮은 음 3번
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(185, audioContext.currentTime + 0.2)
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.4)
      } else {
        // 승리 사운드: 높은 음 2번
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.2)
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.6)
    }

    onMounted(() => {
      // 결과에 따른 사운드 재생
      if (props.result.loser) {
        playSound('lose')
      } else {
        playSound('win')
      }

      // 재시작 버튼에 포커스
      setTimeout(() => {
        restartButton.value?.focus()
      }, 1000)

      // ESC 키로 재시작
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          emit('restart')
        } else if (e.key === 'Enter') {
          emit('restart')
        }
      }
      
      document.addEventListener('keydown', handleKeydown)
      
      return () => {
        document.removeEventListener('keydown', handleKeydown)
      }
    })

    return {
      restartButton,
      formatDuration,
      formatTime
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #F6F8F7;
  border-radius: 0.5rem;
  padding: 2rem;
  margin: 1rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

/* 애니메이션 */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -20px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

/* 버튼 호버 효과 */
button:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 키보드 접근성 */
button:focus {
  outline: 2px solid #F28C28;
  outline-offset: 2px;
}
</style> 