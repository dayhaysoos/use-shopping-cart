import { describe, it, expect, vi, afterEach } from 'vitest'
import { createCartPersister, parseStoredCart } from './persistence'
import { createMemoryStorage } from './storage'
import { initialState } from './ShoppingCart'
import type { CartState, StorageAdapter } from './types'

afterEach(() => {
  vi.restoreAllMocks()
})

const entry = {
  id: 'a',
  name: 'A',
  price: 100,
  currency: 'USD',
  quantity: 2,
  value: 200
}

describe('parseStoredCart', () => {
  it('returns cartDetails, currency and language', () => {
    expect(
      parseStoredCart(
        JSON.stringify({
          cartDetails: { a: entry },
          currency: 'EUR',
          language: 'de-DE',
          totalPrice: 999
        })
      )
    ).toEqual({ cartDetails: { a: entry }, currency: 'EUR', language: 'de-DE' })
  })

  it('skips invalid entries with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const stored = parseStoredCart(
      JSON.stringify({
        cartDetails: { a: entry, bad: { id: 'bad', quantity: -1 } }
      })
    )

    expect(Object.keys(stored!.cartDetails)).toEqual(['a'])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"bad"'))
  })

  it('ignores empty or non-string currency and language', () => {
    const stored = parseStoredCart(
      JSON.stringify({ cartDetails: {}, currency: '', language: 42 })
    )

    expect(stored).toEqual({
      cartDetails: {},
      currency: undefined,
      language: undefined
    })
  })

  it('returns null for unreadable data', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseStoredCart('not json {')).toBeNull()
    expect(parseStoredCart('"a string"')).toBeNull()
    expect(parseStoredCart(JSON.stringify({ cartCount: 3 }))).toBeNull()
  })
})

describe('createCartPersister', () => {
  const state: CartState = { ...initialState, cartDetails: { a: entry as any } }

  it('loads synchronously from sync storage', () => {
    const storage = createMemoryStorage()
    storage.setItem('k', JSON.stringify({ cartDetails: { a: entry } }))
    const onLoad = vi.fn()

    createCartPersister(storage, 'k', initialState).load(onLoad)

    expect(onLoad).toHaveBeenCalledWith(
      expect.objectContaining({ cartDetails: { a: entry } })
    )
  })

  it('does not call onLoad when nothing is stored', () => {
    const onLoad = vi.fn()

    createCartPersister(createMemoryStorage(), 'k', initialState).load(onLoad)

    expect(onLoad).not.toHaveBeenCalled()
  })

  it('loads later from async storage', async () => {
    const storage: StorageAdapter = {
      getItem: async () => JSON.stringify({ cartDetails: { a: entry } }),
      setItem: async () => {},
      removeItem: async () => {}
    }
    const onLoad = vi.fn()

    createCartPersister(storage, 'k', initialState).load(onLoad)
    expect(onLoad).not.toHaveBeenCalled()

    await vi.waitFor(() => expect(onLoad).toHaveBeenCalled())
  })

  describe('when the cart changes before an async load finishes', () => {
    function deferred() {
      let finish!: () => void
      const storage: StorageAdapter = {
        getItem: () =>
          new Promise<string>((resolve) => {
            finish = () =>
              resolve(
                JSON.stringify({
                  cartDetails: { a: entry },
                  currency: 'EUR',
                  language: 'de-DE'
                })
              )
          }),
        setItem: () => {},
        removeItem: () => {}
      }
      return { storage, finish: () => finish() }
    }

    it('skips the saved cart after an item change', async () => {
      const { storage, finish } = deferred()
      const onLoad = vi.fn()
      const persister = createCartPersister(storage, 'k', initialState)

      persister.load(onLoad)
      persister.save(state)
      finish()
      await new Promise((r) => setTimeout(r, 0))

      expect(onLoad).not.toHaveBeenCalled()
    })

    it('restores only the items after a currency or language change', async () => {
      const { storage, finish } = deferred()
      const onLoad = vi.fn()
      const persister = createCartPersister(storage, 'k', initialState)

      persister.load(onLoad)
      persister.save({ ...initialState, currency: 'GBP', cartDetails: {} })
      finish()

      await vi.waitFor(() =>
        expect(onLoad).toHaveBeenCalledWith({ cartDetails: { a: entry } })
      )
    })

    it('restores everything after a UI-only change', async () => {
      const { storage, finish } = deferred()
      const onLoad = vi.fn()
      const persister = createCartPersister(storage, 'k', initialState)

      persister.load(onLoad)
      persister.save({ ...initialState, shouldDisplayCart: true })
      finish()

      await vi.waitFor(() =>
        expect(onLoad).toHaveBeenCalledWith({
          cartDetails: { a: entry },
          currency: 'EUR',
          language: 'de-DE'
        })
      )
    })
  })

  it('writes the same payload shape as earlier versions', () => {
    const storage = createMemoryStorage()

    createCartPersister(storage, 'k', initialState).save(state)

    expect(JSON.parse(storage.getItem('k') as string)).toEqual({
      cartDetails: state.cartDetails,
      cartCount: state.cartCount,
      totalPrice: state.totalPrice,
      formattedTotalPrice: state.formattedTotalPrice,
      currency: state.currency,
      language: state.language
    })
  })

  it('does not write until the cart differs from its initial state', () => {
    const storage = createMemoryStorage()
    const setItem = vi.spyOn(storage, 'setItem')
    const persister = createCartPersister(storage, 'k', initialState)

    persister.save({ ...initialState, shouldDisplayCart: true })
    expect(setItem).not.toHaveBeenCalled()

    persister.save(state)
    expect(setItem).toHaveBeenCalledTimes(1)
  })

  it('retries a failed write on the next save', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = createMemoryStorage()
    const setItem = vi.spyOn(storage, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota')
    })
    const persister = createCartPersister(storage, 'k', initialState)

    persister.save(state)
    persister.save(state)

    expect(setItem).toHaveBeenCalledTimes(2)
    expect(storage.getItem('k')).not.toBeNull()
  })

  it('retries after an async write fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const setItem = vi
      .fn()
      .mockReturnValueOnce(Promise.reject(new Error('quota')))
      .mockReturnValue(undefined)
    const storage: StorageAdapter = {
      getItem: () => null,
      setItem,
      removeItem: () => {}
    }
    const persister = createCartPersister(storage, 'k', initialState)

    persister.save(state)
    await new Promise((r) => setTimeout(r, 0))
    persister.save(state)

    expect(setItem).toHaveBeenCalledTimes(2)
  })

  it('skips writes when nothing persisted changed', () => {
    const storage = createMemoryStorage()
    const setItem = vi.spyOn(storage, 'setItem')
    const persister = createCartPersister(storage, 'k', initialState)

    persister.save(state)
    persister.save({ ...state, shouldDisplayCart: true, lastClicked: 'a' })
    expect(setItem).toHaveBeenCalledTimes(1)

    persister.save({ ...state, currency: 'EUR' })
    expect(setItem).toHaveBeenCalledTimes(2)
  })

  it('warns instead of throwing when an async write fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage: StorageAdapter = {
      getItem: () => null,
      setItem: () => Promise.reject(new Error('quota')),
      removeItem: () => {}
    }

    createCartPersister(storage, 'k', initialState).save(state)

    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        'Failed to persist cart to storage:',
        expect.any(Error)
      )
    )
  })
})
