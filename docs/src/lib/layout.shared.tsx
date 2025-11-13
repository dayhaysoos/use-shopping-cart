import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import * as React from 'react'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'use-shopping-cart'
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
