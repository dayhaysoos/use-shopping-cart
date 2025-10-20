import { renderHook, act, waitFor } from '@testing-library/react'
import { CartProvider } from './index'
import { useOptimisticCart } from './useOptimisticCart'

const wrapper = ({ children }) => (
  <CartProvider
    mode="payment"
    cartMode="client-only"
    stripe="pk_test_123"
    currency="USD"
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
    expect(result.current.isOptimistic).toBe(false)

    // Add item
    act(() => {
      result.current.addItem(mockProduct)
    })

    // Should immediately show optimistic update
    expect(result.current.cartCount).toBe(1)
    expect(result.current.isOptimistic).toBe(true)
    expect(result.current.cartDetails[mockProduct.id]).toBeDefined()
    expect(result.current.cartDetails[mockProduct.id]._optimistic).toBe(true)

    // Wait for real update to complete
    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    // Real state should match
    expect(result.current.cartCount).toBe(1)
  })

  test('should remove item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item first
    act(() => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    expect(result.current.cartCount).toBe(1)

    // Remove item
    act(() => {
      result.current.removeItem(mockProduct.id)
    })

    // Should immediately show optimistic removal
    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartDetails[mockProduct.id]).toBeUndefined()

    // Wait for real update
    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    expect(result.current.cartCount).toBe(0)
  })

  test('should increment item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item first
    act(() => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)

    // Increment
    act(() => {
      result.current.incrementItem(mockProduct.id)
    })

    // Should immediately show optimistic increment
    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(2)
    expect(result.current.isOptimistic).toBe(true)

    // Wait for real update
    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(2)
  })

  test('should decrement item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item with quantity 2
    act(() => {
      result.current.addItem(mockProduct, { count: 2 })
    })

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(2)

    // Decrement
    act(() => {
      result.current.decrementItem(mockProduct.id)
    })

    // Should immediately show optimistic decrement
    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)
    expect(result.current.isOptimistic).toBe(true)

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)
  })

  test('should remove item when decrementing to 0', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item with quantity 1
    act(() => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    // Decrement to 0
    act(() => {
      result.current.decrementItem(mockProduct.id)
    })

    // Should immediately remove item
    expect(result.current.cartDetails[mockProduct.id]).toBeUndefined()
    expect(result.current.cartCount).toBe(0)
  })

  test('should set quantity optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item
    act(() => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    // Set quantity to 5
    act(() => {
      result.current.setItemQuantity(mockProduct.id, 5)
    })

    // Should immediately show optimistic update
    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(5)
    expect(result.current.isOptimistic).toBe(true)

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(5)
  })

  test('should clear cart optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add multiple items
    act(() => {
      result.current.addItem(mockProduct)
      result.current.addItem({ ...mockProduct, id: 'prod_456' })
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(2)
    })

    // Clear cart
    act(() => {
      result.current.clearCart()
    })

    // Should immediately clear
    expect(result.current.cartCount).toBe(0)
    expect(Object.keys(result.current.cartDetails).length).toBe(0)

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })
  })

  test('should calculate optimistic totals correctly', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Add item with price 1000 (= $10.00)
    act(() => {
      result.current.addItem(mockProduct, { count: 2 })
    })

    // Optimistic total should be 2000 (2 * 1000)
    expect(result.current.totalPrice).toBe(2000)
    expect(result.current.cartCount).toBe(2)

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    // Real total should match
    expect(result.current.totalPrice).toBe(2000)
  })

  test('should handle multiple optimistic updates', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    // Multiple rapid updates
    act(() => {
      result.current.addItem(mockProduct)
      result.current.incrementItem(mockProduct.id)
      result.current.incrementItem(mockProduct.id)
    })

    // Should show cumulative optimistic state
    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(3)
    expect(result.current.isOptimistic).toBe(true)

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })

    // Final state should be correct
    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(3)
  })
})
