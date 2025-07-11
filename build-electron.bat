@echo off
echo ===============================================
echo        점심 추첨 게임 실행파일 빌드
echo ===============================================
echo.

echo [1/3] 의존성 설치 중...
call npm install
if %errorlevel% neq 0 (
    echo 의존성 설치 실패!
    pause
    exit /b 1
)

echo.
echo [2/3] 웹 애플리케이션 빌드 중...
call npm run build
if %errorlevel% neq 0 (
    echo 웹 빌드 실패!
    pause
    exit /b 1
)

echo.
echo [3/3] Electron 실행파일 생성 중...
call npm run build-electron
if %errorlevel% neq 0 (
    echo Electron 빌드 실패!
    pause
    exit /b 1
)

echo.
echo ===============================================
echo            빌드 완료!
echo ===============================================
echo.
echo 실행파일 위치: dist-electron\win-unpacked\
echo 설치파일 위치: dist-electron\
echo.
echo 아무 키나 눌러서 dist-electron 폴더를 엽니다...
pause > nul

start explorer "dist-electron" 