import { it, expect, vi, afterEach } from 'vitest'
import { act, createElement } from 'react'

type ReactBuild = typeof import('./index')

function Badge({ lib }: { lib: ReactBuild }) {
  const count = lib.useShoppingCart((cart) => cart.cartCount)
  const total = lib.useShoppingCart((cart) => cart.formattedTotalPrice)
  return createElement('span', null, `${count} ${total}`)
}

function app(lib: ReactBuild) {
  return createElement(
    lib.CartProvider,
    { currency: 'USD' },
    createElement(Badge, { lib })
  )
}

const stored = JSON.stringify({
  cartDetails: {
    a: {
      id: 'a',
      name: 'A',
      price: 100,
      currency: 'USD',
      quantity: 2,
      value: 200,
      formattedValue: '$2.00',
      formattedPrice: '$1.00'
    }
  },
  currency: 'USD',
  language: 'en-US'
})

afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

it('hydrates server HTML, then shows the saved cart', async () => {
  vi.stubGlobal('window', undefined)
  vi.stubGlobal('document', undefined)
  vi.resetModules()
  const { renderToString } = await import('react-dom/server')
  const html = renderToString(app(await import('./index')))
  vi.unstubAllGlobals()

  expect(html).toBe('<span>0 $0.00</span>')

  localStorage.setItem('use-shopping-cart', stored)
  vi.resetModules()
  const { hydrateRoot } = await import('react-dom/client')
  const container = document.createElement('div')
  container.innerHTML = html
  const errors: unknown[] = []

  await act(async () => {
    hydrateRoot(container, app(await import('./index')), {
      onRecoverableError: (error) => errors.push(error)
    })
  })

  expect(errors).toEqual([])
  expect(container.textContent).toBe('2 $2.00')
})
