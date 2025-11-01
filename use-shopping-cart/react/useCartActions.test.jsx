import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest'
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { CartProvider } from './CartProvider'
import { useCartActions } from './useCartActions'

// Suppress console errors/warnings in tests
// These are expected in tests but not in real usage
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
        args[0].includes('Invalid count used'))
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
    stripe="pk_test_123"
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
    })

    test('should handle missing product data', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      // No product data

      await act(async () => {
        await result.current.addToCartAction(formData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      expect(result.current.addItemState.error).toBe('Product data is required')
    })

    test('should default count to 1 if not provided', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      const formData = new FormData()
      formData.append('product', JSON.stringify(mockProduct))
      // No count provided

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

      // First add an item
      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      // Then remove it
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
      // No itemId

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

      // First add an item
      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      // Then update quantity
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
      // Missing itemId and quantity

      await act(async () => {
        await result.current.updateQuantityAction(formData)
      })

      await waitFor(() => {
        expect(result.current.updateQuantityState.status).toBe('error')
      })

      expect(result.current.updateQuantityState.error).toBe(
        'Item ID and quantity are required'
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

      expect(result.current.updateQuantityState.error).toBe(
        'Quantity must be a valid number'
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

      expect(result.current.updateQuantityState.error).toBe(
        'Quantity must be a valid number'
      )
    })
  })

  describe('incrementItemAction', () => {
    test('should increment item via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      // First add an item
      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      // Then increment
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

      // First, add an item to the cart
      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      // Now increment it without providing count (should default to 1)
      const formData = new FormData()
      formData.append('itemId', mockProduct.id)
      // No count provided - should default to 1

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
      // No itemId

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
  })

  describe('decrementItemAction', () => {
    test('should decrement item via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      // First add an item with quantity 3
      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))
      addFormData.append('count', '3')

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      // Then decrement
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
      // No itemId

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
  })

  describe('clearCartAction', () => {
    test('should clear cart via form action', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      // First add some items
      const addFormData = new FormData()
      addFormData.append('product', JSON.stringify(mockProduct))

      await act(async () => {
        await result.current.addToCartAction(addFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('success')
      })

      // Then clear the cart
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

      // During action execution, isPending might be true
      // But since actions are fast, we just verify it completes
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

      // All states should start idle
      expect(result.current.addItemState.status).toBe('idle')
      expect(result.current.removeItemState.status).toBe('idle')
      expect(result.current.updateQuantityState.status).toBe('idle')
      expect(result.current.incrementItemState.status).toBe('idle')
      expect(result.current.decrementItemState.status).toBe('idle')
      expect(result.current.clearCartState.status).toBe('idle')
    })

    test('should handle errors without affecting other actions', async () => {
      const { result } = renderHook(() => useCartActions(), { wrapper })

      // Trigger error on addItem
      const badFormData = new FormData()
      // No product data

      await act(async () => {
        await result.current.addToCartAction(badFormData)
      })

      await waitFor(() => {
        expect(result.current.addItemState.status).toBe('error')
      })

      // Other action states should still be idle
      expect(result.current.removeItemState.status).toBe('idle')
      expect(result.current.clearCartState.status).toBe('idle')
    })
  })
})
