<template>
  <div class="flex-1 flex flex-col bg-bg-light">
    <!-- ToolPhotoStrip -->
    <ToolPhotoStrip />
    
    <!-- 상단 헤더 -->
    <div class="bg-white border-b border-gray-200 p-4 shadow-sm">
      <div class="container mx-auto flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-primary-500 flex items-center gap-2">
            <CoffeeIcon class="w-6 h-6" />
            커피내기 통계
          </h2>
          <p class="text-gray-600">총무팀 커피 지출 현황</p>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- 커피 가격 설정 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">커피 가격:</label>
            <input
              v-model.number="coffeePrice"
              @change="updateCoffeePrice"
              type="number"
              min="1000"
              max="10000"
              step="500"
              class="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
            <span class="text-sm text-gray-600">원</span>
          </div>
          
          <!-- 새로고침 버튼 -->
          <button
            @click="refreshStats"
            class="p-2 rounded hover:bg-accent-200 transition-colors"
            title="통계 새로고침"
          >
            <RestartIcon class="w-5 h-5 text-accent-400" />
          </button>
        </div>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="flex-1 overflow-auto p-6">
      <div class="container mx-auto max-w-6xl">
        <!-- 전체 통계 요약 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div class="text-center">
              <div class="text-2xl font-bold text-accent-400">{{ totalStats.totalGames }}</div>
              <div class="text-sm text-gray-600">총 게임 수</div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div class="text-center">
              <div class="text-2xl font-bold text-accent-400">{{ formatPrice(totalStats.totalAmount) }}</div>
              <div class="text-sm text-gray-600">총 지출 금액</div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div class="text-center">
              <div class="text-2xl font-bold text-accent-400">{{ Object.keys(totalStats.players).length }}</div>
              <div class="text-sm text-gray-600">참여 인원</div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div class="text-center">
              <div class="text-2xl font-bold text-accent-400">{{ formatPrice(averagePerGame) }}</div>
              <div class="text-sm text-gray-600">게임당 평균</div>
            </div>
          </div>
        </div>

        <!-- 탭 메뉴 -->
        <div class="flex border-b border-gray-200 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 font-medium transition-colors',
              activeTab === tab.id 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-600 hover:text-fg'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- 지출 랭킹 탭 -->
        <div v-if="activeTab === 'ranking'" class="space-y-4">
          <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 class="text-lg font-bold text-primary-500 mb-4 flex items-center gap-2">
              <CoffeeBeansIcon class="w-5 h-5" />
              💸 커피 지출 랭킹
            </h3>
            
            <div v-if="topSpenders.length === 0" class="text-center py-8">
              <div class="text-gray-600">아직 게임 기록이 없습니다.</div>
              <div class="text-sm text-gray-500 mt-2">첫 게임을 시작해보세요!</div>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="(player, index) in topSpenders"
                :key="player.name"
                :class="[
                  'flex items-center justify-between p-4 rounded-lg border transition-all',
                  index === 0 ? 'bg-yellow-50 border-yellow-300' :
                  index === 1 ? 'bg-gray-50 border-gray-300' :
                  index === 2 ? 'bg-amber-50 border-amber-300' :
                  'bg-gray-50 border-gray-200'
                ]"
              >
                <div class="flex items-center gap-4">
                  <!-- 순위 -->
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <span v-if="index === 0" class="text-yellow-500">🥇</span>
                    <span v-else-if="index === 1" class="text-gray-500">🥈</span>
                    <span v-else-if="index === 2" class="text-amber-500">🥉</span>
                    <span v-else class="text-gray-600 text-sm">{{ index + 1 }}</span>
                  </div>
                  
                  <!-- 이름 -->
                  <div>
                    <div class="font-bold text-fg">{{ player.name }}</div>
                    <div class="text-sm text-gray-600">{{ player.loseCount }}번 걸림</div>
                  </div>
                </div>
                
                <!-- 지출 금액 -->
                <div class="text-right">
                  <div class="text-lg font-bold text-accent-400">{{ formatPrice(player.totalSpent) }}</div>
                  <div class="text-sm text-gray-600">평균 {{ formatPrice(player.averageSpent) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 최근 게임 기록 탭 -->
        <div v-if="activeTab === 'history'" class="space-y-4">
          <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 class="text-lg font-bold text-primary-500 mb-4 flex items-center gap-2">
              <WrenchIcon class="w-5 h-5" />
              📋 최근 게임 기록
            </h3>
            
            <div v-if="recentGames.length === 0" class="text-center py-8">
              <div class="text-gray-600">아직 게임 기록이 없습니다.</div>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="game in recentGames"
                :key="game.id"
                class="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div class="flex items-center gap-4">
                  <!-- 게임 모드 아이콘 -->
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                    <span>🪜</span>
                  </div>
                  
                  <!-- 게임 정보 -->
                  <div>
                    <div class="font-bold text-fg">
                      사다리 게임
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ formatDate(game.date) }} • {{ game.participants }}명 참여
                    </div>
                  </div>
                </div>
                
                <!-- 결과 -->
                <div class="text-right">
                  <div class="font-bold text-red-500">{{ game.loser }}</div>
                  <div class="text-sm text-gray-600">{{ formatPrice(game.amount) }} 지출</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 월별 통계 탭 -->
        <div v-if="activeTab === 'monthly'" class="space-y-4">
          <div class="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 class="text-lg font-bold text-primary-500 mb-4 flex items-center gap-2">
              <CoffeeIcon class="w-5 h-5" />
              📊 월별 통계
            </h3>
            
            <div v-if="monthlyStats.length === 0" class="text-center py-8">
              <div class="text-gray-600">월별 통계가 없습니다.</div>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="month in monthlyStats"
                :key="month.month"
                class="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div>
                  <div class="font-bold text-fg">{{ month.month }}</div>
                  <div class="text-sm text-gray-600">{{ month.games }}게임</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-accent-400">{{ formatPrice(month.amount) }}</div>
                  <div class="text-sm text-gray-600">{{ formatPrice(month.average) }}/게임</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 컨트롤 (세로 점선으로 구분) -->
    <div class="bg-white border-t-2 border-dashed border-accent-400 p-4">
      <div class="container mx-auto flex justify-center">
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
import { ref, computed, onMounted } from 'vue'
import ToolPhotoStrip from '../components/ToolPhotoStrip.vue'
import { 
  CoffeeIcon,
  CoffeeBeansIcon,
  WrenchIcon,
  RestartIcon,
  HomeIcon
} from '../components/icons/GameIcons.vue'
import { getGameHistory, getCoffeePrice, setCoffeePrice } from '../utils/statistics.js'

export default {
  name: 'StatisticsView',
  components: {
    ToolPhotoStrip,
    CoffeeIcon,
    CoffeeBeansIcon,
    WrenchIcon,
    RestartIcon,
    HomeIcon
  },
  emits: ['back-to-home'],
  setup() {
    const activeTab = ref('ranking')
    const coffeePrice = ref(4000)
    const gameHistory = ref([])
    
    const tabs = [
      { id: 'ranking', name: '지출 랭킹' },
      { id: 'history', name: '게임 기록' },
      { id: 'monthly', name: '월별 통계' }
    ]
    
    // 계산된 속성들
    const totalStats = computed(() => {
      const stats = {
        totalGames: gameHistory.value.length,
        totalAmount: gameHistory.value.length * coffeePrice.value,
        players: {}
      }
      
      gameHistory.value.forEach(game => {
        if (!stats.players[game.loser]) {
          stats.players[game.loser] = { loseCount: 0, totalSpent: 0 }
        }
        stats.players[game.loser].loseCount++
        stats.players[game.loser].totalSpent += coffeePrice.value
      })
      
      return stats
    })
    
    const averagePerGame = computed(() => {
      return totalStats.value.totalGames > 0 ? coffeePrice.value : 0
    })
    
    const topSpenders = computed(() => {
      const players = Object.entries(totalStats.value.players)
        .map(([name, data]) => ({
          name,
          loseCount: data.loseCount,
          totalSpent: data.totalSpent,
          averageSpent: data.totalSpent / data.loseCount
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
      
      return players
    })
    
    const recentGames = computed(() => {
      return gameHistory.value
        .slice(-20)
        .reverse()
        .map((game, index) => ({
          ...game,
          id: index,
          participants: game.winners ? game.winners.length + 1 : 2,
          amount: coffeePrice.value
        }))
    })
    
    const monthlyStats = computed(() => {
      const monthlyData = {}
      
      gameHistory.value.forEach(game => {
        const date = new Date(game.timestamp)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { games: 0, amount: 0 }
        }
        
        monthlyData[monthKey].games++
        monthlyData[monthKey].amount += coffeePrice.value
      })
      
      return Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          games: data.games,
          amount: data.amount,
          average: data.amount / data.games
        }))
        .sort((a, b) => b.month.localeCompare(a.month))
    })
    
    // 메서드들
    const formatPrice = (amount) => {
      return amount.toLocaleString() + '원'
    }
    
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })
    }
    
    const refreshStats = () => {
      gameHistory.value = getGameHistory()
    }
    
    const updateCoffeePrice = () => {
      setCoffeePrice(coffeePrice.value)
    }
    
    // 생명주기
    onMounted(() => {
      gameHistory.value = getGameHistory()
      coffeePrice.value = getCoffeePrice()
    })
    
    return {
      activeTab,
      coffeePrice,
      tabs,
      totalStats,
      averagePerGame,
      topSpenders,
      recentGames,
      monthlyStats,
      formatPrice,
      formatDate,
      refreshStats,
      updateCoffeePrice
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* 버튼 호버 효과 */
button:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

/* 반응형 */
@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
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