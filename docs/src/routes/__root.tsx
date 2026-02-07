import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router'
import * as React from 'react'
import { ConvexProvider } from 'convex/react'
import { RootProvider } from 'fumadocs-ui/provider/tanstack'
import appCss from '@/styles/app.css?url'
import { convexClient } from '@/lib/convexClient'

const FATHOM_SITE_ID = import.meta.env.VITE_FATHOM_SITE_ID ?? 'RFCETJAH'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'use-shopping-cart'
      },
      {
        name: 'description',
        content:
          'use-shopping-cart is the React toolkit for building Stripe Checkout flows with managed cart state, helpers, and optimized UX.'
      }
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  }),
  component: RootComponent
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {import.meta.env.PROD ? (
          <script
            src="https://cdn.usefathom.com/script.js"
            data-site={FATHOM_SITE_ID}
            defer
          />
        ) : null}
      </head>
      <body className="flex flex-col min-h-screen">
        <ConvexProvider client={convexClient}>
          <RootProvider>{children}</RootProvider>
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}
