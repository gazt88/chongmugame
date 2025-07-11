<template>
  <div id="app" class="min-w-desktop min-h-desktop retro-bg">
    <!-- 메인 애플리케이션 컨테이너 -->
    <div class="h-screen flex flex-col">
      <!-- Top Bar -->
      <TopBar 
        :current-view="currentView"
        :sound-enabled="gameState.soundEnabled"
        @change-view="handleViewChange"
        @toggle-sound="toggleSound"
        @exit-game="exitGame"
      />
      
      <!-- 메인 콘텐츠 영역 -->
      <main class="flex-1 flex flex-col">
        <!-- 홈 화면 -->
        <HomeView 
          v-if="currentView === 'home'"
          :game-state="gameState"
          @start-game="startGame"
          @update-participants="updateParticipants"
          @go-to-statistics="goToStatistics"
        />
        
        <!-- 사다리 게임 화면 -->
        <LadderView
          v-else-if="currentView === 'ladder'"
          :game-state="gameState"
          @game-complete="handleGameComplete"
          @back-to-home="goToHome"
        />
        

        
        <!-- 통계 화면 -->
        <StatisticsView
          v-else-if="currentView === 'statistics'"
          @back-to-home="goToHome"
        />
      </main>
      
      <!-- 결과 모달 -->
      <ResultModal
        v-if="showResult"
        :result="gameResult"
        :sound-enabled="gameState.soundEnabled"
        @restart="restartGame"
        @exit="exitGame"
      />
      
      <!-- 확인 모달 -->
      <ConfirmModal
        v-if="showConfirm"
        :message="confirmMessage"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import TopBar from './components/TopBar.vue'
import HomeView from './views/HomeView.vue'
import LadderView from './views/LadderView.vue'
import StatisticsView from './views/StatisticsView.vue'
import ResultModal from './components/ResultModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import { addGameResult } from './utils/statistics.js'

export default {
  name: 'App',
  components: {
    TopBar,
    HomeView,
    LadderView,
    StatisticsView,
    ResultModal,
    ConfirmModal
  },
  setup() {
    // 게임 상태 관리
    const gameState = reactive({
      mode: 'ladder', // 'ladder' only
      participants: [],
      isPlaying: false,
      soundEnabled: true,
      sessionStats: {
        totalGames: 0,
        winners: {},
        losers: {}
      }
    })

    // 현재 화면
    const currentView = ref('home') // 'home' | 'ladder' | 'statistics'
    
    // 결과 관련
    const showResult = ref(false)
    const gameResult = ref(null)
    
    // 확인 모달 관련
    const showConfirm = ref(false)
    const confirmMessage = ref('')
    const confirmCallback = ref(null)

    // 게임 시작
    const startGame = () => {
      if (gameState.participants.length < 2) {
        alert('총무팀원을 최소 2명 이상 입력해주세요! ☕')
        return
      }
      
      gameState.isPlaying = true
      currentView.value = gameState.mode
    }

    // 참가자 업데이트
    const updateParticipants = (participants) => {
      gameState.participants = [...participants]
    }



    // 화면 변경 핸들러
    const handleViewChange = (view) => {
      if (gameState.isPlaying && view !== currentView.value) {
        confirmMessage.value = '정말 게임을 중단하시겠습니까?'
        confirmCallback.value = () => {
          gameState.isPlaying = false
          currentView.value = view
        }
        showConfirm.value = true
      } else {
        currentView.value = view
      }
    }

    // 게임 완료 처리
    const handleGameComplete = (result) => {
      gameState.isPlaying = false
      gameResult.value = result
      showResult.value = true
      
      // 로컬 스토리지에 통계 저장
      try {
        addGameResult(result)
      } catch (error) {
        console.error('통계 저장 실패:', error)
      }
      
      // 세션 통계 업데이트 (기존 코드 유지)
      gameState.sessionStats.totalGames++
      if (result.loser) {
        gameState.sessionStats.losers[result.loser] = 
          (gameState.sessionStats.losers[result.loser] || 0) + 1
      }
      
      // 승자들 통계 업데이트
      result.winners?.forEach(winner => {
        gameState.sessionStats.winners[winner] = 
          (gameState.sessionStats.winners[winner] || 0) + 1
      })
    }

    // 게임 재시작
    const restartGame = () => {
      showResult.value = false
      gameResult.value = null
      gameState.isPlaying = false
      currentView.value = 'home'
    }

    // 홈으로 이동
    const goToHome = () => {
      gameState.isPlaying = false
      currentView.value = 'home'
    }

    // 통계 페이지로 이동
    const goToStatistics = () => {
      currentView.value = 'statistics'
    }

    // 사운드 토글
    const toggleSound = () => {
      gameState.soundEnabled = !gameState.soundEnabled
    }

    // 게임 종료
    const exitGame = () => {
      confirmMessage.value = '정말 종료하시겠습니까?'
      confirmCallback.value = () => {
        // 실제 앱에서는 window.close() 또는 electron의 app.quit()
        if (confirm('브라우저 탭을 닫으시겠습니까?')) {
          window.close()
        }
      }
      showConfirm.value = true
    }

    // 확인 모달 핸들러
    const handleConfirm = () => {
      if (confirmCallback.value) {
        confirmCallback.value()
      }
      showConfirm.value = false
      confirmCallback.value = null
    }

    const handleCancel = () => {
      showConfirm.value = false
      confirmCallback.value = null
    }

    return {
      gameState,
      currentView,
      showResult,
      gameResult,
      showConfirm,
      confirmMessage,
      startGame,
      updateParticipants,
      handleViewChange,
      handleGameComplete,
      restartGame,
      goToHome,
      toggleSound,
      exitGame,
      handleConfirm,
      handleCancel
    }
  }
}
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style> 