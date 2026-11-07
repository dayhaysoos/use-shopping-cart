import { describe, it, expect, afterEach } from 'vitest'
import { createRequire } from 'node:module'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

const require = createRequire(import.meta.url)

type ReactBuild = typeof import('../react/index')
type CoreBuild = typeof import('../core/index')
type UtilitiesBuild = typeof import('../utilities/serverless')

const reactBuilds: Array<[string, () => Promise<ReactBuild>]> = [
  ['react.mjs', () => import('../dist/react.mjs')],
  ['react.cjs', async () => require('../dist/react.cjs')],
  ['react.umd.js', async () => require('../dist/react.umd.js')]
]

const coreBuilds: Array<[string, () => Promise<CoreBuild>]> = [
  ['core.mjs', () => import('../dist/core.mjs')],
  ['core.cjs', async () => require('../dist/core.cjs')],
  ['core.umd.js', async () => require('../dist/core.umd.js')]
]

const utilitiesBuilds: Array<[string, () => Promise<UtilitiesBuild>]> = [
  ['utilities.mjs', () => import('../dist/utilities.mjs')],
  ['utilities.cjs', async () => require('../dist/utilities.cjs')]
]

const product = { id: 'a', name: 'A', price: 100, currency: 'USD' }

let root: Root | null = null
afterEach(() => {
  act(() => root?.unmount())
  root = null
})

describe.each(reactBuilds)('%s', (_name, load) => {
  it('renders a cart and applies changes through every hook', async () => {
    const { CartProvider, useShoppingCart, useOptimisticCart, DebugCart } =
      await load()
    let resolveChange!: () => void
    const api = {} as { current: ReturnType<typeof useOptimisticCart> }

    function Cart() {
      api.current = useOptimisticCart({
        onChange: () =>
          new Promise<void>((resolve) => (resolveChange = resolve))
      })
      const confirmed = useShoppingCart((cart) => cart.cartCount)
      return (
        <p>
          shown {api.current.cartCount} confirmed {confirmed}
        </p>
      )
    }

    const container = document.createElement('div')
    root = createRoot(container)
    await act(async () =>
      root!.render(
        <CartProvider shouldPersist={false} currency="USD" language="en-US">
          <Cart />
          <DebugCart />
        </CartProvider>
      )
    )
    expect(container.textContent).toContain('shown 0 confirmed 0')

    await act(async () => api.current.addItem(product))
    expect(container.textContent).toContain('shown 1 confirmed 0')

    await act(async () => resolveChange())
    expect(container.textContent).toContain('shown 1 confirmed 1')
    expect(container.querySelector('table')).not.toBeNull()
  })
})

describe.each(coreBuilds)('%s', (_name, load) => {
  it('runs a ShoppingCart and throws CartErrors', async () => {
    const { ShoppingCart, isCartError, formatCurrencyString } = await load()
    const cart = new ShoppingCart({
      shouldPersist: false,
      currency: 'USD',
      language: 'en-US'
    })

    cart.addItem(product, { count: 2 })
    expect(cart.getState().cartCount).toBe(2)
    expect(formatCurrencyString({ value: 100, currency: 'USD' })).toBe('$1.00')

    let caught: unknown
    try {
      cart.incrementItem('missing')
    } catch (error) {
      caught = error
    }
    expect(isCartError(caught) && caught.code).toBe('ITEM_NOT_IN_CART')
  })
})

describe.each(utilitiesBuilds)('%s', (_name, load) => {
  it('validates cart items against inventory', async () => {
    const { validateCartItems } = await load()
    const items = validateCartItems([product], {
      a: {
        ...product,
        quantity: 2,
        value: 200,
        formattedValue: '$2.00',
        formattedPrice: '$1.00',
        timestamp: '2026-01-01T00:00:00.000Z'
      }
    })
    expect(items[0]).toEqual(
      expect.objectContaining({ quantity: 2, price_data: expect.anything() })
    )
  })
})
