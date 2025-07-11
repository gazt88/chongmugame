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
            @click="startLadderAnimation"
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

    <!-- 게임 진행 단계 - 사다리 애니메이션 -->
    <div v-else-if="gamePhase === 'playing'" class="flex-1 flex flex-col items-center justify-center p-8">
      <!-- 현재 진행 상태 -->
      <div class="text-center mb-6">
        <div class="bg-accent-400 text-fg-invert px-6 py-3 rounded-full font-bold text-lg inline-block">
          🪜 {{ currentAnimationStep.player }}님이 사다리를 타고 있습니다
        </div>
        <div class="text-sm text-gray-600 mt-2">
          {{ currentAnimationStep.step }}단계 / {{ ladderLevels }}단계
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mt-3 max-w-md mx-auto">
          <div class="bg-accent-400 h-3 rounded-full transition-all duration-300" 
               :style="{ width: `${(currentAnimationStep.step / ladderLevels) * 100}%` }"></div>
        </div>
      </div>

      <!-- 대기 중인 플레이어들 -->
      <div class="flex justify-center mb-6 gap-2 flex-wrap">
        <div
          v-for="(player, index) in orderedPlayers"
          :key="player"
          :class="[
            'px-3 py-2 rounded text-sm font-medium transition-all',
            index < currentPlayerIndex ? 'bg-green-500 text-white' :
            index === currentPlayerIndex ? 'bg-accent-400 text-fg-invert animate-pulse scale-110' :
            'bg-gray-300 text-gray-600'
          ]"
        >
          {{ playerOrder[player] }}번째: {{ player }}
          <span v-if="index < currentPlayerIndex" class="ml-1">✅</span>
          <span v-if="index === currentPlayerIndex" class="ml-1">🏃‍♂️</span>
        </div>
      </div>

      <!-- 사다리 캔버스 -->
      <div class="relative">
        <canvas
          ref="ladderCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
          class="border-4 border-primary-500 rounded-lg shadow-lg bg-white"
        />
        
        <!-- 플레이어 아바타들 (캔버스 위에 절대 위치) -->
        <div
          v-for="(player, index) in orderedPlayers"
          :key="`avatar-${player}`"
          v-show="index <= currentPlayerIndex"
          :class="[
            'absolute transition-all duration-500 ease-in-out',
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
            index === currentPlayerIndex ? 'bg-red-500 text-white animate-bounce z-20' : 'bg-green-500 text-white z-10'
          ]"
          :style="getPlayerAvatarStyle(index)"
        >
          {{ player.slice(0, 1) }}
        </div>
      </div>

      <!-- 진행 메시지 -->
      <div class="text-center mt-6">
        <div class="text-lg text-accent-400 font-bold">
          {{ getProgressMessage() }}
        </div>
        <div class="text-sm text-gray-600 mt-2">
          각 단계마다 연결선을 확인하며 내려갑니다
        </div>
      </div>
    </div>

    <!-- 게임 완료 단계 -->
    <div v-else-if="gamePhase === 'completed'" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <h3 class="text-3xl font-bold text-accent-400 mb-6">🎉 게임 완료!</h3>
        
        <!-- 최종 결과 시각화 -->
        <div class="bg-white rounded-lg p-6 mb-6 max-w-3xl mx-auto border border-gray-200 shadow-lg">
          <h4 class="text-xl font-bold text-red-500 mb-4">💸 커피사는 사람</h4>
          <div class="text-4xl font-bold text-red-500 mb-6 p-4 bg-red-50 rounded-lg">
            {{ finalResult.loser }}
          </div>
          
          <h4 class="text-xl font-bold text-green-600 mb-4">☕ 커피받는 사람들</h4>
          <div class="flex flex-wrap gap-3 justify-center">
            <div
              v-for="winner in finalResult.winners"
              :key="winner"
              class="px-4 py-2 bg-green-500 text-white rounded-full font-medium"
            >
              ✅ {{ winner }}
            </div>
          </div>
          
          <!-- 최종 순서 -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 class="font-bold mb-3">📋 최종 순서</h5>
            <div class="flex flex-wrap gap-2 justify-center">
              <div
                v-for="(player, position) in finalResult.finalOrder"
                :key="`final-${position}`"
                :class="[
                  'px-3 py-2 rounded font-medium',
                  position === finalResult.finalOrder.length - 1 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                ]"
              >
                {{ position + 1 }}위: {{ player }}
              </div>
            </div>
          </div>
        </div>

        <!-- 게임 통계 -->
        <div class="bg-white rounded-lg p-4 mb-6 max-w-md mx-auto border border-gray-200 shadow-sm">
          <div class="text-sm text-gray-600 space-y-1">
            <div>총 게임 시간: {{ formatTime(elapsedTime) }}</div>
            <div>참가자 수: {{ gameState.participants.length }}명</div>
            <div>사다리 단계: {{ ladderLevels }}단계</div>
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
    
    // 애니메이션 관련 상태
    const currentPlayerIndex = ref(0)
    const currentAnimationStep = ref({ player: '', step: 0 })
    const ladderStructure = ref([])
    const ladderLevels = ref(8)
    const playerPaths = ref({}) // 각 플레이어의 최종 경로
    const playerPositions = ref({}) // 각 플레이어의 현재 위치
    
    // 캔버스 관련
    const ladderCanvas = ref(null)
    const canvasWidth = ref(800)
    const canvasHeight = ref(600)
    const canvasConfig = ref({
      padding: 60,
      playerSpacing: 0,
      levelSpacing: 0
    })
    
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
      if (playerOrder.value[player]) return
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
      const structure = []
      
      // 각 레벨마다 연결선 생성
      for (let level = 0; level < ladderLevels.value; level++) {
        const connections = []
        let lastConnection = -2 // 연속된 연결선 방지
        
        for (let i = 0; i < playerCount - 1; i++) {
          // 연속된 연결선이 아니고, 35% 확률로 연결선 생성
          if (i > lastConnection + 1 && Math.random() < 0.35) {
            connections.push(i)
            lastConnection = i
          }
        }
        structure.push(connections)
      }
      
      return structure
    }
    
    const drawStaticLadder = () => {
      const canvas = ladderCanvas.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const playerCount = orderedPlayers.value.length
      
      // 캔버스 클리어
      ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
      
      // 설정값 계산
      canvasConfig.value.playerSpacing = (canvasWidth.value - 2 * canvasConfig.value.padding) / (playerCount - 1)
      canvasConfig.value.levelSpacing = (canvasHeight.value - 2 * canvasConfig.value.padding) / (ladderLevels.value + 1)
      
      // 세로선 그리기 (각 플레이어 경로)
      ctx.strokeStyle = '#2C473F'
      ctx.lineWidth = 4
      
      for (let i = 0; i < playerCount; i++) {
        const x = canvasConfig.value.padding + i * canvasConfig.value.playerSpacing
        ctx.beginPath()
        ctx.moveTo(x, canvasConfig.value.padding)
        ctx.lineTo(x, canvasHeight.value - canvasConfig.value.padding)
        ctx.stroke()
      }
      
      // 가로선 그리기 (연결선)
      ctx.strokeStyle = '#F28C28'
      ctx.lineWidth = 3
      
      ladderStructure.value.forEach((connections, level) => {
        const y = canvasConfig.value.padding + (level + 1) * canvasConfig.value.levelSpacing
        
        connections.forEach(connection => {
          const x1 = canvasConfig.value.padding + connection * canvasConfig.value.playerSpacing
          const x2 = canvasConfig.value.padding + (connection + 1) * canvasConfig.value.playerSpacing
          
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(x2, y)
          ctx.stroke()
          
          // 연결점에 작은 원 그리기
          ctx.fillStyle = '#F28C28'
          ctx.beginPath()
          ctx.arc(x1, y, 4, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x2, y, 4, 0, 2 * Math.PI)
          ctx.fill()
        })
      })
      
      // 플레이어 이름 표시 (상단)
      ctx.fillStyle = '#2C473F'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      
      orderedPlayers.value.forEach((player, index) => {
        const x = canvasConfig.value.padding + index * canvasConfig.value.playerSpacing
        ctx.fillText(player, x, canvasConfig.value.padding - 20)
      })
      
      // 결과 위치 표시 (하단)
      ctx.fillStyle = '#666'
      ctx.font = 'bold 14px Arial'
      
      for (let i = 0; i < playerCount; i++) {
        const x = canvasConfig.value.padding + i * canvasConfig.value.playerSpacing
        const position = i === playerCount - 1 ? '💸 커피사기' : `${i + 1}위`
        ctx.fillText(position, x, canvasHeight.value - canvasConfig.value.padding + 35)
      }
    }
    
    const calculatePlayerPath = (playerIndex) => {
      let currentPosition = playerIndex
      const path = [{ level: 0, position: currentPosition }]
      
      // 각 레벨을 순차적으로 내려가면서 경로 계산
      ladderStructure.value.forEach((connections, level) => {
        connections.forEach(connection => {
          if (currentPosition === connection) {
            currentPosition = connection + 1
          } else if (currentPosition === connection + 1) {
            currentPosition = connection
          }
        })
        path.push({ level: level + 1, position: currentPosition })
      })
      
      return path
    }
    
    const getPlayerAvatarStyle = (playerIndex) => {
      if (!playerPositions.value[playerIndex]) {
        return { display: 'none' }
      }
      
      const pos = playerPositions.value[playerIndex]
      const x = canvasConfig.value.padding + pos.position * canvasConfig.value.playerSpacing - 16
      const y = canvasConfig.value.padding + pos.level * canvasConfig.value.levelSpacing - 16
      
      return {
        left: `${x}px`,
        top: `${y}px`
      }
    }
    
    const getProgressMessage = () => {
      const step = currentAnimationStep.value.step
      const total = ladderLevels.value
      
      if (step === 0) return "시작 위치에서 대기 중..."
      if (step === total) return "도착! 결과를 확인하세요."
      return `${step}단계를 통과하여 내려가는 중...`
    }
    
    const startLadderAnimation = () => {
      if (!canStartGame.value) return
      
      gamePhase.value = 'playing'
      currentPlayerIndex.value = 0
      ladderStructure.value = generateLadder()
      
      // 모든 플레이어의 경로 미리 계산
      orderedPlayers.value.forEach((player, index) => {
        playerPaths.value[index] = calculatePlayerPath(index)
      })
      
      // 초기 위치 설정
      orderedPlayers.value.forEach((player, index) => {
        playerPositions.value[index] = { level: 0, position: index }
      })
      
      startTimer()
      drawStaticLadder()
      
      // 첫 번째 플레이어부터 애니메이션 시작
      setTimeout(() => {
        animateNextPlayer()
      }, 1000)
    }
    
    const animateNextPlayer = () => {
      if (currentPlayerIndex.value >= orderedPlayers.value.length) {
        // 모든 플레이어 완료
        setTimeout(() => {
          finishGame()
        }, 2000)
        return
      }
      
      const player = orderedPlayers.value[currentPlayerIndex.value]
      const path = playerPaths.value[currentPlayerIndex.value]
      
      currentAnimationStep.value = {
        player: player,
        step: 0
      }
      
      // 현재 플레이어의 경로를 단계별로 애니메이션
      animatePlayerPath(currentPlayerIndex.value, path, 0)
    }
    
    const animatePlayerPath = (playerIndex, path, stepIndex) => {
      if (stepIndex >= path.length) {
        // 현재 플레이어 애니메이션 완료, 다음 플레이어로
        currentPlayerIndex.value++
        setTimeout(() => {
          animateNextPlayer()
        }, 800)
        return
      }
      
      const step = path[stepIndex]
      playerPositions.value[playerIndex] = step
      currentAnimationStep.value.step = stepIndex
      
      // 다음 단계로 이동 (각 단계마다 600ms 지연)
      setTimeout(() => {
        animatePlayerPath(playerIndex, path, stepIndex + 1)
      }, 600)
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
      
      // 최종 결과 계산
      const finalOrder = []
      
      orderedPlayers.value.forEach((player, index) => {
        const path = playerPaths.value[index]
        const finalPosition = path[path.length - 1].position
        finalOrder[finalPosition] = player
      })
      
      // 결과 설정
      const loser = finalOrder[finalOrder.length - 1]
      const winners = finalOrder.slice(0, -1).filter(p => p)
      
      finalResult.value = {
        loser,
        winners,
        finalOrder,
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
      currentPlayerIndex.value = 0
      currentAnimationStep.value = { player: '', step: 0 }
      ladderStructure.value = []
      playerPaths.value = {}
      playerPositions.value = {}
      stopTimer()
    }
    
    // 생명주기
    onMounted(() => {
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
      currentPlayerIndex,
      currentAnimationStep,
      ladderLevels,
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
      startLadderAnimation,
      restartGame,
      getPlayerAvatarStyle,
      getProgressMessage
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
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

/* 버튼 호버 효과 */
button:hover:not(:disabled) {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 플레이어 아바타 애니메이션 */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -15px, 0);
  }
  70% {
    transform: translate3d(0, -7px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}
</style> 