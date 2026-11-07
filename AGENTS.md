# use-shopping-cart

A pnpm monorepo: the library in `use-shopping-cart/` (entry points `core`, `react`, `utilities`) and the docs site in `docs/`.

## Before you report work as done

- Run `pnpm check` from the repo root. It runs every CI step: lint, typecheck, build, unit tests, type tests, built-package tests and the package check. The pre-commit hook runs it too.
- Docs changes: also run `pnpm --filter docs build`.

## Where things are decided

- `GLOSSARY.md`: the domain's words. Use them.
- `docs/adr/`: decisions that look odd without their reasons. Read the matching ADR before changing that design.
- `CODING_STANDARDS.md`: what review checks.

## Product rules

- v4 is unreleased: make breaking changes in v4 directly. (Remove this line once 4.0.0 ships.)
- Ask the user before removing a feature or public export, even one that looks unused.
- Code has no comments, including JSDoc. The one exception is the description ESLint requires on `@ts-expect-error`.

## Changing the public API

A breaking change updates all four of these in the same change:

- `CHANGELOG.md`: append under `## [Unreleased]`; released sections never change.
- `MIGRATION.md`
- `docs/content/docs/migration-v4.mdx` and `docs/content/docs/welcome/migration-v4.mdx` (identical copies)

Then update every docs page that shows the changed API.

## Docs gotchas

- Prettier puts `;` in front of a JSX line that follows an import in an MDX code block. Wrap that JSX in `export const Root = () => (...)`.
- The docs site runs its cart with `shouldPersist={false}`, so it never exercises saved carts or server rendering with one. Test those in the library's tests.
