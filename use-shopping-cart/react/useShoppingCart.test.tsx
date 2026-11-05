import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { renderHook, act, render } from '@testing-library/react'
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

  describe('with a selector', () => {
    const product = { id: 'a', name: 'A', price: 100, currency: 'USD' }

    it('returns the selected value', () => {
      const { result } = renderHook(
        () => ({
          count: useShoppingCart((cart) => cart.cartCount),
          addItem: useShoppingCart((cart) => cart.addItem)
        }),
        { wrapper }
      )

      act(() => result.current.addItem(product))

      expect(result.current.count).toBe(1)
    })

    it('re-renders only when the selected value changes', () => {
      let countRenders = 0
      let actions: ReturnType<typeof useShoppingCart> | undefined

      function Count() {
        countRenders++
        const count = useShoppingCart((cart) => cart.cartCount)
        return <span>{count}</span>
      }
      function Actions() {
        actions = useShoppingCart()
        return null
      }

      render(
        <CartProvider shouldPersist={false}>
          <Count />
          <Actions />
        </CartProvider>
      )
      expect(countRenders).toBe(1)

      act(() => actions!.handleCartClick())
      act(() => actions!.storeLastClicked('a'))
      expect(countRenders).toBe(1)

      act(() => actions!.addItem(product))
      expect(countRenders).toBe(2)
    })

    it('handles a selector that returns a new object', () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(
        () => ({
          picked: useShoppingCart((cart) => ({ count: cart.cartCount })),
          addItem: useShoppingCart((cart) => cart.addItem)
        }),
        { wrapper }
      )

      act(() => result.current.addItem(product))

      expect(result.current.picked).toEqual({ count: 1 })
      expect(errors).not.toHaveBeenCalled()
      errors.mockRestore()
    })

    it('does not re-render a component that only selects actions', () => {
      let renders = 0
      let addItem: ((p: typeof product) => void) | undefined

      function AddButton() {
        renders++
        addItem = useShoppingCart((cart) => cart.addItem)
        return null
      }

      render(
        <CartProvider shouldPersist={false}>
          <AddButton />
        </CartProvider>
      )

      act(() => addItem!(product))
      act(() => addItem!(product))
      expect(renders).toBe(1)
    })
  })
})
