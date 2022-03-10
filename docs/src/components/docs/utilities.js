import React from 'react'
import { Link } from '@docusaurus/Link'

export function AddMoreItems() {
  return (
    <div className="red" style={{ width: '50%' }}>
      <style>{`.red p { color: hsla(0, 64%, 42%, 1); }`}</style>
      <p>
        You currently don't have any items in your cart.
        <br />
        Come back after you{' '}
        <Link to="/docs/usage/actions/add-item">
          add more items to your cart
        </Link>
        .
      </p>
    </div>
  )
}
