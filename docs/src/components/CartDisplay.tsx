'use client'

import React from 'react'
import { useShoppingCart } from 'use-shopping-cart'

export function CartDisplay() {
  const { cartCount, cartDetails = {} } = useShoppingCart()

  const hasItems = Object.keys(cartDetails).length > 0

  return (
    <div className="mt-4 p-4 bg-fd-card rounded-lg border border-fd-border">
      <h3 className="text-center text-lg font-semibold mb-3">Cart Display</h3>

      <div className="mb-3 p-2 bg-fd-muted rounded-md">
        <p className="text-sm font-mono text-center">
          <strong>Total Items:</strong> {cartCount}
        </p>
      </div>

      {!hasItems ? (
        <p className="text-fd-muted-foreground text-sm text-center py-4">
          Cart is empty. Add items to see them here!
        </p>
      ) : (
        <div className="space-y-3">
          {Object.keys(cartDetails).map((key) => {
            return (
              <div
                key={key}
                className="p-3 bg-fd-background rounded-md border border-fd-border"
              >
                <p className="text-sm font-semibold mb-2">
                  {cartDetails[key].name}
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span className="text-fd-muted-foreground">Quantity:</span>
                  <span className="font-mono">{cartDetails[key].quantity}</span>

                  <span className="text-fd-muted-foreground">Value:</span>
                  <span className="font-mono">
                    {cartDetails[key].formattedValue}
                  </span>

                  <span className="text-fd-muted-foreground">Price:</span>
                  <span className="font-mono">
                    {cartDetails[key].formattedPrice}
                  </span>

                  <span className="text-fd-muted-foreground">Currency:</span>
                  <span className="font-mono">{cartDetails[key].currency}</span>

                  {cartDetails[key].price_data &&
                    Object.keys(cartDetails[key].price_data).length > 0 && (
                      <>
                        <span className="text-fd-muted-foreground">
                          Price Metadata:
                        </span>
                        <span className="font-mono text-[10px]">
                          {JSON.stringify(cartDetails[key].price_data)}
                        </span>
                      </>
                    )}

                  {cartDetails[key].product_data &&
                    Object.keys(cartDetails[key].product_data).length > 0 && (
                      <>
                        <span className="text-fd-muted-foreground">
                          Product Metadata:
                        </span>
                        <span className="font-mono text-[10px]">
                          {JSON.stringify(cartDetails[key].product_data)}
                        </span>
                      </>
                    )}

                  <span className="text-fd-muted-foreground text-[10px]">
                    Added:
                  </span>
                  <span className="font-mono text-[10px]">
                    {new Date(cartDetails[key].timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
