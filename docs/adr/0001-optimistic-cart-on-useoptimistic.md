# The cart is synchronous; optimistic changes use React's `useOptimistic`

The cart applies every cart change synchronously; talking to a backend is the store's choice, opted into with `useOptimisticCart({ onChange })`. Optimistic changes are shown with React's own `useOptimistic`, held once per cart in a layer `CartProvider` always mounts, so every `useOptimisticCart` on the cart shows the same pending changes. `onChange` calls run one after another in the order the shopper made them and are never cancelled: a shopper who taps "add" three times means three adds.

## Considered Options

- **A hand-rolled optimistic store instead of `useOptimistic`**: rejected. It was tried and reverted (962ecaf); the hook exists to show React 19's optimistic model, and `useOptimistic` already handles transitions and rollback.
- **Removing `useOptimisticCart`**: rejected. It is how a cart backed by a server shows expected values while the server confirms them.
- **Mounting the optimistic state inside each `useOptimisticCart`**: rejected. Each hook would show only its own pending changes, so the cart badge and the cart panel would disagree while a change is in flight.
- **Cancelling or coalescing in-flight changes**: rejected. It drops changes the shopper made; a store that wants that can build it on top of `onChange`.
