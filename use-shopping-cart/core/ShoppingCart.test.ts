import { describe, it, expect, vi } from 'vitest'
import { ShoppingCart, initialState } from './ShoppingCart'
import { createMemoryStorage } from './storage'

describe('ShoppingCart', () => {
  describe('constructor', () => {
    it('initializes with default state', () => {
      const cart = new ShoppingCart()
      const state = cart.getState()

      expect(state.currency).toBe(initialState.currency)
      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
      expect(state.cartDetails).toEqual({})
      expect(state.shouldDisplayCart).toBe(false)
      expect(state.lastClicked).toBe('')
    })

    it('merges config with initial state', () => {
      const cart = new ShoppingCart({
        currency: 'EUR',
        language: 'de-DE',
        stripe: 'pk_test_123'
      })

      const state = cart.getState()
      expect(state.currency).toBe('EUR')
      expect(state.language).toBe('de-DE')
      expect(state.stripe).toBe('pk_test_123')
    })

    it('keeps config options out of state', () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        persistKey: 'k',
        storage: createMemoryStorage(),
        currency: 'EUR',
        language: 'de-DE'
      })

      expect(Object.keys(cart.getState()).sort()).toEqual(
        [
          'cartCount',
          'cartDetails',
          'currency',
          'formattedTotalPrice',
          'language',
          'lastClicked',
          'shouldDisplayCart',
          'totalPrice'
        ].sort()
      )
    })

    it('ignores derived and unknown fields passed as config', () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        cartCount: 99,
        totalPrice: 5,
        mode: 'payment'
      } as never)
      const state = cart.getState() as unknown as Record<string, unknown>

      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
      expect(state).not.toHaveProperty('mode')
    })

    it('uses custom persistKey', () => {
      const storage = createMemoryStorage()
      const cart = new ShoppingCart({
        persistKey: 'custom-key',
        storage
      })

      expect(cart).toBeDefined()
    })

    it('formats initial total price', () => {
      const cart = new ShoppingCart({ currency: 'USD' })
      const state = cart.getState()

      expect(state.formattedTotalPrice).toContain('$')
      expect(state.formattedTotalPrice).toContain('0')
    })
  })

  describe('getState', () => {
    it('returns current state', () => {
      const cart = new ShoppingCart({ currency: 'EUR' })
      const state = cart.getState()

      expect(state).toHaveProperty('cartCount')
      expect(state).toHaveProperty('cartDetails')
      expect(state).toHaveProperty('totalPrice')
      expect(state.currency).toBe('EUR')
    })

    it('returns readonly state', () => {
      const cart = new ShoppingCart()
      const state = cart.getState()

      expect(typeof state).toBe('object')
    })
  })

  describe('subscribe', () => {
    it('returns unsubscribe function', () => {
      const cart = new ShoppingCart()
      const callback = vi.fn()

      const unsubscribe = cart.subscribe(callback)

      expect(typeof unsubscribe).toBe('function')
    })

    it('unsubscribe removes subscriber', () => {
      const cart = new ShoppingCart()
      const callback = vi.fn()

      const unsubscribe = cart.subscribe(callback)
      unsubscribe()

      expect(callback).not.toHaveBeenCalled()
    })

    it('allows multiple subscribers', () => {
      const cart = new ShoppingCart()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      cart.subscribe(callback1)
      cart.subscribe(callback2)

      expect(callback1).toBeDefined()
      expect(callback2).toBeDefined()
    })
  })

  describe('storage persistence', () => {
    it('loads from storage on initialization', () => {
      const storage = createMemoryStorage()

      storage.setItem(
        'test-cart',
        JSON.stringify({
          cartDetails: {
            'item-1': {
              id: 'item-1',
              name: 'Test Item',
              price: 200,
              currency: 'USD',
              quantity: 5,
              value: 1000
            }
          },
          cartCount: 5,
          totalPrice: 1000,
          formattedTotalPrice: '$10.00',
          currency: 'EUR',
          language: 'de-DE'
        })
      )

      const cart = new ShoppingCart({
        persistKey: 'test-cart',
        storage,
        shouldPersist: true
      })

      const state = cart.getState()
      expect(state.cartCount).toBe(5)
      expect(state.totalPrice).toBe(1000)
      expect(state.cartDetails['item-1']).toBeDefined()
      expect(state.currency).toBe('EUR')
      expect(state.language).toBe('de-DE')
    })

    it('handles missing storage gracefully', () => {
      const storage = createMemoryStorage()

      const cart = new ShoppingCart({
        persistKey: 'non-existent',
        storage
      })

      const state = cart.getState()
      expect(state.cartCount).toBe(0)
    })

    it('handles corrupted storage data gracefully', () => {
      const storage = createMemoryStorage()
      storage.setItem('test-cart', 'invalid json{{}')

      const cart = new ShoppingCart({
        persistKey: 'test-cart',
        storage
      })

      const state = cart.getState()
      expect(state.cartCount).toBe(0)
    })

    it('does not use storage when shouldPersist is false', () => {
      const storage = createMemoryStorage()
      storage.setItem(
        'test-cart',
        JSON.stringify({
          cartCount: 999
        })
      )

      const cart = new ShoppingCart({
        persistKey: 'test-cart',
        storage,
        shouldPersist: false
      })

      const state = cart.getState()
      expect(state.cartCount).toBe(0)
    })
  })

  describe('addItem', () => {
    it('adds an entry to the cart', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'test-123',
        name: 'Test Product',
        price: 100,
        currency: 'USD'
      }

      cart.addItem(product)

      const state = cart.getState()
      expect(state.cartDetails['test-123']).toMatchObject(product)
      expect(state.totalPrice).toBe(100)
      expect(state.cartCount).toBe(1)
    })

    it('retains entries when adding a product to a cart that already contains products', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      const product1 = {
        id: 'item-1',
        name: 'Product 1',
        price: 200,
        currency: 'USD'
      }

      const product2 = {
        id: 'item-2',
        name: 'Product 2',
        price: 100,
        currency: 'USD'
      }

      cart.addItem(product1)

      cart.addItem(product2)
      const stateAfterSecond = cart.getState()

      expect(stateAfterSecond.cartCount).toBe(2)
      expect(stateAfterSecond.totalPrice).toBe(300)
      expect(stateAfterSecond.cartDetails['item-1']).toMatchObject(product1)
      expect(stateAfterSecond.cartDetails['item-2']).toMatchObject(product2)
    })

    it('attaches price_metadata to the cart entry', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'test-price-meta',
        name: 'Test Product',
        price: 100,
        currency: 'USD'
      }

      cart.addItem(product, {
        price_metadata: { type: 'food' }
      })

      const state = cart.getState()
      expect(state.cartDetails['test-price-meta'].price_data).toEqual({
        type: 'food'
      })
    })

    it('attaches product_metadata to the cart entry', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'test-product-meta',
        name: 'Test Product',
        price: 100,
        currency: 'USD'
      }

      cart.addItem(product, {
        product_metadata: { type: 'digital' }
      })

      const state = cart.getState()
      expect(state.cartDetails['test-product-meta'].product_data).toEqual({
        type: 'digital'
      })
    })

    it('handles updating the cart entry when adding the same product again', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'test-update',
        name: 'Test Product',
        price: 100,
        currency: 'USD'
      }

      cart.addItem(product)
      cart.addItem(product)

      const state = cart.getState()
      expect(state.cartDetails['test-update']).toMatchObject(product)
      expect(state.cartDetails['test-update'].quantity).toBe(2)
      expect(state.totalPrice).toBe(200)
      expect(state.cartCount).toBe(2)
    })

    it('respects custom count option', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'test-count',
        name: 'Test Product',
        price: 100,
        currency: 'USD'
      }

      cart.addItem(product, { count: 5 })

      const state = cart.getState()
      expect(state.cartDetails['test-count'].quantity).toBe(5)
      expect(state.totalPrice).toBe(500)
      expect(state.cartCount).toBe(5)
    })

    it('notifies subscribers when item is added', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const callback = vi.fn()

      cart.subscribe(callback)

      cart.addItem({
        id: 'test-subscriber',
        name: 'Test',
        price: 100,
        currency: 'USD'
      })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          cartCount: 1,
          totalPrice: 100
        })
      )
    })
  })

  describe('incrementItem', () => {
    it('increments a cart item by 1', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'item-1',
        name: 'Bananas',
        price: 400,
        currency: 'USD'
      }

      cart.addItem(product, { count: 2 })
      cart.incrementItem('item-1')

      const state = cart.getState()
      expect(state.cartDetails['item-1'].quantity).toBe(3)
      expect(state.cartCount).toBe(3)
      expect(state.totalPrice).toBe(1200)
    })

    it('increments a cart item by custom count', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'item-1',
        name: 'Bananas',
        price: 400,
        currency: 'USD'
      }

      cart.addItem(product, { count: 2 })
      cart.incrementItem('item-1', { count: 2 })

      const state = cart.getState()
      expect(state.cartDetails['item-1'].quantity).toBe(4)
      expect(state.cartCount).toBe(4)
      expect(state.totalPrice).toBe(1600)
    })

    it('notifies subscribers when item is incremented', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const callback = vi.fn()

      cart.addItem({
        id: 'test',
        name: 'Test',
        price: 100,
        currency: 'USD'
      })

      callback.mockClear()
      cart.subscribe(callback)

      cart.incrementItem('test')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          cartCount: 2,
          totalPrice: 200
        })
      )
    })
  })

  describe('decrementItem', () => {
    it('decreases the quantity of a cart entry by one', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'item-1',
        name: 'Bananas',
        price: 400,
        currency: 'USD'
      }

      cart.addItem(product, { count: 2 })
      cart.decrementItem('item-1')

      const state = cart.getState()
      expect(state.cartDetails['item-1'].quantity).toBe(1)
      expect(state.cartCount).toBe(1)
      expect(state.totalPrice).toBe(400)
    })

    it('removes entry when quantity becomes zero or negative', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'item-1',
        name: 'Bananas',
        price: 400,
        currency: 'USD'
      }

      cart.addItem(product, { count: 2 })
      cart.decrementItem('item-1', { count: 2 })

      const state = cart.getState()
      expect(state.cartDetails['item-1']).toBeUndefined()
      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
    })

    it('decrements by custom count', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'item-1',
        name: 'Bananas',
        price: 400,
        currency: 'USD'
      }

      cart.addItem(product, { count: 5 })
      cart.decrementItem('item-1', { count: 2 })

      const state = cart.getState()
      expect(state.cartDetails['item-1'].quantity).toBe(3)
      expect(state.cartCount).toBe(3)
      expect(state.totalPrice).toBe(1200)
    })

    it('notifies subscribers when item is decremented', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const callback = vi.fn()

      cart.addItem(
        {
          id: 'test',
          name: 'Test',
          price: 100,
          currency: 'USD'
        },
        { count: 3 }
      )

      callback.mockClear()
      cart.subscribe(callback)

      cart.decrementItem('test')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          cartCount: 2,
          totalPrice: 200
        })
      )
    })
  })

  describe('setItemQuantity', () => {
    it('sets the quantity for a cart item', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'item-1',
        name: 'Bananas',
        price: 400,
        currency: 'USD'
      }

      cart.addItem(product, { count: 2 })
      cart.setItemQuantity('item-1', 10)

      const state = cart.getState()
      expect(state.cartDetails['item-1'].quantity).toBe(10)
      expect(state.cartCount).toBe(10)
      expect(state.totalPrice).toBe(4000)
    })

    it('removes item when quantity is set to 0', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = {
        id: 'item-1',
        name: 'Bananas',
        price: 400,
        currency: 'USD'
      }

      cart.addItem(product, { count: 2 })
      cart.setItemQuantity('item-1', 0)

      const state = cart.getState()
      expect(state.cartDetails['item-1']).toBeUndefined()
      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
    })
  })

  describe('removeItem', () => {
    it('removes the proper entry from cart and updates values', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product1 = {
        id: 'item-1',
        name: 'Product 1',
        price: 400,
        currency: 'USD'
      }
      const product2 = {
        id: 'item-2',
        name: 'Product 2',
        price: 250,
        currency: 'USD'
      }

      cart.addItem(product1, { count: 2 })
      cart.addItem(product2, { count: 4 })

      cart.removeItem('item-1')

      const state = cart.getState()
      expect(state.cartDetails['item-1']).toBeUndefined()
      expect(state.cartDetails['item-2']).toBeDefined()
      expect(state.cartCount).toBe(4)
      expect(state.totalPrice).toBe(1000)
    })
  })

  describe('clearCart', () => {
    it('resets cart to initial state values', () => {
      const cart = new ShoppingCart({ shouldPersist: false, currency: 'EUR' })

      cart.addItem({
        id: 'item-1',
        name: 'Product 1',
        price: 100,
        currency: 'EUR'
      })
      cart.addItem({
        id: 'item-2',
        name: 'Product 2',
        price: 200,
        currency: 'EUR'
      })

      cart.clearCart()

      const state = cart.getState()
      expect(state.cartDetails).toEqual({})
      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
      expect(state.formattedTotalPrice).toContain('0')
      expect(state.currency).toBe('EUR')
    })
  })

  describe('loadCart', () => {
    it('merges new cartDetails into current cartDetails', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      cart.addItem(
        {
          id: 'item-1',
          name: 'Bananas',
          price: 400,
          currency: 'USD'
        },
        { count: 2 }
      )

      const newCartDetails = {
        'item-2': {
          id: 'item-2',
          name: 'Carrots',
          price: 250,
          currency: 'USD',
          quantity: 4,
          value: 1000
        } as any
      }

      cart.loadCart(newCartDetails, true)

      const state = cart.getState()
      expect(state.cartDetails['item-1']).toBeDefined()
      expect(state.cartDetails['item-2']).toBeDefined()
      expect(state.cartCount).toBe(6)
      expect(state.totalPrice).toBe(1800)
    })

    it('replaces cartDetails when shouldMerge is false', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      cart.addItem(
        {
          id: 'item-1',
          name: 'Bananas',
          price: 400,
          currency: 'USD'
        },
        { count: 2 }
      )

      const newCartDetails = {
        'item-2': {
          id: 'item-2',
          name: 'Carrots',
          price: 250,
          currency: 'USD',
          quantity: 4,
          value: 1000
        } as any
      }

      cart.loadCart(newCartDetails, false)

      const state = cart.getState()
      expect(state.cartDetails['item-1']).toBeUndefined()
      expect(state.cartDetails['item-2']).toBeDefined()
      expect(state.cartCount).toBe(4)
      expect(state.totalPrice).toBe(1000)
    })

    it('normalizes loaded entries missing computed fields', () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        currency: 'USD',
        language: 'en-US'
      })

      const newCartDetails = {
        'item-1': {
          id: 'item-1',
          name: 'Bananas',
          price: 1000,
          currency: 'USD',
          quantity: 2
        } as any,
        'item-2': {
          id: 'item-2',
          name: 'Carrots',
          price: 500,
          currency: 'USD',
          quantity: 1
        } as any
      }

      cart.loadCart(newCartDetails, false)

      const state = cart.getState()
      expect(state.cartCount).toBe(3)
      expect(state.totalPrice).toBe(2500)
      expect(state.formattedTotalPrice).toBe('$25.00')
      expect(state.cartDetails['item-1'].value).toBe(2000)
      expect(state.cartDetails['item-1'].formattedValue).toBe('$20.00')
      expect(state.cartDetails['item-1'].formattedPrice).toBe('$10.00')
      expect(state.cartDetails['item-2'].formattedValue).toBe('$5.00')
      expect(state.cartDetails['item-2'].formattedPrice).toBe('$5.00')
    })
  })

  describe('handleCartHover', () => {
    it('sets shouldDisplayCart to true', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      cart.handleCartHover()

      const state = cart.getState()
      expect(state.shouldDisplayCart).toBe(true)
    })
  })

  describe('handleCartClick', () => {
    it('toggles shouldDisplayCart', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      cart.handleCartClick()
      expect(cart.getState().shouldDisplayCart).toBe(true)

      cart.handleCartClick()
      expect(cart.getState().shouldDisplayCart).toBe(false)
    })
  })

  describe('handleCloseCart', () => {
    it('sets shouldDisplayCart to false', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      cart.handleCartClick()
      expect(cart.getState().shouldDisplayCart).toBe(true)

      cart.handleCloseCart()
      expect(cart.getState().shouldDisplayCart).toBe(false)
    })
  })

  describe('storeLastClicked', () => {
    it('stores the id of last clicked item', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      cart.storeLastClicked('item-123')

      const state = cart.getState()
      expect(state.lastClicked).toBe('item-123')
    })
  })

  describe('changeStripeKey', () => {
    it('updates the stripe key', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      cart.changeStripeKey('pk_test_new_key')

      const state = cart.getState()
      expect(state.stripe).toBe('pk_test_new_key')
    })
  })

  describe('changeLanguage', () => {
    it('updates the language and recalculates formatted prices', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      cart.addItem({
        id: 'test',
        name: 'Test',
        price: 1000,
        currency: 'USD'
      })

      cart.changeLanguage('de-DE')

      const state = cart.getState()
      expect(state.language).toBe('de-DE')
      expect(state.formattedTotalPrice).toBeTruthy()
    })
  })

  describe('changeCurrency', () => {
    it('updates the currency and recalculates formatted prices', () => {
      const cart = new ShoppingCart({ shouldPersist: false, currency: 'USD' })

      cart.addItem({
        id: 'test',
        name: 'Test',
        price: 1000,
        currency: 'EUR'
      })

      cart.changeCurrency('EUR')

      const state = cart.getState()
      expect(state.currency).toBe('EUR')
      expect(state.formattedTotalPrice).toContain('€')
    })
  })

  describe('redirectToCheckout', () => {
    it('throws when stripe key not configured', async () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      await expect(cart.redirectToCheckout('sess_123')).rejects.toThrow(
        'Stripe publishable key not configured'
      )
    })

    it('throws when session input is missing', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123'
      })

      await expect(cart.redirectToCheckout('' as any)).rejects.toThrow(
        'sessionUrl or sessionId is required'
      )
    })

    it('throws when stripe key has invalid format', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'invalid_key_123'
      })

      await expect(cart.redirectToCheckout('sess_123')).rejects.toThrow(
        'Invalid Stripe publishable key format'
      )
    })
  })

  describe('addItem edge cases', () => {
    it('handles product without any ID fields by generating consistent ID', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = { name: 'No ID Product', price: 100, currency: 'USD' }

      cart.addItem(product)
      cart.addItem(product)

      const state = cart.getState()
      expect(Object.keys(state.cartDetails)).toHaveLength(1)
      expect(state.cartCount).toBe(2)
      expect(state.totalPrice).toBe(200)
    })

    it('rejects negative count', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = { id: 'test', name: 'Test', price: 100, currency: 'USD' }

      expect(() => cart.addItem(product, { count: -1 })).toThrow()
    })

    it('rejects zero count', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = { id: 'test', name: 'Test', price: 100, currency: 'USD' }

      expect(() => cart.addItem(product, { count: 0 })).toThrow()
    })

    it('rejects non-number count', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const product = { id: 'test', name: 'Test', price: 100, currency: 'USD' }

      expect(() => cart.addItem(product, { count: '5' as any })).toThrow()
    })
  })

  describe('storage security', () => {
    it('ignores malformed JSON in storage', () => {
      const storage = createMemoryStorage()
      storage.setItem('cart', 'not valid json {{{}')

      const cart = new ShoppingCart({ storage, persistKey: 'cart' })
      expect(cart.getState().cartCount).toBe(0)
    })

    it('ignores cart entries with negative quantities', () => {
      const storage = createMemoryStorage()
      storage.setItem(
        'cart',
        JSON.stringify({
          cartDetails: {
            'bad-item': {
              id: 'bad-item',
              name: 'Bad Item',
              price: 100,
              currency: 'USD',
              quantity: -5,
              value: -500
            }
          },
          cartCount: -5,
          totalPrice: -500
        })
      )

      const cart = new ShoppingCart({ storage, persistKey: 'cart' })
      expect(cart.getState().cartDetails['bad-item']).toBeUndefined()
      expect(cart.getState().cartCount).toBe(0)
    })

    it('ignores cart entries with missing required fields', () => {
      const storage = createMemoryStorage()
      storage.setItem(
        'cart',
        JSON.stringify({
          cartDetails: {
            incomplete: { id: 'incomplete' }
          },
          cartCount: 1,
          totalPrice: 100
        })
      )

      const cart = new ShoppingCart({ storage, persistKey: 'cart' })
      expect(cart.getState().cartDetails['incomplete']).toBeUndefined()
      expect(cart.getState().cartCount).toBe(0)
    })

    it('loads valid entries and skips invalid ones', () => {
      const storage = createMemoryStorage()
      storage.setItem(
        'cart',
        JSON.stringify({
          cartDetails: {
            'valid-item': {
              id: 'valid-item',
              name: 'Valid Item',
              price: 100,
              currency: 'USD',
              quantity: 2,
              value: 200
            },
            'invalid-item': {
              id: 'invalid-item',
              quantity: -1
            }
          },
          cartCount: 1,
          totalPrice: 100
        })
      )

      const cart = new ShoppingCart({ storage, persistKey: 'cart' })
      const state = cart.getState()

      expect(state.cartDetails['valid-item']).toBeDefined()
      expect(state.cartDetails['invalid-item']).toBeUndefined()
      expect(state.cartCount).toBe(2)
      expect(state.totalPrice).toBe(200)
    })

    it('rebuilds stored values from price and quantity so totals stay consistent', () => {
      const storage = createMemoryStorage()
      storage.setItem(
        'cart',
        JSON.stringify({
          cartDetails: {
            a: {
              id: 'a',
              name: 'A',
              price: 100,
              currency: 'USD',
              quantity: 2,
              value: 999
            }
          },
          totalPrice: 999
        })
      )

      const cart = new ShoppingCart({
        storage,
        persistKey: 'cart',
        currency: 'USD',
        language: 'en-US'
      })
      expect(cart.getState().cartDetails.a.value).toBe(200)
      expect(cart.getState().cartDetails.a.formattedValue).toBe('$2.00')
      expect(cart.getState().totalPrice).toBe(200)

      cart.incrementItem('a')
      expect(cart.getState().cartDetails.a.value).toBe(300)
      expect(cart.getState().totalPrice).toBe(300)
    })
  })

  describe('async storage', () => {
    function deferredStorage(stored: object) {
      let resolve!: (value: string) => void
      const storage = {
        getItem: () =>
          new Promise<string>((r) => {
            resolve = r
          }),
        setItem: vi.fn(),
        removeItem: () => {}
      }
      return { storage, finishLoad: () => resolve(JSON.stringify(stored)) }
    }

    const storedCart = {
      cartDetails: {
        a: {
          id: 'a',
          name: 'A',
          price: 100,
          currency: 'USD',
          quantity: 2,
          value: 200
        }
      },
      currency: 'USD',
      language: 'en-US'
    }

    it('restores the stored cart when the load finishes', async () => {
      const { storage, finishLoad } = deferredStorage(storedCart)
      const cart = new ShoppingCart({ storage, currency: 'EUR' })

      finishLoad()

      await vi.waitFor(() => expect(cart.getState().cartCount).toBe(2))
      expect(cart.getState().currency).toBe('USD')
    })

    it('keeps cart changes made before the load finished', async () => {
      const { storage, finishLoad } = deferredStorage(storedCart)
      const cart = new ShoppingCart({ storage, currency: 'USD' })

      cart.addItem({ id: 'b', name: 'B', price: 5, currency: 'USD' })
      finishLoad()
      await new Promise((r) => setTimeout(r, 0))

      expect(Object.keys(cart.getState().cartDetails)).toEqual(['b'])
    })

    it('keeps a currency changed before the load finished', async () => {
      const { storage, finishLoad } = deferredStorage(storedCart)
      const cart = new ShoppingCart({
        storage,
        currency: 'USD',
        language: 'en-US'
      })

      cart.changeCurrency('EUR')
      finishLoad()

      await vi.waitFor(() => expect(cart.getState().cartCount).toBe(2))
      expect(cart.getState().currency).toBe('EUR')
      expect(cart.getState().cartDetails.a.formattedValue).toMatch(/€/)
    })
  })

  describe('storage writes', () => {
    it('does not write when the first change is UI-only', () => {
      const storage = createMemoryStorage()
      const setItem = vi.spyOn(storage, 'setItem')
      const cart = new ShoppingCart({ storage })

      cart.handleCartHover()
      cart.storeLastClicked('a')

      expect(setItem).not.toHaveBeenCalled()
    })

    it('does not write for UI-only changes', () => {
      const storage = createMemoryStorage()
      const setItem = vi.spyOn(storage, 'setItem')
      const cart = new ShoppingCart({ storage })

      cart.addItem({ id: 'a', name: 'A', price: 5, currency: 'USD' })
      expect(setItem).toHaveBeenCalledTimes(1)

      cart.handleCartHover()
      cart.handleCartClick()
      cart.storeLastClicked('a')
      expect(setItem).toHaveBeenCalledTimes(1)
    })
  })

  describe('totals invariant', () => {
    function expectTotalsMatchEntries(cart: ShoppingCart) {
      const { cartDetails, totalPrice, cartCount } = cart.getState()
      const entries = Object.values(cartDetails)
      for (const entry of entries) {
        expect(entry.value).toBe(entry.price * entry.quantity)
      }
      expect(totalPrice).toBe(entries.reduce((sum, e) => sum + e.value, 0))
      expect(cartCount).toBe(entries.reduce((sum, e) => sum + e.quantity, 0))
    }

    it('derives totals from cartDetails passed in config', () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        currency: 'USD',
        language: 'en-US',
        cartDetails: {
          a: {
            id: 'a',
            name: 'A',
            price: 250,
            currency: 'USD',
            quantity: 2,
            value: 500
          } as any
        }
      })

      expect(cart.getState().totalPrice).toBe(500)
      expect(cart.getState().cartCount).toBe(2)
      expect(cart.getState().formattedTotalPrice).toBe('$5.00')
      expectTotalsMatchEntries(cart)
    })

    it('holds after every kind of cart change', () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        currency: 'USD',
        language: 'en-US'
      })
      const product = (id: string, price: number) => ({
        id,
        name: id,
        price,
        currency: 'USD'
      })

      const steps: Array<() => void> = [
        () => cart.addItem(product('a', 150), { count: 2 }),
        () => cart.addItem(product('b', 99)),
        () => cart.addItem(product('a', 150)),
        () => cart.incrementItem('b', { count: 4 }),
        () => cart.decrementItem('a', { count: 2 }),
        () => cart.setItemQuantity('b', 7),
        () => cart.changeCurrency('EUR'),
        () => cart.changeLanguage('de-DE'),
        () =>
          cart.loadCart({
            c: { ...product('c', 1000), quantity: 3, value: 1 } as any
          }),
        () => cart.decrementItem('a', { count: 5 }),
        () => cart.removeItem('b'),
        () =>
          cart.loadCart(
            { d: { ...product('d', 5), quantity: 1, value: 5 } as any },
            false
          ),
        () => cart.clearCart()
      ]

      for (const step of steps) {
        step()
        expectTotalsMatchEntries(cart)
      }
    })
  })

  describe('no-op optimizations', () => {
    it('changeLanguage does not update state when language is same', () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        language: 'en-US'
      })
      const callback = vi.fn()

      cart.subscribe(callback)
      cart.changeLanguage('en-US')

      expect(callback).not.toHaveBeenCalled()
    })

    it('changeCurrency does not update state when currency is same', () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        currency: 'USD'
      })
      const callback = vi.fn()

      cart.subscribe(callback)
      cart.changeCurrency('USD')

      expect(callback).not.toHaveBeenCalled()
    })
  })
})
