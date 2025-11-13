'use client'

import React from 'react'
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'
import type { CartEntry } from 'use-shopping-cart/core'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    cartCount,
    cartDetails,
    formattedTotalPrice,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart
  } = useShoppingCart()

  const cartItems = Object.values(cartDetails ?? {}) as CartEntry[]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-fd-background border-l border-fd-border z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-fd-border">
            <h2 className="text-lg font-semibold">
              Shopping Cart {cartCount > 0 && `(${cartCount})`}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-fd-accent rounded-md transition-colors"
              aria-label="Close cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-fd-muted-foreground mb-4"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                <p className="text-fd-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-fd-muted-foreground mt-2">
                  Try the interactive demos on the docs pages!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-fd-card rounded-lg border border-fd-border"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-fd-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                      <p className="text-sm font-semibold mt-1">
                        {formatCurrencyString({
                          value: item.price,
                          currency: item.currency,
                          language: 'en-US'
                        })}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => decrementItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center bg-fd-secondary hover:bg-fd-secondary/80 rounded-md transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => incrementItem(item.id)}
                          className="w-7 h-7 flex items-center justify-center bg-fd-secondary hover:bg-fd-secondary/80 rounded-md transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-sm text-fd-muted-foreground hover:text-fd-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-fd-border space-y-3">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formattedTotalPrice}</span>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'This is a demo. In a real app, this would redirect to checkout.'
                    )
                  ) {
                    // Could call redirectToCheckout() here in real implementation
                  }
                }}
                className="w-full py-3 bg-fd-primary text-fd-primary-foreground rounded-md hover:bg-fd-primary/90 transition-colors font-medium"
              >
                Checkout (Demo)
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Clear all items from cart?')) {
                    clearCart()
                  }
                }}
                className="w-full py-2 text-sm text-fd-muted-foreground hover:text-fd-destructive transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
