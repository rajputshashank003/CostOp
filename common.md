# CostOp Project Blueprint (common.md)

This document is a comprehensive architectural blueprint. Provide this file to an AI agent to recreate the exact technology stack, folder structure, and design patterns used in CostOp from scratch.

---

## 1. Project Overview & Tech Stack

**CostOp** is a SaaS spend-tracking and optimization platform consisting of a Go backend and a React frontend.

**Backend Stack:**
- **Language:** Go 1.25
- **Framework:** Gin (`github.com/gin-gonic/gin`)
- **ORM:** GORM (`gorm.io/gorm` with `gorm.io/driver/postgres`)
- **Database:** PostgreSQL
- **Auth:** JWT (`github.com/golang-jwt/jwt/v5`) & Google OAuth (`google.golang.org/api/idtoken`)
- **Email:** Resend (`github.com/resend/resend-go/v2`)
- **AI:** Google Gemini

**Frontend Stack:**
- **Language:** TypeScript 5
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@tailwindcss/postcss`)
- **Routing:** React Router v7 (`react-router-dom`)
- **Icons:** Lucide React (`lucide-react`)
- **Animation:** Framer Motion (`framer-motion`)

---

## 2. Step-by-Step Initialization

### Phase 1: Initialize the Monorepo
Create a root directory and initialize the two main workspaces:
```bash
mkdir costop && cd costop
mkdir api client health_api
```

### Phase 2: Backend Setup (`api/`)
1. Initialize Go module:
   ```bash
   cd api
   go mod init costop
   ```
2. Install Core Dependencies:
   ```bash
   go get github.com/gin-gonic/gin
   go get gorm.io/gorm
   go get gorm.io/driver/postgres
   go get github.com/joho/godotenv
   go get github.com/golang-jwt/jwt/v5
   go get github.com/gin-contrib/cors
   go get google.golang.org/api/idtoken
   go get github.com/resend/resend-go/v2
   ```

### Phase 3: Frontend Setup (`client/`)
1. Scaffold Vite Project:
   ```bash
   cd ../client
   npx -y create-vite@latest . --template react-ts
   npm install
   ```
2. Install Core Dependencies:
   ```bash
   npm install react-router-dom react-hot-toast lucide-react framer-motion axios lodash @react-oauth/google @vercel/analytics
   npm install -D tailwindcss @tailwindcss/vite @tailwindcss/postcss autoprefixer @types/lodash
   ```

---

## 3. Directory Structure Specification

The agent must create the exact directory tree below.

### Backend Structure (`api/`)
```text
api/
├── cmd/
│   └── server/
│       └── main.go               # Gin router setup, CORS config, Start Cron, Run Server
├── internal/
│   ├── cache/                    # AppCache (in-memory TTL cache)
│   ├── config/
│   │   └── config.go             # godotenv loader, env var struct mappings
│   ├── controllers/              # Domain-specific HTTP handlers (auth.go, user.go, etc.)
│   ├── database/
│   │   └── postgres.go           # GORM Connect(), Connection pool config, AutoMigrate
│   ├── middleware/
│   │   └── auth.go               # JWT verification & c.Set("userID")
│   ├── models/                   # GORM structs (user.go, organization.go, etc.)
│   ├── routes/
│   │   └── routes.go             # API route groupings and middleware application
│   └── services/                 # Business logic, emails, background crons
├── Dockerfile                    # Multi-stage Alpine Go builder
├── .env                          # Local secrets
├── go.mod
└── go.sum
```

### Frontend Structure (`client/`)
```text
client/
├── src/
│   ├── App.tsx                   # Central router & <Suspense> boundary
│   ├── main.tsx                  # <GoogleOAuthProvider> & <AuthProvider> wrapping App
│   ├── index.css                 # Tailwind v4 import & custom @theme properties
│   ├── context/
│   │   └── AuthContext.tsx       # Global user state, login/logout functions
│   ├── hooks/
│   │   └── useUser.ts            # Convenience wrapper for AuthContext
│   ├── components/               # Shared UI elements (PascalCase folders)
│   ├── screens/                  # View pages (PascalCase folders)
│   │   └── Home/                 # **MANDATORY 4-FILE SCREEN PATTERN**
│   │       ├── Home.tsx          # Exported component + Context Provider wrapper
│   │       ├── useHome.tsx       # Hook containing all state & API calls
│   │       ├── context.ts        # React.createContext
│   │       └── components/       # Screen-specific nested components
│   ├── services/                 # Utility logic (e.g., logoService.ts)
│   ├── utils/
│   │   ├── api_request/          # Axios wrappers
│   │   │   ├── utils.ts          # Core axios instance (handles 401s, tokens, toast errors)
│   │   │   └── auth.ts           # Domain specific API calls
│   │   ├── constants.ts          # LOCAL_STORAGE keys, HTTP Methods
│   │   └── helpers.tsx           # Pure functions
│   └── types/                    # Shared interfaces
├── package.json
├── tsconfig.json
├── vite.config.ts                # Vite config + Tailwind plugin + API Proxy
└── vercel.json                   # SPA rewrite rules
```

---

## 4. Architectural Patterns to Implement

Instruct the agent to rigorously follow these specific patterns when writing code:

### The React Screen Pattern (Frontend)
Every screen MUST have its logic decoupled from its UI using a screen-scoped context.
1. `useHome.tsx` manages `useState`, `useEffect`, and fetches data. Returns an object `{ data, actions }`.
2. `Home.tsx` calls `useHome()`, passes the result into `<HomeContext.Provider value={value}>`, and renders `<HomeComp />`.
3. `<HomeComp />` and any child components inside `components/` use `useContext(HomeContext)` to get data. No prop drilling.

### The Central API Wrapper (Frontend)
Never use `axios.get()` directly in components. Create `utils/api_request/utils.ts` exposing a `request()` function that:
1. Reads the JWT from `localStorage` and attaches it as `Bearer <token>`.
2. Uses `toast.error()` globally on failed requests.
3. On a `401 Unauthorized` response, clears localStorage and redirects to `/login`.

### Go Controller Pattern (Backend)
1. Read the user ID: `userID := c.MustGet("userID").(uint)`
2. Bind JSON to a struct (inline or defined).
3. Early returns on error: `c.JSON(http.StatusBadRequest, gin.H{"error": "message"}); return`
4. Use typed HTTP status codes (`http.StatusOK`, `http.StatusCreated`, `http.StatusConflict`).

### Go Database Pattern (Backend)
1. **Never N+1**: If loading a list of items that belong to users, collect all unique user IDs, bulk fetch the users with `WHERE id IN ?`, build a Go map of `map[userID]User`, and attach them in memory.
2. Use `database.DB.Transaction` for any multi-table insert/update.
3. Default to Soft Deletes by embedding `gorm.DeletedAt`.

---

## 5. Required Environment Variables

### Backend (`api/.env`)
```env
PORT=8081
POSTGRES_DSN="host=localhost user=postgres password=postgres dbname=costop port=5432 sslmode=disable"
JWT_SECRET="your_jwt_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
RESEND_API_KEY="re_..."
VITE_FRONTEND_URL="http://localhost:5173"
RUN_UPTIME_CRON="false"
```

### Frontend (`client/.env`)
```env
VITE_API_URL="http://localhost:8081/api"
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
```

---

## 6. Deployment Configurations

### Backend: `api/Dockerfile`
Must use a multi-stage Alpine build.
```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8081
CMD ["./server"]
```

### Frontend: `client/vercel.json`
Must include SPA fallback rewrites.
```json
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
    ]
}
```

---
**Agent Instruction:** Use the definitions in this document to establish the repository architecture before beginning feature development. Strict adherence to the directory structure and the decoupled React Screen pattern is required.
