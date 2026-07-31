/**
 * 카카오 JavaScript 앱 키.
 *
 * 이 키는 브라우저에 노출되는 것이 정상이며, 카카오 개발자 콘솔의
 * "JavaScript SDK 도메인"에 등록된 출처에서만 동작한다.
 * (REST API 키·네이티브 앱 키는 여기에 쓰지 않는다.)
 *
 * 등록되어야 하는 오리진 — 경로는 빼고 오리진만 등록한다:
 *   - https://respoflov.github.io   (배포)
 *   - http://localhost:5173         (로컬 개발)
 *
 * **지금 값은 07번 "내 손안의 작은 부산"의 키다.** 08번 배포 주소가
 * 같은 오리진(`https://respoflov.github.io`)이라 그대로 동작할 것으로 보고 넣어뒀다.
 * 두 앱이 키 하나를 나눠 쓰는 셈이므로, 카카오 콘솔에서 홈코트용 앱을 따로 만들면
 * 여기만 바꾸면 된다. `.env`에 `VITE_KAKAO_JS_KEY`를 두면 그쪽이 우선한다.
 */
export const KAKAO_JS_KEY =
  import.meta.env.VITE_KAKAO_JS_KEY ?? '83f95bdb280c5909a7cf77ec844ad78e'
