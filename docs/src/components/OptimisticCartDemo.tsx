'use client'

import React, { useState } from 'react'
import { useOptimisticCart, formatCurrencyString } from 'use-shopping-cart'
import type { Product } from 'use-shopping-cart/core'
import { CartDisplay } from './CartDisplay'

const sampleProducts: Product[] = [
  {
    id: 'banana_001',
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    price: 400,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&q=80'
  },
  {
    id: 'apple_001',
    name: 'Apples',
    description: 'Crisp and delicious',
    price: 300,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop&q=80'
  },
  {
    id: 'orange_001',
    name: 'Oranges',
    description: 'Juicy citrus fruit',
    price: 350,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop&q=80'
  }
]

export function OptimisticCartDemo() {
  const { addItem, cartDetails, decrementItem } = useOptimisticCart()
  const [selectedProduct, setSelectedProduct] = React.useState(
    sampleProducts[0]
  )
  const [processingItems, setProcessingItems] = React.useState<Set<string>>(
    new Set()
  )

  // Create delayed version of addItem that shows immediate optimistic update
  const addItemWithDelay = async (product: Product, options = {}) => {
    const id = product.id as string

    // Mark this item as processing
    setProcessingItems((prev) => new Set(prev).add(id))

    // Call the actual cart update immediately for optimistic UI
    addItem(product, options)

    // Keep the loading state visible for 2.5 seconds
    setTimeout(() => {
      setProcessingItems((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 2500)
  }

  // Merge cart details with processing state
  const enhancedCartDetails = Object.fromEntries(
    Object.entries(cartDetails).map(([id, item]) => [
      id,
      {
        ...item,
        _optimistic: processingItems.has(id)
      }
    ])
  )

  const isOptimistic = processingItems.size > 0

  const price = formatCurrencyString({
    value: selectedProduct.price,
    currency: selectedProduct.currency,
    language: 'en-US'
  })

  const itemInCart =
    selectedProduct.id && enhancedCartDetails
      ? enhancedCartDetails[selectedProduct.id]
      : undefined

  // Check if this specific item is optimistic
  const isThisItemOptimistic = selectedProduct.id
    ? processingItems.has(selectedProduct.id)
    : false

  return (
    <div className="not-prose my-8 border rounded-lg p-6 bg-fd-card">
      {/* Syncing State Indicator */}
      {isOptimistic && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            🔄 Confirming changes...
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Cart Display */}
        <div className="flex-1">
          <CartDisplay />
        </div>

        {/* Right Side: Products + Buttons */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Product Selector */}
          <div className="grid grid-cols-3 gap-2">
            {sampleProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`p-2 border rounded-lg transition-colors ${
                  selectedProduct.id === product.id
                    ? 'border-fd-primary bg-fd-primary/10'
                    : 'border-fd-border hover:border-fd-primary/50'
                }`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-20 object-contain rounded mb-1"
                />
                <p className="text-xs text-center font-medium">
                  {product.name}
                </p>
              </button>
            ))}
          </div>

          {/* Selected Product Display */}
          <div className="flex flex-col items-center">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full max-w-xs h-48 object-contain rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
            <p className="text-fd-muted-foreground text-sm">
              {selectedProduct.description}
            </p>
            <p className="text-lg font-bold mt-2">{price}</p>
            {itemInCart && (
              <p
                className={`text-sm mt-2 ${
                  isThisItemOptimistic
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {isThisItemOptimistic ? (
                  <>⏳ {itemInCart.quantity} in cart (confirming...)</>
                ) : (
                  <>✓ {itemInCart.quantity} in cart</>
                )}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold mb-2">Try Optimistic Updates:</h4>

            <button
              onClick={() => addItemWithDelay(selectedProduct)}
              disabled={isThisItemOptimistic}
              className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThisItemOptimistic ? 'Confirming...' : 'Add to cart'}
            </button>

            <button
              onClick={() => addItemWithDelay(selectedProduct, { count: 5 })}
              disabled={isThisItemOptimistic}
              className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThisItemOptimistic ? 'Confirming...' : 'Add 5 to cart'}
            </button>

            <button
              onClick={async () => {
                if (!selectedProduct.id) return
                const id = selectedProduct.id
                setProcessingItems((prev) => new Set(prev).add(id))

                try {
                  // Add item optimistically
                  addItem(selectedProduct)

                  // Simulate failed async operation
                  await new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Failed')), 1500)
                  )
                } catch {
                  // On error, rollback the optimistic update
                  decrementItem(id)
                } finally {
                  setProcessingItems((prev) => {
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                  })
                }
              }}
              disabled={isThisItemOptimistic}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThisItemOptimistic ? 'Confirming...' : 'Add with Error (Demo)'}
            </button>

            <div className="mt-4 p-4 bg-fd-secondary/50 rounded-md text-sm">
              <p className="font-semibold mb-2">💡 What's happening?</p>
              <ul className="list-disc list-inside space-y-1 text-fd-muted-foreground">
                <li>Cart count increases instantly (optimistic update)</li>
                <li>Shows "Confirming..." while syncing in background</li>
                <li>
                  <strong>Try the error button</strong> - UI automatically rolls
                  back on failure
                </li>
                <li>Uses React 19's useOptimistic hook</li>
              </ul>
              <p className="mt-2 text-xs text-fd-muted-foreground italic">
                Note: 2.5 second delay added to this demo to showcase the
                confirmation state
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
