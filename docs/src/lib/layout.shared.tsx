import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import * as React from 'react'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'use-shopping-cart',
      children: (
        <a
          href="https://discord.gg/TNQfW4W"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
        >
          Discord
        </a>
      )
    }
  }
}
