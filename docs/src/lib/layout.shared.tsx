import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import * as React from 'react'

const DOCS_URL = '/docs'
const GITHUB_URL = 'https://github.com/dayhaysoos/use-shopping-cart'
const DISCORD_URL = 'https://discord.gg/TNQfW4W'
export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: GITHUB_URL,
    nav: {
      enabled: true,
      title: (
        <div className="flex items-center gap-2 text-[#0b1124] dark:text-white">
          <img
            src="/logo.png"
            alt="use-shopping-cart logo"
            className="h-6 w-auto"
          />
          <span className="text-base font-semibold tracking-tight">
            use-shopping-cart
          </span>
        </div>
      ),
      url: '/'
    },
    links: [
      {
        text: 'Docs',
        url: DOCS_URL,
        on: 'nav'
      },
      {
        text: 'GitHub',
        url: GITHUB_URL,
        external: true,
        on: 'nav'
      },
      {
        text: 'Discord',
        url: DISCORD_URL,
        external: true,
        on: 'nav'
      }
    ]
  }
}
