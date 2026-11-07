# Coding Standards

Judgement calls for reviewing a change. Lint, types, tests and formatting are enforced by `pnpm check`; this file covers what no check can.

## Findings

- **Realistic failures only.** A race, edge case or security concern is a finding when you can name the production scenario: what a real store or shopper does, in what order, and what breaks. A concern without one goes to the user as a question with its likelihood and the cost of handling it, not as a fix.
- **Decisions are settled.** Anything recorded in `docs/adr/` is not a finding. Flag a change only when it contradicts an ADR, and name the ADR.

## Changes

- **A bug fix comes with a test that fails on the code before the fix.** A test that passes either way proves nothing; say how you saw it fail.
- **Check input once, where it enters.** Products, form data, saved carts, inventory and checkout URLs are checked at the entry point that receives them. Code past that point trusts its types.
- **Helpers name a concept.** Extract a function when it is reused or when its name explains the caller better than the lines it replaces; otherwise keep the code where it is used.
- **Use the domain's words.** Names, error messages and docs use the terms in `GLOSSARY.md`.
