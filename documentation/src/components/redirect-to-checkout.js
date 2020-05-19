import React, { useState } from 'react'
import { Link } from 'gatsby'
import { useShoppingCart } from 'use-shopping-cart'

export function RedirectToCheckout() {
  const [status, setStatus] = useState('idle')
  const { redirectToCheckout, cartCount } = useShoppingCart()

  async function handleClick(event) {
    event.preventDefault()

    if (cartCount > 0) {
      setStatus('idle')
      const error = await redirectToCheckout()
      if (error) setStatus('redirect-error')
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
      {status === 'missing-items' && (
        <p>
          Your cart is empty. Please go to{' '}
          <Link to={'/usage/addItem()'}>addItem()</Link> and add an item to the
          cart
        </p>
      )}

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
