import { describe, it, expect, vi } from 'vitest'
import React, { act } from 'react'
import { render } from '@testing-library/react'
import { CartProvider } from './CartProvider'
import { useOptimisticCart, type CartChange } from './useOptimisticCart'
import { useShoppingCart } from './useShoppingCart'

const product = { id: 'a', name: 'A', price: 100, currency: 'USD' }

type Frame = { shown: number; real: number; optimistic: boolean }

function deferred() {
  let resolve!: () => void
  let reject!: (error: unknown) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function setup(onChange?: (change: CartChange) => Promise<void>) {
  const frames: Frame[] = []
  const api = {} as { current: ReturnType<typeof useOptimisticCart> }

  function Probe() {
    api.current = useOptimisticCart(onChange ? { onChange } : undefined)
    const real = useShoppingCart((cart) => cart.cartCount)
    frames.push({
      shown: api.current.cartCount,
      real,
      optimistic: api.current.isOptimistic
    })
    return null
  }

  render(
    <CartProvider shouldPersist={false} currency="USD" language="en-US">
      <Probe />
    </CartProvider>
  )
  return { frames, api, last: () => frames[frames.length - 1] }
}

describe('useOptimisticCart without onChange', () => {
  it('never shows a change twice', async () => {
    const { frames, api } = setup()

    await act(async () => api.current.addItem(product))
    await act(async () => api.current.incrementItem('a'))

    expect(frames.every((f) => f.shown === f.real)).toBe(true)
    expect(frames[frames.length - 1].real).toBe(2)
  })
})

describe('useOptimisticCart with onChange', () => {
  it('shows the change while onChange is pending, then applies it to the cart', async () => {
    const pending = deferred()
    const onChange = vi.fn(() => pending.promise)
    const { frames, api, last } = setup(onChange)

    await act(async () => api.current.addItem(product, { count: 2 }))

    expect(last()).toEqual({ shown: 2, real: 0, optimistic: true })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'add', count: 2 })
    )

    await act(async () => pending.resolve())

    expect(last()).toEqual({ shown: 2, real: 2, optimistic: false })
    expect(frames.every((f) => f.shown <= 2)).toBe(true)
  })

  it.each([
    [
      'removeItem',
      (api: ReturnType<typeof useOptimisticCart>) => api.removeItem('a')
    ],
    [
      'clearCart',
      (api: ReturnType<typeof useOptimisticCart>) => api.clearCart()
    ],
    [
      'decrementItem to zero',
      (api: ReturnType<typeof useOptimisticCart>) => api.decrementItem('a')
    ]
  ])('is optimistic while %s is pending', async (_name, change) => {
    const calls: Array<ReturnType<typeof deferred>> = []
    const { api, last } = setup(() => {
      const d = deferred()
      calls.push(d)
      return d.promise
    })

    await act(async () => api.current.addItem(product))
    await act(async () => calls[0].resolve())
    expect(last()).toEqual({ shown: 1, real: 1, optimistic: false })

    await act(async () => change(api.current))
    expect(last()).toEqual({ shown: 0, real: 1, optimistic: true })

    await act(async () => calls[1].resolve())
    expect(last()).toEqual({ shown: 0, real: 0, optimistic: false })
  })

  it('rolls back and reports the error when onChange rejects', async () => {
    const pending = deferred()
    const { api, last } = setup(() => pending.promise)
    const failure = new Error('server said no')

    await act(async () => api.current.addItem(product))
    expect(last().shown).toBe(1)

    await act(async () => pending.reject(failure))

    expect(last()).toEqual({ shown: 0, real: 0, optimistic: false })
    expect(api.current.error).toBe(failure)
  })

  it('runs changes one after another, in order', async () => {
    const calls: Array<ReturnType<typeof deferred>> = []
    const onChange = vi.fn(() => {
      const d = deferred()
      calls.push(d)
      return d.promise
    })
    const { api, last } = setup(onChange)

    await act(async () => {
      api.current.addItem(product)
      api.current.incrementItem('a')
      api.current.incrementItem('a')
    })

    expect(last().shown).toBe(3)
    expect(onChange).toHaveBeenCalledTimes(1)

    await act(async () => calls[0].resolve())
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(last().real).toBe(1)

    await act(async () => calls[1].resolve())
    await act(async () => calls[2].resolve())

    expect(onChange.mock.calls.map(([change]) => change.type)).toEqual([
      'add',
      'adjust',
      'adjust'
    ])
    expect(last()).toEqual({ shown: 3, real: 3, optimistic: false })
  })

  it('clears the error on the next successful change', async () => {
    let fail = true
    const { api } = setup(async () => {
      if (fail) throw new Error('nope')
    })

    await act(async () => api.current.addItem(product))
    expect(api.current.error).toBeInstanceOf(Error)

    fail = false
    await act(async () => api.current.addItem(product))
    expect(api.current.error).toBeNull()
    expect(api.current.cartCount).toBe(1)
  })

  it('rejects a change to an item that will not be in the cart, before calling onChange', () => {
    const onChange = vi.fn(async () => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { api } = setup(onChange)

    expect(() => api.current.incrementItem('missing')).toThrow(
      expect.objectContaining({ code: 'ITEM_NOT_IN_CART' })
    )
    expect(() => api.current.removeItem('missing')).toThrow(
      expect.objectContaining({ code: 'ITEM_NOT_IN_CART' })
    )
    expect(onChange).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('accepts changes to an item that a queued change adds', async () => {
    const pending = deferred()
    const { api, last } = setup(() => pending.promise)

    await act(async () => {
      api.current.addItem(product)
      api.current.incrementItem('a')
      api.current.setItemQuantity('a', 5)
    })
    expect(last().shown).toBe(5)

    await act(async () => pending.resolve())
    expect(last()).toEqual({ shown: 5, real: 5, optimistic: false })
  })

  it('drops a queued change that depends on a failed one without calling onChange', async () => {
    const calls: Array<ReturnType<typeof deferred>> = []
    const onChange = vi.fn(() => {
      const d = deferred()
      calls.push(d)
      return d.promise
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { api, last } = setup(onChange)

    await act(async () => {
      api.current.addItem(product)
      api.current.incrementItem('a')
    })
    await act(async () => calls[0].reject(new Error('no stock')))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(last()).toEqual({ shown: 0, real: 0, optimistic: false })
    expect(api.current.error).toEqual(
      expect.objectContaining({ code: 'ITEM_NOT_IN_CART' })
    )
    vi.restoreAllMocks()
  })

  it('shares one queue between components using the same cart', async () => {
    const calls: Array<ReturnType<typeof deferred>> = []
    const onChange = vi.fn(() => {
      const d = deferred()
      calls.push(d)
      return d.promise
    })
    const apis: Array<ReturnType<typeof useOptimisticCart>> = []
    function Button({ index }: { index: number }) {
      apis[index] = useOptimisticCart({ onChange })
      return null
    }
    render(
      <CartProvider shouldPersist={false} currency="USD" language="en-US">
        <Button index={0} />
        <Button index={1} />
      </CartProvider>
    )

    await act(async () => {
      apis[0].addItem(product)
      apis[1].incrementItem('a')
    })
    expect(onChange).toHaveBeenCalledTimes(1)

    await act(async () => calls[0].resolve())
    expect(onChange).toHaveBeenCalledTimes(2)
    await act(async () => calls[1].resolve())

    expect(apis[0].cartCount).toBe(2)
  })

  it('throws invalid input synchronously without calling onChange', () => {
    const onChange = vi.fn(async () => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { api } = setup(onChange)

    expect(() => api.current.addItem(product, { count: 0 })).toThrow()
    expect(() =>
      api.current.addItem({ ...product, price: 'x' } as never)
    ).toThrow()
    expect(onChange).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
