# use-shopping-cart Modernization Plan

This document captures the current ideas for a major refactor of `use-shopping-cart`, focusing on upgrading to React 19, replacing Redux with a framework-agnostic cart class, and migrating the codebase to TypeScript.

## ✅ React 19 Upgrade (Completed in v4.0.0)

- **Goal:** Target React 19 for the main `peerDependency` and leverage the latest platform improvements.
- **Status:** Completed - React 19 is now required for v4.0.0
- **Breaking Change:** Users on React 18 should continue using v3.x
- **Key Features to Adopt:**
  - `useActionState` and Actions API for handling cart mutations.
  - `useOptimistic` for latency-friendly UI updates while persisting state.
  - Enhanced context performance and `use()` for async flows.
  - `ref` as a prop and other ergonomic improvements in component APIs.
- **Action Items:**
  - Update peer dependency range to include React 19 and ensure compatibility with React 18 projects.
  - Audit the React bindings (providers/hooks) for any deprecated lifecycles or APIs.
  - Add React 19-centric examples (e.g., `useOptimistic` demo) to the documentation.

## Replace Redux with a Cart Class

- **Goal:** Remove Redux-related dependencies and reimplement cart logic around a robust, framework-agnostic class.
- **Motivation:**
  - Reduce bundle size by eliminating Redux, React-Redux, Redux Persist, etc.
  - Offer a simpler mental model and easier extensibility for framework users.
  - Provide universal support (React, Vue, Svelte, vanilla JS) through a shared core.
- **Proposed Architecture:**
  - `ShoppingCart` class manages state, persistence, and subscriptions.
  - Public API methods mirror the existing hook actions (`addItem`, `removeItem`, `incrementItem`, `clearCart`, etc.).
  - Persistence handled via storage adapters (default `localStorage`, easy to swap/customize).
  - Notify listeners on state changes to keep UI layers in sync.
- **React Integration:**
  - Thin layer using `useSyncExternalStore` for accurate subscriptions.
  - `CartProvider` creates a single cart instance and exposes it through context.
  - Hooks (`useShoppingCart`, `useCartCount`, etc.) wrap the class methods while returning derived state.
- **Migration Strategy:**
  - Maintain similar API surface so existing users adjust minimal code.
  - Publish a v4 migration guide comparing Redux-based usage with the class-based approach.

## TypeScript Migration

- **Goal:** Convert the source to TypeScript for stronger type safety and a better developer experience.
- **Benefits:**
  - Replace manually maintained `.d.ts` files with generated types from the source.
  - Leverage discriminated unions and generics for cart configuration and entry types.
  - Improve confidence in refactors and reduce runtime errors.
- **Implementation Plan:**
  - Set up a `tsconfig` that supports build output (ESM/CJS) and type declarations.
  - Incrementally migrate modules (`core` first, then React bindings, then utilities).
  - Add strict linting/type-check scripts to CI for continuous guarantees.

## Comparison Snapshot

| Aspect | Current (Redux + JS) | Proposed (Class + TS) |
| --- | --- | --- |
| Bundle footprint | ~45 KB (Redux deps) | ~12 KB (class + helpers) |
| Framework support | React-only | Framework agnostic core |
| State access | React hooks + Redux store | Class API + thin React binding |
| Type safety | Hand-written `.d.ts` | Native TypeScript source |
| Dev experience | Redux concepts required | Simple class methods |

> _Note:_ Bundle size estimates assume tree-shaken builds and removal of legacy dependencies; final numbers may vary after implementation.

## React 19 Upgrade Completed ✅

Version 4.0.0 has been updated with:
- React 19 as a peer dependency
- All examples upgraded to React 19
- Jest updated to v29 with modern jsdom
- TypeScript 5.3
- Fixed CartProvider store recreation bug
- All dev dependencies modernized

## Next Steps for v4.0.0 (Redux Removal - Coming Soon)

1. Draft RFC describing Redux removal and the new class-based architecture
2. Prototype the `ShoppingCart` class (with tests) to validate API ergonomics and persistence behavior
3. Complete TypeScript migration of all source files
4. Implement the class-based cart core
5. Update migration guide for the complete v3 → v4 transition


