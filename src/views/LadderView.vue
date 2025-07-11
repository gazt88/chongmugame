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

    <!-- 당첨 내용 설정 단계 -->
    <div v-if="gamePhase === 'setup'" class="flex-1 flex flex-col items-center justify-center p-8">
      <div class="text-center mb-8 max-w-4xl mx-auto">
        <h3 class="text-2xl font-bold text-accent-400 mb-4">🎁 당첨 내용을 설정하세요!</h3>
        <p class="text-fg mb-6">
          참가자 수에 맞게 당첨 내용을 입력해주세요. ({{ gameState.participants.length }}개 필요)
        </p>
        
        <!-- 참가자와 당첨 내용 매칭 -->
        <div class="grid md:grid-cols-2 gap-8">
          <!-- 참가자 목록 -->
          <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 class="text-lg font-bold text-primary-500 mb-4">👥 참가자들</h4>
            <div class="space-y-2">
              <div
                v-for="(participant, index) in gameState.participants"
                :key="participant"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <div class="font-medium">{{ participant }}</div>
              </div>
            </div>
          </div>
          
          <!-- 당첨 내용 입력 -->
          <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 class="text-lg font-bold text-accent-400 mb-4">🎁 당첨 내용</h4>
            <div class="space-y-3">
              <div
                v-for="index in gameState.participants.length"
                :key="`prize-${index}`"
                class="flex items-center gap-3"
              >
                <div class="w-8 h-8 bg-accent-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {{ index }}
                </div>
                <input
                  v-model="prizes[index - 1]"
                  type="text"
                  :placeholder="index === gameState.participants.length ? '커피사기 💸' : `${index}등 상품`"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-transparent"
                />
              </div>
            </div>
            
            <!-- 기본값 설정 버튼 -->
            <div class="mt-4 flex gap-2">
              <button
                @click="setDefaultPrizes"
                class="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-400 transition-colors"
              >
                기본값 설정
              </button>
              <button
                @click="shufflePrizes"
                class="px-4 py-2 text-sm bg-accent-400 text-white rounded hover:bg-accent-200 transition-colors"
              >
                🎲 섞기
              </button>
            </div>
          </div>
        </div>
        
        <!-- 게임 시작 버튼 -->
        <div class="mt-8">
          <button
            v-if="canStartGame"
            @click="startLadderGame"
            class="px-8 py-4 text-lg font-bold bg-accent-400 text-fg-invert rounded hover:bg-accent-200 flex items-center gap-3 mx-auto transition-all"
          >
            <PlayIcon class="w-6 h-6" />
            🪜 사다리게임 시작!
          </button>
          <p v-else class="text-gray-600 mt-4">
            모든 당첨 내용을 입력해주세요. ({{ filledPrizes }}/{{ gameState.participants.length }})
          </p>
        </div>
      </div>
    </div>

    <!-- 사다리게임 진행 단계 -->
    <div v-else-if="gamePhase === 'playing'" class="flex-1 flex flex-col items-center p-6">
      <!-- 진행 상황 -->
      <div class="text-center mb-6">
        <div v-if="currentAnimatingPlayer" class="bg-accent-400 text-fg-invert px-6 py-3 rounded-full font-bold text-lg inline-block">
          🪜 {{ currentAnimatingPlayer }}님이 사다리를 타고 있습니다
        </div>
        <div v-else class="bg-primary-500 text-fg-invert px-6 py-3 rounded-full font-bold text-lg inline-block">
          🎯 GO 버튼을 눌러서 사다리를 타보세요!
        </div>
      </div>

      <!-- 참가자 GO 버튼들 -->
      <div class="flex flex-wrap justify-center gap-4 mb-8">
        <div
          v-for="(participant, index) in gameState.participants"
          :key="participant"
          class="text-center"
        >
          <div class="mb-2 font-bold text-primary-500">{{ participant }}</div>
          <button
            v-if="!playerResults[participant]"
            @click="animatePlayerPath(participant, index)"
            :disabled="!!currentAnimatingPlayer"
            :class="[
              'px-6 py-3 rounded-lg font-bold transition-all',
              currentAnimatingPlayer 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-accent-400 text-fg-invert hover:bg-accent-200 hover:scale-105'
            ]"
          >
            {{ currentAnimatingPlayer === participant ? '진행중...' : 'GO!' }}
          </button>
          <div
            v-else
            class="px-6 py-3 rounded-lg font-bold bg-green-500 text-white"
          >
            완료 ✅
          </div>
          <!-- 결과 표시 -->
          <div v-if="playerResults[participant]" class="mt-2 text-sm">
            <div class="font-bold text-accent-400">{{ playerResults[participant] }}</div>
          </div>
        </div>
      </div>

      <!-- 사다리 캔버스 -->
      <div class="relative bg-white rounded-lg p-4 shadow-lg border-4 border-primary-500">
        <canvas
          ref="ladderCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
          class="block"
        />
        
        <!-- 움직이는 플레이어 아바타 (이름표) -->
        <div
          v-if="currentAnimatingPlayer && animatingAvatar.visible"
          :class="[
            'absolute px-4 py-2 rounded-full flex items-center justify-center font-bold text-sm',
            'bg-gradient-to-r from-red-500 to-orange-500 text-white border-4 border-white shadow-2xl',
            'transition-all duration-500 ease-in-out z-20 animate-pulse'
          ]"
          :style="{
            left: `${animatingAvatar.x}px`,
            top: `${animatingAvatar.y}px`,
            transform: 'translate(-50%, -50%)',
            minWidth: '80px'
          }"
        >
          <div class="text-center">
            <div class="text-white font-bold">{{ currentAnimatingPlayer }}</div>
            <div class="text-xs text-yellow-200">🏃‍♂️</div>
          </div>
        </div>
        
        <!-- 이동 경로 트레일 효과 -->
        <div
          v-for="(trail, index) in animatingTrails"
          :key="`trail-${index}`"
          :class="[
            'absolute w-3 h-3 rounded-full bg-orange-300 transition-all duration-300 ease-out z-10',
            'opacity-' + (100 - index * 20)
          ]"
          :style="{
            left: `${trail.x}px`,
            top: `${trail.y}px`,
            transform: 'translate(-50%, -50%)',
            opacity: Math.max(0.1, 1 - index * 0.2)
          }"
        ></div>
      </div>

      <!-- 결과 요약 -->
      <div v-if="Object.keys(playerResults).length > 0" class="mt-8 max-w-2xl mx-auto">
        <h4 class="text-xl font-bold text-center text-primary-500 mb-4">🏆 결과 발표</h4>
        <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div class="grid gap-3">
            <div
              v-for="(result, player) in playerResults"
              :key="player"
              :class="[
                'flex justify-between items-center p-3 rounded-lg',
                result.includes('커피') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              ]"
            >
              <div class="font-bold">{{ player }}</div>
              <div :class="result.includes('커피') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
                {{ result }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 모든 결과 완료 시 최종 결과 -->
      <div v-if="allPlayersFinished" class="mt-6">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-accent-400 mb-4">🎉 게임 완료!</h3>
          <div class="bg-white rounded-lg p-6 max-w-md mx-auto border border-gray-200 shadow-sm">
            <div class="text-sm text-gray-600 space-y-1">
              <div>총 게임 시간: {{ formatTime(elapsedTime) }}</div>
              <div>참가자 수: {{ gameState.participants.length }}명</div>
              <div>게임 방식: 사다리게임</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 컨트롤 (세로 점선으로 구분) -->
    <div class="bg-white border-t-2 border-dashed border-accent-400 p-4">
      <div class="container mx-auto flex justify-center gap-4">
        <button
          v-if="gamePhase === 'playing'"
          @click="restartGame"
          class="px-6 py-2 bg-accent-400 text-fg-invert rounded hover:bg-accent-200 flex items-center gap-2 transition-all"
        >
          <RestartIcon class="w-4 h-4" />
          다시 시작
        </button>
        
        <button
          v-if="gamePhase === 'setup'"
          @click="resetSetup"
          class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-400 flex items-center gap-2 transition-all"
        >
          <RestartIcon class="w-4 h-4" />
          초기화
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
    const gamePhase = ref('setup') // 'setup', 'playing', 'completed'
    const prizes = ref([]) // 당첨 내용들
    const elapsedTime = ref(0)
    const gameTimer = ref(null)
    
    // 사다리 관련
    const ladderStructure = ref([])
    const ladderLevels = ref(8)
    const playerResults = ref({}) // 각 플레이어의 결과
    
    // 애니메이션 관련
    const currentAnimatingPlayer = ref(null)
    const animatingAvatar = ref({ x: 0, y: 0, visible: false })
    const animatingTrails = ref([]) // 애니메이션 경로의 트레일 정보
    
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
    const filledPrizes = computed(() => {
      return prizes.value.filter(prize => prize && prize.trim()).length
    })
    
    const canStartGame = computed(() => {
      return filledPrizes.value === props.gameState.participants.length
    })
    
    const allPlayersFinished = computed(() => {
      return Object.keys(playerResults.value).length === props.gameState.participants.length
    })
    
    // 메서드들
    const getCurrentPhaseText = () => {
      switch (gamePhase.value) {
        case 'setup':
          return '당첨 내용 설정 단계'
        case 'playing':
          return '사다리게임 진행 중'
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
    
    const setDefaultPrizes = () => {
      const defaultPrizes = []
      const participantCount = props.gameState.participants.length
      
      for (let i = 0; i < participantCount - 1; i++) {
        defaultPrizes.push(`${i + 1}등 상품`)
      }
      defaultPrizes.push('커피사기 💸')
      
      prizes.value = defaultPrizes
    }
    
    const shufflePrizes = () => {
      const shuffled = [...prizes.value]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      prizes.value = shuffled
    }
    
    const resetSetup = () => {
      prizes.value = []
    }
    
    const generateLadder = () => {
      const playerCount = props.gameState.participants.length
      const structure = []
      
      // 각 레벨마다 다양한 연결선 생성
      for (let level = 0; level < ladderLevels.value; level++) {
        const levelConnections = {
          horizontal: [], // 가로선 (기본)
          diagonalDown: [], // 대각선 아래
          diagonalUp: [], // 대각선 위
          curve: [], // 곡선 연결
          zigzag: [] // 지그재그 연결
        }
        
        let lastConnection = -2 // 연속된 연결선 방지
        
        for (let i = 0; i < playerCount - 1; i++) {
          if (i > lastConnection + 1) {
            const connectionType = Math.random()
            
            // 40% 확률로 기본 가로선
            if (connectionType < 0.4) {
              levelConnections.horizontal.push(i)
              lastConnection = i
            }
            // 20% 확률로 대각선 아래
            else if (connectionType < 0.6 && level < ladderLevels.value - 1) {
              levelConnections.diagonalDown.push(i)
              lastConnection = i
            }
            // 15% 확률로 대각선 위
            else if (connectionType < 0.75 && level > 0) {
              levelConnections.diagonalUp.push(i)
              lastConnection = i
            }
            // 10% 확률로 곡선 연결
            else if (connectionType < 0.85) {
              levelConnections.curve.push(i)
              lastConnection = i
            }
            // 나머지 확률로 지그재그 연결
            else if (connectionType < 0.95) {
              levelConnections.zigzag.push(i)
              lastConnection = i
            }
          }
        }
        
        structure.push(levelConnections)
      }
      
      return structure
    }
    
    const drawStaticLadder = () => {
      const canvas = ladderCanvas.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const playerCount = props.gameState.participants.length
      
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
      
      // 복잡한 연결선 그리기
      ladderStructure.value.forEach((levelConnections, level) => {
        const y = canvasConfig.value.padding + (level + 1) * canvasConfig.value.levelSpacing
        
        // 1. 기본 가로선 (주황색)
        ctx.strokeStyle = '#F28C28'
        ctx.lineWidth = 3
        levelConnections.horizontal.forEach(connection => {
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
        
        // 2. 대각선 아래 (빨간색)
        ctx.strokeStyle = '#DC2626'
        ctx.lineWidth = 3
        levelConnections.diagonalDown.forEach(connection => {
          const x1 = canvasConfig.value.padding + connection * canvasConfig.value.playerSpacing
          const x2 = canvasConfig.value.padding + (connection + 1) * canvasConfig.value.playerSpacing
          const y2 = canvasConfig.value.padding + (level + 2) * canvasConfig.value.levelSpacing
          
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(x2, y2)
          ctx.stroke()
          
          // 화살표 표시
          ctx.fillStyle = '#DC2626'
          ctx.beginPath()
          ctx.arc(x1, y, 5, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x2, y2, 5, 0, 2 * Math.PI)
          ctx.fill()
        })
        
        // 3. 대각선 위 (파란색)
        ctx.strokeStyle = '#2563EB'
        ctx.lineWidth = 3
        levelConnections.diagonalUp.forEach(connection => {
          const x1 = canvasConfig.value.padding + connection * canvasConfig.value.playerSpacing
          const x2 = canvasConfig.value.padding + (connection + 1) * canvasConfig.value.playerSpacing
          const y0 = canvasConfig.value.padding + level * canvasConfig.value.levelSpacing
          
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(x2, y0)
          ctx.stroke()
          
          // 화살표 표시
          ctx.fillStyle = '#2563EB'
          ctx.beginPath()
          ctx.arc(x1, y, 5, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x2, y0, 5, 0, 2 * Math.PI)
          ctx.fill()
        })
        
        // 4. 곡선 연결 (초록색)
        ctx.strokeStyle = '#16A34A'
        ctx.lineWidth = 3
        levelConnections.curve.forEach(connection => {
          const x1 = canvasConfig.value.padding + connection * canvasConfig.value.playerSpacing
          const x2 = canvasConfig.value.padding + (connection + 1) * canvasConfig.value.playerSpacing
          const midX = (x1 + x2) / 2
          const midY = y - 20
          
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.quadraticCurveTo(midX, midY, x2, y)
          ctx.stroke()
          
          // 연결점
          ctx.fillStyle = '#16A34A'
          ctx.beginPath()
          ctx.arc(x1, y, 4, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x2, y, 4, 0, 2 * Math.PI)
          ctx.fill()
        })
        
        // 5. 지그재그 연결 (보라색)
        ctx.strokeStyle = '#9333EA'
        ctx.lineWidth = 3
        levelConnections.zigzag.forEach(connection => {
          const x1 = canvasConfig.value.padding + connection * canvasConfig.value.playerSpacing
          const x2 = canvasConfig.value.padding + (connection + 1) * canvasConfig.value.playerSpacing
          const midX = (x1 + x2) / 2
          const midY1 = y - 15
          const midY2 = y + 15
          
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(midX, midY1)
          ctx.lineTo(midX, midY2)
          ctx.lineTo(x2, y)
          ctx.stroke()
          
          // 연결점
          ctx.fillStyle = '#9333EA'
          ctx.beginPath()
          ctx.arc(x1, y, 4, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x2, y, 4, 0, 2 * Math.PI)
          ctx.fill()
        })
      })
      
      // 참가자 이름 표시 (상단)
      ctx.fillStyle = '#2C473F'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      
      props.gameState.participants.forEach((player, index) => {
        const x = canvasConfig.value.padding + index * canvasConfig.value.playerSpacing
        ctx.fillText(player, x, canvasConfig.value.padding - 20)
      })
      
      // 당첨 내용 표시 (하단)
      ctx.fillStyle = '#666'
      ctx.font = 'bold 14px Arial'
      
      prizes.value.forEach((prize, index) => {
        const x = canvasConfig.value.padding + index * canvasConfig.value.playerSpacing
        const lines = prize.length > 10 ? [prize.slice(0, 10), prize.slice(10)] : [prize]
        
        lines.forEach((line, lineIndex) => {
          const y = canvasHeight.value - canvasConfig.value.padding + 35 + (lineIndex * 16)
          ctx.fillText(line, x, y)
        })
      })
    }
    
    const calculatePlayerPath = (playerIndex) => {
      let currentPosition = playerIndex
      const path = [{ level: 0, position: currentPosition }]
      
      // 각 레벨을 순차적으로 내려가면서 경로 계산
      ladderStructure.value.forEach((levelConnections, level) => {
        // 1. 기본 가로선 연결 확인
        levelConnections.horizontal.forEach(connection => {
          if (currentPosition === connection) {
            currentPosition = connection + 1
          } else if (currentPosition === connection + 1) {
            currentPosition = connection
          }
        })
        
        // 2. 대각선 아래 연결 확인
        levelConnections.diagonalDown.forEach(connection => {
          if (currentPosition === connection) {
            currentPosition = connection + 1
          } else if (currentPosition === connection + 1) {
            currentPosition = connection
          }
        })
        
        // 3. 대각선 위 연결 확인
        levelConnections.diagonalUp.forEach(connection => {
          if (currentPosition === connection) {
            currentPosition = connection + 1
          } else if (currentPosition === connection + 1) {
            currentPosition = connection
          }
        })
        
        // 4. 곡선 연결 확인
        levelConnections.curve.forEach(connection => {
          if (currentPosition === connection) {
            currentPosition = connection + 1
          } else if (currentPosition === connection + 1) {
            currentPosition = connection
          }
        })
        
        // 5. 지그재그 연결 확인
        levelConnections.zigzag.forEach(connection => {
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
    
    const animatePlayerPath = async (player, playerIndex) => {
      if (currentAnimatingPlayer.value) return
      
      currentAnimatingPlayer.value = player
      animatingAvatar.value.visible = true
      animatingTrails.value = [] // 새로운 경로 시작 시 트레일 초기화
      
      const path = calculatePlayerPath(playerIndex)
      
      // 애니메이션 실행
      for (let i = 0; i < path.length; i++) {
        const step = path[i]
        
        // 아바타 위치 업데이트
        animatingAvatar.value.x = canvasConfig.value.padding + step.position * canvasConfig.value.playerSpacing
        animatingAvatar.value.y = canvasConfig.value.padding + step.level * canvasConfig.value.levelSpacing
        
        // 트레일 위치 업데이트
        if (i > 0) {
          const prevStep = path[i - 1]
          const trailX = canvasConfig.value.padding + prevStep.position * canvasConfig.value.playerSpacing
          const trailY = canvasConfig.value.padding + prevStep.level * canvasConfig.value.levelSpacing
          animatingTrails.value.push({ x: trailX, y: trailY })
        }
        
        // 각 단계마다 500ms 대기
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // 최종 결과 설정
      const finalPosition = path[path.length - 1].position
      const finalPrize = prizes.value[finalPosition]
      playerResults.value[player] = finalPrize
      
      // 애니메이션 종료
      animatingAvatar.value.visible = false
      currentAnimatingPlayer.value = null
      
      // 모든 플레이어가 완료되면 게임 완료 이벤트 발생
      if (allPlayersFinished.value) {
        setTimeout(() => {
          const gameResult = {
            results: playerResults.value,
            gameTime: elapsedTime.value,
            gameMode: 'ladder',
            totalParticipants: props.gameState.participants.length,
            timestamp: Date.now()
          }
          emit('game-complete', gameResult)
        }, 1000)
      }
    }
    
    const startLadderGame = () => {
      if (!canStartGame.value) return
      
      gamePhase.value = 'playing'
      ladderStructure.value = generateLadder()
      playerResults.value = {}
      
      startTimer()
      
      // 캔버스에 사다리 그리기
      setTimeout(() => {
        drawStaticLadder()
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
    
    const restartGame = () => {
      gamePhase.value = 'setup'
      prizes.value = []
      elapsedTime.value = 0
      playerResults.value = {}
      currentAnimatingPlayer.value = null
      animatingAvatar.value = { x: 0, y: 0, visible: false }
      animatingTrails.value = [] // 게임 재시작 시 트레일 초기화
      ladderStructure.value = []
      stopTimer()
    }
    
    // 생명주기
    onMounted(() => {
      // 초기 당첨 내용 설정
      setDefaultPrizes()
      
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
      prizes,
      elapsedTime,
      playerResults,
      currentAnimatingPlayer,
      animatingAvatar,
      animatingTrails, // 템플릿에 추가
      ladderCanvas,
      canvasWidth,
      canvasHeight,
      filledPrizes,
      canStartGame,
      allPlayersFinished,
      getCurrentPhaseText,
      formatTime,
      setDefaultPrizes,
      shufflePrizes,
      resetSetup,
      startLadderGame,
      animatePlayerPath,
      restartGame
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
  .canvas {
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

/* 애니메이션 효과 */
.transition-all {
  transition: all 0.3s ease;
}
</style> 