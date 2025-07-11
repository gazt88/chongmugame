## 1. 제품 개요 – “사다리타기 2.0”

기존 Lunch-Lottery 앱의 **Ladder** 모드를 **총무팀 업무 흐름**에 맞춰 전면 재설계합니다.
새 버전은 *참가자 등록 → 개인별 낙하 순서 지정 → 10 초 내 전체 애니메이션* 과정을 통해 **빠르고 직관적이며 시청각적으로 즐거운 추첨 경험**을 제공합니다.

| 항목     | 내용                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------ |
| 대상 플랫폼 | Windows 데스크톱 EXE (오프라인)                                                                          |
| 주요 사용자 | 총무팀·행정 지원 인력, 회식·커피 내기 담당자                                                                       |
| 차별 요소  | • 참가자별 색상 랜덤 매핑<br>• 10 초 타이머 기반 ‘동시 낙하’ 애니메이션<br>• 사다리 순서(Top → Bottom) 수동 지정으로 **“운 + 전략”** 결합 |

---

## 2. 개편 목표 & KPI

| 목표            | 지표                        |
| ------------- | ------------------------- |
| **결정 시간 단축**  | 한 라운드 ≤ 30 초 (입력 포함)      |
| **사용 빈도 증가**  | 주 1회 이상 사용 직원 ≥ 85 %      |
| **시각 몰입도 향상** | 만족도 설문 ‘재미/몰입’ 4.2 / 5 ↑  |
| **공정성 투명성**   | 색상 랜덤 배정·알고리즘 로그 100 % 검증 |

---

## 3. 게임 진행 절차 (세부 플로우)

| 단계                 | 사용자 액션            | 시스템 동작                                       | 시간     |
| ------------------ | ----------------- | -------------------------------------------- | ------ |
| **1. 참가자 등록**      | 이름 입력·삭제          | 리스트 검증(≥2명)                                  | 가변     |
| **2. 낙하 순서 지정**    | 드래그&드롭 또는 순번 드롭다운 | UI 상단 → 하단 순서 라벨링                            | ≤ 10 초 |
| **3. 사다리 생성**      | **Start** 클릭      | • 가로줄 무작위 배치<br>• 참가자마다 **고유 색상** RNG        | < 1 초  |
| **4. 동시 낙하 애니메이션** | -                 | • 60 fps, 총 길이 **10 초 고정**<br>• 실시간 경로 하이라이트 | 10 초   |
| **5. 결과 발표**       | -                 | 패자 1명 ‘망했다!’ 모달 + 색상 매칭                      | 즉시     |
| **6. 재시작 / 종료**    | 버튼 선택             | 입력·통계 메모리 리셋 / 앱 종료                          | < 1 초  |

> **색상 랜덤 규칙**
> • HSL 범위에서 *채도 60 %·명도 55 %* 고정, Hue 난수화
> • 색 중복 발생 시 Hue ± 25° 보정

---

## 4. 핵심 기능 & 사양

| 카테고리 | 기능        | 세부 사양                             |
| ---- | --------- | --------------------------------- |
| 입력   | 참가자 CRUD  | 이름 2–20자, 중복 자동 \_suffix          |
| 설정   | 낙하 순서 편집  | 리스트 Drag & Drop, 순번 인디케이터         |
| 비주얼  | 실시간 동시 낙하 | 타임라인 10 000 ms / 600 프레임          |
| 렌더링  | 색상 매핑     | HSL → RGB 변환, 사다리·이름·결과 모달 모두 연동  |
| 공정성  | 무작위 가로줄   | `random.randbytes()` seed=시스템 시간  |
| 피드백  | 결과 모달     | 승자 ‘살았다!’ 초록, 패자 ‘망했다!’ 오렌지       |
| 접근성  | 색각 보정 옵션  | 색약 모드: 색상 대비 자동 상승                |
| 성능   | FPS 유지    | CPU < 25 %, RAM < 220 MB (20명 기준) |

---

## 5. UI / UX 요구사항

| 영역                   | 최소 요구                            |
| -------------------- | -------------------------------- |
| **TopBar**           | 로고, SoundToggle, 세션 타이머          |
| **Participant Pane** | • 리스트 + 색상 점 미리보기<br>• 순서 표시 배지  |
| **Ladder Canvas**    | 16 : 9, 배경 - 중립 밝은 회색, 선 굵기 2 px |
| **Color Legend**     | 하단 고정, 이름&색상 Key                 |
| **Result Modal**     | 전체 블러 + 중앙 카드, 승/패 색상 반영         |

---

## 6. 기술 스택

| 레이어    | 선택                    | 세부 설명                |
| ------ | --------------------- | -------------------- |
| UI     | **Pygame 2.5**        | 타임라인 제어·Sprite Group |
| 로직     | Python 3.11           | `dataclass`로 참가자 객체화 |
| 패키징    | PyInstaller – onefile | 70 MB 예상             |
| 사운드    | WAV 16-bit            | 경쾌한 톤·패배 효과          |
| 색상 RNG | `secrets.randbits`    | 예측 불가성 강화            |

---

## 7. 예외 / 오류 처리

| 조건             | 시스템 대처                |
| -------------- | --------------------- |
| 참가자 < 2명       | 토스트 “2명 이상 필요”        |
| 순서 미지정         | Start 비활성 + 빨강 경고     |
| 중복 색상 1차 생성    | Hue 보정 재시도 (최대 3)     |
| 애니메이션 중 창 리사이즈 | 렌더 일시 정지 → 크기 확정 후 재개 |
| 강제 종료          | 데이터 미저장, 재실행 시 초기 상태  |

---

## 8. 접근성·보안·성능

* **WCAG 2.2**: 텍스트 대비 ≥ 4.5 : 1, 키보드 완전 지원
* **오프라인**: 네트워크 라이브러리 제거 (`socket`, `requests` 미포함)
* **실행 환경**: Win 10(2015) 이상, 내장 GPU 없는 노트북에서도 ≥ 45 fps
* **코드 서명**(옵션): 사내 백신 오탐 방지

---

## 9. 향후 일정(예시)

| Sprint | 목표 산출물                      |
| ------ | --------------------------- |
| 0.5주   | UX 플로우 다이어그램, 색상 RNG 테스트    |
| 1주차    | Participant Pane + 순서 편집 구현 |
| 2주차    | LadderCanvas 동시 낙하 엔진 완성    |
| 3주차    | 결과 모달·사운드·접근성 옵션            |
| 4주차    | 통합 QA → PyInstaller 패키징     |

---