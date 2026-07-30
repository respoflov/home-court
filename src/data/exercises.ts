import type { Exercise } from '@/lib/types'

/**
 * 기본 운동 36종. exercises_draft.md v2를 그대로 옮긴 것.
 * 점프·착지 동작은 애초에 넣지 않았고, 모든 동작에 소음 등급이 붙어 있다.
 */
const e = (x: Omit<Exercise, 'builtin'>): Exercise => ({ ...x, builtin: true })

export const BUILTIN_EXERCISES: Exercise[] = [
  // ── A. 모빌리티 / 웜업 ────────────────────────────────
  e({
    id: 'cat-cow', part: 'warmup', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 45,
    nameKo: '캣카우', nameEn: 'Cat-Cow',
    cueKo: '네발기기 자세로. 숨을 내쉬며 등을 둥글게, 마시며 천천히 젖힙니다.',
    cueEn: 'On all fours. Round your back as you exhale, arch gently as you inhale.',
  }),
  e({
    id: 'thread-needle', part: 'warmup', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 40, bilateral: true,
    nameKo: '흉추 회전', nameEn: 'Thread the Needle',
    cueKo: '네발기기에서 한 팔을 반대쪽 겨드랑이 아래로 길게 통과시킵니다.',
    cueEn: 'From all fours, thread one arm under the opposite armpit.',
  }),
  e({
    id: 'hip-flexor', part: 'warmup', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 45, bilateral: true,
    nameKo: '고관절 앞쪽 스트레치', nameEn: 'Hip Flexor Stretch',
    cueKo: '한 무릎을 대고 런지 자세. 엉덩이를 조여 앞쪽이 늘어나게 합니다.',
    cueEn: 'Half-kneeling lunge. Squeeze your glutes to open the front of the hip.',
  }),
  e({
    id: 'glute-bridge-warm', part: 'warmup', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 45,
    nameKo: '글루트 브릿지', nameEn: 'Glute Bridge',
    cueKo: '누워 무릎을 세우고 엉덩이만 들어올립니다. 허리로 젖히지 않습니다.',
    cueEn: 'Lie down, knees up, lift only your hips. Push with glutes, not your lower back.',
  }),
  e({
    id: 'deep-squat-hold', part: 'warmup', noise: 1, gear: ['none'], load: null, mode: 'time', amount: 40,
    nameKo: '딥 스쿼트 홀드', nameEn: 'Deep Squat Hold',
    cueKo: '발을 떼지 않고 앉을 수 있는 만큼 내려가 버팁니다. 힘들면 문틀을 잡으세요.',
    cueEn: 'Sink as low as you can with feet planted. Hold a doorframe if you need to.',
  }),
  e({
    id: 'wall-slide', part: 'warmup', noise: 1, gear: ['wall'], load: null, mode: 'time', amount: 40,
    nameKo: '월 슬라이드', nameEn: 'Wall Slide',
    cueKo: '등과 팔 뒤를 벽에 붙이고 팔을 천천히 올립니다. 허리가 뜨지 않는 범위까지.',
    cueEn: 'Back and arms on the wall, slide arms up slowly. Keep your lower back flat.',
  }),
  e({
    id: 'neck-trap', part: 'warmup', noise: 1, gear: ['none'], load: null, mode: 'time', amount: 30, bilateral: true,
    nameKo: '목·승모근 스트레치', nameEn: 'Neck & Trap Stretch',
    cueKo: '한 손으로 반대쪽 머리를 가볍게. 당기지 말고 손 무게만 얹습니다.',
    cueEn: 'Rest a hand on the opposite side of your head. Let its weight do the work.',
  }),
  e({
    id: 'ankle-calf', part: 'warmup', noise: 2, gear: ['none'], load: null, mode: 'time', amount: 40,
    nameKo: '발목 서클 + 카프 레이즈', nameEn: 'Ankle Circles + Calf Raise',
    cueKo: '발목을 크게 돌린 뒤, 발꿈치를 들고 소리 없이 천천히 내립니다.',
    cueEn: 'Circle your ankles, then raise your heels and lower them silently.',
  }),
  e({
    id: 'stepper-warm', part: 'warmup', noise: 2, gear: ['stepper'], load: null, mode: 'time', amount: 180,
    nameKo: '스텝퍼 저강도', nameEn: 'Easy Stepper',
    cueKo: '체온을 올리는 구간입니다. 숨이 살짝 빨라지는 정도까지만.',
    cueEn: 'Just to warm up. Only until your breathing picks up a little.',
  }),

  // ── B. 코어 ──────────────────────────────────────────
  e({
    id: 'dead-bug', part: 'core', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 40,
    nameKo: '데드버그', nameEn: 'Dead Bug',
    cueKo: '누워 팔다리를 들고 반대쪽 팔·다리를 천천히 뻗습니다. 허리가 뜨면 범위를 줄이세요.',
    cueEn: 'Lie back, limbs up. Extend opposite arm and leg slowly. Shorten the range if your back lifts.',
  }),
  e({
    id: 'bird-dog', part: 'core', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 40,
    nameKo: '버드독', nameEn: 'Bird Dog',
    cueKo: '네발기기에서 반대쪽 팔·다리를 뻗어 3초 버팁니다. 골반이 기울지 않게.',
    cueEn: 'From all fours, extend opposite arm and leg, hold 3 seconds. Keep hips level.',
  }),
  e({
    id: 'plank', part: 'core', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 30,
    nameKo: '플랭크', nameEn: 'Plank',
    cueKo: '무릎을 대고 시작해도 됩니다. 엉덩이가 처지거나 솟지 않게 일직선으로.',
    cueEn: 'Start on your knees if needed. Keep a straight line, hips neither sagging nor piking.',
  }),
  e({
    id: 'side-plank', part: 'core', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 25, bilateral: true,
    nameKo: '사이드 플랭크', nameEn: 'Side Plank',
    cueKo: '아래쪽 무릎을 접어 지지합니다. 골반을 위로 밀어 옆구리를 폅니다.',
    cueEn: 'Bend the bottom knee for support. Push your hips up to lengthen your side.',
  }),
  e({
    id: 'single-glute-bridge', part: 'core', noise: 1, gear: ['mat'], load: null, mode: 'reps', amount: 10, bilateral: true,
    nameKo: '한 다리 글루트 브릿지', nameEn: 'Single-Leg Glute Bridge',
    cueKo: '한 발을 들고 브릿지. 골반이 한쪽으로 떨어지지 않게 버팁니다.',
    cueEn: 'Bridge with one foot lifted. Do not let your hips drop to one side.',
  }),
  e({
    id: 'suitcase-hold', part: 'core', noise: 1, gear: ['dumbbell'], load: 'torso', mode: 'time', amount: 30, bilateral: true,
    nameKo: '수트케이스 홀드', nameEn: 'Suitcase Hold',
    cueKo: '한 손에만 덤벨을 들고 섭니다. 몸이 그쪽으로 기울지 않게 버팁니다.',
    cueEn: 'Hold a dumbbell in one hand and stand tall. Resist leaning toward it.',
  }),
  e({
    id: 'hollow-hold', part: 'core', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 25,
    nameKo: '할로우 홀드', nameEn: 'Hollow Hold',
    cueKo: '무릎을 접은 채 어깨와 발을 살짝 듭니다. 허리가 뜨면 무릎을 더 접으세요.',
    cueEn: 'Knees bent, lift shoulders and feet slightly. Bend more if your back lifts.',
  }),

  // ── C. 하체 / 둔근 ───────────────────────────────────
  e({
    id: 'goblet-squat', part: 'lower', noise: 2, gear: ['dumbbell'], load: 'leg', mode: 'reps', amount: 10,
    nameKo: '고블릿 스쿼트', nameEn: 'Goblet Squat',
    cueKo: '덤벨을 가슴 앞에 두 손으로 안고, 무릎보다 엉덩이를 먼저 뒤로 보냅니다.',
    cueEn: 'Hold the dumbbell at your chest. Hips back before knees bend.',
  }),
  e({
    id: 'chair-squat', part: 'lower', noise: 2, gear: ['chair'], load: null, mode: 'reps', amount: 12,
    nameKo: '체어 스쿼트', nameEn: 'Chair Squat',
    cueKo: '의자에 살짝 닿았다가 일어납니다. 엉덩이를 먼저 뒤로.',
    cueEn: 'Touch the chair lightly, then stand. Hips back first.',
  }),
  e({
    id: 'split-squat', part: 'lower', noise: 2, gear: ['dumbbell'], load: 'leg', mode: 'reps', amount: 8, bilateral: true,
    nameKo: '스플릿 스쿼트', nameEn: 'Split Squat',
    cueKo: '발을 앞뒤로 벌린 채 위치를 바꾸지 않고 위아래로 움직입니다.',
    cueEn: 'Feet staggered, move straight up and down without stepping.',
  }),
  e({
    id: 'dumbbell-rdl', part: 'lower', noise: 2, gear: ['dumbbell'], load: 'leg', mode: 'reps', amount: 10,
    nameKo: '덤벨 RDL', nameEn: 'Dumbbell RDL',
    cueKo: '무릎을 살짝 굽힌 채 엉덩이를 뒤로 밀며 내립니다. 허리로 숙이는 게 아니라 고관절로 접습니다.',
    cueEn: 'Soft knees, push hips back as you lower. Hinge at the hips, not the spine.',
  }),
  e({
    id: 'hip-thrust', part: 'lower', noise: 1, gear: ['dumbbell', 'mat'], load: 'leg', mode: 'reps', amount: 12,
    nameKo: '덤벨 힙 스러스트', nameEn: 'Dumbbell Hip Thrust',
    cueKo: '브릿지 자세에서 골반 위에 덤벨을 얹습니다. 수건을 대면 덜 아픕니다.',
    cueEn: 'In the bridge position, rest a dumbbell on your hips. A towel makes it comfier.',
  }),
  e({
    id: 'clamshell', part: 'lower', noise: 1, gear: ['mat'], load: null, mode: 'reps', amount: 12, bilateral: true,
    nameKo: '클램쉘', nameEn: 'Clamshell',
    cueKo: '옆으로 누워 발은 붙인 채 위쪽 무릎만 벌립니다.',
    cueEn: 'Lie on your side, feet together, open only the top knee.',
  }),
  e({
    id: 'side-leg-raise', part: 'lower', noise: 1, gear: ['mat'], load: null, mode: 'reps', amount: 12, bilateral: true,
    nameKo: '사이드 레그 레이즈', nameEn: 'Side-Lying Leg Raise',
    cueKo: '옆으로 누워 위쪽 다리를 천천히 듭니다. 몸이 앞으로 말리지 않게.',
    cueEn: 'On your side, lift the top leg slowly. Do not let your torso roll forward.',
  }),
  e({
    id: 'wall-sit', part: 'lower', noise: 1, gear: ['wall'], load: null, mode: 'time', amount: 30,
    nameKo: '월 싯', nameEn: 'Wall Sit',
    cueKo: '벽에 등을 대고 무릎을 90도로 만들어 버팁니다.',
    cueEn: 'Back on the wall, knees at 90 degrees, hold.',
  }),
  e({
    id: 'calf-raise', part: 'lower', noise: 2, gear: ['dumbbell'], load: 'torso', mode: 'reps', amount: 15,
    nameKo: '카프 레이즈', nameEn: 'Calf Raise',
    cueKo: '발꿈치를 들고, 내릴 때 소리 없이 천천히 내립니다.',
    cueEn: 'Rise onto your toes, then lower silently and slowly.',
  }),
  e({
    id: 'step-up', part: 'lower', noise: 3, gear: ['stepper'], load: null, mode: 'reps', amount: 12, bilateral: true,
    nameKo: '스텝업', nameEn: 'Step-Up',
    cueKo: '스텝퍼에 한 발씩 올라섰다 내려옵니다. 쿵 소리가 나면 더 천천히.',
    cueEn: 'Step up and down one foot at a time. If you hear a thud, slow down.',
  }),

  // ── D. 상체 / 등 ─────────────────────────────────────
  e({
    id: 'one-arm-row', part: 'upper', noise: 1, gear: ['dumbbell', 'chair'], load: 'torso', mode: 'reps', amount: 10, bilateral: true,
    nameKo: '덤벨 원암 로우', nameEn: 'One-Arm Row',
    cueKo: '한 손으로 의자를 짚고 상체를 숙입니다. 팔이 아니라 등으로 팔꿈치를 뒤로 당깁니다.',
    cueEn: 'Brace on a chair and hinge forward. Pull the elbow back with your back, not your arm.',
  }),
  e({
    id: 'floor-press', part: 'upper', noise: 1, gear: ['dumbbell', 'mat'], load: 'torso', mode: 'reps', amount: 10,
    nameKo: '덤벨 플로어 프레스', nameEn: 'Dumbbell Floor Press',
    cueKo: '누워서 밉니다. 팔꿈치가 바닥에서 멈춰 어깨가 과하게 젖혀지지 않습니다.',
    cueEn: 'Press while lying down. The floor stops your elbows, so your shoulders stay safe.',
  }),
  e({
    id: 'shoulder-press', part: 'upper', noise: 2, gear: ['dumbbell'], load: 'arm', mode: 'reps', amount: 12,
    nameKo: '덤벨 숄더 프레스', nameEn: 'Dumbbell Shoulder Press',
    cueKo: '앉거나 서서 머리 위로 밉니다. 허리를 젖혀 밀지 않습니다.',
    cueEn: 'Press overhead seated or standing. Do not arch your back to push.',
  }),
  e({
    id: 'prone-ytw', part: 'upper', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 40,
    nameKo: '프론 Y-T-W', nameEn: 'Prone Y-T-W',
    cueKo: '엎드려 팔로 Y, T, W 모양을 차례로 만듭니다. 등 뒤쪽을 깨우는 동작입니다.',
    cueEn: 'Face down, form Y, T, then W with your arms. Wakes up your upper back.',
  }),
  e({
    id: 'incline-pushup', part: 'upper', noise: 2, gear: ['chair'], load: null, mode: 'reps', amount: 10,
    nameKo: '인클라인 푸시업', nameEn: 'Incline Push-Up',
    cueKo: '손을 소파나 책상에 올리고 푸시업합니다. 높을수록 쉬워집니다.',
    cueEn: 'Hands on a sofa or desk. The higher the surface, the easier it gets.',
  }),
  e({
    id: 'knee-pushup', part: 'upper', noise: 1, gear: ['mat'], load: null, mode: 'reps', amount: 10,
    nameKo: '니 푸시업', nameEn: 'Knee Push-Up',
    cueKo: '무릎을 대고 합니다. 허리가 꺾이지 않게 몸통을 한 덩어리로.',
    cueEn: 'On your knees. Keep your torso in one piece so your back does not sag.',
  }),
  e({
    id: 'arm-finisher', part: 'upper', noise: 1, gear: ['dumbbell'], load: 'arm', mode: 'reps', amount: 12,
    nameKo: '덤벨 컬 · 트라이셉스', nameEn: 'Curl & Triceps',
    cueKo: '팔 보조 운동입니다. 시간이 남을 때만 하세요.',
    cueEn: 'Arm accessory work. Only if you have time left.',
  }),

  // ── E. 컨디셔닝 ──────────────────────────────────────
  e({
    id: 'stepper-steady', part: 'cardio', noise: 2, gear: ['stepper'], load: null, mode: 'time', amount: 300,
    nameKo: '스텝퍼 일정 페이스', nameEn: 'Steady Stepper',
    cueKo: '대화가 겨우 되는 정도의 숨으로 유지합니다.',
    cueEn: 'Keep a pace where talking is just barely possible.',
  }),
  e({
    id: 'stepper-interval', part: 'cardio', noise: 2, gear: ['stepper'], load: null, mode: 'time', amount: 480,
    nameKo: '스텝퍼 인터벌', nameEn: 'Stepper Intervals',
    cueKo: '빠르게 40초, 천천히 80초를 반복합니다. 체력이 가장 빨리 붙는 구간입니다.',
    cueEn: 'Fast for 40 seconds, easy for 80. This is where conditioning builds fastest.',
  }),
  e({
    id: 'slide-step', part: 'cardio', noise: 2, gear: ['mat'], load: null, mode: 'time', amount: 60,
    nameKo: '슬라이드 스텝', nameEn: 'Slide Step',
    cueKo: '농구 수비 스텝처럼 낮은 자세로 좌우로 움직입니다. 발을 끌듯이 움직이면 소리가 나지 않습니다.',
    cueEn: 'Shuffle side to side in a low stance. Slide your feet and it stays silent.',
  }),
  e({
    id: 'march', part: 'cardio', noise: 3, gear: ['mat'], load: null, mode: 'time', amount: 90,
    nameKo: '제자리 걷기', nameEn: 'Marching in Place',
    cueKo: '매트 위에서 발을 낮게, 발바닥 전체로 부드럽게 딛습니다.',
    cueEn: 'Stay on the mat, keep steps low, land through the whole foot.',
  }),

  // ── F. 쿨다운 ────────────────────────────────────────
  e({
    id: 'child-pose', part: 'cooldown', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 40,
    nameKo: '차일드 포즈', nameEn: "Child's Pose",
    cueKo: '무릎을 벌리고 앉아 팔을 앞으로 뻗습니다. 등과 골반 뒤쪽이 펴집니다.',
    cueEn: 'Knees wide, sit back and reach forward. Opens your back and hips.',
  }),
  e({
    id: 'figure-four', part: 'cooldown', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 35, bilateral: true,
    nameKo: '피겨4 스트레치', nameEn: 'Figure-Four Stretch',
    cueKo: '누워서 발목을 반대쪽 무릎에 걸고 다리를 당깁니다.',
    cueEn: 'Lying down, cross an ankle over the opposite knee and pull the leg in.',
  }),
  e({
    id: 'hamstring', part: 'cooldown', noise: 1, gear: ['towel'], load: null, mode: 'time', amount: 35, bilateral: true,
    nameKo: '햄스트링 스트레치', nameEn: 'Hamstring Stretch',
    cueKo: '누워 발에 수건을 걸고 다리를 천천히 세웁니다.',
    cueEn: 'Loop a towel around your foot and raise the leg slowly.',
  }),
  e({
    id: 'thoracic-open', part: 'cooldown', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 35, bilateral: true,
    nameKo: '흉추 오픈', nameEn: 'Thoracic Opener',
    cueKo: '옆으로 누워 위쪽 팔을 반대편으로 열어 가슴을 폅니다.',
    cueEn: 'On your side, open the top arm across to stretch your chest.',
  }),
  e({
    id: 'breathing', part: 'cooldown', noise: 1, gear: ['mat'], load: null, mode: 'time', amount: 50,
    nameKo: '호흡 정리', nameEn: 'Breathing',
    cueKo: '누워서 4초 마시고 6초 내쉬기를 반복합니다.',
    cueEn: 'Lie back. Inhale for four, exhale for six.',
  }),
]

export const EXERCISE_BY_ID = new Map(BUILTIN_EXERCISES.map((x) => [x.id, x]))
