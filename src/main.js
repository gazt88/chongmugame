import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// 글로벌 속성 설정
app.config.globalProperties.$gameConfig = {
  maxParticipants: 20,
  minParticipants: 2,
  gameTimeout: 30000, // 30초
  animationDuration: 2000 // 2초
}

app.mount('#app') 