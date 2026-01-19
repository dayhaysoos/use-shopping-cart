import { describe, test, expect } from 'vitest'
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { CartProvider } from './CartProvider'
import { useOptimisticCart } from './useOptimisticCart'

const wrapper = ({ children }) => (
  <CartProvider
    mode="payment"
    cartMode="client-only"
    stripe="pk_test_123"
    currency="USD"
    language="en-US"
    shouldPersist={false}
  >
    {children}
  </CartProvider>
)

describe('useOptimisticCart', () => {
  const mockProduct = {
    id: 'prod_123',
    name: 'Test Product',
    price: 1000,
    currency: 'USD',
    image: 'https://example.com/image.jpg'
  }

  test('should add item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    expect(result.current.cartCount).toBe(0)

    // Add item (wrapped in act)
    await act(async () => {
      result.current.addItem(mockProduct)
    })

    // Wait for update to complete
    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    // Real state should be present
    expect(result.current.cartDetails[mockProduct.id]).toBeDefined()
    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)
  })

  test('should remove item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item first
    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    // Remove item
    await act(async () => {
      result.current.removeItem(mockProduct.id)
    })

    // Wait for removal to complete
    await waitFor(() => {
      expect(result.current.cartCount).toBe(0)
    })

    expect(result.current.cartDetails[mockProduct.id]).toBeUndefined()
  })

  test('should increment item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item first
    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)
    })

    // Increment
    await act(async () => {
      result.current.incrementItem(mockProduct.id)
    })

    // Wait for increment to complete
    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(2)
      expect(result.current.cartDetails[mockProduct.id].formattedValue).toBe(
        '$20.00'
      )
      expect(result.current.cartDetails[mockProduct.id].formattedPrice).toBe(
        '$10.00'
      )
    })
  })

  test('should decrement item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item with quantity 2
    await act(async () => {
      result.current.addItem(mockProduct, { count: 2 })
    })

    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(2)
    })

    // Decrement
    await act(async () => {
      result.current.decrementItem(mockProduct.id)
    })

    // Wait for decrement to complete
    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)
    })
  })

  test('should remove item when decrementing to 0', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item with quantity 1
    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    // Decrement to 0
    await act(async () => {
      result.current.decrementItem(mockProduct.id)
    })

    // Wait for removal
    await waitFor(() => {
      expect(result.current.cartCount).toBe(0)
    })

    expect(result.current.cartDetails[mockProduct.id]).toBeUndefined()
  })

  test('should set quantity optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item
    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    // Set quantity to 5
    await act(async () => {
      result.current.setItemQuantity(mockProduct.id, 5)
    })

    // Wait for update
    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(5)
    })
  })

  test('should clear cart optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add multiple items
    await act(async () => {
      result.current.addItem(mockProduct)
      result.current.addItem({ ...mockProduct, id: 'prod_456' })
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(2)
    })

    // Clear cart
    await act(async () => {
      result.current.clearCart()
    })

    // Wait for clear
    await waitFor(() => {
      expect(result.current.cartCount).toBe(0)
    })

    expect(Object.keys(result.current.cartDetails).length).toBe(0)
  })

  test('should calculate optimistic totals correctly', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item with price 1000 (= $10.00)
    await act(async () => {
      result.current.addItem(mockProduct, { count: 2 })
    })

    // Wait for update
    await waitFor(() => {
      expect(result.current.cartCount).toBe(2)
    })

    // Total should be 2000 (2 * 1000)
    expect(result.current.totalPrice).toBe(2000)
  })

  test('should handle multiple optimistic updates', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Multiple rapid updates
    await act(async () => {
      result.current.addItem(mockProduct)
      result.current.incrementItem(mockProduct.id)
      result.current.incrementItem(mockProduct.id)
    })

    // Wait for all updates to complete
    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id]?.quantity).toBe(3)
    })

    // Final state should be correct
    expect(result.current.cartCount).toBe(3)
  })
})
