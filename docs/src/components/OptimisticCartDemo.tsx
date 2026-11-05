'use client'

import { useState } from 'react'
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

const failingProducts = new WeakSet<Product>()

function simulateServer(shouldFail: boolean) {
  return new Promise<void>((resolve, reject) =>
    setTimeout(
      () => (shouldFail ? reject(new Error('Server rejected')) : resolve()),
      shouldFail ? 1500 : 2500
    )
  )
}

export function OptimisticCartDemo() {
  const { addItem, cartDetails, isOptimistic, error } = useOptimisticCart({
    onChange: (change) =>
      simulateServer(
        change.type === 'add' && failingProducts.has(change.product)
      )
  })
  const [selectedProduct, setSelectedProduct] = useState(sampleProducts[0])

  const price = formatCurrencyString({
    value: selectedProduct.price,
    currency: selectedProduct.currency,
    language: 'en-US'
  })

  const itemInCart = selectedProduct.id
    ? cartDetails[selectedProduct.id]
    : undefined
  const isThisItemOptimistic = itemInCart?._optimistic === true

  return (
    <div className="not-prose my-8 border rounded-lg p-6 bg-fd-card">
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

      {error != null && !isOptimistic && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-600 dark:text-red-400">
          The last change failed, so it was rolled back.
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <CartDisplay />
        </div>

        <div className="flex-1 flex flex-col gap-4">
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
                  alt={`${product.name} product photo`}
                  className="w-full h-20 object-contain rounded mb-1"
                />
                <p className="text-xs text-center font-medium">
                  {product.name}
                </p>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <img
              src={selectedProduct.image}
              alt={`${selectedProduct.name} product photo`}
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

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold mb-2">Try Optimistic Updates:</h4>

            <button
              onClick={() => addItem(selectedProduct)}
              disabled={isThisItemOptimistic}
              className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThisItemOptimistic ? 'Confirming...' : 'Add to cart'}
            </button>

            <button
              onClick={() => addItem(selectedProduct, { count: 5 })}
              disabled={isThisItemOptimistic}
              className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThisItemOptimistic ? 'Confirming...' : 'Add 5 to cart'}
            </button>

            <button
              onClick={() => {
                const product = { ...selectedProduct }
                failingProducts.add(product)
                addItem(product)
              }}
              disabled={isThisItemOptimistic}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThisItemOptimistic ? 'Confirming...' : 'Add with Error (Demo)'}
            </button>

            <div className="mt-4 p-4 bg-fd-secondary/50 rounded-md text-sm">
              <p className="font-semibold mb-2">💡 What's happening?</p>
              <ul className="list-disc list-inside space-y-1 text-fd-muted-foreground">
                <li>
                  The quantity under the product updates instantly, marked
                  "confirming..."
                </li>
                <li>
                  The cart on the left uses useShoppingCart, so it updates once
                  the simulated server confirms
                </li>
                <li>
                  <strong>Try the error button</strong> - UI automatically rolls
                  back on failure
                </li>
                <li>
                  Uses <code>useOptimisticCart(&#123; onChange &#125;)</code>{' '}
                  with a simulated server
                </li>
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
