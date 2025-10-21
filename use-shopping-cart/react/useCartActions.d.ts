/**
 * State returned by cart actions
 */
export interface ActionState {
  status: 'idle' | 'success' | 'error'
  error: string | null
}

export interface AddItemState extends ActionState {
  productId: string | null
}

export interface RemoveItemState extends ActionState {
  itemId: string | null
}

export interface UpdateQuantityState extends ActionState {
  itemId: string | null
  quantity: number | null
}

/**
 * Form-friendly cart actions using React 19's useActionState.
 * Perfect for progressive enhancement and form-based cart operations.
 *
 * @example
 * ```tsx
 * function ProductCard({ product }: { product: Product }) {
 *   const { addToCartAction, isPending } = useCartActions()
 *
 *   return (
 *     <form action={addToCartAction}>
 *       <input type="hidden" name="product" value={JSON.stringify(product)} />
 *       <button disabled={isPending}>
 *         {isPending ? 'Adding...' : 'Add to Cart'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 *
 * @returns Object with form actions and their states
 */
export function useCartActions(): {
  // Add item
  addToCartAction: (formData: FormData) => void
  addItemState: AddItemState
  isAddingItem: boolean

  // Remove item
  removeFromCartAction: (formData: FormData) => void
  removeItemState: RemoveItemState
  isRemovingItem: boolean

  // Update quantity
  updateQuantityAction: (formData: FormData) => void
  updateQuantityState: UpdateQuantityState
  isUpdatingQuantity: boolean

  // Increment item
  incrementItemAction: (formData: FormData) => void
  incrementItemState: ActionState & { itemId: string | null }
  isIncrementingItem: boolean

  // Decrement item
  decrementItemAction: (formData: FormData) => void
  decrementItemState: ActionState & { itemId: string | null }
  isDecrementingItem: boolean

  // Clear cart
  clearCartAction: (formData: FormData) => void
  clearCartState: ActionState
  isClearingCart: boolean

  // Global pending state
  isPending: boolean
}
