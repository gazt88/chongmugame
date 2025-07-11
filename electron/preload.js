// Preload script for security
// 이 파일은 렌더러 프로세스가 안전하게 Node.js API에 접근할 수 있도록 하는 브리지 역할을 합니다.

import { contextBridge } from 'electron'

// 필요한 경우 여기에 안전한 API를 노출할 수 있습니다.
contextBridge.exposeInMainWorld('electronAPI', {
  // 현재는 특별한 기능이 필요하지 않으므로 빈 객체
  // 예: platform: process.platform
})

// 개발 환경에서만 콘솔 로그
if (process.env.NODE_ENV === 'development') {
  console.log('Preload script loaded')
} 