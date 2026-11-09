import type { CartDetailsInput, CartState, StorageAdapter } from './types'
import { isValidCartEntry } from './validation'

export interface SavedCart {
  cartDetails: CartDetailsInput
  currency?: string
  language?: string
}

export interface CartPersister {
  load(onLoad: (saved: SavedCart) => void): void
  save(state: Readonly<CartState>): void
}

type PersistedFields = Pick<CartState, 'cartDetails' | 'currency' | 'language'>

export function createCartPersister(
  storage: StorageAdapter,
  key: string,
  initial: Readonly<PersistedFields>
): CartPersister {
  let lastSaved: Readonly<PersistedFields> | null = initial
  let lastSeen: Readonly<PersistedFields> = initial
  let queuedState: Readonly<CartState> | null = null
  let readsSynchronously = false
  let loading = true
  let entriesChanged = false
  let currencyChanged = false
  let languageChanged = false

  function finishLoad(raw: string | null, onLoad: (saved: SavedCart) => void) {
    loading = false
    if (entriesChanged) return
    const saved = raw ? parseSavedCart(raw) : null
    if (!saved) return
    const restored: SavedCart = { cartDetails: saved.cartDetails }
    if (!currencyChanged && saved.currency) restored.currency = saved.currency
    if (!languageChanged && saved.language) restored.language = saved.language
    onLoad(restored)
    const restoredAsSaved = !currencyChanged && !languageChanged
    if (restoredAsSaved) lastSaved = lastSeen
  }

  return {
    load(onLoad) {
      try {
        const raw = storage.getItem(key)
        readsSynchronously = !(raw instanceof Promise)
        if (raw instanceof Promise) {
          raw
            .then((data) => finishLoad(data, onLoad))
            .catch((error) => {
              loading = false
              console.warn('Failed to load cart from storage:', error)
            })
          return
        }

        finishLoad(raw, onLoad)
      } catch (error) {
        loading = false
        console.warn('Failed to load cart from storage:', error)
      }
    },

    save(state) {
      if (loading) {
        const currencyDiffers = state.currency !== lastSeen.currency
        const languageDiffers = state.language !== lastSeen.language
        if (currencyDiffers) currencyChanged = true
        if (languageDiffers) languageChanged = true
        if (
          !currencyDiffers &&
          !languageDiffers &&
          state.cartDetails !== lastSeen.cartDetails
        ) {
          entriesChanged = true
        }
      }
      lastSeen = state

      if (!queuedState) queueMicrotask(write)
      queuedState = state
    }
  }

  function write() {
    const state = queuedState!
    queuedState = null
    if (
      lastSaved &&
      lastSaved.cartDetails === state.cartDetails &&
      lastSaved.currency === state.currency &&
      lastSaved.language === state.language
    ) {
      return
    }
    lastSaved = state

    try {
      const serialized = serializeCart(state)
      if (readsSynchronously && storage.getItem(key) === serialized) return
      const result = storage.setItem(key, serialized)
      if (result instanceof Promise) {
        result.catch((error) => {
          if (lastSaved === state) lastSaved = null
          console.warn('Failed to persist cart to storage:', error)
        })
      }
    } catch (error) {
      lastSaved = null
      console.warn('Failed to persist cart to storage:', error)
    }
  }
}

export function parseSavedCart(raw: string): SavedCart | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    console.warn('Failed to parse saved cart data:', error)
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null

  const { cartDetails, currency, language } = parsed as Record<string, unknown>
  if (!cartDetails || typeof cartDetails !== 'object') return null

  const validCartDetails: CartDetailsInput = {}
  for (const id in cartDetails) {
    const entry = (cartDetails as Record<string, unknown>)[id]
    if (isValidCartEntry(entry)) {
      validCartDetails[id] = entry
    } else {
      console.warn(`Invalid cart entry "${id}" skipped during load`)
    }
  }

  return {
    cartDetails: validCartDetails,
    currency: nonEmptyString(currency),
    language: nonEmptyString(language)
  }
}

function serializeCart(state: Readonly<CartState>): string {
  return JSON.stringify({
    cartDetails: state.cartDetails,
    cartCount: state.cartCount,
    totalPrice: state.totalPrice,
    formattedTotalPrice: state.formattedTotalPrice,
    currency: state.currency,
    language: state.language
  })
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
