import * as React from 'react'
import {
  CartProvider,
  formatCurrencyString,
  useShoppingCart
} from 'use-shopping-cart'
import type { Product } from 'use-shopping-cart/core'

import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

const BANANA_PRODUCT: Product = {
  id: 'banana_001',
  name: 'Bananas',
  description: 'Yummy yellow fruit picked this morning.',
  price: 400,
  currency: 'USD',
  image:
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&q=80'
}

const APPLE_PRODUCT: Product = {
  id: 'apple_001',
  name: 'Apples',
  description: 'Crisp mountain-grown honeycrisps.',
  price: 350,
  currency: 'USD',
  image:
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop&q=80'
}

type ShippingTier = 'standard' | 'priority'

export function CartInteractionPlayground() {
  return (
    <CartProvider
      stripe=""
      currency="USD"
      language="en-US"
      shouldPersist={false}
      persistKey="landing-playground"
    >
      <PlaygroundContent />
    </CartProvider>
  )
}

function PlaygroundContent() {
  const {
    addItem,
    incrementItem,
    decrementItem,
    clearCart,
    cartDetails = {},
    cartCount,
    formattedTotalPrice,
    totalPrice
  } = useShoppingCart()

  const incrementCounter = useMutation(api.counter.increment)
  const interactionCount = useQuery(api.counter.getTotal) ?? 0

  const recordInteraction = React.useCallback(() => {
    incrementCounter({ amount: 1 }).catch((error) => {
      console.error('Failed to record cart interaction', error)
    })
  }, [incrementCounter])

  const formattedInteractionCount = React.useMemo(
    () => interactionCount.toLocaleString('en-US'),
    [interactionCount]
  )

  const [promotionApplied, setPromotionApplied] = React.useState(false)
  const [shippingTier, setShippingTier] =
    React.useState<ShippingTier>('standard')
  const [previewMode, setPreviewMode] = React.useState<'ui' | 'json'>('ui')
  const cartDetailsJSON = React.useMemo(
    () => JSON.stringify(cartDetails, null, 2),
    [cartDetails]
  )
  const hasCartEntries = Object.keys(cartDetails).length > 0

  const bananaInCart = cartDetails[BANANA_PRODUCT.id ?? '']
  const subtotal = totalPrice ?? 0
  const discount = promotionApplied ? 200 : 0
  const shippingAmount = shippingTier === 'standard' ? 0 : 500
  const computedTotal = Math.max(subtotal + shippingAmount - discount, 0)

  const formattedSubtotal = formatCurrencyString({
    value: subtotal,
    currency: BANANA_PRODUCT.currency
  })
  const formattedDiscount = formatCurrencyString({
    value: discount,
    currency: BANANA_PRODUCT.currency
  })
  const formattedShipping =
    shippingAmount === 0
      ? 'Free'
      : formatCurrencyString({
          value: shippingAmount,
          currency: BANANA_PRODUCT.currency
        })
  const formattedComputedTotal = formatCurrencyString({
    value: computedTotal,
    currency: BANANA_PRODUCT.currency
  })

  const handleAddBananas = () => {
    addItem(BANANA_PRODUCT)
    recordInteraction()
  }

  const handleAddApples = () => {
    addItem(APPLE_PRODUCT)
    recordInteraction()
  }

  const handleIncrement = () => {
    if (!BANANA_PRODUCT.id) return
    if (!bananaInCart) {
      addItem(BANANA_PRODUCT)
      recordInteraction()
      return
    }
    incrementItem(BANANA_PRODUCT.id)
    recordInteraction()
  }

  const handleDecrement = () => {
    if (!BANANA_PRODUCT.id || !bananaInCart) return
    decrementItem(BANANA_PRODUCT.id)
    recordInteraction()
  }

  const handlePromotion = () => {
    setPromotionApplied((prev) => !prev)
    recordInteraction()
  }

  const handleShipping = () => {
    setShippingTier((prev) => (prev === 'standard' ? 'priority' : 'standard'))
    recordInteraction()
  }

  const handleClear = () => {
    clearCart()
    setPromotionApplied(false)
    setShippingTier('standard')
    recordInteraction()
  }

  const handlePreviewModeChange = (mode: 'ui' | 'json') => {
    setPreviewMode(mode)
    recordInteraction()
  }

  const handleCheckout = () => {
    recordInteraction()
  }

  const cartItems = Object.values(cartDetails)

  return (
    <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-6">
          <p
            id="playground-instructions"
            className="text-sm text-neutral-700 dark:text-white/70"
          >
            Every control below triggers the same cart methods you use in an
            app. The totals on the right announce updates automatically.
          </p>
          <fieldset
            className="space-y-4"
            aria-describedby="playground-instructions"
          >
            <legend className="sr-only">Cart interaction controls</legend>
            <div className="grid gap-3 md:grid-cols-2">
              <ActionButton
                label="Add bananas"
                helper="Calls addItem(banana_001)"
                onClick={handleAddBananas}
              />
              <ActionButton
                label="Add apples"
                helper="Calls addItem(apple_001)"
                onClick={handleAddApples}
              />
              <ActionButton
                label="Increment quantity"
                helper="Calls incrementItem(id)"
                onClick={handleIncrement}
                disabled={!bananaInCart}
              />
              <ActionButton
                label="Decrement quantity"
                helper="Calls decrementItem(id)"
                onClick={handleDecrement}
                disabled={!bananaInCart}
              />
              <ActionButton
                label={
                  promotionApplied ? 'Remove promotion' : 'Apply promotion'
                }
                helper="Simulates togglePromotionCodes(true)"
                onClick={handlePromotion}
                ariaPressed={promotionApplied}
              />
              <ActionButton
                label={
                  shippingTier === 'standard'
                    ? 'Enable priority shipping'
                    : 'Return to free shipping'
                }
                helper="Simulates setting alternate shipping tiers"
                onClick={handleShipping}
              />
              <ActionButton
                label="Clear cart"
                helper="Calls clearCart()"
                onClick={handleClear}
                tone="danger"
              />
            </div>
          </fieldset>
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryChip label="cartCount" value={cartCount ?? 0} />
            <SummaryChip
              label="formattedTotalPrice"
              value={formattedTotalPrice ?? '$0.00'}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#cfd5ea] bg-white p-6 shadow-md dark:border-white/10 dark:bg-black/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Cart preview mode"
              className="inline-flex items-center gap-2 rounded-full border border-[#d6dcf2] bg-[#e9ecf8] p-1 dark:border-white/10 dark:bg-white/5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={previewMode === 'ui'}
                aria-controls="cart-preview-ui"
                tabIndex={previewMode === 'ui' ? 0 : -1}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  previewMode === 'ui'
                    ? 'bg-white text-[#0b1124] shadow-sm dark:bg-black/70 dark:text-white'
                    : 'text-[#1f2337] hover:text-[#0b1124] dark:text-white/60 dark:hover:text-white'
                }`}
                onClick={() => handlePreviewModeChange('ui')}
              >
                Cart UI
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={previewMode === 'json'}
                aria-controls="cart-preview-json"
                tabIndex={previewMode === 'json' ? 0 : -1}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  previewMode === 'json'
                    ? 'bg-white text-[#0b1124] shadow-sm dark:bg-black/70 dark:text-white'
                    : 'text-[#1f2337] hover:text-[#0b1124] dark:text-white/60 dark:hover:text-white'
                }`}
                onClick={() => handlePreviewModeChange('json')}
              >
                Cart JSON
              </button>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-white/60">
              {previewMode === 'ui'
                ? 'Live mock UI — nothing billed'
                : 'cartDetails updates live'}
            </span>
          </div>

          {previewMode === 'ui' ? (
            <div
              id="cart-preview-ui"
              role="tabpanel"
              aria-label="Cart UI preview"
            >
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0b1124] dark:text-white">
                    Cart preview
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-white/60">
                    Toggle actions to see totals move.
                  </p>
                </div>
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-[#0b1124] dark:border-white/20 dark:text-white/70">
                  {shippingTier === 'standard'
                    ? 'Free shipping'
                    : 'Priority shipping'}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {cartItems.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-black/20 p-4 text-sm text-neutral-600 dark:border-white/20 dark:text-white/60">
                    Cart is empty. Add the sample product to see totals update.
                  </p>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-xl bg-black/4 p-4 dark:bg-white/5"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 shrink-0 rounded-xl bg-linear-to-br from-fd-primary to-fd-accent/80" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-[#0b1124] dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-white/60">
                          Qty {item.quantity} · {item.formattedPrice}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#0b1124] dark:text-white">
                        {item.formattedValue}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div
                className="mt-6 space-y-2 rounded-2xl bg-[#e9ecf8] p-5 text-sm dark:bg-white/5"
                aria-live="polite"
              >
                <div className="flex items-center justify-between text-neutral-700 dark:text-white/70">
                  <span>Subtotal</span>
                  <span>{formattedSubtotal}</span>
                </div>
                <div className="flex items-center justify-between text-[#0e603b] dark:text-fd-primary">
                  <span>Promotion</span>
                  <span>- {formattedDiscount}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-700 dark:text-white/70">
                  <span>Shipping</span>
                  <span>{formattedShipping}</span>
                </div>
                <div className="flex items-center justify-between pt-2 text-base font-semibold text-[#0b1124] dark:text-white">
                  <span>Total</span>
                  <span>{formattedComputedTotal}</span>
                </div>
                <button
                  className="mt-4 w-full rounded-full bg-fd-primary px-4 py-3 text-sm font-semibold text-black"
                  type="button"
                  onClick={handleCheckout}
                >
                  Checkout with Stripe
                </button>
              </div>
            </div>
          ) : (
            <CartJsonPanel
              id="cart-preview-json"
              ariaLabel="Cart JSON preview"
              json={cartDetailsJSON}
              hasData={hasCartEntries}
            />
          )}
        </div>
      </div>

      <ConvexCounterSummary
        countLabel={formattedInteractionCount}
        ariaLabel={`This cart has been clicked ${interactionCount} times.`}
      />
    </div>
  )
}

function ActionButton({
  label,
  helper,
  onClick,
  disabled,
  tone = 'default',
  ariaPressed
}: {
  label: string
  helper: string
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'danger'
  ariaPressed?: boolean
}) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    setButtonGlowPosition(buttonRef.current, event)
  }

  const handlePointerLeave = () => {
    resetButtonGlow(buttonRef.current)
  }

  const handleFocus = () => {
    activateButtonGlow(buttonRef.current)
  }

  const handleBlur = () => {
    resetButtonGlow(buttonRef.current)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariaPressed}
      ref={buttonRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`cart-action-button flex flex-col rounded-xl border px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-primary ${
        disabled
          ? 'cursor-not-allowed border-black/10 bg-black/5 text-neutral-400 dark:border-white/15 dark:bg-white/10 dark:text-white/60'
          : tone === 'danger'
          ? 'border-red-200 bg-linear-to-r from-[#f8d7da] to-[#f3b3bb] text-[#5f0f1c] hover:border-red-300 dark:border-white/15 dark:from-[#2B0B0B] dark:to-[#3B0F0F] dark:text-white dark:hover:border-white/30'
          : 'border-black/10 bg-black/4 text-[#0b1124] hover:border-black/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/30'
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-neutral-600 dark:text-white/60">
        {helper}
      </span>
    </button>
  )
}

function SummaryChip({
  label,
  value
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm dark:border-white/10 dark:bg-black/40 dark:text-white/70">
      <p className="text-sm font-medium text-neutral-500 dark:text-white/60">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[#0b1124] dark:text-white">
        {value}
      </p>
    </div>
  )
}

function ConvexCounterSummary({
  countLabel,
  ariaLabel
}: {
  countLabel: string
  ariaLabel: string
}) {
  return (
    <div
      className="rounded-2xl border border-dashed border-[#cfd5ea] bg-white/90 p-5 text-center shadow-sm transition hover:shadow-md dark:border-white/20 dark:bg-white/5"
      aria-label={ariaLabel}
    >
      <p
        className="text-lg font-semibold text-[#0b1124] tracking-wide dark:text-white"
        aria-live="polite"
      >
        This cart has been clicked {countLabel} times.
      </p>
    </div>
  )
}

function setButtonGlowPosition(
  node: HTMLButtonElement | null,
  event: React.PointerEvent<HTMLButtonElement>
) {
  if (!node) return
  const rect = node.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  node.style.setProperty('--button-pointer-x', clamp01(x).toString())
  node.style.setProperty('--button-pointer-y', clamp01(y).toString())
  node.style.setProperty('--button-pointer-active', '1')
}

function activateButtonGlow(node: HTMLButtonElement | null) {
  if (!node) return
  node.style.setProperty('--button-pointer-x', '0.5')
  node.style.setProperty('--button-pointer-y', '0.5')
  node.style.setProperty('--button-pointer-active', '1')
}

function resetButtonGlow(node: HTMLButtonElement | null) {
  if (!node) return
  node.style.setProperty('--button-pointer-active', '0')
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function CartJsonPanel({
  id,
  ariaLabel,
  json,
  hasData
}: {
  id: string
  ariaLabel: string
  json: string
  hasData: boolean
}) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-label={ariaLabel}
      className="mt-4 rounded-2xl border border-dashed border-black/15 bg-black/5 p-4 dark:border-white/15 dark:bg-white/4"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/60">
        cartDetails
      </p>
      {hasData ? (
        <pre
          className="mt-3 max-h-[340px] overflow-auto rounded-xl bg-black/80 px-4 py-3 font-mono text-xs text-white dark:bg-black"
          aria-live="polite"
        >
          {json}
        </pre>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-black/15 p-4 text-sm text-neutral-600 dark:border-white/20 dark:text-white/70">
          Cart is empty — call an action to populate the object.
        </p>
      )}
    </div>
  )
}
