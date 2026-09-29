import { KAKAO_JS_KEY } from './config'

/**
 * 카카오 지도 SDK 로더.
 *
 * **앱이 뜰 때 부르지 않는다.** 기록에서 궤적을 펼칠 때만 부른다.
 * 시작할 때 불러버리면 오프라인에서 앱 전체가 지도를 기다리게 된다.
 *
 * 이 앱은 지도를 그리기만 하므로 `libraries=services`(장소검색)는 쓰지 않는다.
 */

declare global {
  interface Window {
    kakao?: KakaoNamespace
  }
}

// 이 앱이 쓰는 카카오 지도 객체들의 최소 타입
export interface KakaoLatLng {
  getLat(): number
  getLng(): number
}
export interface KakaoBounds {
  extend(ll: KakaoLatLng): void
  isEmpty(): boolean
}
export interface KakaoMapInstance {
  setBounds(bounds: KakaoBounds, ...padding: number[]): void
  relayout(): void
}
export interface KakaoOverlay {
  setMap(map: KakaoMapInstance | null): void
}

export interface KakaoNamespace {
  maps: {
    load(cb: () => void): void
    LatLng: new (lat: number, lng: number) => KakaoLatLng
    LatLngBounds: new () => KakaoBounds
    Map: new (
      container: HTMLElement,
      opts: { center: KakaoLatLng; level: number; draggable?: boolean; zoomable?: boolean },
    ) => KakaoMapInstance
    Polyline: new (opts: {
      path: KakaoLatLng[]
      strokeWeight?: number
      strokeColor?: string
      strokeOpacity?: number
      /** 'solid' | 'shortdash' | 'dash' 등 */
      strokeStyle?: string
      map?: KakaoMapInstance
    }) => KakaoOverlay
    CustomOverlay: new (opts: {
      position: KakaoLatLng
      content: HTMLElement | string
      yAnchor?: number
      xAnchor?: number
      zIndex?: number
      map?: KakaoMapInstance
    }) => KakaoOverlay
  }
}

let pending: Promise<KakaoNamespace> | null = null

// 카카오맵 SDK를 한 번만 불러온다. 실패하면 지도 없이 기록만 보여 준다
export function loadKakao(): Promise<KakaoNamespace> {
  if (window.kakao?.maps?.Map) return Promise.resolve(window.kakao)
  if (pending) return pending

  pending = new Promise<KakaoNamespace>((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src =
      'https://dapi.kakao.com/v2/maps/sdk.js' +
      `?appkey=${encodeURIComponent(KAKAO_JS_KEY)}&autoload=false`

    const timer = window.setTimeout(() => reject(new Error('KAKAO_TIMEOUT')), 12000)

    script.onload = () => {
      const kakao = window.kakao
      if (!kakao?.maps) {
        window.clearTimeout(timer)
        reject(new Error('KAKAO_NOT_AVAILABLE'))
        return
      }
      kakao.maps.load(() => {
        window.clearTimeout(timer)
        resolve(kakao)
      })
    }
    script.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error('KAKAO_SCRIPT_ERROR'))
    }
    document.head.appendChild(script)
  })

  // 실패한 로드는 캐시하지 않는다 — 네트워크가 돌아오면 다시 시도할 수 있게
  pending.catch(() => {
    pending = null
  })
  return pending
}
