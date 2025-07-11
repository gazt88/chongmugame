// 게임 통계 관리 유틸리티

// 로컬 스토리지 키
const STORAGE_KEY = 'coffee-lottery-statistics'
const SETTINGS_KEY = 'coffee-lottery-settings'

// 기본 커피 가격 (원)
const DEFAULT_COFFEE_PRICE = 5000

// 설정 관리
export const getSettings = () => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY)
    return settings ? JSON.parse(settings) : { coffeePrice: DEFAULT_COFFEE_PRICE }
  } catch (error) {
    console.error('설정 로드 실패:', error)
    return { coffeePrice: DEFAULT_COFFEE_PRICE }
  }
}

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('설정 저장 실패:', error)
  }
}

// 통계 데이터 구조
const createEmptyStats = () => ({
  totalGames: 0,
  totalAmount: 0,
  players: {}, // { playerName: { loseCount: 0, totalSpent: 0, games: [] } }
  gameHistory: [] // 게임 기록
})

// 통계 데이터 로드
export const loadStatistics = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : createEmptyStats()
  } catch (error) {
    console.error('통계 로드 실패:', error)
    return createEmptyStats()
  }
}

// 통계 데이터 저장
export const saveStatistics = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch (error) {
    console.error('통계 저장 실패:', error)
  }
}

// 게임 결과 추가
export const addGameResult = (result) => {
  const stats = loadStatistics()
  const settings = getSettings()
  const coffeePrice = settings.coffeePrice || DEFAULT_COFFEE_PRICE
  
  // 기본 통계 업데이트
  stats.totalGames++
  stats.totalAmount += coffeePrice
  
  // 플레이어 통계 업데이트
  const loser = result.loser
  if (loser) {
    if (!stats.players[loser]) {
      stats.players[loser] = {
        loseCount: 0,
        totalSpent: 0,
        games: []
      }
    }
    
    stats.players[loser].loseCount++
    stats.players[loser].totalSpent += coffeePrice
    stats.players[loser].games.push({
      date: new Date().toISOString(),
      gameMode: result.gameMode,
      participants: result.totalParticipants,
      amount: coffeePrice,
      selectedLadder: result.selectedLadder || null
    })
  }
  
  // 승자들도 플레이어 목록에 추가 (통계 추적용)
  result.winners?.forEach(winner => {
    if (!stats.players[winner]) {
      stats.players[winner] = {
        loseCount: 0,
        totalSpent: 0,
        games: []
      }
    }
  })
  
  // 게임 기록 추가
  stats.gameHistory.push({
    id: Date.now(),
    date: new Date().toISOString(),
    gameMode: result.gameMode,
    loser: result.loser,
    winners: result.winners || [],
    participants: result.totalParticipants,
    duration: result.duration,
    amount: coffeePrice,
    selectedLadder: result.selectedLadder || null
  })
  
  // 최근 100개 게임만 보관
  if (stats.gameHistory.length > 100) {
    stats.gameHistory = stats.gameHistory.slice(-100)
  }
  
  saveStatistics(stats)
  return stats
}

// 플레이어 통계 정렬 (지출 금액 기준)
export const getTopSpenders = (limit = 10) => {
  const stats = loadStatistics()
  return Object.entries(stats.players)
    .map(([name, data]) => ({
      name,
      loseCount: data.loseCount,
      totalSpent: data.totalSpent,
      averageSpent: data.loseCount > 0 ? data.totalSpent / data.loseCount : 0
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit)
}

// 최근 게임 기록 가져오기
export const getRecentGames = (limit = 20) => {
  const stats = loadStatistics()
  return stats.gameHistory
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}

// 월별 통계 가져오기
export const getMonthlyStats = () => {
  const stats = loadStatistics()
  const monthlyData = {}
  
  stats.gameHistory.forEach(game => {
    const date = new Date(game.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        totalGames: 0,
        totalAmount: 0,
        players: {}
      }
    }
    
    monthlyData[monthKey].totalGames++
    monthlyData[monthKey].totalAmount += game.amount
    
    if (game.loser) {
      if (!monthlyData[monthKey].players[game.loser]) {
        monthlyData[monthKey].players[game.loser] = 0
      }
      monthlyData[monthKey].players[game.loser] += game.amount
    }
  })
  
  return monthlyData
}

// 통계 초기화
export const clearStatistics = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('통계 초기화 실패:', error)
    return false
  }
}

// 통계 내보내기 (JSON)
export const exportStatistics = () => {
  const stats = loadStatistics()
  const settings = getSettings()
  
  const exportData = {
    exportDate: new Date().toISOString(),
    settings,
    statistics: stats
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `coffee-lottery-stats-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 통계 가져오기 (JSON)
export const importStatistics = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (data.statistics) {
          saveStatistics(data.statistics)
        }
        
        if (data.settings) {
          saveSettings(data.settings)
        }
        
        resolve(data)
      } catch (error) {
        reject(new Error('잘못된 파일 형식입니다.'))
      }
    }
    
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsText(file)
  })
} 