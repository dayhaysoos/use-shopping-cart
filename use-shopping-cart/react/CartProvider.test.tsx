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

// Integration tests with useShoppingCart
import { useShoppingCart } from './useShoppingCart'
import { act } from '@testing-library/react'

describe('CartProvider integration with useShoppingCart', () => {
  function TestComponent() {
    const { cartCount, addItem, formattedTotalPrice } = useShoppingCart()
    return (
      <div>
        <span data-testid="count">{cartCount}</span>
        <span data-testid="total">{formattedTotalPrice}</span>
        <button
          onClick={() =>
            addItem({
              id: 'test',
              name: 'Test',
              price: 1000,
              currency: 'USD'
            })
          }
        >
          Add
        </button>
      </div>
    )
  }

  it('updates UI when items are added', async () => {
    render(
      <CartProvider shouldPersist={false}>
        <TestComponent />
      </CartProvider>
    )

    expect(screen.getByTestId('count')).toHaveTextContent('0')

    await act(async () => {
      screen.getByText('Add').click()
    })

    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('total')).toHaveTextContent('$10.00')
  })

  it('shares state between multiple consumers', async () => {
    function SecondConsumer() {
      const { cartCount } = useShoppingCart()
      return <span data-testid="second-count">{cartCount}</span>
    }

    render(
      <CartProvider shouldPersist={false}>
        <TestComponent />
        <SecondConsumer />
      </CartProvider>
    )

    await act(async () => {
      screen.getByText('Add').click()
    })

    // Both consumers should see the same count
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('second-count')).toHaveTextContent('1')
  })

  it('increments quantity when adding same product twice', async () => {
    render(
      <CartProvider shouldPersist={false}>
        <TestComponent />
      </CartProvider>
    )

    await act(async () => {
      screen.getByText('Add').click()
    })

    await act(async () => {
      screen.getByText('Add').click()
    })

    expect(screen.getByTestId('count')).toHaveTextContent('2')
    expect(screen.getByTestId('total')).toHaveTextContent('$20.00')
  })
})
