// Core exports for use-shopping-cart (runtime values only)
export { ShoppingCart, initialState } from './ShoppingCart'
export { formatCurrencyString } from './formatters'
export {
  createLocalStorage,
  createNoopStorage,
  createMemoryStorage
} from './storage'

// Helper function for filtering cart
export async function filterCart(
  cartDetails: Record<string, any>,
  filter: (entry: any) => Promise<boolean> | boolean
): Promise<Record<string, any>> {
  const filteredCart: Record<string, any> = {}

  for (const sku in cartDetails) {
    const entry = cartDetails[sku]
    if (await filter(entry)) filteredCart[sku] = entry
  }

  return filteredCart
}

// Note: Types are exported via core/index.d.ts for TypeScript consumers
