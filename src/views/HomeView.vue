<template>
  <div class="flex-1 flex flex-col bg-bg-light">
    <!-- ToolPhotoStrip -->
    <ToolPhotoStrip />
    
    <!-- 메인 콘텐츠 -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-4xl">
        <!-- 게임 제목 -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-fg mb-4 flex items-center justify-center gap-3">
            <WrenchIcon class="w-8 h-8 text-primary-500" />
            총무팀 사다리 게임
            <CoffeeIcon class="w-8 h-8 text-accent-400" />
          </h2>
          <p class="text-fg text-lg mb-4">
            총무팀원들이 사다리를 타고 내려가서 한 명만 커피를 사게 됩니다! ☕
          </p>
        </div>

        <!-- 4열 그리드 레이아웃 -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <!-- 참가자 입력 섹션 -->
          <div class="xl:col-span-2 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 class="text-xl font-bold mb-4 text-primary-500 flex items-center gap-2">
              <ScrewdriverIcon class="w-5 h-5" />
              총무팀 참가자 등록
            </h3>
            
            <!-- 참가자 목록 -->
            <div class="space-y-3 mb-4">
              <div 
                v-for="(participant, index) in participants" 
                :key="index"
                class="flex items-center gap-3 p-3 bg-bg-light rounded border"
              >
                <span class="text-accent-400 font-bold w-8 flex items-center gap-1">
                  {{ index + 1 }}.
                </span>
                <input
                  v-model="participants[index]"
                  @input="updateParticipants"
                  @keyup.enter="focusNextInput(index)"
                  :ref="el => participantInputs[index] = el"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
                  :placeholder="`총무팀원 ${index + 1} 이름`"
                  maxlength="10"
                />
                <button
                  v-if="participants.length > 2"
                  @click="removeParticipant(index)"
                  class="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="참가자 삭제"
                >
                  <RemoveIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- 참가자 추가/제거 버튼 -->
            <div class="flex justify-between items-center mb-6">
              <button
                @click="addParticipant"
                :disabled="participants.length >= 20"
                class="px-4 py-2 bg-primary-500 text-fg-invert rounded hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <AddIcon class="w-4 h-4" />
                팀원 추가
              </button>
              
              <div class="text-fg text-sm">
                {{ participants.filter(p => p.trim()).length }} / 20명
                <span v-if="participants.filter(p => p.trim()).length < 2" class="text-accent-400">
                  (최소 2명 필요)
                </span>
              </div>
            </div>
          </div>

          <!-- 세로 점선 구분 -->
          <div class="hidden xl:block">
            <div class="h-full border-l-2 border-dashed border-accent-400 mx-auto animate-dashBlink"></div>
          </div>

          <!-- 게임 시작 섹션 -->
          <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 class="text-xl font-bold mb-4 text-primary-500 flex items-center gap-2">
              <PlayIcon class="w-5 h-5" />
              게임 시작
            </h3>
            
            <div class="text-center">
              <button
                @click="startGame"
                :disabled="!canStartGame"
                class="w-full py-4 text-lg font-bold bg-accent-400 text-fg-invert rounded hover:bg-accent-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
                :class="{ 'animate-pulse': canStartGame }"
              >
                <CoffeeIcon class="w-6 h-6" />
                커피내기 사다리 시작!
              </button>
              
              <p class="text-sm text-gray-600 mt-3">
                사다리를 타고 내려가서<br>
                커피사는 사람을 결정해요!
              </p>
            </div>
          </div>
        </div>

        <!-- 통계 섹션 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 세션 통계 -->
          <div v-if="gameState.sessionStats.totalGames > 0" class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 class="text-lg font-bold mb-4 text-primary-500 flex items-center gap-2">
              <RulerIcon class="w-5 h-5" />
              이번 세션 통계
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-fg">총 커피내기 수</span>
                <span class="font-bold text-fg">{{ gameState.sessionStats.totalGames }}회</span>
              </div>
              <div class="flex justify-between">
                <span class="text-fg">최다 커피사는 사람</span>
                <span class="font-bold text-accent-400">{{ mostFrequentLoser.name || '-' }} ({{ mostFrequentLoser.count }}회)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-fg">최다 커피받는 사람</span>
                <span class="font-bold text-primary-500">{{ mostFrequentWinner.name || '-' }} ({{ mostFrequentWinner.count }}회)</span>
              </div>
            </div>
          </div>

          <!-- 전체 통계 버튼 -->
          <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 class="text-lg font-bold mb-4 text-primary-500 flex items-center gap-2">
              <CoffeeIcon class="w-5 h-5" />
              전체 통계
            </h4>
            <div class="text-center">
              <button
                @click="goToStatistics"
                class="w-full py-3 text-lg font-bold bg-primary-500 text-fg-invert rounded hover:bg-primary-300 flex items-center justify-center gap-3 transition-all"
              >
                📊 전체 통계 보기
              </button>
              <p class="text-sm text-gray-600 mt-3">
                지금까지의 모든 커피내기 기록과<br>
                지출 현황을 확인하세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import ToolPhotoStrip from '../components/ToolPhotoStrip.vue'
import { 
  WrenchIcon,
  ScrewdriverIcon,
  RulerIcon,
  CoffeeIcon,
  AddIcon, 
  RemoveIcon, 
  PlayIcon 
} from '../components/icons/GameIcons.vue'

export default {
  name: 'HomeView',
  components: {
    ToolPhotoStrip,
    WrenchIcon,
    ScrewdriverIcon,
    RulerIcon,
    CoffeeIcon,
    AddIcon,
    RemoveIcon,
    PlayIcon
  },
  props: {
    gameState: {
      type: Object,
      required: true
    }
  },
  emits: ['start-game', 'update-participants', 'go-to-statistics'],
  setup(props, { emit }) {
    // 참가자 목록 (로컬 상태)
    const participants = ref(['', ''])
    const participantInputs = ref([])

    // 계산된 속성들
    const canStartGame = computed(() => {
      const validParticipants = participants.value.filter(p => p.trim())
      return validParticipants.length >= 2 && validParticipants.length <= 20
    })

    const mostFrequentLoser = computed(() => {
      const losers = props.gameState.sessionStats.losers
      if (Object.keys(losers).length === 0) return { name: '', count: 0 }
      
      const maxCount = Math.max(...Object.values(losers))
      const name = Object.keys(losers).find(key => losers[key] === maxCount)
      return { name, count: maxCount }
    })

    const mostFrequentWinner = computed(() => {
      const winners = props.gameState.sessionStats.winners
      if (Object.keys(winners).length === 0) return { name: '', count: 0 }
      
      const maxCount = Math.max(...Object.values(winners))
      const name = Object.keys(winners).find(key => winners[key] === maxCount)
      return { name, count: maxCount }
    })

    // 메서드들
    const addParticipant = () => {
      if (participants.value.length < 20) {
        participants.value.push('')
        nextTick(() => {
          const newIndex = participants.value.length - 1
          if (participantInputs.value[newIndex]) {
            participantInputs.value[newIndex].focus()
          }
        })
      }
    }

    const removeParticipant = (index) => {
      if (participants.value.length > 2) {
        participants.value.splice(index, 1)
        updateParticipants()
      }
    }

    const updateParticipants = () => {
      const validParticipants = participants.value
        .map(p => p.trim())
        .filter(p => p)
      
      emit('update-participants', validParticipants)
    }

    const focusNextInput = (currentIndex) => {
      const nextIndex = currentIndex + 1
      if (nextIndex < participants.value.length) {
        participantInputs.value[nextIndex]?.focus()
      } else if (canStartGame.value) {
        startGame()
      }
    }

    const startGame = () => {
      if (!canStartGame.value) {
        return
      }

      const validParticipants = participants.value
        .map(p => p.trim())
        .filter(p => p)

      // 중복 이름 처리
      const uniqueParticipants = []
      const nameCount = {}
      
      validParticipants.forEach(name => {
        if (nameCount[name]) {
          nameCount[name]++
          uniqueParticipants.push(`${name}_${nameCount[name]}`)
        } else {
          nameCount[name] = 1
          uniqueParticipants.push(name)
        }
      })

      emit('update-participants', uniqueParticipants)
      emit('start-game')
    }

    const goToStatistics = () => {
      emit('go-to-statistics')
    }

    return {
      participants,
      participantInputs,
      canStartGame,
      mostFrequentLoser,
      mostFrequentWinner,
      addParticipant,
      removeParticipant,
      updateParticipants,
      focusNextInput,
      startGame,
      goToStatistics
    }
  }
}
</script>

<style scoped>
/* 반응형 그리드 */
@media (min-width: 1366px) and (max-width: 1600px) {
  .xl\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 호버 효과 */
.hover\:bg-primary-300:hover {
  background-color: #486B63;
}

.hover\:bg-accent-200:hover {
  background-color: #FFBF7A;
}

/* 포커스 효과 */
.focus\:ring-accent-400:focus {
  --tw-ring-color: #F28C28;
}

/* 버튼 호버 효과 */
button:hover:not(:disabled) {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 세로 점선 호버 효과 */
.border-dashed:hover {
  border-color: #F28C28;
  filter: drop-shadow(0 0 4px rgba(242, 140, 40, 0.3));
}
</style> 