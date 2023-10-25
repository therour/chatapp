import clsx, { ClassValue } from 'clsx'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))

export const useIsScrollingRef = (timeout: number = 50) => {
  const isScrollingRef = useRef(false)
  useEffect(() => {
    let scrollHandlerTimeoutId: NodeJS.Timeout | undefined = undefined
    const handler = () => {
      clearTimeout(scrollHandlerTimeoutId)
      isScrollingRef.current = true
      scrollHandlerTimeoutId = setTimeout(() => {
        isScrollingRef.current = false
      }, timeout)
    }

    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [timeout])

  return isScrollingRef
}
