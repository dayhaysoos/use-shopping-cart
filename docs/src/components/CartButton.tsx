'use client'

import React, { useState } from 'react'
import { CartIcon } from './CartIcon'
import { CartSidebar } from './CartSidebar'

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <CartIcon onClick={() => setIsOpen(true)} />
      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
