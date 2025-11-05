'use client'

import React from 'react'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'
import type { Product } from 'use-shopping-cart/core'
import { CartDisplay } from './CartDisplay'

const sampleProducts: Product[] = [
  {
    id: 'banana_001',
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    price: 400,
    currency: 'USD',
    image: 'https://i.imgur.com/AUJQtJC.jpg'
  },
  {
    id: 'apple_001',
    name: 'Apples',
    description: 'Crisp and delicious',
    price: 300,
    currency: 'USD',
    image: 'https://i.imgur.com/vkwjWG1.jpg'
  },
  {
    id: 'orange_001',
    name: 'Oranges',
    description: 'Juicy citrus fruit',
    price: 350,
    currency: 'USD',
    image: 'https://i.imgur.com/m7IHiAN.jpg'
  }
]

export function ClearCartDemo() {
  const { clearCart, addItem, cartCount } = useShoppingCart()

  const addAllProducts = () => {
    sampleProducts.forEach((product) => {
      addItem(product, { count: Math.floor(Math.random() * 5) + 1 })
    })
  }

  return (
    <div className="not-prose my-8 border rounded-lg p-6 bg-fd-card">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Cart Display */}
        <div className="flex-1">
          <CartDisplay />
        </div>

        {/* Right Side: Products + Buttons */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Product Display */}
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {sampleProducts.map((product) => (
                <div key={product.id} className="flex flex-col items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                  <p className="text-xs text-center mt-1">{product.name}</p>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-semibold">Multiple Products</h3>
            <p className="text-fd-muted-foreground text-sm text-center">
              Add multiple items and clear them all at once
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold mb-2">Try it out:</h4>

            <button
              onClick={addAllProducts}
              className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors"
            >
              Add all products
            </button>

            <button
              onClick={() => clearCart()}
              disabled={cartCount === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear entire cart
            </button>

            <p className="text-sm text-fd-muted-foreground mt-2">
              clearCart() removes all items from the cart at once
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
