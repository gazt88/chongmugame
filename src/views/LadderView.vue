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

    <!-- 사다리게임 진행 단계 -->
    <div v-if="gamePhase === 'playing'" class="flex-1 flex flex-col items-center p-6">
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
      <div class="relative bg-white rounded-lg p-2 shadow-lg border-2 border-primary-500 max-w-3xl mx-auto">
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
            'absolute px-3 py-1 rounded-full flex items-center justify-center font-bold text-xs',
            'bg-gradient-to-r from-red-500 to-orange-500 text-white border-2 border-white shadow-lg',
            'transition-all duration-500 ease-in-out z-20 animate-pulse'
          ]"
          :style="{
            left: `${animatingAvatar.x}px`,
            top: `${animatingAvatar.y}px`,
            transform: 'translate(-50%, -50%)',
            minWidth: '60px'
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
            'absolute w-2 h-2 rounded-full bg-orange-300 transition-all duration-300 ease-out z-10'
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
                result.includes('커피사기') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              ]"
            >
              <div class="font-bold">{{ player }}</div>
              <div :class="result.includes('커피사기') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
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
          @click="restartGame"
          class="px-6 py-2 bg-accent-400 text-fg-invert rounded hover:bg-accent-200 flex items-center gap-2 transition-all"
        >
          <RestartIcon class="w-4 h-4" />
          다시 시작
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
    const gamePhase = ref('playing') // 바로 게임 시작
    const elapsedTime = ref(0)
    const gameTimer = ref(null)
    
    // 사다리 관련
    const ladderStructure = ref([])
    const ladderLevels = ref(12) // 레벨 수 늘려서 긴장감 증가
    const playerResults = ref({}) // 각 플레이어의 결과
    const prizeOrder = ref([]) // 하단에 표시할 당첨 결과 순서
    
    // 애니메이션 관련
    const currentAnimatingPlayer = ref(null)
    const animatingAvatar = ref({ x: 0, y: 0, visible: false })
    const animatingTrails = ref([]) // 애니메이션 경로의 트레일 정보
    
    // 캔버스 관련
    const ladderCanvas = ref(null)
    const canvasWidth = ref(600) // 크기 줄이기
    const canvasHeight = ref(450) // 사다리 레벨 증가에 따라 높이 조정
    const canvasConfig = ref({
      padding: 40, // 패딩 줄이기
      playerSpacing: 0,
      levelSpacing: 0
    })
    
    // 계산된 속성들
    const allPlayersFinished = computed(() => {
      return Object.keys(playerResults.value).length === props.gameState.participants.length
    })
    
    // 메서드들
    const getCurrentPhaseText = () => {
      return '커피내기 사다리게임 진행 중'
    }
    
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    
    // 간단한 커피내기 결과 생성
    const generateCoffeeResults = () => {
      const participants = props.gameState.participants
      const coffeePayerIndex = Math.floor(Math.random() * participants.length)
      const results = []
      
      participants.forEach((participant, index) => {
        if (index === coffeePayerIndex) {
          results.push('커피사기 💸')
        } else {
          results.push('얻어먹기 ☕')
        }
      })
      
      return results
    }
    
    const generateLadder = () => {
      const playerCount = props.gameState.participants.length
      const structure = []
      
      // 각 레벨마다 연결선 생성 (복잡하고 긴장감 있는 구조)
      for (let level = 0; level < ladderLevels.value; level++) {
        const connections = []
        let lastConnection = -2 // 연속된 연결선 방지
        
        // 더 많은 연결선으로 흥미롭게 만들기
        for (let i = 0; i < playerCount - 1; i++) {
          // 연속된 연결선이 아니고, 65% 확률로 연결선 생성 (긴장감 증가)
          if (i > lastConnection + 1 && Math.random() < 0.65) {
            connections.push({
              from: i,
              to: i + 1,
              type: Math.random() < 0.6 ? 'straight' : 'curve' // 60% 직선, 40% 곡선
            })
            lastConnection = i
          }
        }
        
        // 빈 레벨이 생기지 않도록 최소 하나의 연결선 보장
        if (connections.length === 0 && playerCount > 2) {
          const randomPos = Math.floor(Math.random() * (playerCount - 1))
          connections.push({
            from: randomPos,
            to: randomPos + 1,
            type: Math.random() < 0.6 ? 'straight' : 'curve'
          })
        }
        
        structure.push(connections)
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
      
      // 세로선 그리기 (각 플레이어 경로) - 더 굵고 선명하게
      ctx.strokeStyle = '#2C473F'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      
      for (let i = 0; i < playerCount; i++) {
        const x = canvasConfig.value.padding + i * canvasConfig.value.playerSpacing
        ctx.beginPath()
        ctx.moveTo(x, canvasConfig.value.padding)
        ctx.lineTo(x, canvasHeight.value - canvasConfig.value.padding)
        ctx.stroke()
        
        // 플레이어 위치에 시작점 표시
        ctx.fillStyle = '#2C473F'
        ctx.beginPath()
        ctx.arc(x, canvasConfig.value.padding, 8, 0, 2 * Math.PI)
        ctx.fill()
        
        // 도착점 표시
        ctx.fillStyle = '#F28C28'
        ctx.beginPath()
        ctx.arc(x, canvasHeight.value - canvasConfig.value.padding, 8, 0, 2 * Math.PI)
        ctx.fill()
      }
      
      // 연결선 그리기 - 단순하지만 화려하게
      ladderStructure.value.forEach((connections, level) => {
        const y = canvasConfig.value.padding + (level + 1) * canvasConfig.value.levelSpacing
        
        connections.forEach((connection, index) => {
          const x1 = canvasConfig.value.padding + connection.from * canvasConfig.value.playerSpacing
          const x2 = canvasConfig.value.padding + connection.to * canvasConfig.value.playerSpacing
          
          // 연결선 색상을 다채롭게
          const colors = ['#F28C28', '#DC2626', '#16A34A', '#2563EB', '#9333EA', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316']
          ctx.strokeStyle = colors[index % colors.length]
          ctx.lineWidth = 4
          ctx.lineCap = 'round'
          
          if (connection.type === 'curve') {
            // 곡선 연결
            const midX = (x1 + x2) / 2
            const midY = y - 25
            
            ctx.beginPath()
            ctx.moveTo(x1, y)
            ctx.quadraticCurveTo(midX, midY, x2, y)
            ctx.stroke()
            
            // 곡선 중간에 장식점
            ctx.fillStyle = ctx.strokeStyle
            ctx.beginPath()
            ctx.arc(midX, midY, 6, 0, 2 * Math.PI)
            ctx.fill()
          } else {
            // 직선 연결
            ctx.beginPath()
            ctx.moveTo(x1, y)
            ctx.lineTo(x2, y)
            ctx.stroke()
          }
          
          // 연결점에 원 그리기
          ctx.fillStyle = ctx.strokeStyle
          ctx.beginPath()
          ctx.arc(x1, y, 6, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x2, y, 6, 0, 2 * Math.PI)
          ctx.fill()
        })
      })
      
      // 참가자 이름 표시 (상단) - 더 크고 선명하게
      ctx.fillStyle = '#2C473F'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 2
      
      props.gameState.participants.forEach((player, index) => {
        const x = canvasConfig.value.padding + index * canvasConfig.value.playerSpacing
        ctx.fillText(player, x, canvasConfig.value.padding - 25)
      })
      
      // 그림자 제거
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      
      // 하단에 당첨 결과 표시
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      
      prizeOrder.value.forEach((prize, index) => {
        const x = canvasConfig.value.padding + index * canvasConfig.value.playerSpacing
        const y = canvasHeight.value - canvasConfig.value.padding + 30
        
        // 당첨 결과에 따라 색상 다르게
        if (prize.includes('커피사기')) {
          ctx.fillStyle = '#DC2626' // 빨간색
        } else {
          ctx.fillStyle = '#16A34A' // 초록색
        }
        
        // 배경 박스 그리기
        const textWidth = ctx.measureText(prize).width
        ctx.fillStyle = prize.includes('커피사기') ? '#FEF2F2' : '#F0FDF4'
        ctx.fillRect(x - textWidth/2 - 8, y - 18, textWidth + 16, 22)
        
        // 테두리 그리기
        ctx.strokeStyle = prize.includes('커피사기') ? '#DC2626' : '#16A34A'
        ctx.lineWidth = 2
        ctx.strokeRect(x - textWidth/2 - 8, y - 18, textWidth + 16, 22)
        
        // 텍스트 그리기
        ctx.fillStyle = prize.includes('커피사기') ? '#DC2626' : '#16A34A'
        ctx.fillText(prize, x, y - 2)
      })
    }
    

    
    const animatePlayerPath = async (player, playerIndex) => {
      if (currentAnimatingPlayer.value) return
      
      currentAnimatingPlayer.value = player
      animatingAvatar.value.visible = true
      animatingTrails.value = [] // 새로운 경로 시작 시 트레일 초기화
      
      // 시작 위치 설정
      let currentPosition = playerIndex
      const startX = canvasConfig.value.padding + currentPosition * canvasConfig.value.playerSpacing
      const startY = canvasConfig.value.padding
      
      animatingAvatar.value.x = startX
      animatingAvatar.value.y = startY
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 레벨별로 실제 사다리를 타고 내려가는 애니메이션
      for (let level = 0; level < ladderLevels.value; level++) {
        const currentLevelY = canvasConfig.value.padding + (level + 1) * canvasConfig.value.levelSpacing
        const currentX = canvasConfig.value.padding + currentPosition * canvasConfig.value.playerSpacing
        
        // 1. 세로선을 따라 현재 레벨까지 내려가기
        await animateVerticalMove(animatingAvatar.value.y, currentLevelY)
        
        // 2. 현재 레벨에서 가로선(연결선) 확인
        const connections = ladderStructure.value[level]
        let foundConnection = null
        
        // 현재 위치에서 연결선 찾기
        for (const connection of connections) {
          if (currentPosition === connection.from) {
            foundConnection = { ...connection, direction: 'right' }
            break
          } else if (currentPosition === connection.to) {
            foundConnection = { ...connection, direction: 'left' }
            break
          }
        }
        
        // 3. 연결선이 있으면 가로선을 타고 이동
        if (foundConnection) {
          const targetPosition = foundConnection.direction === 'right' ? foundConnection.to : foundConnection.from
          const targetX = canvasConfig.value.padding + targetPosition * canvasConfig.value.playerSpacing
          
          // 가로선을 따라 이동
          await animateHorizontalMove(animatingAvatar.value.x, targetX, foundConnection.type)
          
          // 위치 업데이트
          currentPosition = targetPosition
        }
        
        // 각 레벨마다 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 33))
      }
      
      // 4. 마지막 레벨까지 내려가기
      const finalY = canvasConfig.value.padding + (ladderLevels.value + 1) * canvasConfig.value.levelSpacing
      await animateVerticalMove(animatingAvatar.value.y, finalY)
      
      // 최종 결과 설정 (미리 생성된 결과 사용)
      playerResults.value[player] = prizeOrder.value[currentPosition]
      
      // 최종 위치에서 당첨 결과 강조 효과
      highlightWinningPosition(currentPosition)
      
      // 애니메이션 종료
      setTimeout(() => {
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
      }, 500)
    }
    
    // 세로 이동 애니메이션 (사다리 세로선을 따라)
    const animateVerticalMove = async (fromY, toY) => {
      const distance = Math.abs(toY - fromY)
      const steps = Math.max(10, Math.floor(distance / 20))
      const stepSize = (toY - fromY) / steps
      
      for (let i = 0; i <= steps; i++) {
        animatingAvatar.value.y = fromY + (stepSize * i)
        
        // 트레일 효과
        if (i % 3 === 0) {
          animatingTrails.value.push({
            x: animatingAvatar.value.x,
            y: animatingAvatar.value.y
          })
          if (animatingTrails.value.length > 8) {
            animatingTrails.value.shift()
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    // 가로 이동 애니메이션 (사다리 가로선을 따라)
    const animateHorizontalMove = async (fromX, toX, connectionType) => {
      const distance = Math.abs(toX - fromX)
      const steps = Math.max(15, Math.floor(distance / 15))
      
      if (connectionType === 'curve') {
        // 곡선 이동
        const centerX = (fromX + toX) / 2
        const centerY = animatingAvatar.value.y - 25
        
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          
          // 베지어 곡선 계산
          const x = Math.pow(1 - t, 2) * fromX + 2 * (1 - t) * t * centerX + Math.pow(t, 2) * toX
          const y = Math.pow(1 - t, 2) * animatingAvatar.value.y + 2 * (1 - t) * t * centerY + Math.pow(t, 2) * animatingAvatar.value.y
          
          animatingAvatar.value.x = x
          animatingAvatar.value.y = y
          
          // 트레일 효과
          if (i % 2 === 0) {
            animatingTrails.value.push({
              x: animatingAvatar.value.x,
              y: animatingAvatar.value.y
            })
            if (animatingTrails.value.length > 8) {
              animatingTrails.value.shift()
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 12))
        }
      } else {
        // 직선 이동
        const stepSize = (toX - fromX) / steps
        
        for (let i = 0; i <= steps; i++) {
          animatingAvatar.value.x = fromX + (stepSize * i)
          
          // 트레일 효과
          if (i % 2 === 0) {
            animatingTrails.value.push({
              x: animatingAvatar.value.x,
              y: animatingAvatar.value.y
            })
            if (animatingTrails.value.length > 8) {
              animatingTrails.value.shift()
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
    }
    
    // 당첨 위치 강조 효과
    const highlightWinningPosition = (position) => {
      const canvas = ladderCanvas.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const x = canvasConfig.value.padding + position * canvasConfig.value.playerSpacing
      const y = canvasHeight.value - canvasConfig.value.padding + 30
      
      // 강조 효과 애니메이션
      let flashCount = 0
      const flashInterval = setInterval(() => {
        if (flashCount >= 6) {
          clearInterval(flashInterval)
          drawStaticLadder() // 원래 상태로 복원
          return
        }
        
        const prize = prizeOrder.value[position]
        const textWidth = ctx.measureText(prize).width
        
        if (flashCount % 2 === 0) {
          // 강조 색상
          ctx.fillStyle = prize.includes('커피사기') ? '#DC2626' : '#16A34A'
          ctx.fillRect(x - textWidth/2 - 8, y - 18, textWidth + 16, 22)
          
          // 강조 테두리
          ctx.strokeStyle = '#FFD700' // 금색
          ctx.lineWidth = 4
          ctx.strokeRect(x - textWidth/2 - 8, y - 18, textWidth + 16, 22)
          
          // 강조 텍스트
          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 16px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(prize, x, y - 2)
        } else {
          // 원래 색상으로 복원
          drawStaticLadder()
        }
        
        flashCount++
      }, 200)
    }
    
    const startLadderGame = () => {
      gamePhase.value = 'playing'
      ladderStructure.value = generateLadder()
      playerResults.value = {}
      
      // 미리 당첨 결과 생성
      prizeOrder.value = generateCoffeeResults()
      
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
      gamePhase.value = 'playing'
      elapsedTime.value = 0
      playerResults.value = {}
      currentAnimatingPlayer.value = null
      animatingAvatar.value = { x: 0, y: 0, visible: false }
      animatingTrails.value = [] // 게임 재시작 시 트레일 초기화
      ladderStructure.value = generateLadder()
      
      // 새로운 당첨 결과 생성
      prizeOrder.value = generateCoffeeResults()
      
      stopTimer()
      startTimer()
      
      // 캔버스 다시 그리기
      setTimeout(() => {
        drawStaticLadder()
      }, 100)
    }
    
    // 생명주기
    onMounted(() => {
      // 게임 시작
      startLadderGame()
      
      // 캔버스 크기 조정
      const updateCanvasSize = () => {
        const container = ladderCanvas.value?.parentElement
        if (container) {
          const rect = container.getBoundingClientRect()
          canvasWidth.value = Math.min(600, rect.width - 40)
          canvasHeight.value = Math.min(450, canvasWidth.value * 0.75)
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
        elapsedTime,
        playerResults,
        currentAnimatingPlayer,
        animatingAvatar,
        animatingTrails, // 템플릿에 추가
        ladderCanvas,
        canvasWidth,
        canvasHeight,
        prizeOrder,
        allPlayersFinished,
        getCurrentPhaseText,
        formatTime,
        startLadderGame,
        animatePlayerPath,
        animateVerticalMove,
        animateHorizontalMove,
        highlightWinningPosition,
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