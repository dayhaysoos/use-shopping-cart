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

  it('exposes new Stripe API modernization methods', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })

    // Verify all new methods are exposed
    expect(result.current.setCustomerEmail).toBeDefined()
    expect(result.current.toggleAutomaticTax).toBeDefined()
    expect(result.current.setCustomText).toBeDefined()
    expect(result.current.setCustomFields).toBeDefined()
    expect(result.current.setShippingOptions).toBeDefined()
    expect(result.current.setUIMode).toBeDefined()
    expect(result.current.togglePhoneCollection).toBeDefined()
    expect(result.current.togglePromotionCodes).toBeDefined()
    expect(result.current.toggleTermsOfService).toBeDefined()
    expect(result.current.setCreateSessionEndpoint).toBeDefined()
    expect(result.current.initEmbeddedCheckout).toBeDefined()
  })

  it('can use new Stripe configuration methods', () => {
    const { result } = renderHook(() => useShoppingCart(), { wrapper })

    act(() => {
      result.current.setCustomerEmail('test@example.com')
    })
    expect(result.current.customerEmail).toBe('test@example.com')

    act(() => {
      result.current.toggleAutomaticTax(true)
    })
    expect(result.current.automaticTax).toBe(true)

    act(() => {
      result.current.togglePhoneCollection(true)
    })
    expect(result.current.collectPhoneNumber).toBe(true)

    act(() => {
      result.current.togglePromotionCodes(true)
    })
    expect(result.current.allowPromotionCodes).toBe(true)

    act(() => {
      result.current.setUIMode('embedded')
    })
    expect(result.current.uiMode).toBe('embedded')

    act(() => {
      result.current.setCustomText({ submit: 'Complete Purchase' })
    })
    expect(result.current.customText).toEqual({ submit: 'Complete Purchase' })
  })
})
