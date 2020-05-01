import React from 'react'
import { Link } from 'gatsby'
require('typeface-bungee')

const Logo = () => {
  return (
    <Link
      aria-label={'Use Shopping Cart'}
      style={{
        backgroundColor: 'white',
        color: '#3E4C93',
        fontFamily: 'bungee',
      }}
      to={'/'}
    >
      use-shopping-cart
    </Link>
  )
}

export default Logo
