import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Bug #122: Initial state is undefined (not false) to avoid hydration mismatch.
// The `!!undefined` coercion returns false on SSR which can cause layout shift
// if user is on mobile. Consumers needing to differentiate SSR from desktop
// should use useIsMobileRaw() instead.
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
