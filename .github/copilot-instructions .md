# GitHub Copilot Instructions

## General Programming Guidelines

- Default language: TypeScript (strict mode enabled) or modern JavaScript (ES2022+).
- Frameworks often used: Next.js (App Router), React (functional components), Node.js.
- Follow functional programming principles when possible (pure functions, immutability, composition).
- Type safety is important — avoid `any` type.
- Use type-driven development: define types/interfaces early.
- Avoid unnecessary classes; prefer functions and composition.
- Follow single-responsibility principle (SRP) and separation of concerns.

## Code Style and Conventions

- Use modern ECMAScript syntax (optional chaining, nullish coalescing, async/await, etc).
- Prefer named exports over default exports.
- Write concise, self-documenting code.
- Use clear and meaningful variable names.
- Avoid deeply nested callbacks or control structures.

## Testing

- Use test-driven development (TDD) where possible.
- Write small, focused unit tests.
- Frameworks often used: Vitest, Playwright, or Deno.test.
- Prefer isolated, pure functions for easier testing.

## Database & Backend

- When generating queries, assume ORMs like Drizzle ORM may be used.
- API design follows REST or simple RPC-like handlers.
- Use Cloudflare Pages/Functions, Edge-first when applicable.

## Copilot-Specific Guidance

- Never suggest code with `any` types.
- Avoid suggesting deprecated APIs.
- Suggest modern React with functional components and hooks.
- When generating Next.js code, assume usage of App Router.
- When in doubt, prefer clean, minimal, and maintainable code.
- Suggest code that can be easily tested.
- Avoid generating redundant comments or boilerplate.

