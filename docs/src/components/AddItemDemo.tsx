'use client'

import React from 'react'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'
import type { Product } from 'use-shopping-cart/core'

const sampleProduct: Product = {
  id: 'banana_001',
  name: 'Bananas',
  description: 'Yummy yellow fruit',
  price: 400,
  currency: 'USD',
  image: 'https://i.imgur.com/AUJQtJC.jpg'
}

export function AddItemDemo() {
  const { addItem, cartCount, cartDetails } = useShoppingCart()

  const price = formatCurrencyString({
    value: sampleProduct.price,
    currency: sampleProduct.currency,
    language: 'en-US'
  })

  const itemInCart =
    sampleProduct.id && cartDetails ? cartDetails[sampleProduct.id] : undefined

  return (
    <div className="not-prose my-8 border rounded-lg p-6 bg-fd-card">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Display */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={sampleProduct.image}
            alt={sampleProduct.name}
            className="w-full max-w-xs h-48 object-cover rounded-lg mb-4"
          />
          <h3 className="text-xl font-semibold">{sampleProduct.name}</h3>
          <p className="text-fd-muted-foreground text-sm">
            {sampleProduct.description}
          </p>
          <p className="text-lg font-bold mt-2">{price}</p>
          {itemInCart && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {itemInCart.quantity} in cart
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex flex-col gap-3">
          <h4 className="font-semibold mb-2">Try it out:</h4>

          <button
            onClick={() => addItem(sampleProduct)}
            className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors"
          >
            Add to cart
          </button>

          <button
            onClick={() => addItem(sampleProduct, { count: 10 })}
            className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors"
          >
            Add 10 to cart
          </button>

          <button
            onClick={() =>
              addItem(sampleProduct, {
                count: 1,
                price_metadata: { type: 'fruit' }
              })
            }
            className="px-4 py-2 bg-fd-secondary text-fd-secondary-foreground rounded-md hover:bg-fd-secondary/90 transition-colors"
          >
            Add with price metadata
          </button>

          <button
            onClick={() =>
              addItem(sampleProduct, {
                count: 1,
                product_metadata: { category: 'fruit' }
              })
            }
            className="px-4 py-2 bg-fd-secondary text-fd-secondary-foreground rounded-md hover:bg-fd-secondary/90 transition-colors"
          >
            Add with product metadata
          </button>

          {/* Cart Info */}
          <div className="mt-4 p-3 bg-fd-muted rounded-md">
            <p className="text-sm font-mono">
              <strong>Cart Count:</strong> {cartCount}
            </p>
            {itemInCart && (
              <div className="mt-2 text-xs">
                <p>
                  <strong>Quantity:</strong> {itemInCart.quantity}
                </p>
                <p>
                  <strong>Value:</strong>{' '}
                  {formatCurrencyString({
                    value: itemInCart.value,
                    currency: itemInCart.currency
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
