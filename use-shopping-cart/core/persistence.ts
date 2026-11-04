import type { CartDetails, CartEntry, CartState, StorageAdapter } from './types'

export interface StoredCart {
  cartDetails: CartDetails
  currency?: string
  language?: string
}

export interface CartPersister {
  load(onLoad: (stored: StoredCart) => void): void
  save(state: Readonly<CartState>): void
}

type PersistedFields = Pick<CartState, 'cartDetails' | 'currency' | 'language'>

export function createCartPersister(
  storage: StorageAdapter,
  key: string,
  initial: Readonly<PersistedFields>
): CartPersister {
  let lastSaved: Readonly<PersistedFields> | null = initial

  return {
    load(onLoad) {
      try {
        const raw = storage.getItem(key)
        if (raw instanceof Promise) {
          raw
            .then((data) => {
              const stored = data ? parseStoredCart(data) : null
              if (stored) onLoad(stored)
            })
            .catch((error) => {
              console.warn('Failed to load cart from storage:', error)
            })
          return
        }

        const stored = raw ? parseStoredCart(raw) : null
        if (stored) onLoad(stored)
      } catch (error) {
        console.warn('Failed to load cart from storage:', error)
      }
    },

    save(state) {
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
        const result = storage.setItem(key, serializeCart(state))
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
}

export function parseStoredCart(raw: string): StoredCart | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    console.warn('Failed to parse stored cart data:', error)
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null

  const { cartDetails, currency, language } = parsed as Record<string, unknown>
  if (!cartDetails || typeof cartDetails !== 'object') return null

  const validCartDetails: CartDetails = {}
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

function isValidCartEntry(entry: unknown): entry is CartEntry {
  if (!entry || typeof entry !== 'object') return false

  const e = entry as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.price === 'number' &&
    Number.isFinite(e.price) &&
    typeof e.quantity === 'number' &&
    Number.isInteger(e.quantity) &&
    e.quantity > 0 &&
    typeof e.value === 'number' &&
    Number.isFinite(e.value) &&
    typeof e.name === 'string' &&
    typeof e.currency === 'string'
  )
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
