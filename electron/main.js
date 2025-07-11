import { app, BrowserWindow, Menu } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 개발 환경 확인
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  // 메인 윈도우 생성
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    title: '점심 추첨 게임',
    show: false,
    titleBarStyle: 'default'
  })

  // 개발 환경에서는 개발 서버 로드, 프로덕션에서는 빌드된 파일 로드
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    // 개발자 도구 열기
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // 윈도우가 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 윈도우가 닫힐 때
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Electron이 준비되면 윈도우 생성
app.whenReady().then(() => {
  createWindow()

  // macOS에서 dock 아이콘 클릭 시 윈도우 재생성
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // 메뉴 설정 (개발 환경에서만)
  if (isDev) {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: '개발',
        submenu: [
          {
            label: '새로고침',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              mainWindow.reload()
            }
          },
          {
            label: '개발자 도구',
            accelerator: 'F12',
            click: () => {
              mainWindow.webContents.toggleDevTools()
            }
          },
          { type: 'separator' },
          {
            label: '종료',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit()
            }
          }
        ]
      }
    ]))
  } else {
    // 프로덕션에서는 메뉴 숨김
    Menu.setApplicationMenu(null)
  }
})

// 모든 윈도우가 닫힐 때 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 보안 설정
app.on('web-contents-created', (event, contents) => {
  // 외부 링크 차단
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
  })

  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
      event.preventDefault()
    }
  })
}) 