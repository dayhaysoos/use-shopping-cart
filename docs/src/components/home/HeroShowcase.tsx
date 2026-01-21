import * as React from 'react'
import { Highlight, themes, type Language } from 'prism-react-renderer'

const theme = themes.nightOwl

type ShowcaseItem = {
  id: string
  group: 'Hook' | 'Action' | 'State' | 'Helper'
  snippet: string
  description: string
  language: Language
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'hook-use-shopping-cart',
    group: 'Hook',
    snippet: `const {
  addItem,
  cartCount,
  formattedTotalPrice
} = useShoppingCart()`,
    description: 'One hook exposes state + Stripe helpers.',
    language: 'tsx'
  },
  {
    id: 'action-add-item',
    group: 'Action',
    snippet: `<button onClick={() => addItem(product)}>
  Add to cart
</button>`,
    description: 'Attach metadata before Stripe Checkout.',
    language: 'tsx'
  },
  {
    id: 'state-cart-count',
    group: 'State',
    snippet: '{ cartCount: 3 }',
    description: 'Derived totals ready for your UI layer.',
    language: 'json'
  },
  {
    id: 'action-decrement',
    group: 'Action',
    snippet: `<form action={() => decrementItem('price_123')}>
  <button>- Remove</button>
</form>`,
    description: 'Safe quantity updates with optimistic UX.',
    language: 'tsx'
  },
  {
    id: 'hook-use-cart-actions',
    group: 'Hook',
    snippet: `const { pending, formAction } = useCartActions({
  action: addItem
})`,
    description: 'React 19 action forms, no reducers needed.',
    language: 'tsx'
  },
  {
    id: 'helper-validate',
    group: 'Helper',
    snippet: `const lineItems = validateCartItems(
  inventory,
  cartDetails
)`,
    description: 'Server-side guard rails before Checkout.',
    language: 'ts'
  },
  {
    id: 'state-cart-details',
    group: 'State',
    snippet: `{
  cartDetails: {
    banana_001: {
      quantity: 2,
      formattedValue: '$8.00'
    }
  }
}`,
    description: 'Typed map of every item, quantity, and price.',
    language: 'json'
  }
]

const ROTATION_INTERVAL_MS = 6000

export function HeroShowcase() {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(media.matches)

    updatePreference()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updatePreference)
      return () => media.removeEventListener('change', updatePreference)
    }

    media.addListener(updatePreference)
    return () => media.removeListener(updatePreference)
  }, [])

  React.useEffect(() => {
    if (prefersReducedMotion || isPaused || typeof window === 'undefined')
      return

    const id = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % SHOWCASE_ITEMS.length)
    }, ROTATION_INTERVAL_MS)

    return () => window.clearInterval(id)
  }, [prefersReducedMotion, isPaused])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-linear-to-br from-[#0f1328] via-[#11183A] to-[#151f4a] px-4 py-4 text-white shadow-[0_40px_90px_rgba(5,6,15,0.4)] dark:border-white/5">
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          aria-pressed={isPaused}
          onClick={() => setIsPaused((prev) => !prev)}
          className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-white/80 transition hover:border-white/40"
        >
          {isPaused || prefersReducedMotion ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div
        className="relative min-h-[320px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {SHOWCASE_ITEMS.map((item, index) => (
          <figure
            key={item.id}
            className={`absolute inset-0 flex flex-col justify-center gap-6 p-2 transition-all duration-500 ${
              index === activeIndex
                ? 'opacity-100 translate-y-0'
                : 'pointer-events-none opacity-0 -translate-y-4'
            }`}
            aria-hidden={index !== activeIndex}
            tabIndex={-1}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
              {item.group}
            </p>
            <Highlight
              code={item.snippet.trim()}
              language={item.language}
              theme={theme}
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <div className="max-h-[230px] min-h-[180px] overflow-auto overscroll-contain rounded-2xl bg-black/30 px-6 py-5 font-mono text-base leading-relaxed text-white/90">
                  <pre
                    className={className}
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
                </div>
              )}
            </Highlight>
            <p className="text-sm text-white/80">{item.description}</p>
          </figure>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2">
        {SHOWCASE_ITEMS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Showcase ${item.snippet}`}
            onClick={() => setActiveIndex(index)}
            className={`h-2 w-6 rounded-full transition ${
              index === activeIndex
                ? 'bg-fd-primary'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
