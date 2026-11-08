import { describe, it, expect, vi, afterEach } from 'vitest'
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

    act(() => {
      result.current.addItem({
        id: 'test',
        name: 'Test',
        price: 100,
        currency: 'USD'
      })
    })
    expect(result.current.cartCount).toBe(1)

    act(() => {
      result.current.incrementItem('test')
    })
    expect(result.current.cartCount).toBe(2)

    act(() => {
      result.current.decrementItem('test')
    })
    expect(result.current.cartCount).toBe(1)

    act(() => {
      result.current.setItemQuantity('test', 5)
    })
    expect(result.current.cartCount).toBe(5)

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

    afterEach(() => vi.restoreAllMocks())

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

    it('skips re-renders when isEqual says the selection is unchanged', () => {
      let renders = 0
      let actions: ReturnType<typeof useShoppingCart> | undefined

      function Totals() {
        renders++
        const totals = useShoppingCart(
          (cart) => ({ count: cart.cartCount }),
          (previous, next) => previous.count === next.count
        )
        return <span>{totals.count}</span>
      }
      function Actions() {
        actions = useShoppingCart()
        return null
      }

      render(
        <CartProvider shouldPersist={false}>
          <Totals />
          <Actions />
        </CartProvider>
      )
      expect(renders).toBe(1)

      act(() => actions!.handleCartClick())
      expect(renders).toBe(1)

      act(() => actions!.addItem(product))
      expect(renders).toBe(2)
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
    })

    it('shares a module-level selector between carts without re-render loops', () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
      const selectCount = (cart: ReturnType<typeof useShoppingCart>) => ({
        count: cart.cartCount
      })
      const seen: Record<string, number> = {}
      const adders: Record<string, (p: typeof product) => void> = {}

      function Count({ name }: { name: string }) {
        seen[name] = useShoppingCart(selectCount).count
        adders[name] = useShoppingCart((cart) => cart.addItem)
        return null
      }

      render(
        <>
          <CartProvider shouldPersist={false}>
            <Count name="left" />
          </CartProvider>
          <CartProvider shouldPersist={false}>
            <Count name="right" />
          </CartProvider>
        </>
      )

      act(() => adders.left(product))
      act(() => adders.right(product))
      act(() => adders.right(product))

      expect(seen).toEqual({ left: 1, right: 2 })
      expect(errors).not.toHaveBeenCalled()
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
