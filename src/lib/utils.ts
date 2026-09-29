// Tailwind 클래스 합치기 도우미
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// 조건부 클래스들을 합치고 충돌하는 Tailwind 클래스는 뒤의 것으로 정리한다
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
