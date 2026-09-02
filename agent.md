# CostOp — Agent Coding Rules

This file defines the **non-negotiable code conventions** for the CostOp project. Every change to the codebase — frontend or backend — must conform to these rules. If you are an AI agent, read this file completely before writing a single line of code.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Backend Rules (Go / Gin / GORM)](#backend-rules)
4. [Frontend Rules (React / TypeScript / Tailwind)](#frontend-rules)
5. [API Contract Rules](#api-contract-rules)
6. [Database Rules](#database-rules)
7. [Authentication & Security Rules](#authentication--security-rules)
8. [Shared / Cross-Cutting Rules](#shared--cross-cutting-rules)

---

## Project Overview

**CostOp** is a SaaS spend-tracking and optimization platform. Companies use it to manage software subscriptions, seat assignments, team access, and billing alerts.

- **Backend** → `api/` — Go 1.25, Gin, GORM, PostgreSQL
- **Frontend** → `client/` — React 18, TypeScript 5, Vite 6, Tailwind CSS v4
- **Health API** → `health_api/` — Lightweight Go uptime pinger (separate module)

---

## Repository Structure

```
CostOp/
├── api/                          # Backend Go service
│   ├── cmd/server/main.go        # Entrypoint — DO NOT add business logic here
│   ├── internal/
│   │   ├── cache/                # In-memory TTL cache (AppCache)
│   │   ├── config/config.go      # All env-var loading (single source of truth)
│   │   ├── controllers/          # One file per domain (auth, subscription, team …)
│   │   ├── database/postgres.go  # DB singleton + AutoMigrate
│   │   ├── middleware/auth.go    # JWT auth middleware
│   │   ├── models/               # One file per GORM model
│   │   ├── routes/routes.go      # All route registrations
│   │   └── services/             # Background jobs, email, crons
│   └── go.mod                    # module name: `costop`
│
└── client/                       # Frontend React app
    └── src/
        ├── App.tsx               # Route declarations only
        ├── main.tsx              # Provider tree only
        ├── context/AuthContext.tsx
        ├── hooks/useUser.ts
        ├── screens/              # Feature screens (PascalCase folders)
        │   └── <Screen>/
        │       ├── <Screen>.tsx  # Thin shell: wraps hook in Context.Provider
        │       ├── use<Screen>.tsx # All state + data-fetching logic
        │       ├── context.ts    # createContext for this screen
        │       └── components/   # Sub-components for this screen only
        ├── components/           # Shared, reusable UI components
        ├── services/             # Non-request utility services (e.g. logoService)
        ├── utils/
        │   ├── api_request/      # One file per domain (subscriptions, teams …)
        │   │   └── utils.ts      # Central Axios wrapper — NEVER use raw axios elsewhere
        │   ├── constants.ts      # Named constants only (no magic strings/numbers)
        │   └── helpers.tsx       # Pure utility functions / JSX helpers
        └── types/index.ts        # Shared TypeScript types
```

---

## Backend Rules

### 1. Package Naming
- All packages use **lowercase, no underscores**: `controllers`, `models`, `services`, `database`, `middleware`, `config`, `cache`.
- The Go module name is `costop` (see `go.mod`). All internal imports use `costop/internal/...`.

### 2. Controller Conventions
- **One file per domain** in `internal/controllers/`. File name = domain noun (e.g., `subscription.go`, `team.go`).
- Every exported controller function **must** match the signature `func FuncName(c *gin.Context)`.
- Extract the caller's identity at the **very top** of every handler:
  ```go
  userID := c.MustGet("userID").(uint)
  ```
- **Always use early returns** on error; never nest happy-path logic in `if err == nil` blocks.
- **Do NOT** return raw DB errors to the client. Map them to safe HTTP responses:
  ```go
  c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
  return
  ```
- JSON error keys **must** always be lowercase `"error"`:
  ```go
  gin.H{"error": "Something went wrong"}
  ```
- Use `gin.H{}` for ad-hoc JSON responses. Use typed structs for structured, reusable response shapes.
- When inline request structs are needed, declare them inside the handler:
  ```go
  var input struct {
      UserID uint `json:"user_id" binding:"required"`
  }
  if err := c.ShouldBindJSON(&input); err != nil { ... }
  ```
- **Status codes to use**:
  - `200 OK` — successful GET / PATCH with a payload
  - `201 Created` — successful POST that creates a resource
  - `400 Bad Request` — malformed request / validation failure
  - `401 Unauthorized` — unauthenticated
  - `403 Forbidden` — authenticated but not permitted
  - `404 Not Found` — resource doesn't exist or access is denied
  - `409 Conflict` — duplicate, seat overflow, or state conflict
  - `500 Internal Server Error` — unexpected DB/service failure

### 3. Route Conventions
- All routes live in `internal/routes/routes.go`. **No routes anywhere else**.
- All routes are prefixed with `/api`.
- Group routes by domain and apply middleware at the group level:
  ```go
  subscriptions := api.Group("/subscriptions")
  subscriptions.Use(middleware.RequireAuth())
  {
      subscriptions.GET("", controllers.GetSubscriptions)
      ...
  }
  ```
- Use **section comments** to separate domains (copy the existing `// ── Teams ──` style with box-drawing characters).
- Include inline comments on each route showing its HTTP verb + path:
  ```go
  alerts.DELETE("/:id", controllers.DeleteAlert) // DELETE /api/alerts/:id
  ```
- Route paths use **kebab-case** for multi-word segments: `/unused-seats`, `/department-spends`, `/read-all`.
- Sub-resources use nested paths: `/subscriptions/:id/assign/:uid`.

### 4. Model Conventions
- **One file per model** in `internal/models/`.
- Every model embeds standard timestamp fields:
  ```go
  CreatedAt time.Time      `json:"created_at"`
  UpdatedAt time.Time      `json:"updated_at"`
  DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
  ```
- `DeletedAt` is always `json:"-"` (never exposed to the API).
- Use GORM struct tags to set constraints, never raw SQL migrations:
  ```go
  Name string `gorm:"not null" json:"name"`
  ```
- **Virtual fields** (computed at query time, not stored in DB) are tagged `gorm:"-"`:
  ```go
  AssignedCount  int `gorm:"-" json:"assigned_count"`
  AvailableSeats int `gorm:"-" json:"available_seats"`
  ```
- Deprecated fields must be documented with a comment AND a GORM tag note:
  ```go
  TeamID *uint `gorm:"index" json:"team_id"` // DEPRECATED: use subscription_teams
  ```
- Model-level doc comments explain the business rules encoded in the struct:
  ```go
  // Subscription represents a SaaS tool tracked on the platform.
  // SeatCount: total purchased seats; enforced via subscription_assignments count.
  ```
- **Soft-delete** is the default. Hard deletes must be explicitly justified.

### 5. Database Query Rules
- **Never N+1 queries.** Fetch related data in bulk, then join in memory.
- Use helper functions to batch-enrich slices (see `enrichSubscriptions`):
  ```go
  func enrichSubscriptions(subs []models.Subscription) []models.Subscription { ... }
  ```
- Collect IDs → bulk-fetch records → build a map → iterate once:
  ```go
  // Collect unique user IDs
  userIDs := make(map[uint]bool)
  // Bulk fetch
  database.DB.Where("id IN ?", uniqueUserIDs).Find(&users)
  // Build map
  userMap := make(map[uint]string)
  // Populate virtual fields
  for i, sub := range subs { subs[i].AddedByName = userMap[sub.UserID] }
  ```
- Use `database.DB.Transaction(func(tx *gorm.DB) error { ... })` for any multi-step write that must be atomic.
- Inside transactions, use the `tx` variable — **never** `database.DB`.
- Use `UpdateColumns(map[string]interface{}{...})` (not `Save`) for partial field updates to avoid overwriting zero values.
- Use `ILIKE` for case-insensitive text search in PostgreSQL:
  ```go
  query = query.Where("name ILIKE ?", "%"+search+"%")
  ```
- Build queries incrementally using chained `.Where()` calls; never concatenate raw SQL strings.

### 6. Configuration
- All environment variables are loaded **once** in `config.Load()` at startup.
- Variables are exported as `config.<VarName>` (e.g., `config.JWTSecret`, `config.ResendAPIKey`).
- `getEnvOrDefault(key, fallback)` is the only way to read env vars with defaults.
- Never call `os.Getenv()` directly outside of `config/config.go`.

### 7. Services
- Services are pure Go functions in `internal/services/`. They have **no knowledge of HTTP** (`gin.Context` must never appear in a service).
- Email functions follow the pattern `Send<Purpose>Email(...)` and return `error`.
- Non-critical side effects (e.g., welcome emails on signup) are launched as goroutines from the controller:
  ```go
  go func(u models.User, at string) {
      _ = services.SendWelcomeEmail(u.Email, u.Name, u.AvatarURL)
  }(user, accountType)
  ```
- Always validate `config.ResendAPIKey != ""` before constructing a Resend client.

### 8. Caching
- Use `cache.AppCache` (the in-memory TTL cache) for hot read paths.
- Pattern: check cache → miss → fetch DB → write cache:
  ```go
  cacheKey := fmt.Sprintf("user_%d", userID)
  if cached, ok := cache.AppCache.Get(cacheKey); ok {
      user = cached.(models.User)
  } else {
      database.DB.First(&user, userID)
      cache.AppCache.Set(cacheKey, user, 5*time.Minute)
  }
  ```
- Cache keys must be namespaced with their entity type to avoid collisions.

### 9. Error Sentinel Values
- Define domain sentinel errors at the top of the file that uses them:
  ```go
  var ErrNoSeats = errors.New("no seats available")
  ```
- Use `errors.Is()` for sentinel checks, never string comparison.

### 10. Logging
- Use `fmt.Printf` or `log.Printf` for server-side logging.
- Debug lines in production code **must** be prefixed: `[DEBUG]`.
- Never log user passwords, raw tokens, or PII.

---

## Frontend Rules

### 1. Screen Architecture Pattern
Every screen **must** follow this 4-file pattern:

| File | Purpose |
|---|---|
| `<Screen>.tsx` | Thin shell: creates the context provider, renders `<ScreenComp />` |
| `use<Screen>.tsx` | ALL state, effects, API calls, and derived data |
| `context.ts` | `React.createContext<any>(null)` — typed loosely, strongly by the hook return type |
| `components/` | Sub-components that consume the screen's context |

Example from `Home`:
```tsx
// Home.tsx — the exported page component
const Home = () => {
    const value = useHome();
    return (
        <HomeContext.Provider value={value}>
            <HomeComp />
        </HomeContext.Provider>
    );
};
export default Home;

// HomeComp reads everything from context, no props
const HomeComp = () => {
    const { metrics, subscriptions } = useContext(HomeContext);
    ...
};
```

**Rule:** Sub-components under a screen must **never** accept data as props that is already in the screen context. They must use `useContext(HomeContext)` directly.

### 2. Component Architecture
- Each reusable component lives in its own **PascalCase folder** under `src/components/`:
  ```
  components/
  ├── SubscriptionCard/
  │   └── SubscriptionCard.tsx
  ├── Sidebar/
  │   └── Sidebar.tsx
  ```
- Export components as **default exports**.
- Components must be `function` declarations (not arrow function constants at module level).

### 3. Imports
- Use **named imports from lodash** (not the barrel import):
  ```ts
  import map from "lodash/map";
  import debounce from "lodash/debounce";
  import reduce from "lodash/reduce";
  ```
  Never: `import _ from "lodash"` or `import { map } from "lodash"`.
- Icons come from `lucide-react` only. Pass `size` as a number prop.
- Animations use `framer-motion`. Modal unmount animations must be wrapped in `<AnimatePresence>`.

### 4. State Management
- Global auth state lives in `AuthContext` (`src/context/AuthContext.tsx`). Access it via the `useUser()` hook.
- Screen-level state lives in the `use<Screen>` hook, shared via a screen-level context.
- Never use `useState` inside a sub-component for state that belongs to the screen. Lift it into `use<Screen>`.
- Derive computed values **inside** the hook and expose them from the return value:
  ```ts
  const filteredSubscriptions = showMine
      ? subscriptions.filter(s => s.owner_id === user?.id)
      : subscriptions;
  return { subscriptions: filteredSubscriptions, ... };
  ```

### 5. API Request Layer
- All HTTP calls go through `utils/api_request/utils.ts`'s `utils.request()`. **Never** use raw `axios` directly in hooks or components.
- One API file per domain in `utils/api_request/` (e.g., `subscriptions.ts`, `teams.ts`).
- Export as a plain object literal:
  ```ts
  export const subscriptionsApi = {
      get_all: (params?) => utils.request({ url: `/subscriptions?...`, method: METHODS.GET }),
      create: (payload) => utils.request({ url: `/subscriptions`, method: METHODS.POST, data: payload }),
  };
  ```
- `response_array: true` must be set when the endpoint returns a bare JSON array.
- `show_error: false` must be set for calls where the caller handles errors silently.
- The central `utils.request()` handles:
  - Auto-attaching `Authorization: Bearer <token>` from localStorage.
  - Unified 401 → redirect to `/login`.
  - Global `toast.error()` on failures (unless `show_error: false`).

### 6. Constants
- No magic strings or magic numbers. All constants live in `utils/constants.ts`.
- localStorage keys use the `LOCAL_STORAGE` object:
  ```ts
  localStorage.getItem(LOCAL_STORAGE.TOKEN)
  ```
- HTTP method strings use the `METHODS` object:
  ```ts
  method: METHODS.GET
  ```

### 7. Styling — Tailwind CSS v4
- **Tailwind CSS v4** is used (`@import "tailwindcss"` in `index.css`).
- Use **Tailwind utility classes directly in JSX** — no separate CSS files per component.
- CSS custom properties (design tokens) are defined globally and referenced via Tailwind's `@theme`:
  ```css
  @theme {
    --color-primary: var(--accent-indigo);
  }
  ```
- Use CSS variables for design tokens: `bg-[var(--surface-1)]`, not hardcoded hex.
- The global background is `bg-[#f0f0f5]` (light gray page background). All authenticated pages use this.
- Primary brand color is `emerald-600` / `emerald-500`. Accents are `indigo`.
- All modals/overlays use `framer-motion` for enter/exit animations.
- **No inline `style={}` props** unless you are passing a dynamic value that Tailwind cannot handle.

### 8. Routing
- All routes are declared in `App.tsx`. **No `<Route>` anywhere else.**
- All screens are **lazy-loaded** with `React.lazy` + `<Suspense>`:
  ```tsx
  const Home = lazy(() => import("./screens/Home/Home"));
  ```
- Protected routes use the `<ProtectedRoute>` wrapper defined in `App.tsx`.
- The loading fallback is a centered emerald spinner on the `#f0f0f5` background.
- Non-onboarded users are redirected to `/onboarding` by `<ProtectedRoute>`.

### 9. Debounce
- Search inputs must be debounced at **400ms** using lodash `debounce`.
- The debounce must be cancelled on cleanup:
  ```ts
  useEffect(() => {
      debouncedSetSearch(localSearch);
      return () => debouncedSetSearch.cancel();
  }, [localSearch, debouncedSetSearch]);
  ```

### 10. URL Sync for Filters
- Screens with filters (search, category, date) must mirror their state into URL query params via `window.history.replaceState`.
- Filters must be read from URL params on mount (`new URLSearchParams(window.location.search)`).
- This allows sharing/bookmarking filtered views.

### 11. Toasts
- Use `react-hot-toast` (`toast.success(...)`, `toast.error(...)`).
- The `<Toaster>` instance lives in `App.tsx` at `position="bottom-right"`.
- Toast styles must use the CSS custom property tokens (already configured in `App.tsx`).
- **Do not** add a second `<Toaster>` anywhere.

### 12. TypeScript Rules
- `strict: true` is enabled in `tsconfig.json`. Do not weaken it.
- Shared types go in `src/types/index.ts`.
- The `User` type is defined in `AuthContext.tsx`; reuse it, don't redeclare.
- Use `any` only in hook-level state where the type is genuinely dynamic (e.g., `useState<any[]>([])`). Narrow types for all component props and function arguments.
- `import.meta.env.VITE_*` for all environment variables on the frontend.

### 13. Logo / Avatar
- Subscription logos are fetched via `getLogoUrl(name)` from `src/services/logoService.ts`.
- This function maps a subscription name to a Clearbit-style favicon URL via the `COMPANY_DOMAINS` map.
- To add a new company, append it to the map in `logoService.ts`. Do not fetch logos anywhere else.

---

## API Contract Rules

1. **All API routes** are prefixed `/api`.
2. **Auth header**: `Authorization: Bearer <jwt_token>` (set automatically by `utils.request()`).
3. **Error shape** is always `{ "error": "Human readable message" }`.
4. **Success shape** for collections is a bare JSON array. For single objects, the resource itself or `gin.H{ "field": value }`.
5. **Pagination**: Not currently used. Return full result sets (filtered server-side).
6. **Soft deletes**: Resources are never truly deleted. Status fields (`"active"`, `"archived"`, `"deleted"`) mark the lifecycle.
7. **Date fields**: Always `RFC3339` / ISO 8601. On the frontend, parse with `new Date(str)`.
8. **Seat management** endpoints are nested under the subscription: `/subscriptions/:id/assign`, `/subscriptions/:id/teams`.

---

## Database Rules

1. **ORM only**: Use GORM for all queries. No raw `database/sql` unless GORM cannot express the query.
2. **AutoMigrate** in `database/postgres.go` handles schema. New models must be added to the `AutoMigrate(...)` call.
3. **Soft delete by default**: Use `gorm.DeletedAt` on all models. Hard deletes must be approved.
4. **Avoid N+1**: See the "enrichSubscriptions" pattern — bulk fetch and map in memory.
5. **Connection pooling**: Already configured (`MaxIdleConns: 20`, `MaxOpenConns: 100`). Do not change without benchmarking.
6. **Indexes**: Add GORM `gorm:"index"` tags on foreign keys and frequently filtered columns. Document any performance indexes added via raw SQL in comments.
7. **Transactions**: Use `database.DB.Transaction(...)` for multi-step writes. All writes inside must use the `tx` variable.
8. **Bulk inserts**: Use `tx.Create(&slice)` for inserting multiple rows in one statement.
9. **Count queries**: Use `database.DB.Model(&Model{}).Where(...).Count(&n)` — never load records just to get a count.

---

## Authentication & Security Rules

### Backend
- `middleware.RequireAuth()` is **applied at the group level** in `routes.go`, not per-handler.
- The middleware validates the JWT, extracts `user_id` (float64), casts to `uint`, and sets `c.Set("userID", uint(userID))` and `c.Set("user", user)`.
- JWTs expire in **72 hours**. Algorithm: `HS256`.
- Role checks are done in-handler by querying `team_members.role`. The two roles are `"owner"` and `"member"`. Owners have admin privileges.
- Google OAuth token verification uses `google.golang.org/api/idtoken`. Never trust client-supplied user identity data directly.
- Org-scoping: Every multi-tenant query must include an `org_id = ?` filter to prevent cross-organization data leaks.

### Frontend
- The JWT token is stored in `localStorage` under key `LOCAL_STORAGE.TOKEN`.
- The user object is stored under `LOCAL_STORAGE.USER`.
- On 401 from any API call, the central `utils.request()` automatically clears storage and redirects to `/login`.
- Never store sensitive data beyond token + user object in localStorage.
- `AuthContext` hydrates from localStorage on mount (`useEffect([], [])`) before any protected route is rendered.

---

## Shared / Cross-Cutting Rules

### Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Go files | `snake_case.go` | `subscription_assignment.go` |
| Go packages | `lowercase` | `controllers`, `models` |
| Go exported identifiers | `PascalCase` | `GetSubscriptions`, `Subscription` |
| Go unexported identifiers | `camelCase` | `enrichSubscriptions`, `orgSubscriptionQuery` |
| React component files | `PascalCase.tsx` | `SubscriptionCard.tsx` |
| React hook files | `use<Name>.ts(x)` | `useHome.tsx`, `useUser.ts` |
| Screen folders | `PascalCase` | `AddSubscription/`, `SubscriptionDetail/` |
| Component folders | `PascalCase` | `ArchiveConfirmationModal/` |
| API request files | `camelCase.ts` | `subscriptions.ts`, `teams.ts` |
| API object methods | `snake_case` | `subscriptionsApi.get_all()` |
| CSS class | Tailwind utility | (no custom class names except `animate-shimmer`) |

### Comments
- Every exported Go function that is non-trivial **must** have a doc comment.
- Inline comments explain *why*, not *what*.
- Mark deprecated fields/behavior explicitly: `// DEPRECATED: ...`
- Mark non-obvious SQL rationale: `// Optimised: Use Distinct to prevent double-counting`

### Environment Variables

| Variable | Used In | Description |
|---|---|---|
| `POSTGRES_DSN` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | HMAC secret for JWT signing |
| `GOOGLE_CLIENT_ID` | Backend + Frontend | Google OAuth client ID |
| `RESEND_API_KEY` | Backend | Resend email API key |
| `GEMINI_API_KEY` | Backend | Google Gemini AI key |
| `VITE_FRONTEND_URL` | Backend | Frontend origin (for email links) |
| `PORT` | Backend | HTTP listen port (default `8081`) |
| `VITE_API_URL` | Frontend | Backend base URL (default `http://localhost:8081/api`) |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Google OAuth client ID |
| `RUN_UPTIME_CRON` | Backend | `"true"` to enable the health-ping cron |

### Git / File Hygiene
- `.DS_Store` and build artifacts are gitignored.
- Never commit `.env` files.
- `node_modules/` and `go.sum` are never edited manually.

### What NOT To Do (Anti-Patterns)
- ❌ Do not call `database.DB` inside a `Transaction` callback — use `tx`.
- ❌ Do not add routes anywhere except `routes/routes.go`.
- ❌ Do not use raw `axios` in components or hooks — always use `utils.request()`.
- ❌ Do not add `<Route>` declarations outside `App.tsx`.
- ❌ Do not put business logic in `main.go`.
- ❌ Do not fetch user identity from the request body — always from the JWT via `c.MustGet("userID")`.
- ❌ Do not return DB-level error messages to the HTTP client.
- ❌ Do not use `import _ from "lodash"` — use per-function imports.
- ❌ Do not use `Save()` for partial GORM updates — use `UpdateColumns()` or `Updates(map)`.
- ❌ Do not add a second `<Toaster>` — there is exactly one, in `App.tsx`.
- ❌ Do not hardcode colors in JSX — use Tailwind classes or CSS custom properties.
- ❌ Do not create new context files in `src/context/` — screen-level context goes co-located in the screen folder.
