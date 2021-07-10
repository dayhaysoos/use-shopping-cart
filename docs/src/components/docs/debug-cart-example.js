import React from 'react'
import { DebugCart } from 'use-shopping-cart'

export function DebugCartExample() {
  return (
    <>
      <p>This is an example of what the DebugCart component looks like.</p>
      <DebugCart className="usc-debug" style={{}} />
      <style>{`
        .usc-debug {
          border-spacing: 0 10px;

          max-width: 500px;
          padding: 20px;

          background-color: #eee;
          text-align: left;
        }
      `}</style>
    </>
  )
}

export default DebugCartExample
