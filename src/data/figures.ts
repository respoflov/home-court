/**
 * 동작 그림 42종.
 *
 * 공통 규격 — 이걸 벗어나면 42개가 42가지 스타일이 된다.
 *   캔버스   120 × 120
 *   몸통     stroke 8      팔·다리 6      먼 쪽 팔·다리 6 + opacity .3
 *   머리     빈 원 r=9, stroke 5.5        발 짧은 가로선 stroke 5.5
 *   바닥     stroke 3.5, 서면 y=110 / 누우면 y=100
 *   앰버     운동당 하나만 — 그 동작에서 가장 중요한 것에만
 *
 * a = 시작 자세, b = 끝 자세. 목록에서는 a만, 운동 중 화면에서만 교차한다.
 */
export interface Figure {
  /** 바닥선. 없으면 그리지 않는다 (공중 동작 없음이라 대부분 있다) */
  ground?: string
  a: string
  b: string
}

/* 자주 쓰는 조각 — 같은 자세끼리 좌표를 공유해야 한 세트로 보인다 */
const G_STAND = 'M16 110 H104'
const G_FLOOR = 'M10 100 H110'
const G_WALL = 'M22 12 V110 M22 110 H104'

const head = (x: number, y: number) => `<circle class="hd" cx="${x}" cy="${y}" r="9"/>`
const torso = (d: string) => `<path class="ts" d="${d}"/>`
const limb = (d: string) => `<path class="lb" d="${d}"/>`
const far = (d: string) => `<path class="fr" d="${d}"/>`
const foot = (d: string) => `<path class="ft" d="${d}"/>`
const cue = (d: string) => `<path class="cu" d="${d}"/>`
const bell = (x: number, y: number) => `<rect class="ld" x="${x}" y="${y}" width="18" height="10" rx="4.5"/>`
const bellSm = (x: number, y: number) => `<rect class="ld" x="${x}" y="${y}" width="14" height="8" rx="3.5"/>`

/* ── 네발기기 ────────────────────────────────────── */
const QUAD_BASE =
  far('M74 64 L78 88 L78 100') +
  head(34, 62) +
  limb('M43 64 L43 88 L43 100') +
  limb('M72 64 L76 88 L76 100')

/* ── 누움 (머리 왼쪽) ────────────────────────────── */
const SUPINE_HEAD = head(24, 86)

export const FIGURES: Record<string, Figure> = {
  /* ── A. 모빌리티 / 웜업 ─────────────────────────── */
  'cat-cow': {
    ground: G_FLOOR,
    a: QUAD_BASE + torso('M42 62 Q58 60 74 63'),
    b: QUAD_BASE + cue('M42 62 Q58 44 74 63'),
  },
  'thread-needle': {
    ground: G_FLOOR,
    a: QUAD_BASE + torso('M42 62 Q58 60 74 63') + limb('M46 64 L46 82'),
    b:
      far('M74 64 L78 88 L78 100') +
      head(36, 72) +
      torso('M44 70 Q58 62 74 63') +
      limb('M72 64 L76 88 L76 100') +
      cue('M46 72 L34 84 L22 90'),
  },
  // 반무릎 런지 — 뒷무릎이 바닥에 닿아 있어야 이 동작으로 읽힌다
  'hip-flexor': {
    ground: G_STAND,
    a:
      head(56, 34) +
      torso('M56 45 L54 72') +
      limb('M56 52 L46 64 L44 74') +
      limb('M54 72 L78 78 L78 106') +
      foot('M72 108 H92') +
      limb('M54 72 L38 92 L38 108') +
      foot('M34 108 H54'),
    b:
      head(50, 30) +
      cue('M50 41 L52 70') +
      limb('M50 48 L42 60 L42 70') +
      limb('M52 70 L80 76 L80 106') +
      foot('M74 108 H94') +
      limb('M52 70 L34 92 L34 108') +
      foot('M30 108 H50'),
  },
  'glute-bridge-warm': {
    ground: G_FLOOR,
    a:
      SUPINE_HEAD +
      torso('M34 90 L64 92') +
      limb('M64 92 L82 92 L84 98') +
      far('M64 94 L80 95 L82 98') +
      limb('M36 88 L46 96'),
    b:
      SUPINE_HEAD +
      cue('M34 90 L64 74') +
      limb('M64 74 L84 90 L84 98') +
      far('M64 76 L82 92 L82 98') +
      limb('M36 88 L46 96'),
  },
  'deep-squat-hold': {
    ground: G_STAND,
    a:
      far('M53 62 L60 85 L57 103') +
      head(54, 20) +
      torso('M54 31 L53 62') +
      limb('M53 62 L54 85 L52 103') +
      foot('M48 105 H63') +
      limb('M54 37 L44 50 L48 62'),
    b:
      far('M46 78 L68 88 L56 103') +
      head(60, 46) +
      torso('M58 57 L46 78') +
      cue('M46 78 L66 88 L52 103') +
      foot('M48 105 H63') +
      limb('M57 61 L48 72 L46 80'),
  },
  'wall-slide': {
    ground: G_WALL,
    a:
      head(36, 28) +
      torso('M34 39 L34 74') +
      limb('M34 46 L48 56 L46 70') +
      far('M34 48 L50 58 L48 72') +
      limb('M34 74 L36 92 L34 108') +
      foot('M30 110 H46'),
    b:
      head(36, 28) +
      torso('M34 39 L34 74') +
      cue('M34 46 L46 34 L44 20') +
      far('M34 48 L48 36 L46 22') +
      limb('M34 74 L36 92 L34 108') +
      foot('M30 110 H46'),
  },
  'neck-trap': {
    ground: G_STAND,
    a:
      head(60, 26) +
      torso('M60 37 L60 72') +
      limb('M60 44 L44 56 L42 72') +
      far('M60 44 L76 56 L78 72') +
      limb('M60 72 L54 92 L52 108') +
      far('M60 72 L68 92 L70 108') +
      foot('M46 110 H60') ,
    b:
      head(52, 30) +
      torso('M56 40 L60 72') +
      cue('M56 42 L72 34 L58 24') +
      far('M56 44 L76 56 L78 72') +
      limb('M60 72 L54 92 L52 108') +
      far('M60 72 L68 92 L70 108') +
      foot('M46 110 H60'),
  },
  'ankle-calf': {
    ground: G_STAND,
    a:
      far('M60 66 L64 88 L64 106') +
      head(58, 24) +
      torso('M58 35 L59 66') +
      limb('M59 66 L58 88 L58 106') +
      foot('M52 108 H68'),
    b:
      far('M60 60 L64 82 L64 98') +
      head(58, 18) +
      torso('M58 29 L59 60') +
      limb('M59 60 L58 82 L58 98') +
      cue('M54 100 L68 108'),
  },
  'stepper-warm': {
    ground: G_STAND,
    a:
      `<rect class="gr2" x="62" y="94" width="34" height="14" rx="3"/>` +
      far('M56 64 L62 86 L60 104') +
      head(54, 22) +
      torso('M54 33 L55 64') +
      limb('M55 64 L54 86 L52 106') +
      foot('M46 108 H60'),
    b:
      `<rect class="gr2" x="62" y="94" width="34" height="14" rx="3"/>` +
      far('M56 60 L62 82 L60 100') +
      head(54, 18) +
      torso('M54 29 L55 60') +
      cue('M55 60 L72 78 L74 92') +
      limb('M55 60 L50 82 L48 104'),
  },

  /* ── B. 코어 ──────────────────────────────────── */
  'dead-bug': {
    ground: G_FLOOR,
    a:
      far('M47 89 L47 76 L47 63') +
      far('M72 91 L72 77 L84 74') +
      SUPINE_HEAD +
      torso('M34 88 L70 91') +
      limb('M43 88 L43 74 L43 60') +
      limb('M68 90 L68 74 L81 71'),
    b:
      far('M47 89 L47 76 L47 63') +
      far('M72 91 L72 77 L84 74') +
      SUPINE_HEAD +
      torso('M34 88 L70 91') +
      cue('M43 88 L30 80 L16 77') +
      cue('M68 90 L86 84 L102 83'),
  },
  'bird-dog': {
    ground: G_FLOOR,
    a: QUAD_BASE + torso('M42 62 Q58 60 74 63'),
    b:
      far('M74 64 L78 88 L78 100') +
      head(34, 62) +
      torso('M42 62 Q58 60 74 63') +
      limb('M72 64 L76 88 L76 100') +
      cue('M43 64 L30 56 L16 52') +
      cue('M74 64 L90 58 L104 56'),
  },
  plank: {
    ground: G_FLOOR,
    a:
      head(24, 74) +
      torso('M33 78 L74 90') +
      limb('M36 80 L36 98') +
      far('M40 81 L40 98') +
      limb('M74 90 L86 98') +
      far('M74 92 L88 99'),
    b:
      head(24, 74) +
      cue('M33 78 L74 90') +
      limb('M36 80 L36 98') +
      far('M40 81 L40 98') +
      limb('M74 90 L86 98') +
      far('M74 92 L88 99'),
  },
  'side-plank': {
    ground: G_FLOOR,
    a:
      head(26, 68) +
      torso('M35 74 L76 88') +
      limb('M38 76 L34 98') +
      limb('M76 88 L62 98') +
      far('M76 90 L88 98'),
    b:
      head(26, 62) +
      cue('M35 68 L76 86') +
      limb('M38 70 L34 98') +
      limb('M76 86 L62 98') +
      far('M76 88 L88 98'),
  },
  'single-glute-bridge': {
    ground: G_FLOOR,
    a:
      SUPINE_HEAD +
      torso('M34 90 L64 92') +
      limb('M64 92 L82 92 L84 98') +
      far('M64 94 L78 88 L88 80') +
      limb('M36 88 L46 96'),
    b:
      SUPINE_HEAD +
      torso('M34 90 L64 74') +
      limb('M64 74 L84 90 L84 98') +
      cue('M64 76 L82 66 L96 60') +
      limb('M36 88 L46 96'),
  },
  'suitcase-hold': {
    ground: G_STAND,
    a:
      far('M60 66 L64 88 L64 106') +
      head(58, 24) +
      torso('M58 35 L59 66') +
      limb('M58 40 L72 56 L74 72') +
      limb('M59 66 L58 88 L58 106') +
      foot('M52 108 H68') +
      bellSm(67, 72),
    b:
      far('M60 66 L64 88 L64 106') +
      head(58, 24) +
      cue('M58 35 L59 66') +
      limb('M58 40 L74 56 L76 72') +
      limb('M59 66 L58 88 L58 106') +
      foot('M52 108 H68') +
      bellSm(69, 72),
  },
  'hollow-hold': {
    ground: G_FLOOR,
    a:
      SUPINE_HEAD +
      torso('M34 88 L68 92') +
      limb('M40 88 L40 74') +
      limb('M66 91 L70 76 L84 74'),
    b:
      head(28, 78) +
      cue('M37 82 L68 90') +
      limb('M42 82 L46 70') +
      limb('M66 89 L72 74 L86 72'),
  },

  /* ── C. 하체 ──────────────────────────────────── */
  'goblet-squat': {
    ground: G_STAND,
    a:
      far('M53 62 L60 85 L57 103') +
      head(54, 20) +
      torso('M54 31 L53 62') +
      limb('M53 62 L54 85 L52 103') +
      foot('M48 105 H63') +
      limb('M54 37 L44 50 L55 45') +
      bell(48, 38),
    b:
      far('M45 73 L70 88 L55 103') +
      head(61, 37) +
      torso('M59 48 L45 73') +
      limb('M45 73 L66 87 L51 103') +
      foot('M47 105 H62') +
      limb('M58 53 L47 65 L58 61') +
      bell(51, 54),
  },
  'chair-squat': {
    ground: G_STAND,
    a:
      `<path class="gr2" d="M76 78 V106 M76 78 H100 M100 78 V106"/>` +
      far('M53 62 L60 85 L57 103') +
      head(54, 20) +
      torso('M54 31 L53 62') +
      limb('M53 62 L54 85 L52 103') +
      foot('M48 105 H63') +
      limb('M54 37 L46 52 L48 66'),
    b:
      `<path class="gr2" d="M76 78 V106 M76 78 H100 M100 78 V106"/>` +
      far('M52 76 L70 88 L56 103') +
      head(60, 42) +
      torso('M58 53 L52 76') +
      cue('M52 76 L68 87 L52 103') +
      foot('M48 105 H63') +
      limb('M58 57 L48 68 L44 78'),
  },
  'split-squat': {
    ground: G_STAND,
    a:
      far('M58 64 L40 84 L38 104') +
      head(58, 22) +
      torso('M58 33 L58 64') +
      limb('M58 64 L74 84 L74 104') +
      foot('M68 106 H88') +
      limb('M58 64 L42 84 L38 104') +
      foot('M32 106 H48') +
      bellSm(72, 52) +
      bellSm(38, 52),
    b:
      far('M56 76 L40 90 L38 106') +
      head(56, 34) +
      torso('M56 45 L56 76') +
      limb('M56 76 L76 88 L74 106') +
      foot('M68 108 H88') +
      cue('M56 76 L42 92 L38 106') +
      foot('M32 108 H48') +
      bellSm(70, 64) +
      bellSm(36, 64),
  },
  'dumbbell-rdl': {
    ground: G_STAND,
    a:
      far('M56 64 L60 86 L58 104') +
      head(56, 22) +
      torso('M56 33 L56 64') +
      limb('M56 40 L54 58 L54 72') +
      limb('M56 64 L55 86 L54 104') +
      foot('M48 106 H64') +
      bell(45, 70),
    b:
      far('M42 66 L52 88 L52 104') +
      head(74, 46) +
      cue('M70 52 L42 66') +
      limb('M68 56 L64 72 L62 84') +
      limb('M42 66 L50 88 L52 104') +
      foot('M46 106 H62') +
      bell(53, 82),
  },
  'hip-thrust': {
    ground: G_FLOOR,
    a:
      SUPINE_HEAD +
      torso('M34 90 L64 92') +
      limb('M64 92 L82 92 L84 98') +
      far('M64 94 L80 95 L82 98') +
      limb('M40 88 L52 94') +
      bell(52, 84),
    b:
      SUPINE_HEAD +
      torso('M34 90 L64 74') +
      limb('M64 74 L84 90 L84 98') +
      far('M64 76 L82 92 L82 98') +
      limb('M40 88 L54 78') +
      bell(54, 66),
  },
  clamshell: {
    ground: G_FLOOR,
    a:
      head(24, 82) +
      torso('M34 86 L64 90') +
      limb('M64 90 L78 82 L92 88') +
      far('M64 92 L78 84 L92 90') +
      limb('M36 84 L48 88'),
    b:
      head(24, 82) +
      torso('M34 86 L64 90') +
      cue('M64 90 L76 72 L92 78') +
      far('M64 92 L78 84 L92 90') +
      limb('M36 84 L48 88'),
  },
  'side-leg-raise': {
    ground: G_FLOOR,
    a:
      head(24, 82) +
      torso('M34 86 L64 90') +
      limb('M64 90 L78 92 L94 94') +
      far('M64 92 L78 94 L94 96') +
      limb('M36 84 L48 88'),
    b:
      head(24, 82) +
      torso('M34 86 L64 90') +
      cue('M64 90 L78 76 L94 66') +
      far('M64 92 L78 94 L94 96') +
      limb('M36 84 L48 88'),
  },
  'wall-sit': {
    ground: G_WALL,
    a:
      head(36, 30) +
      torso('M34 41 L34 72') +
      limb('M34 48 L46 60 L44 72') +
      limb('M34 72 L36 92 L34 108') +
      foot('M30 110 H46'),
    b:
      head(36, 44) +
      torso('M34 55 L34 80') +
      cue('M34 80 L66 80 L66 108') +
      far('M34 82 L64 82 L64 108') +
      limb('M34 62 L48 72 L52 80') +
      foot('M60 110 H76'),
  },
  'calf-raise': {
    ground: G_STAND,
    a:
      far('M60 66 L64 88 L64 106') +
      head(58, 24) +
      torso('M58 35 L59 66') +
      limb('M58 40 L72 56 L74 72') +
      limb('M59 66 L58 88 L58 106') +
      foot('M52 108 H68') +
      bellSm(67, 72),
    b:
      far('M60 58 L64 80 L64 98') +
      head(58, 16) +
      torso('M58 27 L59 58') +
      limb('M58 32 L72 48 L74 64') +
      limb('M59 58 L58 80 L58 98') +
      cue('M54 100 L68 108') +
      bellSm(67, 64),
  },
  'step-up': {
    ground: G_STAND,
    a:
      `<rect class="gr2" x="66" y="92" width="34" height="16" rx="3"/>` +
      far('M54 64 L60 86 L58 104') +
      head(52, 22) +
      torso('M52 33 L53 64') +
      limb('M53 64 L52 86 L50 106') +
      foot('M44 108 H58') +
      cue('M53 64 L72 78 L74 90'),
    b:
      `<rect class="gr2" x="66" y="92" width="34" height="16" rx="3"/>` +
      far('M66 56 L72 74 L74 88') +
      head(66, 14) +
      torso('M66 25 L66 56') +
      cue('M66 56 L74 74 L76 90') +
      limb('M66 56 L56 76 L54 96'),
  },

  /* ── D. 상체 ──────────────────────────────────── */
  'one-arm-row': {
    ground: G_STAND,
    a:
      `<path class="gr2" d="M26 74 V106 M26 74 H50"/>` +
      far('M74 66 L74 88 L74 106') +
      head(40, 52) +
      torso('M49 58 L74 66') +
      limb('M50 60 L44 70 L40 78') +
      limb('M74 66 L72 88 L72 106') +
      foot('M66 108 H82') +
      limb('M56 60 L58 76 L58 88') +
      bell(50, 86),
    b:
      `<path class="gr2" d="M26 74 V106 M26 74 H50"/>` +
      far('M74 66 L74 88 L74 106') +
      head(40, 52) +
      torso('M49 58 L74 66') +
      limb('M50 60 L44 70 L40 78') +
      limb('M74 66 L72 88 L72 106') +
      foot('M66 108 H82') +
      cue('M56 60 L64 70 L58 62') +
      bell(50, 58),
  },
  'floor-press': {
    ground: G_FLOOR,
    a:
      SUPINE_HEAD +
      torso('M34 90 L66 92') +
      limb('M66 92 L82 92 L84 98') +
      far('M66 94 L80 94 L82 98') +
      limb('M40 88 L34 78 L46 76') +
      bell(36, 70),
    b:
      SUPINE_HEAD +
      torso('M34 90 L66 92') +
      limb('M66 92 L82 92 L84 98') +
      far('M66 94 L80 94 L82 98') +
      cue('M40 88 L40 72 L40 58') +
      bell(31, 50),
  },
  'shoulder-press': {
    ground: G_STAND,
    a:
      far('M60 66 L64 88 L64 106') +
      head(58, 26) +
      torso('M58 37 L59 66') +
      limb('M58 40 L44 48 L46 34') +
      far('M58 42 L72 50 L70 36') +
      limb('M59 66 L58 88 L58 106') +
      foot('M52 108 H68') +
      bell(38, 26) +
      bell(62, 26),
    b:
      far('M60 66 L64 88 L64 106') +
      head(58, 30) +
      torso('M58 41 L59 66') +
      cue('M58 42 L44 34 L44 16') +
      far('M58 44 L72 36 L72 18') +
      limb('M59 66 L58 88 L58 106') +
      foot('M52 108 H68') +
      bell(36, 8) +
      bell(64, 8),
  },
  'prone-ytw': {
    ground: G_FLOOR,
    a:
      head(24, 82) +
      torso('M33 88 L76 92') +
      limb('M38 88 L26 78 L14 70') +
      far('M38 91 L28 82 L18 74') +
      limb('M76 92 L88 96') +
      far('M76 94 L88 98'),
    b:
      head(24, 78) +
      torso('M33 84 L76 92') +
      cue('M38 84 L30 70 L20 58') +
      far('M38 87 L32 74 L24 62') +
      limb('M76 92 L88 96') +
      far('M76 94 L88 98'),
  },
  'incline-pushup': {
    ground: G_FLOOR,
    a:
      `<path class="gr2" d="M14 64 H46 M18 64 V100 M42 64 V100"/>` +
      head(30, 52) +
      torso('M39 58 L82 86') +
      limb('M40 58 L34 64') +
      far('M44 61 L38 66') +
      limb('M82 86 L92 98') +
      foot('M86 100 H100'),
    b:
      `<path class="gr2" d="M14 64 H46 M18 64 V100 M42 64 V100"/>` +
      head(34, 60) +
      cue('M42 64 L82 88') +
      limb('M43 64 L34 64') +
      far('M46 67 L38 67') +
      limb('M82 88 L92 98') +
      foot('M86 100 H100'),
  },
  'knee-pushup': {
    ground: G_FLOOR,
    a:
      head(24, 66) +
      torso('M33 72 L70 88') +
      limb('M36 74 L34 98') +
      far('M40 76 L38 98') +
      limb('M70 88 L86 96') +
      foot('M80 98 H96'),
    b:
      head(24, 78) +
      cue('M33 82 L70 90') +
      limb('M36 84 L34 98') +
      far('M40 85 L38 98') +
      limb('M70 90 L86 96') +
      foot('M80 98 H96'),
  },
  'arm-finisher': {
    ground: G_STAND,
    a:
      far('M60 66 L64 88 L64 106') +
      head(58, 24) +
      torso('M58 35 L59 66') +
      limb('M58 40 L52 56 L54 72') +
      far('M58 42 L66 58 L68 74') +
      limb('M59 66 L58 88 L58 106') +
      foot('M52 108 H68') +
      bellSm(47, 72),
    b:
      far('M60 66 L64 88 L64 106') +
      head(58, 24) +
      torso('M58 35 L59 66') +
      cue('M58 40 L50 54 L58 42') +
      far('M58 42 L66 58 L68 74') +
      limb('M59 66 L58 88 L58 106') +
      foot('M52 108 H68') +
      bellSm(51, 38),
  },

  /* ── E. 컨디셔닝 ──────────────────────────────── */
  'stepper-steady': {
    ground: G_STAND,
    a:
      `<rect class="gr2" x="62" y="94" width="34" height="14" rx="3"/>` +
      far('M56 64 L62 86 L60 104') +
      head(54, 22) +
      torso('M54 33 L55 64') +
      limb('M55 64 L54 86 L52 106') +
      foot('M46 108 H60'),
    b:
      `<rect class="gr2" x="62" y="94" width="34" height="14" rx="3"/>` +
      far('M56 60 L62 82 L60 100') +
      head(54, 18) +
      torso('M54 29 L55 60') +
      cue('M55 60 L72 78 L74 92') +
      limb('M55 60 L50 82 L48 104'),
  },
  'stepper-interval': {
    ground: G_STAND,
    a:
      `<rect class="gr2" x="62" y="94" width="34" height="14" rx="3"/>` +
      far('M56 64 L62 86 L60 104') +
      head(54, 22) +
      torso('M54 33 L55 64') +
      limb('M54 38 L44 50 L42 62') +
      limb('M55 64 L54 86 L52 106') +
      foot('M46 108 H60'),
    b:
      `<rect class="gr2" x="62" y="94" width="34" height="14" rx="3"/>` +
      far('M56 56 L62 78 L60 96') +
      head(54, 14) +
      torso('M54 25 L55 56') +
      cue('M54 30 L66 42 L68 54') +
      cue('M55 56 L74 74 L76 90') +
      limb('M55 56 L48 78 L46 100'),
  },
  'slide-step': {
    ground: G_STAND,
    a:
      far('M58 62 L44 84 L42 104') +
      head(58, 22) +
      torso('M58 33 L58 62') +
      limb('M58 40 L44 50 L42 62') +
      limb('M58 62 L74 84 L76 104') +
      foot('M70 106 H90') +
      limb('M58 62 L44 84 L40 104') +
      foot('M32 106 H48'),
    b:
      far('M58 66 L38 86 L34 104') +
      head(58, 26) +
      torso('M58 37 L58 66') +
      limb('M58 42 L42 52 L40 64') +
      cue('M58 66 L82 84 L88 104') +
      foot('M82 106 H102') +
      limb('M58 66 L38 86 L32 104') +
      foot('M24 106 H40'),
  },
  march: {
    ground: G_STAND,
    a:
      far('M58 64 L64 86 L64 104') +
      head(56, 22) +
      torso('M56 33 L57 64') +
      limb('M56 38 L44 50 L46 62') +
      limb('M57 64 L56 86 L54 106') +
      foot('M48 108 H64'),
    b:
      far('M58 64 L64 86 L64 104') +
      head(56, 22) +
      torso('M56 33 L57 64') +
      limb('M56 38 L68 50 L66 62') +
      cue('M57 64 L44 78 L46 92') +
      limb('M57 64 L62 86 L62 106'),
  },

  /* ── F. 쿨다운 ────────────────────────────────── */
  'child-pose': {
    ground: G_FLOOR,
    a:
      head(30, 74) +
      torso('M39 78 L70 90') +
      limb('M70 90 L78 96 L70 100') +
      far('M70 92 L80 97 L72 100') +
      limb('M40 78 L28 84 L16 88'),
    b:
      head(26, 84) +
      cue('M35 88 L70 92') +
      limb('M70 92 L78 96 L70 100') +
      far('M70 94 L80 97 L72 100') +
      limb('M34 88 L22 90 L12 92'),
  },
  'figure-four': {
    ground: G_FLOOR,
    a:
      SUPINE_HEAD +
      torso('M34 90 L64 92') +
      limb('M64 92 L80 86 L82 96') +
      far('M64 94 L82 94 L84 98') +
      limb('M38 88 L50 94'),
    b:
      SUPINE_HEAD +
      torso('M34 90 L64 88') +
      cue('M64 88 L74 72 L88 76') +
      far('M64 90 L78 80 L80 90') +
      limb('M38 88 L54 82'),
  },
  hamstring: {
    ground: G_FLOOR,
    a:
      SUPINE_HEAD +
      torso('M34 90 L66 92') +
      limb('M66 92 L84 92 L86 98') +
      far('M66 94 L82 95 L84 98') +
      limb('M38 88 L52 92'),
    b:
      SUPINE_HEAD +
      torso('M34 90 L66 92') +
      cue('M66 92 L74 74 L78 58') +
      far('M66 94 L82 95 L84 98') +
      limb('M38 88 L60 70'),
  },
  'thoracic-open': {
    ground: G_FLOOR,
    a:
      head(24, 82) +
      torso('M34 86 L64 90') +
      limb('M38 84 L56 80 L74 78') +
      far('M38 87 L56 83 L74 81') +
      limb('M64 90 L76 82 L90 86'),
    b:
      head(28, 86) +
      torso('M36 88 L64 90') +
      cue('M40 86 L34 70 L18 66') +
      far('M40 88 L56 84 L74 82') +
      limb('M64 90 L76 82 L90 86'),
  },
  breathing: {
    ground: G_FLOOR,
    a:
      SUPINE_HEAD +
      torso('M34 90 L70 92') +
      limb('M70 92 L86 92 L88 98') +
      far('M70 94 L86 94 L88 99') +
      limb('M38 88 L54 94'),
    b:
      SUPINE_HEAD +
      cue('M34 86 L70 88') +
      limb('M70 88 L86 90 L88 98') +
      far('M70 90 L86 92 L88 99') +
      limb('M38 84 L54 90'),
  },
}
