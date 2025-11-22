import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import * as React from 'react'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="use-shopping-cart logo"
            className="h-6 w-auto"
          />
          <span>use-shopping-cart</span>
        </div>
      )
    },
    links: [
      {
        text: 'Discord',
        url: 'https://discord.gg/TNQfW4W',
        external: true
      }
    ]
  }
}
