<template>
  <div class="modal-overlay" @click="$emit('cancel')">
    <div class="modal-content" @click.stop>
      <div class="text-center">
        <!-- 아이콘 -->
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-200 flex items-center justify-center">
          <svg class="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        
        <!-- 메시지 -->
        <h3 class="text-lg font-bold text-fg mb-2">확인</h3>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        
        <!-- 버튼들 -->
        <div class="flex gap-3 justify-center">
          <button 
            @click="$emit('cancel')"
            class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-400 transition-all"
          >
            취소
          </button>
          <button 
            @click="$emit('confirm')"
            class="px-6 py-2 bg-accent-400 text-fg-invert rounded hover:bg-accent-200 transition-all"
            ref="confirmButton"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'

export default {
  name: 'ConfirmModal',
  props: {
    message: {
      type: String,
      required: true
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const confirmButton = ref(null)

    onMounted(() => {
      // 모달이 열리면 확인 버튼에 포커스
      confirmButton.value?.focus()
      
      // ESC 키로 취소
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          emit('cancel')
        }
      }
      
      document.addEventListener('keydown', handleKeydown)
      
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        document.removeEventListener('keydown', handleKeydown)
      }
    })

    return {
      confirmButton
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
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
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