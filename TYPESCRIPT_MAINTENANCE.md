# TypeScript Maintenance Guide

This guide provides best practices for maintaining TypeScript code quality in the NetworkFounderApp.

## Table of Contents

- [Type Safety Best Practices](#type-safety-best-practices)
- [Handling Runtime Checks](#handling-runtime-checks)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Type Safety Best Practices

### Avoid Using `any`

The `any` type defeats TypeScript's purpose. Use these alternatives:

```typescript
// Instead of any:
function processData(data: any) { ... }

// Better alternatives:
function processData(data: unknown) { ... }
function processData<T>(data: T) { ... }
function processData(data: Record<string, unknown>) { ... }
```

### Use Proper Nullability Checking

```typescript
// Safe optional chaining
const userName = user?.name || 'Anonymous';

// Type guards
if (typeof data === 'string') {
  // data is treated as string here
}

// Nullability assertions (use sparingly)
function getLength(str: string | null) {
  if (str === null) throw new Error('String is null');
  return str.length; // str is known to be string here
}
```

### Create Specific Interfaces

```typescript
// Specific interface instead of any
interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}
```

## Handling Runtime Checks

TypeScript only provides compile-time checks. For runtime safety:

### API Data Validation

Use runtime validation for API responses:

```typescript
function validateUserResponse(data: unknown): data is UserProfile {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  
  return (
    typeof d.id === 'string' &&
    typeof d.name === 'string' &&
    typeof d.email === 'string'
  );
}

// Usage
if (validateUserResponse(apiData)) {
  // apiData is typed as UserProfile here
  console.log(apiData.name);
}
```

### Safe Type Assertions

When you know more about a type than TypeScript does:

```typescript
// Using type assertion with validation
function processApiResponse(response: unknown) {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response');
  }
  
  // Now we know it's an object at least
  const typedResponse = response as Record<string, unknown>;
  
  if (typeof typedResponse.status !== 'string') {
    throw new Error('Missing status field');
  }
  
  // Now we can safely use status
  return typedResponse.status;
}
```

## Common Patterns

### React Component Props

```typescript
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

function Button({ text, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  // Implementation
}
```

### React State

```typescript
// Typed state
const [users, setUsers] = useState<UserProfile[]>([]);

// Typed reducers
type UserAction = 
  | { type: 'ADD_USER'; payload: UserProfile }
  | { type: 'REMOVE_USER'; payload: { id: string } };

const userReducer = (state: UserProfile[], action: UserAction) => {
  switch (action.type) {
    case 'ADD_USER':
      return [...state, action.payload];
    case 'REMOVE_USER':
      return state.filter(user => user.id !== action.payload.id);
    default:
      return state;
  }
};
```

## Troubleshooting

### Type Errors in External Libraries

If a library doesn't have type definitions:

```typescript
// Create a declaration file (e.g., my-module.d.ts)
declare module 'untyped-library' {
  export function someFunction(param: string): number;
  export const someValue: string;
}
```

### Temporary Type Assertions

When migrating code or dealing with complex types:

```typescript
// Use type assertions sparingly
const result = complexOperation() as { success: boolean };

// Better: Add type guards
function isSuccessResult(value: unknown): value is { success: boolean } {
  return Boolean(value && typeof value === 'object' && 'success' in value);
}
```

### Debugging Types

Use `typeof` and `instanceof` for runtime type checking:

```typescript
console.log(typeof variable); // Shows runtime type
console.log(variable instanceof SomeClass); // Checks class instances
```

---

Remember, TypeScript is a tool to help catch errors early - use its features to make your code more reliable and maintainable.
