'use client'

import * as React from 'react'
import { useShoppingCart } from './useShoppingCart'

export interface DebugCartProps extends React.DetailedHTMLProps<
  React.TableHTMLAttributes<HTMLTableElement>,
  HTMLTableElement
> {}

export function DebugCart(props: DebugCartProps) {
  const state = Object.entries(useShoppingCart()).filter(
    ([, value]) => typeof value !== 'function'
  )

  return (
    <table
      {...props}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: '1rem',
        fontSize: '12px',
        maxWidth: '400px',
        ...props.style
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Property</th>
          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Value</th>
        </tr>
      </thead>
      <tbody>
        {state.map(([key, value]) => (
          <tr key={key}>
            <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{key}</td>
            <td
              style={{
                padding: '0.5rem',
                maxWidth: '200px',
                wordBreak: 'break-word'
              }}
            >
              {typeof value === 'object' && value !== null ? (
                <button
                  onClick={() => console.log(`${key}:`, value)}
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    cursor: 'pointer'
                  }}
                >
                  Log to console
                </button>
              ) : (
                String(value)
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
