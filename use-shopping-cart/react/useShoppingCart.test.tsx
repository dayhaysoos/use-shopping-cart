import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { CartProvider } from './CartProvider'
import { useShoppingCart } from './useShoppingCart'

describe('useShoppingCart', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider shouldPersist={false}>{children}</CartProvider>
  )

  it('returns cart state and methods', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })

    expect(result.current).toHaveProperty('cartCount')
    expect(result.current).toHaveProperty('totalPrice')
    expect(result.current).toHaveProperty('cartDetails')
    expect(result.current).toHaveProperty('addItem')
    expect(result.current).toHaveProperty('removeItem')
    expect(result.current).toHaveProperty('clearCart')
  })

  it('updates when cart state changes', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })

    act(() => {
      result.current.addItem({
        id: 'test',
        name: 'Test',
        price: 100,
        currency: 'USD'
      })
    })

    expect(result.current.cartCount).toBe(1)
    expect(result.current.totalPrice).toBe(100)
    expect(result.current.cartDetails['test']).toBeDefined()
  })

  it('all cart methods work correctly', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })

    // addItem
    act(() => {
      result.current.addItem({
        id: 'test',
        name: 'Test',
        price: 100,
        currency: 'USD'
      })
    })
    expect(result.current.cartCount).toBe(1)

    // incrementItem
    act(() => {
      result.current.incrementItem('test')
    })
    expect(result.current.cartCount).toBe(2)

    // decrementItem
    act(() => {
      result.current.decrementItem('test')
    })
    expect(result.current.cartCount).toBe(1)

    // setItemQuantity
    act(() => {
      result.current.setItemQuantity('test', 5)
    })
    expect(result.current.cartCount).toBe(5)

    // removeItem
    act(() => {
      result.current.removeItem('test')
    })
    expect(result.current.cartCount).toBe(0)
  })

  it('handles UI methods', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })

    act(() => {
      result.current.handleCartClick()
    })
    expect(result.current.shouldDisplayCart).toBe(true)

    act(() => {
      result.current.handleCloseCart()
    })
    expect(result.current.shouldDisplayCart).toBe(false)

    act(() => {
      result.current.handleCartHover()
    })
    expect(result.current.shouldDisplayCart).toBe(true)
  })

  it('handles config methods', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })

    act(() => {
      result.current.changeStripeKey('pk_test_new')
    })
    expect(result.current.stripe).toBe('pk_test_new')

    act(() => {
      result.current.changeCurrency('EUR')
    })
    expect(result.current.currency).toBe('EUR')

    act(() => {
      result.current.changeLanguage('de-DE')
    })
    expect(result.current.language).toBe('de-DE')
  })
})
