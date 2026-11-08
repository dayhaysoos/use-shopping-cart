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

    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    expect(result.current.cartDetails[mockProduct.id]).toBeDefined()
    expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)
  })

  test('should remove item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    await act(async () => {
      result.current.removeItem(mockProduct.id)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(0)
    })

    expect(result.current.cartDetails[mockProduct.id]).toBeUndefined()
  })

  test('should increment item optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)
    })

    await act(async () => {
      result.current.incrementItem(mockProduct.id)
    })

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

    await act(async () => {
      result.current.addItem(mockProduct, { count: 2 })
    })

    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(2)
    })

    await act(async () => {
      result.current.decrementItem(mockProduct.id)
    })

    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(1)
    })
  })

  test('should remove item when decrementing to 0', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    await act(async () => {
      result.current.decrementItem(mockProduct.id)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(0)
    })

    expect(result.current.cartDetails[mockProduct.id]).toBeUndefined()
  })

  test('should set quantity optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    await act(async () => {
      result.current.addItem(mockProduct)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    await act(async () => {
      result.current.setItemQuantity(mockProduct.id, 5)
    })

    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id].quantity).toBe(5)
    })
  })

  test('should clear cart optimistically', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    await act(async () => {
      result.current.addItem(mockProduct)
      result.current.addItem({ ...mockProduct, id: 'prod_456' })
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(2)
    })

    await act(async () => {
      result.current.clearCart()
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(0)
    })

    expect(Object.keys(result.current.cartDetails).length).toBe(0)
  })

  test('should calculate optimistic totals correctly', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    await act(async () => {
      result.current.addItem(mockProduct, { count: 2 })
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(2)
    })

    expect(result.current.totalPrice).toBe(2000)
  })

  test('should handle multiple optimistic updates', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    await act(async () => {
      result.current.addItem(mockProduct)
      result.current.incrementItem(mockProduct.id)
      result.current.incrementItem(mockProduct.id)
    })

    await waitFor(() => {
      expect(result.current.cartDetails[mockProduct.id]?.quantity).toBe(3)
    })

    expect(result.current.cartCount).toBe(3)
  })

  test('should generate unique IDs for products without IDs', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    const productWithoutId1 = {
      name: 'Product Without ID 1',
      price: 500,
      currency: 'USD'
    }
    const productWithoutId2 = {
      name: 'Product Without ID 2',
      price: 750,
      currency: 'USD'
    }

    await act(async () => {
      result.current.addItem(productWithoutId1)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    await act(async () => {
      result.current.addItem(productWithoutId2)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(2)
    })

    const cartEntries = Object.values(result.current.cartDetails)
    expect(cartEntries.length).toBe(2)

    const ids = Object.keys(result.current.cartDetails)
    expect(ids[0]).not.toBe('')
    expect(ids[1]).not.toBe('')
    expect(ids[0]).not.toBe(ids[1])

    expect(productWithoutId1.id).toBeUndefined()
    expect(productWithoutId2.id).toBeUndefined()
  })

  test('should reconcile optimistic state with real state for products without IDs', async () => {
    const { result } = renderHook(() => useOptimisticCart(), { wrapper })

    const productWithoutId = {
      name: 'Product Without ID',
      price: 1200,
      currency: 'USD'
    }

    await act(async () => {
      result.current.addItem(productWithoutId)
    })

    await waitFor(() => {
      expect(result.current.cartCount).toBe(1)
    })

    const cartEntries = Object.values(result.current.cartDetails)
    expect(cartEntries.length).toBe(1)

    const [cartEntry] = cartEntries
    expect(cartEntry.id).toBeDefined()
    expect(typeof cartEntry.id).toBe('string')
    expect(cartEntry.id.length).toBeGreaterThan(0)

    expect(result.current.cartDetails[cartEntry.id]).toBeDefined()
    expect(result.current.cartDetails[cartEntry.id].quantity).toBe(1)

    await waitFor(() => {
      expect(result.current.isOptimistic).toBe(false)
    })
  })
})
