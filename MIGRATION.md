# Migration Guide

## Upgrading to v4.0.0

Version 4.0.0 is a major update that brings React 19 support and several important improvements. This guide will help you upgrade from v3.x to v4.0.0.

### Breaking Changes

#### React 19 Required

use-shopping-cart v4.0.0 requires React 19 as a peer dependency.

**Before (v3.x):**
```json
{
  "dependencies": {
    "react": "^17.0.0",
    "react-dom": "^17.0.0",
    "use-shopping-cart": "^3.2.0"
  }
}
```

**After (v4.x):**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "use-shopping-cart": "^4.0.0"
  }
}
```

**If you need to stay on React 18:**
You can continue using use-shopping-cart v3.x, which will receive critical bug fixes but no new features.

#### Node.js Version Requirement

Node.js 18 or higher is now required (previously Node.js 8+).

### Improvements and Bug Fixes

#### Fixed: CartProvider Store Recreation Bug

In v3.x, the `CartProvider` would recreate the Redux store every time props changed, which could cause unexpected behavior. This has been fixed in v4.0.0.

**What this means for you:**
- Your cart state should be more stable
- No action required on your part - this fix is automatic

#### Updated Dependencies

All dependencies have been updated to their latest versions:
- TypeScript 5.3
- Jest 29
- ESLint 9
- Testing Library 14
- And more...

### TypeScript Changes

If you're using TypeScript, you'll need to update your type imports:

```bash
npm install --save-dev @types/react@^19.0.0 @types/react-dom@^19.0.0
```

### Migration Steps

#### 1. Update React

```bash
npm install react@^19.0.0 react-dom@^19.0.0
# or
pnpm add react@^19.0.0 react-dom@^19.0.0
# or
yarn add react@^19.0.0 react-dom@^19.0.0
```

#### 2. Update use-shopping-cart

```bash
npm install use-shopping-cart@^4.0.0
# or
pnpm add use-shopping-cart@^4.0.0
# or
yarn add use-shopping-cart@^4.0.0
```

#### 3. Run React 19 Codemods (Optional)

React provides codemods to help migrate your code to React 19:

```bash
npx codemod@latest react/19/migration-recipe
```

This will automatically update deprecated APIs like:
- `ReactDOM.render` → `ReactDOM.createRoot`
- String refs → Ref callbacks
- And more...

#### 4. Update TypeScript Types (If Using TypeScript)

```bash
npm install --save-dev @types/react@^19.0.0 @types/react-dom@^19.0.0
```

Then run the TypeScript codemods:

```bash
npx types-react-codemod@latest preset-19 ./src
```

#### 5. Test Your Application

Run your test suite to ensure everything works correctly:

```bash
npm test
```

### Common Issues and Solutions

#### Issue: Type errors with refs

**Error:**
```
Cannot assign to 'current' because it is a read-only property
```

**Solution:**
Update your ref usage. In React 19, `useRef` requires an argument:

```typescript
// Before
const ref = useRef<HTMLDivElement>()

// After
const ref = useRef<HTMLDivElement>(null)
```

#### Issue: Test failures with `act`

**Error:**
```
Cannot find module 'react-dom/test-utils'
```

**Solution:**
Import `act` from `react` instead:

```javascript
// Before
import { act } from 'react-dom/test-utils'

// After
import { act } from 'react'
```

#### Issue: ESLint errors

If you're using ESLint 7 or 8, you may need to update to ESLint 9:

```bash
npm install --save-dev eslint@^9.0.0
```

Note: ESLint 9 uses a new flat config format. See [ESLint's migration guide](https://eslint.org/docs/latest/use/configure/migration-guide) for details.

### New Features in v4.0.0

While v4.0.0 is primarily focused on React 19 compatibility, it includes several improvements:

1. **Fixed CartProvider Bug**: Store is now created only once, not on every prop change
2. **Better Testing**: Updated to Jest 29 with modern jsdom environment
3. **Modern Dependencies**: All dependencies updated to latest stable versions
4. **Improved TypeScript**: Better type definitions and React 19 compatibility

### What's Next?

We're continuing work on v4.0.0 with these upcoming features:

- **Redux Removal (Coming in v4.0.0)**: Replace Redux with a lightweight class-based cart
- **Full TypeScript Migration**: Convert entire codebase from JavaScript to TypeScript
- **Smaller Bundle Size**: Reduce bundle size by ~70% by removing Redux
- **Framework Agnostic Core**: Use the cart with React, Vue, Svelte, or vanilla JS

The React 19 upgrade you just completed is the first step. Stay tuned for the complete v4.0.0 release!

### Getting Help

If you encounter issues during migration:

1. Check the [GitHub Issues](https://github.com/dayhaysoos/use-shopping-cart/issues)
2. Join our [Discord community](https://useshoppingcart.com/discord)
3. Review the [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

### Rollback Instructions

If you need to rollback to v3.x:

```bash
npm install use-shopping-cart@^3.2.0 react@^18.2.0 react-dom@^18.2.0
# or
pnpm add use-shopping-cart@^3.2.0 react@^18.2.0 react-dom@^18.2.0
# or
yarn add use-shopping-cart@^3.2.0 react@^18.2.0 react-dom@^18.2.0
```

---

**Last Updated:** December 2024
**Version:** 4.0.0

