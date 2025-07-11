<template>
  <div class="flex-1 flex flex-col bg-bg-light">
    <!-- ToolPhotoStrip -->
    <ToolPhotoStrip />

    <!-- 게임 상단 정보 -->
    <div class="bg-white border-b border-gray-200 p-4 shadow-sm">
      <div class="container mx-auto flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-primary-500 flex items-center gap-2">
            <WrenchIcon class="w-6 h-6" />
            총무팀 커피내기 사다리
          </h2>
          <p class="text-fg">참가자: {{ gameState.participants.join(', ') }}</p>
        </div>
        
        <div class="text-right">
          <div class="text-sm text-gray-600">
            {{ getCurrentPhaseText() }}
          </div>
          <div class="text-lg font-bold text-accent-400">{{ formatTime(elapsedTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 순서 선택 단계 -->
    <div v-if="gamePhase === 'order-selection'" class="flex-1 flex flex-col items-center justify-center p-8">
      <div class="text-center mb-8">
        <h3 class="text-2xl font-bold text-accent-400 mb-4">🎯 떨어질 순서를 선택하세요!</h3>
        <p class="text-fg mb-6">
          각자 자신이 떨어질 순서를 클릭하여 선택해주세요.
        </p>
        
        <!-- 순서 선택 상태 표시 -->
        <div class="bg-white rounded-lg p-4 mb-6 max-w-2xl mx-auto border border-gray-200 shadow-sm">
          <div class="text-sm text-gray-600 mb-2">선택 현황:</div>
          <div class="flex flex-wrap gap-2 justify-center">
            <div
              v-for="(participant, index) in gameState.participants"
              :key="participant"
              :class="[
                'px-3 py-1 rounded-full text-sm',
                playerOrder[participant] 
                  ? 'bg-accent-400 text-fg-invert' 
                  : 'bg-gray-200 text-gray-600'
              ]"
            >
              {{ participant }}
              <span v-if="playerOrder[participant]" class="ml-1">
                ({{ playerOrder[participant] }}번째)
              </span>
            </div>
          </div>
        </div>
        
        <!-- 순서 선택 버튼들 -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          <div
            v-for="order in gameState.participants.length"
            :key="order"
            class="p-4 rounded-lg border-2 border-gray-300 bg-white shadow-sm"
          >
            <div class="text-center mb-3">
              <div class="text-3xl mb-2">{{ order === 1 ? '🥇' : order === 2 ? '🥈' : order === 3 ? '🥉' : '🎯' }}</div>
              <div class="font-bold text-accent-400 mb-1">{{ order }}번째</div>
            </div>
            
            <!-- 선택된 플레이어 또는 선택 버튼들 -->
            <div v-if="getPlayerByOrder(order)" class="text-center">
              <div class="text-sm font-medium text-green-600 mb-1">{{ getPlayerByOrder(order) }}</div>
              <button
                @click="removePlayerFromOrder(order)"
                class="text-xs text-red-500 hover:text-red-700"
              >
                선택 취소
              </button>
            </div>
            
            <div v-else class="space-y-1">
              <button
                v-for="participant in availableParticipants"
                :key="participant"
                @click="selectOrder(order, participant)"
                class="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-accent-200 rounded transition-colors"
              >
                {{ participant }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 게임 시작 버튼 -->
        <div class="mt-8">
          <button
            v-if="canStartGame"
            @click="startSequentialGame"
            class="px-8 py-4 text-lg font-bold bg-accent-400 text-fg-invert rounded hover:bg-accent-200 flex items-center gap-3 mx-auto transition-all"
          >
            <PlayIcon class="w-6 h-6" />
            🪜 사다리 게임 시작!
          </button>
          <p v-else class="text-gray-600 mt-4">
            모든 참가자가 순서를 선택해야 게임을 시작할 수 있습니다. ({{ Object.keys(playerOrder).length }}/{{ gameState.participants.length }})
          </p>
        </div>
      </div>
    </div>

    <!-- 게임 진행 단계 -->
    <div v-else-if="gamePhase === 'playing'" class="flex-1 flex items-center justify-center p-8">
      <div class="relative">
        <!-- 게임 진행 정보 -->
        <div class="text-center mb-6">
          <div class="bg-accent-400 text-fg-invert px-6 py-3 rounded-full font-bold text-lg inline-block animate-pulse">
            🎯 사다리를 타고 내려가는 중...
          </div>
          <div class="text-sm text-gray-600 mt-2">
            {{ gameProgress }}% 완료
          </div>
        </div>
        
        <!-- 순서 표시 -->
        <div class="flex justify-center mb-4 gap-2 flex-wrap">
          <div
            v-for="(player, index) in orderedPlayers"
            :key="player"
            :class="[
              'px-3 py-2 rounded text-sm font-medium transition-all',
              index < currentPlayerIndex ? 'bg-green-500 text-white' :
              index === currentPlayerIndex ? 'bg-accent-400 text-fg-invert animate-bounce' :
              'bg-gray-300 text-gray-600'
            ]"
          >
            {{ playerOrder[player] }}번째: {{ player }}
          </div>
        </div>

        <!-- 캔버스 -->
        <canvas
          ref="ladderCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
          class="game-canvas border-4 border-primary-500 rounded-lg mb-4 shadow-lg"
        />

        <!-- 진행 상태 -->
        <div class="text-center">
          <div class="text-lg text-accent-400 font-bold">
            🪜 {{ orderedPlayers[currentPlayerIndex] || '...' }}님이 사다리를 타고 있습니다
          </div>
          <div class="text-sm text-gray-600 mt-2">
            잠시 후 결과가 나타납니다
          </div>
        </div>
      </div>
    </div>

    <!-- 게임 완료 단계 -->
    <div v-else-if="gamePhase === 'completed'" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <h3 class="text-3xl font-bold text-accent-400 mb-6">🎉 게임 완료!</h3>
        
        <!-- 최종 결과 -->
        <div class="bg-white rounded-lg p-6 mb-6 max-w-2xl mx-auto border border-gray-200 shadow-sm">
          <h4 class="text-xl font-bold text-red-500 mb-4">💸 커피사는 사람</h4>
          <div class="text-3xl font-bold text-red-500 mb-4">{{ finalResult.loser }}</div>
          
          <h4 class="text-xl font-bold text-green-600 mb-4">☕ 커피받는 사람들</h4>
          <div class="flex flex-wrap gap-2 justify-center">
            <div
              v-for="winner in finalResult.winners"
              :key="winner"
              class="px-4 py-2 bg-green-500 text-white rounded-full"
            >
              {{ winner }}
            </div>
          </div>
        </div>

        <!-- 게임 통계 -->
        <div class="bg-white rounded-lg p-4 mb-6 max-w-md mx-auto border border-gray-200 shadow-sm">
          <div class="text-sm text-gray-600 space-y-1">
            <div>총 게임 시간: {{ formatTime(elapsedTime) }}</div>
            <div>참가자 수: {{ gameState.participants.length }}명</div>
            <div>게임 방식: 순서 선택 사다리</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 컨트롤 (세로 점선으로 구분) -->
    <div class="bg-white border-t-2 border-dashed border-accent-400 p-4">
      <div class="container mx-auto flex justify-center gap-4">
        <button
          v-if="gamePhase === 'completed'"
          @click="restartGame"
          class="px-6 py-2 bg-accent-400 text-fg-invert rounded hover:bg-accent-200 flex items-center gap-2 transition-all"
        >
          <RestartIcon class="w-4 h-4" />
          다시 시작
        </button>
        
        <button
          v-if="gamePhase === 'order-selection'"
          @click="resetOrderSelection"
          class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-400 flex items-center gap-2 transition-all"
        >
          <RestartIcon class="w-4 h-4" />
          순서 초기화
        </button>
        
        <button
          @click="$emit('back-to-home')"
          class="px-6 py-2 bg-primary-500 text-fg-invert rounded hover:bg-primary-300 flex items-center gap-2 transition-all"
        >
          <HomeIcon class="w-4 h-4" />
          홈으로
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ToolPhotoStrip from '../components/ToolPhotoStrip.vue'
import { 
  WrenchIcon,
  PlayIcon,
  RestartIcon,
  HomeIcon
} from '../components/icons/GameIcons.vue'

export default {
  name: 'LadderView',
  components: {
    ToolPhotoStrip,
    WrenchIcon,
    PlayIcon,
    RestartIcon,
    HomeIcon
  },
  props: {
    gameState: {
      type: Object,
      required: true
    }
  },
  emits: ['game-complete', 'back-to-home'],
  setup(props, { emit }) {
    // 게임 상태
    const gamePhase = ref('order-selection') // 'order-selection', 'playing', 'completed'
    const playerOrder = ref({}) // 플레이어별 순서
    const elapsedTime = ref(0)
    const gameTimer = ref(null)
    const finalResult = ref(null)
    
    // 게임 진행 상태
    const gameProgress = ref(0)
    const currentPlayerIndex = ref(0)
    const ladderStructure = ref([])
    
    // 캔버스 관련
    const ladderCanvas = ref(null)
    const canvasWidth = ref(800)
    const canvasHeight = ref(600)
    
    // 계산된 속성들
    const canStartGame = computed(() => {
      return Object.keys(playerOrder.value).length === props.gameState.participants.length
    })
    
    const orderedPlayers = computed(() => {
      const ordered = []
      for (let i = 1; i <= props.gameState.participants.length; i++) {
        const player = Object.keys(playerOrder.value).find(p => playerOrder.value[p] === i)
        if (player) ordered.push(player)
      }
      return ordered
    })
    
    const availableParticipants = computed(() => {
      return props.gameState.participants.filter(p => !playerOrder.value[p])
    })
    
    // 메서드들
    const getCurrentPhaseText = () => {
      switch (gamePhase.value) {
        case 'order-selection':
          return '순서 선택 단계'
        case 'playing':
          return '게임 진행 중'
        case 'completed':
          return '게임 완료'
        default:
          return ''
      }
    }
    
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    
    const selectOrder = (order, player) => {
      if (playerOrder.value[player]) return // 이미 선택된 플레이어라면 무시
      playerOrder.value[player] = order
    }

    const removePlayerFromOrder = (order) => {
      const playerToRemove = Object.keys(playerOrder.value).find(p => playerOrder.value[p] === order)
      if (playerToRemove) {
        delete playerOrder.value[playerToRemove]
      }
    }
    
    const getPlayerByOrder = (order) => {
      return Object.keys(playerOrder.value).find(p => playerOrder.value[p] === order) || ''
    }
    
    const resetOrderSelection = () => {
      playerOrder.value = {}
    }
    
    const generateLadder = () => {
      const playerCount = props.gameState.participants.length
      const ladderHeight = 8 // 사다리 단계 수
      const structure = []
      
      // 각 단계마다 연결선 생성 (랜덤)
      for (let level = 0; level < ladderHeight; level++) {
        const connections = []
        for (let i = 0; i < playerCount - 1; i++) {
          // 30% 확률로 연결선 생성
          if (Math.random() < 0.3) {
            connections.push(i)
          }
        }
        structure.push(connections)
      }
      
      return structure
    }
    
    const drawLadder = () => {
      const canvas = ladderCanvas.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const playerCount = props.gameState.participants.length
      const ladderHeight = ladderStructure.value.length
      
      // 캔버스 클리어
      ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
      
      // 설정값
      const padding = 50
      const playerSpacing = (canvasWidth.value - 2 * padding) / (playerCount - 1)
      const levelSpacing = (canvasHeight.value - 2 * padding) / ladderHeight
      
      // 세로선 그리기 (각 플레이어 경로)
      ctx.strokeStyle = '#2C473F'
      ctx.lineWidth = 3
      
      for (let i = 0; i < playerCount; i++) {
        const x = padding + i * playerSpacing
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, canvasHeight.value - padding)
        ctx.stroke()
      }
      
      // 가로선 그리기 (연결선)
      ctx.strokeStyle = '#F28C28'
      ctx.lineWidth = 2
      
      ladderStructure.value.forEach((connections, level) => {
        const y = padding + (level + 1) * levelSpacing
        
        connections.forEach(connection => {
          const x1 = padding + connection * playerSpacing
          const x2 = padding + (connection + 1) * playerSpacing
          
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(x2, y)
          ctx.stroke()
        })
      })
      
      // 플레이어 이름 표시
      ctx.fillStyle = '#2C473F'
      ctx.font = '14px bold'
      ctx.textAlign = 'center'
      
      orderedPlayers.value.forEach((player, index) => {
        const x = padding + index * playerSpacing
        ctx.fillText(player, x, padding - 10)
      })
    }
    
    const simulateLadderGame = () => {
      const playerCount = props.gameState.participants.length
      const finalPositions = []
      
      // 각 플레이어의 최종 위치 계산
      for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
        let currentPosition = playerIndex
        
        // 사다리를 따라 내려가면서 위치 추적
        ladderStructure.value.forEach(connections => {
          connections.forEach(connection => {
            if (currentPosition === connection) {
              currentPosition = connection + 1
            } else if (currentPosition === connection + 1) {
              currentPosition = connection
            }
          })
        })
        
        finalPositions[currentPosition] = orderedPlayers.value[playerIndex]
      }
      
      return finalPositions
    }
    
    const startSequentialGame = () => {
      if (!canStartGame.value) return
      
      gamePhase.value = 'playing'
      gameProgress.value = 0
      currentPlayerIndex.value = 0
      
      // 사다리 구조 생성
      ladderStructure.value = generateLadder()
      
      startTimer()
      
      // 게임 진행 애니메이션
      const gameInterval = setInterval(() => {
        gameProgress.value += 10
        
        if (gameProgress.value % 20 === 0 && currentPlayerIndex.value < orderedPlayers.value.length - 1) {
          currentPlayerIndex.value++
        }
        
        if (gameProgress.value >= 100) {
          clearInterval(gameInterval)
          setTimeout(() => {
            finishGame()
          }, 1000)
        }
      }, 200)
      
      // 캔버스에 사다리 그리기
      setTimeout(() => {
        drawLadder()
      }, 100)
    }
    
    const startTimer = () => {
      gameTimer.value = setInterval(() => {
        elapsedTime.value++
      }, 1000)
    }
    
    const stopTimer = () => {
      if (gameTimer.value) {
        clearInterval(gameTimer.value)
        gameTimer.value = null
      }
    }
    
    const finishGame = () => {
      gamePhase.value = 'completed'
      stopTimer()
      
      // 실제 사다리 게임 결과 계산
      const finalPositions = simulateLadderGame()
      
      // 마지막 위치(가장 아래)가 패자
      const loser = finalPositions[finalPositions.length - 1]
      const winners = finalPositions.slice(0, -1).filter(p => p)
      
      finalResult.value = {
        loser,
        winners,
        gameTime: elapsedTime.value,
        gameMode: 'ladder',
        totalParticipants: props.gameState.participants.length,
        timestamp: Date.now()
      }
      
      emit('game-complete', finalResult.value)
    }
    
    const restartGame = () => {
      gamePhase.value = 'order-selection'
      playerOrder.value = {}
      elapsedTime.value = 0
      finalResult.value = null
      gameProgress.value = 0
      currentPlayerIndex.value = 0
      ladderStructure.value = []
      stopTimer()
    }
    
    // 생명주기
    onMounted(() => {
      // 캔버스 크기 조정
      const updateCanvasSize = () => {
        const container = ladderCanvas.value?.parentElement
        if (container) {
          const rect = container.getBoundingClientRect()
          canvasWidth.value = Math.min(800, rect.width - 40)
          canvasHeight.value = Math.min(600, canvasWidth.value * 0.75)
        }
      }
      
      updateCanvasSize()
      window.addEventListener('resize', updateCanvasSize)
    })
    
    onUnmounted(() => {
      stopTimer()
      window.removeEventListener('resize', updateCanvasSize)
    })
    
    return {
      gamePhase,
      playerOrder,
      elapsedTime,
      finalResult,
      gameProgress,
      currentPlayerIndex,
      ladderCanvas,
      canvasWidth,
      canvasHeight,
      canStartGame,
      orderedPlayers,
      availableParticipants,
      getCurrentPhaseText,
      formatTime,
      selectOrder,
      removePlayerFromOrder,
      getPlayerByOrder,
      resetOrderSelection,
      startSequentialGame,
      restartGame
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.game-canvas {
  background: white;
  display: block;
  margin: 0 auto;
}

/* 버튼 호버 효과 */
button:hover:not(:disabled) {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 반응형 */
@media (max-width: 768px) {
  .game-canvas {
    max-width: 100%;
    height: auto;
  }
}

/* 세로 점선 애니메이션 */
.border-dashed {
  animation: dashBlink 2s infinite alternate;
}

@keyframes dashBlink {
  0% { 
    border-color: #F28C28;
    opacity: 1;
  }
  100% { 
    border-color: #F28C28;
    opacity: 0.6;
  }
}
</style> 