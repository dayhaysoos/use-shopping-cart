import React, { useState } from 'react'
import { useShoppingCart } from 'use-shopping-cart'
import { AddMoreItems } from './utilities'

export function RedirectToCheckout() {
  const [status, setStatus] = useState('idle')
  const { redirectToCheckout, cartCount } = useShoppingCart()

  async function handleClick(event) {
    event.preventDefault()

    if (cartCount > 0) {
      setStatus('idle')
      try {
        const result = await redirectToCheckout()
        if (result?.error) {
          console.error(result)
          setStatus('redirect-error')
        }
      } catch (error) {
        console.error(error)
        setStatus('redirect-error')
      }
    } else {
      setStatus('missing-items')
    }
  }

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%'
      }}
    >
      {status === 'missing-items' && <AddMoreItems />}

      {status === 'redirect-error' && (
        <p>Unable to redirect to Stripe checkout page.</p>
      )}

      <button
        onClick={handleClick}
        style={{ height: 50, width: 100, marginBottom: 30 }}
      >
        Checkout
      </button>
    </article>
  )
}

export default RedirectToCheckout
