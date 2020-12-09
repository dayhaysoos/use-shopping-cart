import React from 'react'
import { Link } from 'gatsby'

export function AddMoreItems() {
  return (
    <div className="red" style={{ width: '50%' }}>
      <style>{`.red p { color: hsla(0, 64%, 42%, 1); }`}</style>
      <p>
        You currently don't have any items in your cart.
        <br />
        Come back after you <Link to="/usage/addItem()">add more items</Link> to
        your cart.
      </p>
    </div>
  )
}
