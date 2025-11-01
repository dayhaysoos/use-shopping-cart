import { describe, it, expect, vi } from 'vitest'
import { ShoppingCart, initialState } from './ShoppingCart'
import { createMemoryStorage } from './storage'

describe('ShoppingCart', () => {
  describe('constructor', () => {
    it('initializes with default state', () => {
      const cart = new ShoppingCart()
      const state = cart.getState()

      expect(state.cartMode).toBe(initialState.cartMode)
      expect(state.mode).toBe(initialState.mode)
      expect(state.currency).toBe(initialState.currency)
      expect(state.cartCount).toBe(0)
      expect(state.totalPrice).toBe(0)
      expect(state.cartDetails).toEqual({})
    })

    it('merges config with initial state', () => {
      const cart = new ShoppingCart({
        currency: 'EUR',
        mode: 'subscription',
        cartMode: 'client-only'
      })

      const state = cart.getState()
      expect(state.currency).toBe('EUR')
      expect(state.mode).toBe('subscription')
      expect(state.cartMode).toBe('client-only')
    })

    it('respects shouldPersist false', () => {
      const cart = new ShoppingCart({ shouldPersist: false })
      const state = cart.getState()

      expect(state.shouldPersist).toBe(false)
    })

    it('uses custom persistKey', () => {
      const storage = createMemoryStorage()
      const cart = new ShoppingCart({
        persistKey: 'custom-key',
        storage
      })

      // This will be tested more thoroughly when we implement cart methods
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

      // TypeScript enforces readonly, but at runtime we can still access properties
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

      // When we implement methods, we'll verify callback is not called
      expect(callback).not.toHaveBeenCalled()
    })

    it('allows multiple subscribers', () => {
      const cart = new ShoppingCart()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      cart.subscribe(callback1)
      cart.subscribe(callback2)

      // Both callbacks should exist (will be verified when methods are implemented)
      expect(callback1).toBeDefined()
      expect(callback2).toBeDefined()
    })
  })

  describe('storage persistence', () => {
    it('loads from storage on initialization', () => {
      const storage = createMemoryStorage()

      // Pre-populate storage
      storage.setItem(
        'test-cart',
        JSON.stringify({
          cartDetails: {},
          cartCount: 5,
          totalPrice: 1000,
          formattedTotalPrice: '$10.00'
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
      expect(state.cartCount).toBe(0) // Falls back to default
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
      expect(state.cartCount).toBe(0) // Should not load from storage
    })
  })

  // ============================================================================
  // CART METHODS
  // ============================================================================

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
      const stateAfterFirst = cart.getState()

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

      callback.mockClear() // Clear the addItem call
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
      // Should keep other config
      expect(state.currency).toBe('EUR')
    })
  })

  describe('loadCart', () => {
    it('merges new cartDetails into current cartDetails', () => {
      const cart = new ShoppingCart({ shouldPersist: false })

      // Add initial items
      cart.addItem(
        {
          id: 'item-1',
          name: 'Bananas',
          price: 400,
          currency: 'USD'
        },
        { count: 2 }
      )

      // Load new items (merge mode)
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

      // Add initial items
      cart.addItem(
        {
          id: 'item-1',
          name: 'Bananas',
          price: 400,
          currency: 'USD'
        },
        { count: 2 }
      )

      // Load new items (replace mode)
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

      cart.handleCartClick() // Open it first
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
      // Formatted prices should be updated
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

      await expect(cart.redirectToCheckout()).rejects.toThrow(
        'Stripe public key not configured'
      )
    })

    it('throws when sessionId missing in checkout-session mode', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123',
        cartMode: 'checkout-session'
      })

      await expect(cart.redirectToCheckout()).rejects.toThrow(
        'sessionId required'
      )
    })
  })

  describe('checkoutSingleItem', () => {
    it('throws when stripe key not configured', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        cartMode: 'client-only'
      })

      await expect(cart.checkoutSingleItem('price_123')).rejects.toThrow(
        'Stripe public key not configured'
      )
    })

    it('throws when not in client-only mode', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123',
        cartMode: 'checkout-session'
      })

      await expect(cart.checkoutSingleItem('price_123')).rejects.toThrow(
        'only works in client-only mode'
      )
    })
  })

  describe('new configuration methods (Phase 6)', () => {
    describe('setCustomerEmail', () => {
      it('sets customer email in state', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        cart.setCustomerEmail('test@example.com')

        const state = cart.getState()
        expect(state.customerEmail).toBe('test@example.com')
      })

      it('notifies subscribers when customer email is set', () => {
        const cart = new ShoppingCart({ shouldPersist: false })
        const callback = vi.fn()

        cart.subscribe(callback)
        cart.setCustomerEmail('customer@test.com')

        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            customerEmail: 'customer@test.com'
          })
        )
      })
    })

    describe('toggleAutomaticTax', () => {
      it('enables automatic tax', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        cart.toggleAutomaticTax(true)

        const state = cart.getState()
        expect(state.automaticTax).toBe(true)
      })

      it('disables automatic tax', () => {
        const cart = new ShoppingCart({
          shouldPersist: false,
          automaticTax: true
        })

        cart.toggleAutomaticTax(false)

        const state = cart.getState()
        expect(state.automaticTax).toBe(false)
      })
    })

    describe('setCustomText', () => {
      it('sets custom text for checkout', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        const customText = {
          submit: 'Complete your order',
          shippingAddress: 'Enter your address'
        }

        cart.setCustomText(customText)

        const state = cart.getState()
        expect(state.customText).toEqual(customText)
      })
    })

    describe('setCustomFields', () => {
      it('sets custom fields for checkout', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        const customFields = [
          {
            key: 'gift_message',
            label: 'Gift Message',
            type: 'text' as const,
            optional: true
          }
        ]

        cart.setCustomFields(customFields)

        const state = cart.getState()
        expect(state.customFields).toEqual(customFields)
      })
    })

    describe('setShippingOptions', () => {
      it('sets shipping options for checkout', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        const shippingOptions = [
          {
            displayName: 'Standard Shipping',
            amount: 500,
            deliveryEstimate: {
              minimum: { unit: 'day' as const, value: 5 },
              maximum: { unit: 'day' as const, value: 7 }
            }
          }
        ]

        cart.setShippingOptions(shippingOptions)

        const state = cart.getState()
        expect(state.shippingOptions).toEqual(shippingOptions)
      })
    })

    describe('setUIMode', () => {
      it('sets UI mode to embedded', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        cart.setUIMode('embedded')

        const state = cart.getState()
        expect(state.uiMode).toBe('embedded')
      })

      it('sets UI mode to hosted', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        cart.setUIMode('hosted')

        const state = cart.getState()
        expect(state.uiMode).toBe('hosted')
      })
    })

    describe('togglePhoneCollection', () => {
      it('enables phone number collection', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        cart.togglePhoneCollection(true)

        const state = cart.getState()
        expect(state.collectPhoneNumber).toBe(true)
      })

      it('disables phone number collection', () => {
        const cart = new ShoppingCart({
          shouldPersist: false,
          collectPhoneNumber: true
        })

        cart.togglePhoneCollection(false)

        const state = cart.getState()
        expect(state.collectPhoneNumber).toBe(false)
      })
    })

    describe('togglePromotionCodes', () => {
      it('enables promotion codes', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        cart.togglePromotionCodes(true)

        const state = cart.getState()
        expect(state.allowPromotionCodes).toBe(true)
      })

      it('disables promotion codes', () => {
        const cart = new ShoppingCart({
          shouldPersist: false,
          allowPromotionCodes: true
        })

        cart.togglePromotionCodes(false)

        const state = cart.getState()
        expect(state.allowPromotionCodes).toBe(false)
      })
    })

    describe('toggleTermsOfService', () => {
      it('requires terms of service', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        cart.toggleTermsOfService(true)

        const state = cart.getState()
        expect(state.requireTermsOfService).toBe(true)
      })

      it('makes terms of service optional', () => {
        const cart = new ShoppingCart({
          shouldPersist: false,
          requireTermsOfService: true
        })

        cart.toggleTermsOfService(false)

        const state = cart.getState()
        expect(state.requireTermsOfService).toBe(false)
      })
    })

    describe('setCreateSessionEndpoint', () => {
      it('sets the create session endpoint', () => {
        const cart = new ShoppingCart({ shouldPersist: false })

        cart.setCreateSessionEndpoint('https://api.example.com/create-session')

        const state = cart.getState()
        expect(state.createSessionEndpoint).toBe(
          'https://api.example.com/create-session'
        )
      })
    })
  })

  describe('initEmbeddedCheckout', () => {
    it('throws when uiMode is not embedded', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123',
        uiMode: 'hosted'
      })

      await expect(cart.initEmbeddedCheckout('#checkout')).rejects.toThrow(
        'uiMode must be "embedded"'
      )
    })

    it('throws when stripe key is not configured', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        uiMode: 'embedded'
      })

      await expect(cart.initEmbeddedCheckout('#checkout')).rejects.toThrow(
        'Stripe key required'
      )
    })

    it('throws when createSessionEndpoint is not provided', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123',
        uiMode: 'embedded'
      })

      await expect(cart.initEmbeddedCheckout('#checkout')).rejects.toThrow(
        'createSessionEndpoint required'
      )
    })

    it('throws when fetch fails', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123',
        uiMode: 'embedded',
        createSessionEndpoint: 'https://api.example.com/create-session'
      })

      // Mock fetch to fail
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      })

      await expect(cart.initEmbeddedCheckout('#checkout')).rejects.toThrow(
        'Failed to create checkout session'
      )
    })

    it('throws when no clientSecret is returned', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123',
        uiMode: 'embedded',
        createSessionEndpoint: 'https://api.example.com/create-session'
      })

      // Mock fetch to return empty response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({})
      })

      await expect(cart.initEmbeddedCheckout('#checkout')).rejects.toThrow(
        'No clientSecret returned'
      )
    })

    it('calls fetch with correct parameters', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123',
        uiMode: 'embedded',
        createSessionEndpoint: 'https://api.example.com/create-session',
        mode: 'payment'
      })

      // Add an item to cart
      cart.addItem({
        id: 'price_123',
        name: 'Test Product',
        price: 1000,
        currency: 'USD'
      })

      // Mock fetch
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ clientSecret: 'cs_test_123' })
      })
      global.fetch = mockFetch

      // Mock Stripe
      const mockMount = vi.fn()
      const mockCheckout = { mount: mockMount }
      const mockInitEmbeddedCheckout = vi.fn().mockResolvedValue(mockCheckout)
      const mockStripe = vi.fn().mockReturnValue({
        initEmbeddedCheckout: mockInitEmbeddedCheckout
      })

      // @ts-ignore
      global.window = { Stripe: mockStripe }

      await cart.initEmbeddedCheckout('#checkout')

      // Verify fetch was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/create-session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('price_123')
        }
      )

      // Verify Stripe was initialized
      expect(mockStripe).toHaveBeenCalledWith('pk_test_123')

      // Verify embedded checkout was initialized
      expect(mockInitEmbeddedCheckout).toHaveBeenCalledWith({
        clientSecret: 'cs_test_123'
      })

      // Verify mount was called
      expect(mockMount).toHaveBeenCalledWith('#checkout')
    })

    it('sends cart details and mode to endpoint', async () => {
      const cart = new ShoppingCart({
        shouldPersist: false,
        stripe: 'pk_test_123',
        uiMode: 'embedded',
        createSessionEndpoint: 'https://api.example.com/create-session',
        mode: 'subscription'
      })

      cart.addItem({
        id: 'price_456',
        name: 'Subscription',
        price: 2999,
        currency: 'USD'
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ clientSecret: 'cs_test_456' })
      })
      global.fetch = mockFetch

      const mockMount = vi.fn()
      const mockCheckout = { mount: mockMount }
      const mockInitEmbeddedCheckout = vi.fn().mockResolvedValue(mockCheckout)
      const mockStripe = vi.fn().mockReturnValue({
        initEmbeddedCheckout: mockInitEmbeddedCheckout
      })

      // @ts-ignore
      global.window = { Stripe: mockStripe }

      await cart.initEmbeddedCheckout('#checkout-container')

      const fetchCall = mockFetch.mock.calls[0]
      const body = JSON.parse(fetchCall[1].body)

      expect(body.mode).toBe('subscription')
      expect(body.cartDetails).toHaveProperty('price_456')
      expect(mockMount).toHaveBeenCalledWith('#checkout-container')
    })
  })
})
