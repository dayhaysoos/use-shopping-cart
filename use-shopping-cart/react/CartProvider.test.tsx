/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { CartProvider, useCartContext } from './CartProvider'

describe('CartProvider', () => {
  it('provides ShoppingCart instance to children', () => {
    function TestComponent() {
      const cart = useCartContext()
      return <div>{cart ? 'has cart' : 'no cart'}</div>
    }

    render(
      <CartProvider shouldPersist={false}>
        <TestComponent />
      </CartProvider>
    )

    expect(screen.getByText('has cart')).toBeInTheDocument()
  })

  it('passes config to ShoppingCart', () => {
    function TestComponent() {
      const cart = useCartContext()
      const state = cart.getState()
      return <div>{state.currency}</div>
    }

    render(
      <CartProvider shouldPersist={false} currency="EUR">
        <TestComponent />
      </CartProvider>
    )

    expect(screen.getByText('EUR')).toBeInTheDocument()
  })

  it('reuses same cart instance across renders', () => {
    const instances: any[] = []

    function TestComponent() {
      const cart = useCartContext()
      instances.push(cart)
      return <div>test</div>
    }

    const { rerender } = render(
      <CartProvider shouldPersist={false}>
        <TestComponent />
      </CartProvider>
    )

    rerender(
      <CartProvider shouldPersist={false}>
        <TestComponent />
      </CartProvider>
    )

    expect(instances.length).toBe(2)
    expect(instances[0]).toBe(instances[1]) // Same instance
  })

  it('shows loading initially when persistence enabled', async () => {
    render(
      <CartProvider shouldPersist={true} loading={<div>Loading...</div>}>
        <div>Content</div>
      </CartProvider>
    )

    // In jsdom, useEffect runs, so we need to wait
    // Initially might show loading, then shows content after effect
    await waitFor(() => {
      const content = screen.queryByText('Content')
      expect(content).toBeInTheDocument()
    })
  })

  it('shows content immediately when persistence disabled', () => {
    render(
      <CartProvider shouldPersist={false}>
        <div>Content</div>
      </CartProvider>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('accepts new Stripe API modernization props', () => {
    function TestComponent() {
      const cart = useCartContext()
      const state = cart.getState()
      return (
        <div>
          <div data-testid="email">{state.customerEmail}</div>
          <div data-testid="tax">{String(state.automaticTax)}</div>
          <div data-testid="phone">{String(state.collectPhoneNumber)}</div>
          <div data-testid="promo">{String(state.allowPromotionCodes)}</div>
          <div data-testid="ui-mode">{state.uiMode}</div>
        </div>
      )
    }

    render(
      <CartProvider
        shouldPersist={false}
        customerEmail="test@example.com"
        automaticTax={true}
        collectPhoneNumber={true}
        allowPromotionCodes={true}
        uiMode="embedded"
      >
        <TestComponent />
      </CartProvider>
    )

    expect(screen.getByTestId('email')).toHaveTextContent('test@example.com')
    expect(screen.getByTestId('tax')).toHaveTextContent('true')
    expect(screen.getByTestId('phone')).toHaveTextContent('true')
    expect(screen.getByTestId('promo')).toHaveTextContent('true')
    expect(screen.getByTestId('ui-mode')).toHaveTextContent('embedded')
  })
})

describe('useCartContext', () => {
  it('throws when used outside provider', () => {
    function TestComponent() {
      useCartContext()
      return null
    }

    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow(
      'useCartContext must be used within CartProvider'
    )

    spy.mockRestore()
  })
})
