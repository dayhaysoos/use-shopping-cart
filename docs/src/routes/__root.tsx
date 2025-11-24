import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts
} from '@tanstack/react-router'
import * as React from 'react'
import appCss from '@/styles/app.css?url'
import { RootProvider } from 'fumadocs-ui/provider/tanstack'

const LIST_PATCH_SCRIPT = `(function(){var SELECTOR='li.list-none';function wrap(li){if(!li||li.dataset.uscListWrapped==='true'){return;}if(li.closest('ul,ol,menu')){return;}var parent=li.parentElement;if(!parent){return;}var wrapper=document.createElement('ul');wrapper.setAttribute('data-usc-list-wrapper','');wrapper.style.listStyle='none';wrapper.style.margin='0';wrapper.style.padding='0';parent.insertBefore(wrapper,li);wrapper.appendChild(li);li.dataset.uscListWrapped='true';}function scan(root){var nodes=(root.matches?root.matches(SELECTOR)?[root]:[]:[]).concat(Array.from(root.querySelectorAll?root.querySelectorAll(SELECTOR):[]));nodes.forEach(wrap);}function init(){scan(document);var observer=new MutationObserver(function(mutations){mutations.forEach(function(m){m.addedNodes&&m.addedNodes.forEach(function(node){if(node.nodeType!==1)return;scan(node);});});});observer.observe(document.body,{childList:true,subtree:true});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init,{once:true});}else{init();}})();`

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
        <script
          id="usc-a11y-list-patch"
          dangerouslySetInnerHTML={{ __html: LIST_PATCH_SCRIPT }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
        <Scripts />
      </body>
    </html>
  )
}
