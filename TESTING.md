# Testing Guide

This project uses **Jest** and **React Testing Library** for unit and component testing.

## Setup

Install test dependencies:

```bash
npm install
```

Dependencies installed:
- `jest` — test runner
- `@testing-library/react` — React component testing utilities
- `@testing-library/jest-dom` — custom Jest matchers for DOM assertions
- `jest-environment-jsdom` — simulates browser environment in tests
- `@types/jest` — TypeScript types for Jest

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Component Tests

Component tests live in `src/components/__tests__/` with the naming pattern `ComponentName.test.tsx`.

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Utility/Function Tests

Utility tests live in `src/lib/__tests__/` with the naming pattern `fileName.test.ts`.

Example test:

```ts
import { myFunction } from '../utils';

describe('myFunction', () => {
  it('returns expected output', () => {
    expect(myFunction('input')).toBe('expected output');
  });

  it('handles edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toThrow();
  });
});
```

## Test Coverage

Coverage reports are generated in the `coverage/` directory. View the HTML report:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

**Coverage goals:**
- Components: 80%+
- Utilities: 90%+
- Critical paths (API routes, auth): 100%

## Mocking

### Mock API Fetch Calls

```ts
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ data: 'mocked response' }),
  })
) as jest.Mock;
```

### Mock Next.js Router

```ts
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/test',
  }),
}));
```

## Existing Tests

- **`src/lib/__tests__/github.test.ts`** — Tests for GitHub API helper functions
- **`src/components/__tests__/ProjectCard.test.tsx`** — Tests for ProjectCard component

## CI Integration

Tests run automatically on every push and pull request via GitHub Actions (`.github/workflows/ci.yml`). The CI pipeline:

1. Runs ESLint
2. Type-checks with TypeScript
3. **Runs Jest tests** (coming soon - add to workflow)
4. Builds the project

## Best Practices

1. **Test behavior, not implementation** — Focus on what users see/do, not internal state
2. **Use semantic queries** — Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Keep tests simple** — One assertion per test when possible
4. **Mock external dependencies** — Don't hit real APIs or databases in tests
5. **Test edge cases** — Null values, empty arrays, error states
6. **Avoid snapshot tests** — They're brittle and don't catch real bugs

## Troubleshooting

**"Cannot find module '@testing-library/react'"**
→ Run `npm install`

**"SyntaxError: Cannot use import statement outside a module"**
→ Make sure `jest.config.js` has `moduleNameMapper` for path aliases

**Tests pass locally but fail in CI**
→ Check for environment-specific issues (Node version, missing env vars)

---

For more info:
- [Jest docs](https://jestjs.io/docs/getting-started)
- [React Testing Library docs](https://testing-library.com/docs/react-testing-library/intro/)
