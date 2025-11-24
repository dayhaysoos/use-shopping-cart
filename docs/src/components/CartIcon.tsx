'use client'

import React from 'react'
import { useShoppingCart } from 'use-shopping-cart'

interface CartIconProps {
  onClick: () => void
}

export function CartIcon({ onClick }: CartIconProps) {
  const { cartCount } = useShoppingCart()
  const displayCartCount = cartCount ?? 0

  return (
    <button
      onClick={onClick}
      className="relative p-3 bg-fd-background border border-fd-border rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      aria-label="Shopping cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-fd-foreground"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      {displayCartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-fd-primary text-fd-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
          {displayCartCount}
        </span>
      )}
    </button>
  )
}
