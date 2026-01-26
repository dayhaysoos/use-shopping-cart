import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router'
import * as React from 'react'
import { useEffect } from 'react'
import { ConvexProvider } from 'convex/react'
import { RootProvider } from 'fumadocs-ui/provider/tanstack'
import appCss from '@/styles/app.css?url'
import { convexClient } from '@/lib/convexClient'

const FATHOM_SITE_ID = import.meta.env.VITE_FATHOM_SITE_ID ?? 'RFCETJAH'

// A11y patch to wrap orphan <li> elements in <ul> containers
// Must run AFTER React hydration to avoid hydration mismatch
function useListPatch() {
  useEffect(() => {
    const SELECTOR = 'li.list-none'

    function wrap(li: Element) {
      if (!(li instanceof HTMLLIElement)) return
      if (li.dataset.uscListWrapped === 'true') return
      if (li.closest('ul,ol,menu')) return

      const parent = li.parentElement
      if (!parent) return

      const wrapper = document.createElement('ul')
      wrapper.setAttribute('data-usc-list-wrapper', '')
      wrapper.style.listStyle = 'none'
      wrapper.style.margin = '0'
      wrapper.style.padding = '0'
      parent.insertBefore(wrapper, li)
      wrapper.appendChild(li)
      li.dataset.uscListWrapped = 'true'
    }

    function scan(root: Element | Document) {
      const nodes: Element[] = []
      if (root instanceof Element && root.matches?.(SELECTOR)) {
        nodes.push(root)
      }
      if (root.querySelectorAll) {
        nodes.push(...Array.from(root.querySelectorAll(SELECTOR)))
      }
      nodes.forEach(wrap)
    }

    // Initial scan after hydration
    scan(document)

    // Watch for new nodes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          scan(node as Element)
        })
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])
}

// Force full page navigation for /docs links to bypass SPA routing issues
// This is needed because the docs route uses server-only APIs that don't work on client
function useDocsFullPageNavigation() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Only intercept internal /docs links
      if (href.startsWith('/docs')) {
        e.preventDefault()
        e.stopPropagation()
        window.location.href = href
      }
    }

    // Use capture phase to intercept before TanStack Router
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])
}

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
  // Run a11y list patch after hydration to avoid hydration mismatch
  useListPatch()
  // Force full page navigation for docs links
  useDocsFullPageNavigation()

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
