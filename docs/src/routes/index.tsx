import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/lib/layout.shared'
import { Container, Section, SectionHeading } from '@/components/home/Section'
import { CartInteractionPlayground } from '@/components/CartInteractionPlayground'
import { HeroShowcase } from '@/components/home/HeroShowcase'
import { Highlight, themes, type Language } from 'prism-react-renderer'

type HomeMetrics = {
  githubStars: number | null
  npmDownloads: number | null
}

type HomeLoaderData = {
  metrics: HomeMetrics
}

const INSTALL_SNIPPET = 'npm install @stripe/stripe-js use-shopping-cart'
const CODE_THEME = themes.nightOwl

const PRIMARY_FEATURES = [
  {
    title: 'Optimistic cart UX',
    description:
      'useOptimisticCart mirrors server state so quantity and price changes feel instant while requests settle.'
  },
  {
    title: 'State persistence controls',
    description:
      'Tune persistKey, storage, and shouldPersist to decide exactly how carts survive reloads or sign-outs.'
  },
  {
    title: 'Inventory filters',
    description:
      'Run filterCart on live cartDetails to build subscription-only, digital, or custom product views on the fly.'
  }
]

const SECONDARY_FEATURES = [
  {
    title: 'Fully tested',
    description:
      'Core logic ships with unit + integration coverage so you can focus on UX.'
  },
  {
    title: 'Event-aware buttons',
    description:
      'handleCartClick, handleCartHover, and handleCloseCart emit metadata for animating CTAs, drawers, or tooltips.'
  },
  {
    title: 'Serverless utilities',
    description:
      'Validate carts and hydrate Stripe Checkout sessions with a single helper import.'
  }
]

const WORKFLOW_STEPS = [
  {
    title: 'Wrap your app',
    description:
      'Drop `<CartProvider>` at the root and pass your Stripe publishable key.',
    language: 'tsx',
    code: `import { CartProvider } from 'use-shopping-cart'

export function Root() {
  return (
    <CartProvider
      mode="payment"
      cartMode="checkout-session"
      stripe={import.meta.env.VITE_STRIPE_KEY}
      currency="USD"
    >
      <App />
    </CartProvider>
  )
}`
  },
  {
    title: 'Shape your products',
    description:
      'Inventory can come from Stripe, a CMS, a database, or JSON as long as the fields match.',
    language: 'ts',
    code: `export const products = [
  {
    id: 'id_banana001',
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    price: 400,
    currency: 'USD',
    image: '/assets/bananas.png'
  }
] as const`
  },
  {
    title: 'Build the frontend',
    description:
      'Use the hook to format currency, add items, or kick off Checkout.',
    language: 'tsx',
    code: `import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart'

function Product({ product }) {
  const { addItem } = useShoppingCart()

  return (
    <button
      onClick={() => addItem(product)}
      className="rounded-full bg-white/10 px-4 py-2"
    >
      Add {formatCurrencyString({ value: product.price, currency: 'USD' })}
    </button>
  )
}`
  },
  {
    title: 'Validate & redirect',
    description:
      'Use our helpers in serverless functions to create Stripe sessions.',
    language: 'ts',
    code: `import Stripe from 'stripe'
import { validateCartItems } from 'use-shopping-cart/utilities'

export const handler = async (event) => {
  const stripe = new Stripe(process.env.STRIPE_API_SECRET)
  const productJSON = JSON.parse(event.body)
  const lineItems = validateCartItems(inventory, productJSON)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL
  })

  return { statusCode: 200, body: JSON.stringify({ sessionId: session.id }) }
}`
  }
]

const METRICS_TTL = 1000 * 60 * 5
let metricsCache: { value: HomeMetrics; timestamp: number } | null = null

const FRAMEWORK_TABS = [
  {
    id: 'react',
    label: 'React',
    description: 'Wrap your root entry (Vite, CRA) with CartProvider.',
    language: 'tsx',
    code: `import { CartProvider } from 'use-shopping-cart'
import React from 'react'
import App from './App'

export function Root() {
  return (
    <CartProvider
      stripe={import.meta.env.VITE_STRIPE_KEY}
      currency="USD"
      shouldPersist
    >
      <App />
    </CartProvider>
  )
}`
  },
  {
    id: 'next',
    label: 'Next.js',
    description: 'App Router layout with checkout-session mode.',
    language: 'tsx',
    code: `'use client'
import { CartProvider } from 'use-shopping-cart'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider
      stripe={process.env.NEXT_PUBLIC_STRIPE_KEY!}
      currency="USD"
      shouldPersist
    >
      {children}
    </CartProvider>
  )
}`
  },
  {
    id: 'remix',
    label: 'Remix',
    description: 'Expose cart context to every route via root component.',
    language: 'tsx',
    code: `import { Links, Meta, Outlet } from '@remix-run/react'
import { CartProvider } from 'use-shopping-cart'

export default function App() {
  return (
    <Document>
      <CartProvider stripe={process.env.STRIPE_KEY!} currency="USD">
        <Outlet />
      </CartProvider>
    </Document>
  )
}`
  }
] as const

export const Route = createFileRoute('/')({
  loader: loadHomeData,
  component: Home
})

async function loadHomeData(): Promise<HomeLoaderData> {
  const metrics = await fetchHomeMetrics()
  return { metrics }
}

async function fetchHomeMetrics(): Promise<HomeMetrics> {
  const now = Date.now()

  if (metricsCache && now - metricsCache.timestamp < METRICS_TTL) {
    return metricsCache.value
  }

  const [githubStars, npmDownloads] = await Promise.all([
    fetchGithubStars(),
    fetchNpmDownloads()
  ])

  const metrics: HomeMetrics = {
    githubStars,
    npmDownloads
  }

  metricsCache = {
    value: metrics,
    timestamp: now
  }

  return metrics
}

async function fetchGithubStars(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.github.com/repos/dayhaysoos/use-shopping-cart',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'use-shopping-cart-site'
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const json: { stargazers_count?: number } = await response.json()
    return typeof json.stargazers_count === 'number'
      ? json.stargazers_count
      : null
  } catch (_error) {
    return null
  }
}

async function fetchNpmDownloads(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://api.npmjs.org/downloads/point/last-week/use-shopping-cart'
    )

    if (!response.ok) {
      return null
    }

    const json: { downloads?: number } = await response.json()
    return typeof json.downloads === 'number' ? json.downloads : null
  } catch (_error) {
    return null
  }
}

function Home() {
  const { metrics } = Route.useLoaderData() as HomeLoaderData

  return (
    <HomeLayout
      {...baseOptions()}
      className="bg-[#f5f6fb] text-[#0b1124] dark:bg-[#05060F] dark:text-white [--section-spacing:clamp(4rem,7vw,7.5rem)]"
    >
      <a href="#home-main-content" className="skip-link">
        Skip to main content
      </a>
      <div id="home-main-content" className="relative overflow-hidden">
        <HeroSection metrics={metrics} />
        <CartPlaygroundSection />
        <FeatureHighlights />
        <WorkflowSection />
        <SocialProofSection metrics={metrics} />
        <CTASection />
      </div>
    </HomeLayout>
  )
}

function HeroSection({ metrics }: { metrics: HomeMetrics }) {
  const githubStat = formatMetric(metrics.githubStars)
  const npmStat = formatMetric(metrics.npmDownloads)

  return (
    <Section className="pt-20">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
            React 19 ready
            <span className="inline-block h-2 w-2 rounded-full bg-fd-primary" />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#0b1124] dark:text-white sm:text-5xl lg:text-6xl text-shine">
              Launch Stripe-shaped carts in minutes.
            </h1>
            <p className="text-lg text-neutral-700 dark:text-white/70 sm:text-xl">
              use-shopping-cart handles cart state, formatting, and Checkout
              wiring so you can focus on customer experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/docs/$"
              params={{
                _splat: 'getting-started'
              }}
              className="inline-flex items-center justify-center rounded-full bg-fd-primary px-6 py-3 text-sm font-semibold text-black transition hover:bg-fd-primary/90"
            >
              Get started
            </Link>
            <a
              href="#cart-playground"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#0b1124] transition hover:border-black/40 dark:border-white/20 dark:text-white dark:hover:border-white/40 scroll-smooth"
            >
              Try it out
            </a>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm font-mono text-[#0f1328] shadow-sm dark:border-white/10 dark:bg-black/40 dark:text-white/80">
            <span className="text-[#0e603b] dark:text-fd-primary">$</span>{' '}
            {INSTALL_SNIPPET}
          </div>
          <div className="flex flex-wrap gap-4">
            <StatBadge
              label="GitHub stars"
              value={githubStat}
              tooltip={metricTooltip(metrics.githubStars)}
            />
            <StatBadge
              label="Weekly npm downloads"
              value={npmStat}
              tooltip={metricTooltip(metrics.npmDownloads)}
            />
          </div>
        </div>
        <HeroShowcase />
      </Container>
    </Section>
  )
}

function CartPlaygroundSection() {
  return (
    <Section id="cart-playground" className="bg-black/2 dark:bg-white/5">
      <Container className="space-y-8">
        <SectionHeading
          eyebrow="Try it now"
          title="Cart Interaction Playground"
          description="Tap the controls to see how cart totals and UX respond instantly—with no real Stripe keys required."
        />
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(5,6,15,0.15)] dark:border-white/10 dark:bg-black/60 dark:shadow-[0_30px_80px_rgba(5,6,15,0.55)]">
          <a
            href="#after-playground"
            className="skip-playground mb-4 inline-flex text-sm font-semibold text-[#0e603b] underline-offset-4 focus-visible:outline dark:text-fd-primary"
          >
            Skip interactive cart demo
          </a>
          <CartInteractionPlayground />
        </div>
        <div id="after-playground" aria-hidden="true" />
      </Container>
    </Section>
  )
}

function FeatureHighlights() {
  return (
    <Section className="bg-linear-to-b from-transparent via-[#EEF0FA] to-transparent dark:via-[#090B18]">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Modern cart toolkit"
          title="Ship Stripe-ready carts without reinventing state."
          description="Purpose-built for React 19 apps: compose cart hooks, format helpers, and server utilities to launch Stripe Checkout faster."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {PRIMARY_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {SECONDARY_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} muted />
          ))}
        </div>
      </Container>
    </Section>
  )
}

function WorkflowSection() {
  return (
    <Section>
      <Container className="space-y-12">
        <SectionHeading
          eyebrow="Developer workflow"
          title="Four steps from prototype to Checkout."
          description="Follow the same flow on every project—wrap the provider, pull in products, wire buttons, validate servers."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {WORKFLOW_STEPS.map((step, index) => (
            <WorkflowCard key={step.title} index={index + 1} {...step} />
          ))}
        </div>
        <CodeTabs tabs={FRAMEWORK_TABS} />
      </Container>
    </Section>
  )
}

function SocialProofSection({ metrics }: { metrics: HomeMetrics }) {
  const githubValue = formatMetric(metrics.githubStars)
  const npmValue = formatMetric(metrics.npmDownloads)

  return (
    <Section className="bg-[#eef0fa] dark:bg-[#080A14]">
      <Container className="space-y-6">
        <SectionHeading
          eyebrow="Community"
          title="Trusted by teams shipping serious carts."
          description="Join agencies, SaaS builders, indie hackers, and open source maintainers who rely on use-shopping-cart."
          align="center"
        />
        <div className="flex flex-wrap items-center justify-center gap-6">
          <MetricBadge
            label="GitHub stars"
            value={githubValue}
            tooltip={metricTooltip(metrics.githubStars)}
          />
          <MetricBadge
            label="Weekly npm downloads"
            value={npmValue}
            tooltip={metricTooltip(metrics.npmDownloads)}
          />
          <MetricBadge label="Years in production" value="4+" />
        </div>
      </Container>
    </Section>
  )
}

function CTASection() {
  return (
    <Section className="pb-24 pt-10">
      <Container>
        <div className="rounded-3xl border border-black/10 bg-linear-to-r from-white via-[#e8ecff] to-white p-10 text-center text-[#0b1124] shadow-[0_30px_70px_rgba(15,17,34,0.15)] dark:border-white/10 dark:bg-linear-to-r dark:from-[#0B0F2B] dark:via-[#10163A] dark:to-[#151C47] dark:text-white dark:shadow-[0_40px_80px_rgba(5,6,15,0.7)]">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-neutral-500 dark:text-white/60">
            Ready to launch?
          </p>
          <h2 className="mt-4 text-3xl font-semibold">
            Everything you need to sell products with Stripe Checkout.
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-white/70">
            Dive into the docs or try the interactive playground first—no Stripe
            keys required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/docs/$"
              params={{
                _splat: 'getting-started'
              }}
              className="inline-flex items-center justify-center rounded-full bg-fd-primary px-8 py-3 text-sm font-semibold text-black transition hover:bg-fd-primary/90"
            >
              Read the docs
            </Link>
            <a
              href="#cart-playground"
              className="inline-flex items-center justify-center rounded-full border border-black/20 px-8 py-3 text-sm font-semibold text-[#0b1124] transition hover:border-black/40 dark:border-white/30 dark:text-white dark:hover:border-white/60 scroll-smooth"
            >
              Try it out
            </a>
          </div>
        </div>
      </Container>
    </Section>
  )
}

function FeatureCard({
  title,
  description,
  muted
}: {
  title: string
  description: string
  muted?: boolean
}) {
  const cardRef = React.useRef<HTMLDivElement>(null)

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      setFeatureCardGlow(cardRef.current, event)
    },
    []
  )

  const handlePointerLeave = React.useCallback(() => {
    resetFeatureCardGlow(cardRef.current)
  }, [])

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`feature-card rounded-2xl border border-black/10 p-6 transition hover:-translate-y-1 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30 ${
        muted ? 'feature-card--muted' : ''
      }`}
    >
      <h3 className="text-xl font-semibold text-[#0b1124] dark:text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm text-neutral-700 dark:text-white/70">
        {description}
      </p>
    </div>
  )
}

function setFeatureCardGlow(
  node: HTMLDivElement | null,
  event: React.PointerEvent<HTMLDivElement>
) {
  if (!node) return
  const rect = node.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  node.style.setProperty('--button-pointer-x', clampToUnit(x).toString())
  node.style.setProperty('--button-pointer-y', clampToUnit(y).toString())
  node.style.setProperty('--button-pointer-active', '1')
}

function resetFeatureCardGlow(node: HTMLDivElement | null) {
  if (!node) return
  node.style.setProperty('--button-pointer-active', '0')
}

function clampToUnit(value: number) {
  return Math.min(1, Math.max(0, value))
}

function WorkflowCard({
  index,
  title,
  description,
  language,
  code
}: {
  index: number
  title: string
  description: string
  language: string
  code: string
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/40">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-[#0b1124] dark:bg-white/10 dark:text-white">
          {index}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-[#0b1124] dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-white/70">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex-1 overflow-auto rounded-xl bg-[#050a1d] p-4 text-[#f8fbff] dark:bg-[#04050C] dark:text-white">
        <CodeBlock
          code={code}
          language={language}
          className="m-0 whitespace-pre-wrap font-mono text-xs leading-relaxed"
        />
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-white/40">
        {language}
      </p>
    </div>
  )
}

function StatBadge({
  label,
  value,
  tooltip
}: {
  label: string
  value: string
  tooltip?: string
}) {
  return (
    <div
      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm dark:border-white/10 dark:bg-black/50 dark:text-white/80"
      title={tooltip}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-white/50">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[#0b1124] dark:text-white">
        {value}
      </p>
    </div>
  )
}

function MetricBadge({
  label,
  value,
  tooltip
}: {
  label: string
  value: string
  tooltip?: string
}) {
  return (
    <div
      className="flex flex-col rounded-2xl border border-black/10 bg-white px-5 py-4 text-center text-sm text-neutral-600 shadow-sm dark:border-white/10 dark:bg-black/40 dark:text-white/70"
      title={tooltip}
    >
      <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-white/40">
        {label}
      </span>
      <span className="mt-2 text-2xl font-semibold text-[#0b1124] dark:text-white">
        {value}
      </span>
    </div>
  )
}

type FrameworkTab = (typeof FRAMEWORK_TABS)[number]

function CodeTabs({ tabs }: { tabs: readonly FrameworkTab[] }) {
  const [activeId, setActiveId] = React.useState(tabs[0]?.id)
  const [copied, setCopied] = React.useState(false)
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0]

  const handleCopy = async () => {
    if (!activeTab) {
      return
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(activeTab.code)
      } else if (typeof document !== 'undefined') {
        const temp = document.createElement('textarea')
        temp.value = activeTab.code
        document.body.appendChild(temp)
        temp.select()
        document.execCommand('copy')
        document.body.removeChild(temp)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_error) {
      setCopied(false)
    }
  }

  if (!activeTab) return null

  return (
    <div className="space-y-4 rounded-2xl border border-[#cfd5ea] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab.id === tab.id
                ? 'bg-fd-primary text-black'
                : 'bg-[#dfe4f5] text-[#0b1124] hover:bg-[#cfd6ec] dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-4 top-4 rounded-full border border-[#c7cee5] bg-[#edf0fb] px-3 py-1 text-xs font-semibold text-[#0b1124] transition hover:border-[#acb5da] hover:bg-[#dde2f5] dark:border-white/20 dark:bg-transparent dark:text-white/70 dark:hover:border-white/50"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <div className="overflow-x-auto rounded-2xl bg-[#030717] p-5 text-[#fdfefe] dark:bg-[#04050C] dark:text-white">
          <CodeBlock
            code={activeTab.code}
            language={activeTab.language}
            className="m-0 whitespace-pre-wrap font-mono text-xs leading-relaxed"
          />
        </div>
        <span className="absolute right-4 bottom-4 text-[11px] uppercase tracking-[0.3em] text-[#a9b3ce] dark:text-white/50">
          {activeTab.language}
        </span>
      </div>
      <p className="text-sm text-neutral-700 dark:text-white/70">
        {activeTab.description}
      </p>
    </div>
  )
}

function formatMetric(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '—'
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}m`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return value.toLocaleString()
}

function metricTooltip(value: number | null): string | undefined {
  if (value === null || Number.isNaN(value)) {
    return 'Temporarily unavailable. Please try again soon.'
  }

  return undefined
}

function CodeBlock({
  code,
  language,
  className
}: {
  code: string
  language: string
  className?: string
}) {
  const prismLanguage = normalizeLanguage(language)
  return (
    <Highlight code={code} language={prismLanguage} theme={CODE_THEME}>
      {({
        className: highlightClass,
        style,
        tokens,
        getLineProps,
        getTokenProps
      }) => (
        <pre
          className={`${highlightClass ?? ''} ${className ?? ''}`.trim()}
          style={{ ...style, background: 'transparent' }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

function normalizeLanguage(language: string): Language {
  if (language === 'ts') return 'tsx'
  if (language === 'js') return 'tsx'
  return (language as Language) || 'tsx'
}
