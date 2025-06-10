# Workflows for Orchestrator

## Workflow Selection Criteria

**Use "Add new feature" when:**

-   User requests adding new functionality
-   New files need to be created under `src/`
-   Existing functionality needs extension

**Use "Single File Refactoring" when:**

-   User requests improving code quality of a specific file
-   Code structure needs improvement without API changes

**Use "Library API Refactoring" when:**

-   User requests library/component interface improvements
-   Breaking changes to public API are acceptable
-   Module exports need restructuring
-   Documentation indicates API design issues

---

## Workflow: Add new feature

**Prerequisites:** User has specified the feature requirements and target functionality

### Step 0: Initial Git Status Check

**[Mode: code]**

-   Run `git status` to check current repository state
-   Ensure working directory is clean or document existing changes
-   **Success criteria:** Git status documented and ready for workflow

### Step 1: Analyze existing codebase

**[Mode: ask]**

-   Search for similar functionality in `src/` directory using semantic search
-   Identify patterns and conventions from existing code
-   **Decision criteria:** If similar functionality exists, extend existing file; if not, create new file
-   **On failure:** Ask user for clarification on feature requirements
-   **Success criteria:** Clear understanding of implementation approach and file location

### Step 2: Create or modify implementation file

**[Mode: code]**

-   Create new file (e.g., `src/feature/{feature-name}.ts` or `src/components/{component-name}.ts`) or modify existing file
-   Implement feature following React/Next.js and TypeScript conventions
-   **Prerequisites:** Step 1 completed successfully
-   **On failure:** Switch to [Mode: debug] to analyze compilation errors
-   **Success criteria:** File compiles without TypeScript/JSX errors

### Step 3: Final Git Commit

**[Mode: code]**

-   Stage changes with `git add .`
-   Commit with conventional commit message format:
    -   `feat: add {feature-name}` for new features
    -   `feat: extend {existing-feature}` for feature extensions
-   **Prerequisites:** Changes implemented
-   **Success criteria:** Changes committed with appropriate conventional commit message

### Step 4: Transition to refactoring

**[Mode: orchestrator]**

-   Delegate to "Single File Refactoring" workflow for code quality improvements
-   **Prerequisites:** Changes committed successfully
-   **Success criteria:** Workflow transition completed

---

## Workflow: Single File Refactoring

**Prerequisites:** Target file path specified and file exists

### Step 0: Initial Git Status Check

**[Mode: code]**

-   Run `git status` to check current repository state
-   Ensure working directory is clean or document existing changes
-   **Success criteria:** Git status documented and ready for workflow

### Step 1: File analysis

**[Mode: ask]**

-   Read target file: `{filepath}.ts` or `{filepath}.tsx`
-   Analyze code structure and complexity
-   **On failure:** Request valid file path from user
-   **Success criteria:** File content loaded and analyzed

### Step 2: Refactoring plan creation

**[Mode: refactor]**

-   Identify specific refactoring opportunities:
    -   Function/Component extraction for complex logic
    -   Improved state management (if applicable)
    -   Type safety improvements
    -   Adherence to React best practices
-   **Prerequisites:** File analysis completed
-   **On failure:** Request additional context about refactoring goals
-   **Success criteria:** Concrete refactoring plan with specific changes identified

### Step 3: Apply refactoring changes

**[Mode: refactor]**

-   Implement planned refactoring changes
-   Maintain existing functionality (no behavioral changes)
-   Ensure code adheres to TypeScript conventions
-   **Prerequisites:** Refactoring plan exists
-   **On failure:** Revert changes and switch to [Mode: debug] to analyze issues
-   **Success criteria:** File compiles without TypeScript/JSX errors

### Step 4: Final Git Commit

**[Mode: code]**

-   Stage changes with `git add .`
-   Commit with conventional commit message format:
    -   `refactor: improve {filename}` for code quality improvements
    -   `style: format {filename}` for formatting changes