# 홈코트 — interface-design system.md

방향·토큰·패턴의 확정 기록. 상세 서술은 ../DESIGN.md, 시각 원본은 ../mockup/design-final-v1.html.

## 방향
- 시그니처: **"조용한 버저"** — 소리를 못 내는 앱이라 화면 테두리 전체가 타이머 겸 전환 신호
- 톤: 새벽 6시의 어두운 방. 다크 기본은 취향이 아니라 사용 맥락
- 깊이: **보더 중심 + 서피스 단차**. 그림자는 시트와 드래그 잡힘에만
- 폰이 바닥에 있고 사용자는 1.5m 밖 — 운동 중 화면은 크고 단순하게, 장식 금지

## 토큰 (다크 / 라이트)
- void: #0B0E15 / #F7F5F1 · surface: #12161F / #FFFFFF · raised: #1A1F2A / #FFFFFF
- ink: #E9EEF7 / #14171F (2차 62% · 3차 40~42% · 4차 24~26%)
- line: rgba(233,238,247,.09) / rgba(20,23,31,.10) · line-2는 .16 / .18
- **buzzer(단일 액센트): #FFA31A / 텍스트용 #C96A00** — 채움색은 양쪽 다 #FFA31A
- buzzer-hot(전환 3초 전 전용): #FF4D2E · buzzer-soft: rgba(255,163,26,.13~.16)
- lift(그림자): 0 10px 22px -8px rgba(0,0,0,.75) / -10px rgba(20,23,31,.28)

## 타이포·스페이싱
- Pretendard Variable 자체 호스팅. 숫자는 전부 tabular-nums(.tnum)
- 9.5~11 / 12~13 / 14~15 / 17 / 20 / 26 / 30 / 52 / **104(운동 중 타이머)**
- 큰 글씨 모드: `--live-scale: 1.14`, 운동 중 동작명·타이머에만
- 4px 그리드. 화면 좌우 20px, 컨트롤 패딩 10~17px
- 라운드: 칩 999 / 버튼·필드 10~14 / 카드 15~20 / 시트 상단 24

## 컴포넌트 확정값
- 탭바: 5탭, 아이콘 19px(stroke 1.8) + 9.5px 라벨, 패딩 9 / safe-area
- CTA: buzzer-fill 배경, on-fill 글자, r14, py 17, 17px/700. ghost는 line-2 보더 + py 14
- 설정 행(SItem): 좌 라벨 14px/500 + 부제 11px, 우 값 12.5px + ›. 패딩 15×13
- 토글: 44×26, 노브 20px, 200ms
- 소음 마크(NoiseMark): 막대 3개 4/7.5/11px × 3px, 간격 2px. 3단계만 buzzer
- 히트맵: 셀 26px h, r6, 5주×7일. 강도는 타임아웃/기본/풀 = 30%/55%/100%
  - **원정 링은 앰버가 아니라 `color-mix(in srgb, var(--ink) 55%, transparent)` 2px** — 앰버로 두면 풀 경기(같은 앰버) 위에서 완전히 묻힌다. 범례 스와치·날짜 시트의 점도 같은 값 (`test/heatmap/결과-2026-07-31.md`)
- 앱 아이콘: 로고와 **같은 좌표를 크롭만 달리** 한 것. 48 좌표계 `[0.535, 11.7, 24.6]`, 선 40% × 굵기 0.85배. 원본 `public/favicon.svg`, 굽는 도구 `test/icon/icon-build.html` (좌표를 늘 같이 고칠 것)
- 운동 중 테두리: rect x5 y5 w365 h802 rx35, stroke 5 → 3초 전 9, pathLength 100 + dasharray
- 바텀시트: r24 상단, grab 36×4, dim rgba(4,6,10,.72)
- 드래그 잡힘: buzzer 보더 + lift + scale(1.015), 놓일 자리는 44px 점선

## 동작 그림 (Figure)
- 120×120 · 몸통 8 / 팔다리 6 / 먼쪽 6+opacity.3 / 머리 r9 stroke5.5 / 발 stroke5.5 / 바닥 3.5
- 앰버는 운동당 하나만. 목록 정지, 운동 중만 2.6s 교차. `figureOff`로 동작 단위 끄기
- 크기: 운동 중 136 · 동작 시트 92 · 루틴 편집 26~30 · 플레이북 34

## 절차 메모
- 승인 과정 시안은 mockup/design-mockup-v1~v4.html에 전부 보존 (덮어쓰기 금지)
- 톤 참고: 로컬 _references/awesome-design-md의 raycast, linear.app에서 다크 서피스 사다리 + 헤어라인 보더 + 단일 액센트 구조만 취함
