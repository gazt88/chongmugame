# 점심 추첨 게임 - 데스크톱 실행 파일 빌드 가이드

## 🚀 실행 파일 생성 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발용 실행 (Electron)
```bash
npm run electron-dev
```

### 3. 최종 실행 파일 생성 (.exe)
```bash
npm run dist
```

실행 파일은 `dist-electron` 폴더에 생성됩니다.

## 📦 빌드 결과물

- **설치 파일**: `dist-electron/점심 추첨 게임 Setup 1.0.0.exe`
- **실행 파일**: `dist-electron/win-unpacked/점심 추첨 게임.exe`

## 🎯 사용 방법

1. `npm run dist` 명령어 실행
2. `dist-electron` 폴더에서 생성된 exe 파일 확인
3. 다른 PC에 배포 시 `점심 추첨 게임 Setup 1.0.0.exe` 사용
4. 바로 실행하려면 `win-unpacked` 폴더의 exe 파일 사용

## ⚠️ 주의사항

- 첫 빌드 시 시간이 오래 걸릴 수 있습니다 (Electron 다운로드)
- Windows Defender에서 경고가 나올 수 있습니다 (서명되지 않은 앱)
- 아이콘이 기본값으로 설정됩니다 (필요시 `electron/icon.ico` 파일 교체)

## 🔧 문제 해결

### 빌드 실패 시
```bash
# 캐시 정리
npm run build
rm -rf dist-electron
npm run dist
```

### 권한 문제 시
- 관리자 권한으로 CMD 실행
- 바이러스 백신 소프트웨어 일시 해제 