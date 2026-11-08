import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { CartProvider } from './CartProvider'
import { useCartActions } from './useCartActions'

const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('useActionState was called outside of a transition')
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Invalid product ID') ||
        args[0].includes('Invalid count used') ||
        args[0].includes('Invalid count in') ||
        args[0].includes('Invalid quantity in'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

const wrapper = ({ children }) => (
  <CartProvider
    mode="payment"
    cartMode="client-only"
    successUrl="https://example.com/success"
    cancelUrl="https://example.com/cancel"
    currency="USD"
    shouldPersist={false}
  >
    {children}
  </CartProvider>
)

describe('useCartActions', () => {
  const mockProduct = {
    id: 'prod_123',
    name: 'Test Product',
    price: 1000,
    currency: 'USD',
    image: 'https://example.com/image.jpg'
  }

  describe('addToCartAction', () => {
    test('should add item via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      expect(result.current.isAddingItem).toBe(false)
      expect(result.current.addItemState.status).toBe('idle')

      const formData = new FormData()
      formData.append('product', JSON.stringify(mockProduct))
      formData.append('count', '2')

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      expect(result.current.addItemState.error).toBeNull()
      expect(result.current.addItemState.productId).toBe(mockProduct.id)
      expect(result.current.addItemState.errorCode).toBeNull()
    })

    test('should handle missing product data', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      expect(result.current.addItemState.errorCode).toBeNull()

      const formData = new FormData()

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      expect(result.current.addItemState.error).toBe('Product data is required')
      expect(result.current.addItemState.errorCode).toBe('INVALID_FORM_DATA')
    })

    test('should reject invalid JSON product data', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('product', '{broken')

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      expect(result.current.addItemState.error).toBe(
        'Product data must be valid JSON'
      )
    })

    test('should reject oversized product data', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('product', 'x'.repeat(60_000))

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      expect(result.current.addItemState.error).toBe(
        'Product data is too large'
      )
    })

    test('should reject non-integer count', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('product', JSON.stringify(mockProduct))
      formData.append('count', '1.5')

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      expect(result.current.addItemState.error).toContain(
        'count must be an integer'
      )
    })

    test('should reject infinite count', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('product', JSON.stringify(mockProduct))
      formData.append('count', 'Infinity')

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      expect(result.current.addItemState.error).toContain(
        'count must be a finite number'
      )
    })

    test('should reject negative count', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('product', JSON.stringify(mockProduct))
      formData.append('count', '-2')

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      expect(result.current.addItemState.error).toContain(
        'count must be greater than 0'
      )
    })

    test('should default count to 1 if not provided', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })
    })
  })

  describe('removeFromCartAction', () => {
    test('should remove item via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      const removeFormData = new FormData()
      removeFormData.append('itemId', mockProduct.id)

      await act(async () => {
        await result.current.removeFromCartAction(removeFormData)
      })

      await waitFor(() => {
        expect(result.current.removeItemState.status).toBe('success')
      })

      expect(result.current.removeItemState.itemId).toBe(mockProduct.id)
    })

    test('should handle missing itemId', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()

      await act(async () => {
        await result.current.removeFromCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.removeItemState.status).toBe('error')
      })

      expect(result.current.removeItemState.error).toBe('Item ID is required')
    })
  })

  describe('updateQuantityAction', () => {
    test('should update quantity via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      const updateFormData = new FormData()
      updateFormData.append('itemId', mockProduct.id)
      updateFormData.append('quantity', '5')

      await act(async () => {
        await result.current.updateQuantityAction(updateFormData)
      })

      await waitFor(() => {
        expect(result.current.updateQuantityState.status).toBe('success')
      })

      expect(result.current.updateQuantityState.quantity).toBe(5)
    })

    test('should handle missing fields', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()

      await act(async () => {
        await result.current.updateQuantityAction(formData)
      })

      await waitFor(() => {
        expect(result.current.updateQuantityState.status).toBe('error')
      })

      expect(result.current.updateQuantityState.error).toBe(
        'Item ID is required'
      )
    })

    test('should handle invalid quantity', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('itemId', 'test_id')
      formData.append('quantity', 'invalid')

      await act(async () => {
        await result.current.updateQuantityAction(formData)
      })

      await waitFor(() => {
        expect(result.current.updateQuantityState.status).toBe('error')
      })

      expect(result.current.updateQuantityState.error).toContain(
        'quantity must be a finite number'
      )
    })

    test('should handle negative quantity', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('itemId', 'test_id')
      formData.append('quantity', '-5')

      await act(async () => {
        await result.current.updateQuantityAction(formData)
      })

      await waitFor(() => {
        expect(result.current.updateQuantityState.status).toBe('error')
      })

      expect(result.current.updateQuantityState.error).toContain(
        'quantity must be greater than or equal to 0'
      )
    })

    test('should reject non-integer quantity', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('itemId', 'test_id')
      formData.append('quantity', '1.25')

      await act(async () => {
        await result.current.updateQuantityAction(formData)
      })

      await waitFor(() => {
        expect(result.current.updateQuantityState.status).toBe('error')
      })

      expect(result.current.updateQuantityState.error).toContain(
        'quantity must be an integer'
      )
    })

    test('should reject infinite quantity', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('itemId', 'test_id')
      formData.append('quantity', 'Infinity')

      await act(async () => {
        await result.current.updateQuantityAction(formData)
      })

      await waitFor(() => {
        expect(result.current.updateQuantityState.status).toBe('error')
      })

      expect(result.current.updateQuantityState.error).toContain(
        'quantity must be a finite number'
      )
    })
  })

  describe('incrementItemAction', () => {
    test('should increment item via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      const incrementFormData = new FormData()
      incrementFormData.append('itemId', mockProduct.id)
      incrementFormData.append('count', '2')

      await act(async () => {
        await result.current.incrementItemAction(incrementFormData)
      })

      await waitFor(() => {
        expect(result.current.incrementItemState.status).toBe('success')
      })
    })

    test('should default count to 1', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      const formData = new FormData()
      formData.append('itemId', mockProduct.id)

      await act(async () => {
        await result.current.incrementItemAction(formData)
      })

      await waitFor(() => {
        expect(result.current.incrementItemState.status).toBe('success')
      })
    })

    test('should handle missing itemId', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()

      await act(async () => {
        await result.current.incrementItemAction(formData)
      })

      await waitFor(() => {
        expect(result.current.incrementItemState.status).toBe('error')
      })

      expect(result.current.incrementItemState.error).toBe(
        'Item ID is required'
      )
    })

    test('should reject invalid count', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('itemId', 'test_id')
      formData.append('count', '0')

      await act(async () => {
        await result.current.incrementItemAction(formData)
      })

      await waitFor(() => {
        expect(result.current.incrementItemState.status).toBe('error')
      })

      expect(result.current.incrementItemState.error).toContain(
        'count must be greater than 0'
      )
    })
  })

  describe('decrementItemAction', () => {
    test('should decrement item via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))
      addFormData.append('count', '3')

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      const decrementFormData = new FormData()
      decrementFormData.append('itemId', mockProduct.id)
      decrementFormData.append('count', '1')

      await act(async () => {
        await result.current.decrementItemAction(decrementFormData)
      })

      await waitFor(() => {
        expect(result.current.decrementItemState.status).toBe('success')
      })
    })

    test('should handle missing itemId', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()

      await act(async () => {
        await result.current.decrementItemAction(formData)
      })

      await waitFor(() => {
        expect(result.current.decrementItemState.status).toBe('error')
      })

      expect(result.current.decrementItemState.error).toBe(
        'Item ID is required'
      )
    })

    test('should reject invalid count', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('itemId', 'test_id')
      formData.append('count', '-1')

      await act(async () => {
        await result.current.decrementItemAction(formData)
      })

      await waitFor(() => {
        expect(result.current.decrementItemState.status).toBe('error')
      })

      expect(result.current.decrementItemState.error).toContain(
        'count must be greater than 0'
      )
    })
  })

  describe('clearCartAction', () => {
    test('should clear cart via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      const clearFormData = new FormData()

      await act(async () => {
        await result.current.clearCartAction(clearFormData)
      })

      await waitFor(() => {
        expect(result.current.clearCartState.status).toBe('success')
      })

      expect(result.current.clearCartState.error).toBeNull()
    })
  })

  describe('isPending global state', () => {
    test('should be true when any action is pending', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      expect(result.current.isPending).toBe(false)

      const formData = new FormData()
      formData.append('product', JSON.stringify(mockProduct))

      let actionPromise
      await act(async () => {
        actionPromise = result.current.addToCartAction(formData)
      })

      await act(async () => {
        await actionPromise
      })

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })
    })
  })

  describe('state management', () => {
    test('should maintain separate states for different actions', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      expect(result.current.addItemState.status).toBe('idle')
      expect(result.current.removeItemState.status).toBe('idle')
      expect(result.current.updateQuantityState.status).toBe('idle')
      expect(result.current.incrementItemState.status).toBe('idle')
      expect(result.current.decrementItemState.status).toBe('idle')
      expect(result.current.clearCartState.status).toBe('idle')
    })

    test('should handle errors without affecting other actions', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const badFormData = new FormData()

      await act(async () => {
        await result.current.addToCartAction(badFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      expect(result.current.removeItemState.status).toBe('idle')
      expect(result.current.clearCartState.status).toBe('idle')
    })
  })

  describe('errorCode', () => {
    test('carries the CartError code from the cart', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('itemId', 'missing')

      await act(async () => {
        await result.current.incrementItemAction(formData)
      })

      await waitFor(() => {
        expect(result.current.incrementItemState.status).toBe('error')
      })

      expect(result.current.incrementItemState.errorCode).toBe(
        'ITEM_NOT_IN_CART'
      )
    })
  })
})
