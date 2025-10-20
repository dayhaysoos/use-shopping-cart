# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2024-12-20

### 🚨 Breaking Changes

- **React 19 Required**: Updated peer dependency to require React 19.0.0 or higher
  - Users on React 18 should continue using v3.x
  - See [Migration Guide](./MIGRATION.md) for upgrade instructions
- **Node.js 18+ Required**: Minimum Node.js version increased from 8 to 18
- **Removed `jest-environment-jsdom-fifteen`**: Now using modern `jsdom` environment

### ✨ Improvements

- **Fixed CartProvider Bug**: Store is now created only once using `useRef` instead of `useMemo`
  - Previously, the store would be recreated on every prop change
  - This could cause unexpected behavior and state loss
  - No code changes required - the fix is automatic
- **Updated to TypeScript 5.3**: Better type inference and performance
- **Updated to Jest 29**: Modern testing environment with better performance
- **Updated to ESLint 9**: Latest linting standards
- **Updated Testing Library**: Now using @testing-library/react v14 with React 19 support

### 📦 Dependencies

- Updated `react` peer dependency to `^19.0.0`
- Updated `react-dom` peer dependency to `^19.0.0`
- Updated `typescript` to `^5.3.3`
- Updated `jest` to `^29.7.0`
- Updated `eslint` to `^9.0.0`
- Updated `@testing-library/react` to `^14.1.2`
- Updated `@testing-library/jest-dom` to `^6.1.5`
- Added `@types/react@^19.0.0`
- Added `@types/react-dom@^19.0.0`

### 📚 Documentation

- Added comprehensive [Migration Guide](./MIGRATION.md)
- Updated README with React 19 requirements
- Added installation instructions and requirements
- Updated all example projects to React 19

### 🔧 Examples

All example projects have been updated:
- `examples/vite-react` - Updated to Vite 5 and React 19
- `examples/nextjs` - Updated to Next.js 15 and React 19
- `examples/nextjs-app-router` - Updated to Next.js 15 and React 19
- `examples/typescript-usage` - Updated to React 19 and TypeScript 5.3
- `docs` - Updated to Docusaurus 3 and React 19

### 🧪 Testing

- Updated Jest configuration to use modern `jsdom` environment
- Added coverage thresholds (70% for branches, functions, lines, and statements)
- Improved test configuration for better performance

## [3.2.0] - Previous Release

See [v3.2.0 release notes](https://github.com/dayhaysoos/use-shopping-cart/releases/tag/v3.2.0) for details.

---

For older versions, see the [releases page](https://github.com/dayhaysoos/use-shopping-cart/releases).


