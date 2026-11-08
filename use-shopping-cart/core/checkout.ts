import { CartError } from './errors'

const checkoutUrlPattern = /^https?:\/\//i

export function redirectToCheckout(sessionUrl: string): void {
  const url = typeof sessionUrl === 'string' ? sessionUrl.trim() : ''
  if (!checkoutUrlPattern.test(url)) {
    throw new CartError(
      'INVALID_CHECKOUT_URL',
      'redirectToCheckout needs the Checkout Session URL (session.url). Session IDs are no longer supported.'
    )
  }

  if (typeof window === 'undefined') {
    throw new CartError(
      'NOT_IN_BROWSER',
      'Checkout redirects can only be initiated in the browser'
    )
  }

  window.location.assign(url)
}
