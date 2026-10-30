# TypeScript Handbook: Reference & Structural Typing Guide

> **Reference Work:** *The Official TypeScript Handbook*  
> **Maintainer:** Microsoft TypeScript Team  
> **Canonical Documentation:** [typescriptlang.org/docs/handbook/](https://www.typescriptlang.org/docs/handbook/)  
> **Source Repository:** [github.com/microsoft/TypeScript-Website](https://github.com/microsoft/TypeScript-Website)  
> **License:** Apache License 2.0 / Creative Commons Attribution 4.0 International  
> **Practical Synergy:** This reference synthesizes core type theory, advanced metaprogramming, and configuration patterns. Practical exercises for every concept in this guide are located in `D:\Learning\Programming\JavaScript-TypeScript\Programs\Type-Challenges-Repository\`.

---

## 1. Structural Type System Philosophy

Unlike nominal type systems (e.g., Java, C++) where type identity is determined by explicit declaration names, TypeScript operates on a **structural type system** (often called compile-time duck typing). Two types are compatible if they possess the same internal structure (properties and method signatures), regardless of how or where they were defined.

```
       NOMINAL SYSTEM                         STRUCTURAL SYSTEM
   (Java / C# / C++)                           (TypeScript / Go)

class Point { int x; int y; }               interface Point { x: number; y: number; }
class Vector { int x; int y; }              interface Vector { x: number; y: number; }

Point p = new Vector(); // ERROR!           const p: Point = { x: 1, y: 2 }; // VALID!
// Incompatible nominal types               // Shapes match identically
```

---

## 2. Core Type Primitives & Special Types

### Fundamental Types
- **Primitives:** `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined`.
- **Literal Types:** Specific values as types (e.g., `let direction: "left" | "right" | "up" | "down"`).
- **Arrays & Tuples:** `number[]` or `Array<number>`. Tuples have fixed length and specific types per position: `type KeyValuePair = readonly [string, number]`.

### Top & Bottom Types
- **`unknown` (Top Type):** The type-safe counterpart of `any`. Any value can be assigned to `unknown`, but no operations or property accesses are permitted without prior narrowing.
- **`any`:** Completely disables TypeScript's type-checking mechanism. Avoid in robust codebases.
- **`never` (Bottom Type):** Represents the empty set of values. Returned by functions that never return (infinite loops or throw exceptions), and used to prove exhaustiveness in switch statements.
- **`void`:** Represents the return value of functions that do not return a meaningful value.

---

## 3. Control Flow Analysis & Type Narrowing

TypeScript inspects runtime control flow branches to narrow wide types (like unions) into specific types.

### Narrowing Mechanisms
1. **`typeof` Guards:** Narrow primitives (`typeof x === "string"`).
2. **`instanceof` Guards:** Narrow prototype chains (`x instanceof Date`).
3. **`in` Operator:** Check for property existence (`"error" in response`).
4. **Equality Narrowing:** Strict equality checks (`x === y` where `y: string`).
5. **Truthiness Narrowing:** Filtering out `null`, `undefined`, `0`, `""`.
6. **User-Defined Type Predicates:**
   ```typescript
   function isFish(pet: Fish | Bird): pet is Fish {
       return (pet as Fish).swim !== undefined;
   }
   ```

### Discriminated Unions & Exhaustiveness Checking
Discriminated unions combine a common literal property (the discriminant) across multiple variants. Use `never` to guarantee that all cases are handled at compile time:

```typescript
type Circle = { kind: "circle"; radius: number };
type Square = { kind: "square"; sideLength: number };
type Shape = Circle | Square;

function calculateArea(s: Shape): number {
    switch (s.kind) {
        case "circle":
            return Math.PI * s.radius ** 2;
        case "square":
            return s.sideLength ** 2;
        default: {
            // If a new variant (e.g. Triangle) is added to Shape,
            // this assignment causes a compile-time error.
            const _exhaustiveCheck: never = s;
            return _exhaustiveCheck;
        }
    }
}
```

---

## 4. Interfaces vs. Type Aliases

| Feature | Interface (`interface X { ... }`) | Type Alias (`type X = ...`) |
|---|---|---|
| **Declaration Merging** | Yes: multiple declarations merge into one | No: duplicate identifiers cause compile errors |
| **Union & Intersection** | Cannot represent union directly | Supports unions (`A \| B`) and primitives |
| **Object Extension** | `interface B extends A { ... }` | `type B = A & { ... }` (intersection) |
| **Performance** | Faster compiler cache lookups on object shapes | Slightly slower on massive intersection chains |
| **Convention** | Preferred for public library APIs and OOP models | Preferred for unions, tuples, and mapped types |

---

## 5. Generics & Type Constraints

Generics parameterize types, enabling reusable components while preserving type information.

```typescript
// Generic function with constraints and keyof
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// Default type parameters
interface ApiResponse<T = unknown> {
    data: T;
    timestamp: number;
    status: number;
}
```

---

## 6. Advanced Metaprogramming & Type Operators

### 1. Conditional Types
Conditional types select one of two types based on a subtyping relationship:
```typescript
type IsString<T> = T extends string ? true : false;
```

### 2. Type Inference with `infer`
Extract component types from within complex generic types:
```typescript
// Extract return type of a function
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract element type of an array
type ElementOf<T> = T extends (infer E)[] ? E : T;

// Unwrap Promise
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;
```

### 3. Mapped Types & Key Remapping
Iterate over keys to transform object structures:
```typescript
// Create a readonly version with optional keys
type CustomModifier<T> = {
    +readonly [K in keyof T]?: T[K];
};

// Key remapping via `as` and Template Literal Types
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

---

## 7. Built-in Utility Types

| Utility Type | Definition | Common Use Case |
|---|---|---|
| `Partial<T>` | `{ [P in keyof T]?: T[P] }` | Patch updates, options objects |
| `Required<T>` | `{ [P in keyof T]-?: T[P] }` | Ensuring complete configuration |
| `Readonly<T>` | `{ readonly [P in keyof T]: T[P] }` | Preventing object mutation |
| `Record<K, T>` | `{ [P in K]: T }` | Dictionaries and key-value lookups |
| `Pick<T, K>` | Picks a subset of keys `K` from `T` | Narrowing API responses |
| `Omit<T, K>` | Removes a subset of keys `K` from `T` | Excluding sensitive fields (e.g., passwords) |
| `Exclude<T, U>` | Excludes types in `U` from union `T` | Removing specific variants from a union |
| `Extract<T, U>` | Extracts types in `U` from union `T` | Filtering union variants |
| `NonNullable<T>` | Removes `null` and `undefined` from `T` | Ensuring guaranteed values |
| `ReturnType<T>` | Extracts the return type of a function | Inferring factory outputs |

---

## 8. Compiler Configuration (`tsconfig.json`) Standards

For production-grade TypeScript development, adhere to strict compiler defaults:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```
