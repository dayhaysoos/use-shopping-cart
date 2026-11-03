import type { CartDetails, CartEntry, CartState, StorageAdapter } from './types'

/** The parts of a stored cart that are restored. Everything else is derived. */
export interface StoredCart {
  cartDetails: CartDetails
  currency?: string
  language?: string
}

export interface CartPersister {
  /**
   * Read the stored cart and pass a validated snapshot to `onLoad`:
   * synchronously for sync storage, later for async storage. Not called when
   * nothing is stored or the data is unreadable.
   */
  load(onLoad: (stored: StoredCart) => void): void
  /**
   * Write the cart if anything that is persisted changed since the last
   * write. A failed write is retried on the next save.
   */
  save(state: Readonly<CartState>): void
}

type PersistedFields = Pick<CartState, 'cartDetails' | 'currency' | 'language'>

/**
 * `initial` is the cart's starting state: saves are skipped until the cart,
 * currency or language differ from it, so UI-only changes never write.
 */
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
            // Forget this write so the next save retries it
            if (lastSaved === state) lastSaved = null
            console.warn('Failed to persist cart to storage:', error)
          })
        }
      } catch (error) {
        lastSaved = null // retry on the next save
        console.warn('Failed to persist cart to storage:', error)
      }
    }
  }
}

/**
 * Parse stored cart JSON. Invalid entries are skipped with a warning; returns
 * null when the data is unreadable or has no cartDetails.
 */
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

/** Same payload as earlier versions, so existing stored carts keep loading. */
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
