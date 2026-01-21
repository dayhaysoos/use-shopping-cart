const FATHOM_RETRY_DELAY_MS = 250

type FathomClient = {
  trackEvent?: (name: string) => void
}

export function trackEvent(name: string): void {
  if (!import.meta.env.PROD) return
  if (typeof window === 'undefined') return

  const fathom = (window as typeof window & { fathom?: FathomClient }).fathom

  if (typeof fathom?.trackEvent === 'function') {
    fathom.trackEvent(name)
    return
  }

  window.setTimeout(() => {
    const retry = (window as typeof window & { fathom?: FathomClient }).fathom
    if (typeof retry?.trackEvent === 'function') {
      retry.trackEvent(name)
    }
  }, FATHOM_RETRY_DELAY_MS)
}
