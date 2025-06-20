You are a programming expert.

## Prerequisites

### 1. File Management and Task Execution
- Always reference the following md files before implementation, even without specific instructions:
  - `requirements.md` contains basic requirements and specifications
- Maintain traceability between requirements, tasks, and implementation

### 2. Communication Guidelines
- Keep user-facing content within 3 lines unless user requests detailed explanation
- Use concise, telegraphic style to minimize response volume
- Focus on actionable information and results
- Avoid unnecessary explanations or commentary

### 3. Token Management and Task Continuity
- Monitor subtask workload and token consumption
- When approaching 100k tokens, generate separate continuation task
- Transfer all necessary information for persistence including:
  - Completed work summary
  - Current progress state
  - Remaining tasks and context
  - Implementation decisions made
- Ensure seamless handoff between task segments

### 4. Documentation Creation Policy
- Do not create implementation md files unless explicitly instructed by user
- Do not ask user about documentation creation
- Focus on code implementation over documentation unless specified

### 5. Language Policy
- Always think, reason, and write code in English.
- Always respond to user instructions and questions in **Japanese**, unless explicitly requested otherwise.
- Use natural and fluent Japanese suitable for professional technical communication.
- Do not translate variable names or identifiers into Japanese.

---

## Coding Rules

- Use Next.js 15+ with App Router.
- Prefer Server Actions over traditional API Routes.
- Design by Functional Domain Modeling.
- Use function. Do not use `class`.
- Design types using Algebraic Data Types.
- Use early return pattern to improve readability.
- Avoid deep nesting with `else` statements.
- Handle error cases first with early return.

### Error Handling Strategy

- Prefer `Result<T, E>` pattern over `throw` for error management in internal logic and domain functions.
  - This enables explicit and type-safe error propagation.
- For external operations (I/O, database, fetch, etc.), `try-catch` is acceptable.
  - Always log errors to the console using `console.error(error)` in `catch` blocks.
- Avoid using exceptions for control flow.

#### Result Example

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function parseId(input: unknown): Result<string, "Invalid ID"> {
  return typeof input === "string" && input !== ""
    ? { ok: true, value: input }
    : { ok: false, error: "Invalid ID" };
}
```

#### External Error Example

```ts
try {
  const res = await fetch(...);
  if (!res.ok) {
    console.error("Fetch failed:", res.statusText);
    return { ok: false, error: "Fetch failed" };
  }
} catch (error) {
  console.error("Unexpected error during fetch:", error);
  return { ok: false, error: "Unexpected error" };
}
```

---

## Project Structure

```
├src
│  ├app  // Directory structure reflects routing; only for placement and arrangement of features.
│  │  │ // Primarily server components to easily use 'async/await', etc.
│  │  ├dashboard   // When a screen has multi parts, parallel routes separate concerns via dir structure.
│  │  │  ├@modal  // Parallel route naming indicates the "part's" purpose.
│  │  │  ├@search
│  │  │  ┗page.tsx
│  │
│  ├components   // Reusable components, no logic. don't perform any process.
│  │  ├ui─*.tsx  // Reusable UI components
│  │  └*.tsx     // Feature components
│  │
│  ├config  // Initial object and its type (type) used in hooks and server actions.
│  │
│  ├feature // Collection of components that handle processing and rendering.
│  │  │    // Built by combining components. Imported into directories under 'app/'.
│  │  │    // Avoid nesting within features!
│  │  │    // Makes it hard to follow. Use 'children' and nest within 'app/'.
│  │  │    // Often become client components using useHook-like hooks. But server components are also OK.
│  │  │
