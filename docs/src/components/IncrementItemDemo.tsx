'use client'

import React from 'react'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'
import type { Product } from 'use-shopping-cart/core'
import { CartDisplay } from './CartDisplay'

const sampleProduct: Product = {
  id: 'banana_001',
  name: 'Bananas',
  description: 'Yummy yellow fruit',
  price: 400,
  currency: 'USD',
  image: 'https://i.imgur.com/AUJQtJC.jpg'
}

export function IncrementItemDemo() {
  const { incrementItem, addItem, cartCount, cartDetails } = useShoppingCart()

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
        {/* Left Side: Cart Display */}
        <div className="flex-1">
          <CartDisplay />
        </div>

        {/* Right Side: Product + Buttons */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Product Display */}
          <div className="flex flex-col items-center">
            <img
              src={sampleProduct.image}
              alt={sampleProduct.name}
              className="w-full max-w-xs h-64 object-contain rounded-lg mb-4"
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
          <div className="flex flex-col gap-3">
            {!itemInCart ? (
              <>
                <h4 className="font-semibold mb-2">Add to Cart First:</h4>
                <button
                  onClick={() => addItem(sampleProduct)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add {sampleProduct.name} to Cart
                </button>
                <p className="text-sm text-fd-muted-foreground">
                  Add the item to your cart to try incrementing
                </p>
              </>
            ) : (
              <>
                <h4 className="font-semibold mb-2">Increment Item:</h4>
                <button
                  onClick={() => incrementItem(sampleProduct.id!)}
                  className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors"
                >
                  Increment by 1
                </button>

                <button
                  onClick={() => incrementItem(sampleProduct.id!, { count: 5 })}
                  className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors"
                >
                  Increment by 5
                </button>

                <p className="text-sm text-fd-muted-foreground mt-2">
                  Click to increase quantity
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
