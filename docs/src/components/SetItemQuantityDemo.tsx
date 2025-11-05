'use client'

import React, { useState } from 'react'
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

export function SetItemQuantityDemo() {
  const { setItemQuantity, addItem, cartCount, cartDetails } = useShoppingCart()
  const [quantity, setQuantity] = useState(5)

  const price = formatCurrencyString({
    value: sampleProduct.price,
    currency: sampleProduct.currency,
    language: 'en-US'
  })

  const itemInCart =
    sampleProduct.id && cartDetails ? cartDetails[sampleProduct.id] : undefined

  const handleSetQuantity = () => {
    if (!itemInCart) {
      // Add item first if not in cart
      addItem(sampleProduct)
    }
    setItemQuantity(sampleProduct.id!, quantity)
  }

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
            <h4 className="font-semibold mb-2">Set specific quantity:</h4>

            <div className="flex items-center gap-2">
              <label htmlFor="quantity" className="text-sm">
                Quantity:
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="px-3 py-2 border rounded-md w-24"
              />
            </div>

            <button
              onClick={handleSetQuantity}
              className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors"
            >
              Set to {quantity}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setQuantity(10)
                  handleSetQuantity()
                }}
                className="flex-1 px-4 py-2 bg-fd-secondary text-fd-secondary-foreground rounded-md hover:bg-fd-secondary/90 transition-colors text-sm"
              >
                Set to 10
              </button>
              <button
                onClick={() => {
                  setQuantity(25)
                  handleSetQuantity()
                }}
                className="flex-1 px-4 py-2 bg-fd-secondary text-fd-secondary-foreground rounded-md hover:bg-fd-secondary/90 transition-colors text-sm"
              >
                Set to 25
              </button>
            </div>

            <p className="text-sm text-fd-muted-foreground mt-2">
              setItemQuantity() sets an exact quantity (setting to 0 removes the
              item)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
