import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { CartProvider } from './CartProvider'
import { DebugCart } from './DebugCart'

describe('DebugCart', () => {
  function renderDebugCart() {
    return render(
      <CartProvider shouldPersist={false} currency="USD" language="en-US">
        <DebugCart data-testid="debug" />
      </CartProvider>
    )
  }

  it('lists cart state with primitive values inline', () => {
    renderDebugCart()

    expect(screen.getByText('cartCount')).toBeInTheDocument()
    expect(screen.getByText('formattedTotalPrice')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('offers object values via a log button', () => {
    renderDebugCart()

    const row = screen.getByText('cartDetails').closest('tr')!
    expect(row).toHaveTextContent('Log to console')
  })

  it('does not list the cart methods', () => {
    renderDebugCart()

    for (const method of ['addItem', 'redirectToCheckout', 'loadCart']) {
      expect(screen.queryByText(method)).not.toBeInTheDocument()
    }
    expect(screen.getByTestId('debug')).not.toHaveTextContent('=>')
    expect(screen.getByTestId('debug')).not.toHaveTextContent('function')
  })
})
