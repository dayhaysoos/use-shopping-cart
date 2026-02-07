import { createFileRoute, notFound } from '@tanstack/react-router'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { createServerFn } from '@tanstack/react-start'
import browserCollections from '@/.source/browser'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle
} from 'fumadocs-ui/page'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import { baseOptions } from '@/lib/layout.shared'
import { CartButton } from '@/components/CartButton'
import { CartProvider } from 'use-shopping-cart'
import { trackEvent } from '@/lib/analytics'
import { useFumadocsLoader } from 'fumadocs-core/source/client'
import { Suspense, useEffect } from 'react'

const getPageData = createServerFn({
  method: 'GET'
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const { source } = await import('@/lib/source')
    const page = source.getPage(slugs)
    if (!page) throw notFound()

    return {
      pageTree: await source.serializePageTree(source.pageTree),
      path: page.path
    }
  })

const clientLoader = browserCollections.docs.createClientLoader({
  id: 'docs',
  component({ toc, frontmatter, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents
            }}
          />
        </DocsBody>
      </DocsPage>
    )
  }
})

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? []
    const data = await getPageData({ data: slugs })
    await clientLoader.preload(data.path)
    return data
  }
})

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData())

  useEffect(() => {
    trackEvent('docs_page_view')
  }, [data.path])

  return (
    <CartProvider stripe={''} currency="USD" shouldPersist={false}>
      <DocsLayout {...baseOptions()} tree={data.pageTree}>
        <Suspense>{clientLoader.useContent(data.path)}</Suspense>
      </DocsLayout>
      <div className="fixed top-4 right-4 z-50">
        <CartButton />
      </div>
    </CartProvider>
  )
}
