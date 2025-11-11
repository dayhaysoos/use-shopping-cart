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

export function DecrementItemDemo() {
  const { decrementItem, addItem, cartCount, cartDetails } = useShoppingCart()
  const [selectedProduct, setSelectedProduct] = React.useState(
    sampleProducts[0]
  )

  const price = formatCurrencyString({
    value: selectedProduct.price,
    currency: selectedProduct.currency,
    language: 'en-US'
  })

  const itemInCart =
    selectedProduct.id && cartDetails
      ? cartDetails[selectedProduct.id]
      : undefined

  return (
    <div className="not-prose my-8 border rounded-lg p-6 bg-fd-card">
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
                  onClick={() => addItem(selectedProduct, { count: 10 })}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add 10 {selectedProduct.name} to Cart
                </button>
                <p className="text-sm text-fd-muted-foreground">
                  Add items to your cart to try decrementing
                </p>
              </>
            ) : (
              <>
                <h4 className="font-semibold mb-2">Decrement Item:</h4>
                <button
                  onClick={() => decrementItem(selectedProduct.id!)}
                  className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors"
                >
                  Decrement by 1
                </button>

                <button
                  onClick={() =>
                    decrementItem(selectedProduct.id!, { count: 5 })
                  }
                  disabled={itemInCart.quantity < 5}
                  className="px-4 py-2 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Decrement by 5
                </button>

                <p className="text-sm text-fd-muted-foreground mt-2">
                  Click to decrease quantity (removes item if quantity reaches
                  0)
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
