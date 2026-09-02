# FRONTEND ARCHITECTURE & FEATURE IMPLEMENTATION PROMPT

Use this prompt in Cursor (`.cursorrules` or System Prompt) or Antigravity (`AGENTS.md`) to enforce the exact React + TypeScript frontend architecture across your projects.

---

# ARCHITECTURE & FEATURE IMPLEMENTATION RULES

You are an expert React & TypeScript software engineer. When writing code, generating features, or modifying existing files in this repository, you MUST strictly adhere to the project architecture, directory structure, and design patterns outlined below.

---

## 1. Directory Structure Specification

The `client/src/` folder must strictly adhere to the following organization:

```text
src/
├── App.tsx                     # Main Router & Suspense setup
├── main.tsx                    # Top-level Context Providers wrapper
├── index.css                   # Global styles / CSS Tokens
├── context/                    # GLOBAL App-wide Contexts ONLY (e.g., AuthContext, ThemeContext)
│   └── AuthContext.tsx
├── hooks/                      # App-wide global utility hooks (e.g., useDebounce, useMediaQuery)
├── components/                 # COMMON/SHARED UI Components (PascalCase folders)
│   ├── Button/
│   ├── Modal/
│   └── Navbar/
├── screens/                    # View pages & Feature modules (PascalCase folders)
│   └── [ScreenName]/           # MANDATORY 4-FILE SCREEN PATTERN
│       ├── [ScreenName].tsx    # Exported component & Provider wrapper
│       ├── use[ScreenName].ts  # Custom hook containing ALL state & API calls
│       ├── context.ts          # React.createContext declaration
│       └── components/         # Screen-specific nested micro-components
├── services/                   # App utility services (e.g., analytics, storage wrappers)
├── types/                      # Shared TypeScript interfaces & API types
└── utils/                      # Pure helper functions & API client
    ├── api_request/            # Centralized API Request Layer
    │   ├── utils.ts            # Central Axios/Fetch wrapper (handles auth, headers, 401s)
    │   └── [domain].ts         # Domain API definitions (e.g., auth.ts, user.ts, project.ts)
    ├── constants.ts            # App constants & storage keys
    └── helpers.ts              # Pure transformation functions
```

---

## 2. The Mandatory 4-File Screen Pattern

Every screen or major feature view in `src/screens/[ScreenName]` **MUST** be decoupled using the 4-file pattern. Never write state or API calls directly inside UI view components.

### File 1: `context.ts`
Declares the Context type and creates the React context container.
```typescript
import { createContext } from 'react';
import { ReturnTypeOfUseScreenName } from './useScreenName'; // Or typed context interface

export const ScreenNameContext = createContext<ReturnTypeOfUseScreenName | null>(null);
```

### File 2: `useScreenName.ts`
Contains **ALL** `useState`, `useEffect`, event handlers, derived data, and API invocations for this screen.
```typescript
import { useState, useEffect } from 'react';
import { fetchFeatureData } from '../../utils/api_request/feature';

export const useScreenName = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchFeatureData();
      setData(res);
    } catch (err) {
      // Error handling managed via global API utils or local state
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string) => {
    // Action logic here
  };

  return {
    // State
    data,
    loading,
    // Actions
    handleAction,
    loadData,
  };
};

export type ReturnTypeOfUseScreenName = ReturnType<typeof useScreenName>;
```

### File 3: `ScreenName.tsx`
Thin presentation component. Calls `useScreenName()`, wraps children in `ScreenNameContext.Provider`, and renders layout shell.
```typescript
import React, { useContext } from 'react';
import { useScreenName } from './useScreenName';
import { ScreenNameContext } from './context';
import HeaderComponent from './components/HeaderComponent';
import ListComponent from './components/ListComponent';

const ScreenContent: React.FC = () => {
  const context = useContext(ScreenNameContext);
  if (!context) throw new Error('ScreenContent must be used within ScreenNameContext.Provider');
  
  const { loading } = context;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4 p-6">
      <HeaderComponent />
      <ListComponent />
    </div>
  );
};

export const ScreenName: React.FC = () => {
  const screenState = useScreenName();

  return (
    <ScreenNameContext.Provider value={screenState}>
      <ScreenContent />
    </ScreenNameContext.Provider>
  );
};

export default ScreenName;
```

### File 4: `components/` (Screen-Specific Micro-Components)
Nested subcomponents inside `src/screens/[ScreenName]/components/` consume state directly via `useContext(ScreenNameContext)`. **No prop drilling!**
```typescript
import React, { useContext } from 'react';
import { ScreenNameContext } from '../context';

const HeaderComponent: React.FC = () => {
  const context = useContext(ScreenNameContext);
  if (!context) return null;

  const { data, handleAction } = context;

  return (
    <header className="flex justify-between items-center">
      <h1>Total Items: {data.length}</h1>
      <button onClick={() => handleAction('sample-id')}>Perform Action</button>
    </header>
  );
};

export default HeaderComponent;
```

---

## 3. Centralized API Request Layer (`src/utils/api_request/`)

### Rule: NO inline `axios.get()` or `fetch()` inside components or hooks!
All API traffic must flow through `utils/api_request/`.

1. **`src/utils/api_request/utils.ts`**: Holds the central HTTP client instance.
   - Automatically attaches bearer tokens from `localStorage`.
   - Formats errors and triggers global error notifications (e.g., `react-hot-toast`).
   - Handles `401 Unauthorized` responses by clearing credentials and redirecting to login.

   ```typescript
   // Example src/utils/api_request/utils.ts wrapper interface
   export const request = async <T>(config: RequestConfig): Promise<T> => { ... };
   ```

2. **`src/utils/api_request/[domain].ts`**: Defines domain specific endpoint functions.
   ```typescript
   // src/utils/api_request/subscriptions.ts
   import { request } from './utils';
   import { Subscription } from '../../types';

   export const getSubscriptions = () => {
     return request<Subscription[]>({
       url: '/subscriptions',
       method: 'GET',
     });
   };

   export const createSubscription = (data: Partial<Subscription>) => {
     return request<Subscription>({
       url: '/subscriptions',
       method: 'POST',
       data,
     });
   };
   ```

---

## 4. Strict Engineering Rules for AI

1. **No Prop Drilling**: Do not pass screen state through multi-level props. Use the screen's Context (`useContext(ScreenContext)`).
2. **No Data Fetching in UI Components**: UI components inside `screens/[ScreenName]/components/` or `src/components/` must remain pure visual renders. All API logic must reside inside `use[ScreenName].ts` via `utils/api_request/[domain].ts`.
3. **Global vs. Screen Context**:
   - `src/context/`: Used ONLY for cross-cutting global state (e.g., User Authentication, Active Theme, Global Settings).
   - `src/screens/[ScreenName]/context.ts`: Used for feature/screen specific state.
4. **Common Components (`src/components/`)**:
   - Must be reusable across multiple screens (e.g., `Button`, `Modal`, `Table`, `Input`).
   - Must accept explicit props (they do not connect to specific screen contexts).
5. **Types and Interfaces (`src/types/`)**:
   - Place all data entities, request payloads, and API response TypeScript interfaces inside `src/types/`.

---

## 5. Instructions for Creating a New Feature

When instructed to "Create feature X":
1. Create domain API calls in `src/utils/api_request/X.ts`.
2. Add necessary types in `src/types/X.ts`.
3. Create screen directory `src/screens/X/`.
4. Create `src/screens/X/context.ts`.
5. Create `src/screens/X/useX.ts` with all state management and API integration.
6. Create `src/screens/X/components/` with micro-components consuming `useContext(XContext)`.
7. Create `src/screens/X/X.tsx` as the context provider and view shell.
8. Register the route in `src/App.tsx`.
