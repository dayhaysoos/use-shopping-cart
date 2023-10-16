import './globals.css'
import { Inter } from 'next/font/google'

import CartProvider from './components/providers'
import NavBar from './components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Fresh',
  description:
    'Next.js 13 app router example to show how to use use-shopping-cart'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <NavBar />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
