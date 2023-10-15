'use client'

import { useShoppingCart } from 'use-shopping-cart'
import Image from 'next/image'
import Link from 'next/link'
import ShoppingCart from './ShoppingCart'

export default function NavBar() {
  const { handleCartClick, cartCount } = useShoppingCart()
  return (
    <nav className="py-5 bg-white px-12 flex justify-between">
      <Link href="/">
        <p className="bg-white text-3xl font-bold underline underline-offset-4 decoration-wavy decoration-2 decoration-emerald-500">
          fresh
        </p>
      </Link>
      <button className="relative" onClick={() => handleCartClick()}>
        <Image
          src="./cart.svg"
          width={40}
          height={40}
          alt="shopping cart icon"
        />
        <div className="rounded-full flex justify-center items-center bg-emerald-500 text-xs text-white absolute w-6 h-5 bottom-6 -right-1">
          {cartCount}
        </div>
      </button>
      <ShoppingCart />
    </nav>
  )
}
