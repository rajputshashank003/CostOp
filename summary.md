# CostOp: Project Summary & Architecture Blueprint

Welcome to the **CostOp** technical overview. This document provides a complete description of the system architecture, database schema, and end-to-end logical flows from the React frontend to the PostgreSQL database.

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Project Directory Structure](#2-project-directory-structure)
3. [Database Schema Design](#3-database-schema-design)
4. [End-to-End System Flows](#4-end-to-end-system-flows)
   - [Auth & Onboarding Flow](#flow-a-authentication--onboarding)
   - [Subscription Creation & Seat Allocation Flow](#flow-b-subscription-creation--seat-allocation)
   - [Subscription Request & Approval Flow](#flow-c-subscription-request--approval)
   - [Analytics & Run-Rate Generation Flow](#flow-d-analytics--historical-spend-run-rate)
   - [Proactive Multi-Offset Alerting Flow](#flow-e-proactive-multi-offset-alerting)
5. [Advanced System Design & Key Solutions](#5-advanced-system-design--key-solutions)
   - [Race Condition Prevention via SELECT FOR UPDATE](#1-pessimistic-locking-select-for-update)
   - [Access Policy vs. Assignment Materialization](#2-decoupled-access-policy-and-materialization)
   - [N+1 Query Elimination](#3-n1-query-avoidance)
   - [JSON Arrays in PostgreSQL Relational Columns](#4-custom-json-serializers)

---

## 1. System Architecture Overview

CostOp uses a decoupled Client-Server architecture designed for scalability, performance, and transactional integrity.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             REACT FRONTEND                               │
│  Vite • Tailwind CSS v4 • Framer Motion • Context API • React Router v7  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     │ HTTP (JSON API) / Bearer JWT
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                               GO BACKEND                                 │
│         Gin Framework • GORM v2 • SMTP (Resend) • Uptime Cron            │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     │ PostgreSQL Protocol (Neon DB)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           POSTGRESQL DATABASE                            │
│           Tenancy Scoping • Row Locking • Transaction Isolation           │
└──────────────────────────────────────────────────────────────────────────┘
```

*   **Frontend (client/):** A modern React application built on top of **Vite 6** and **Tailwind CSS v4**. It uses **React Router v7** for routing, **Framer Motion** for animations, and **react-hot-toast** for in-app messaging. State is handled locally via a structured **React Screen Pattern** leveraging Context API.
*   **Backend (api/):** A high-performance REST API written in **Go 1.25** using the **Gin Framework** for web routing and **GORM** for relational database access. 
*   **Database (PostgreSQL):** Hosted on **Neon DB**, structured to support multi-tenancy (isolated by `org_id`), ACID transactions, and pessimistic row locking to prevent resource race conditions.

---

## 2. Project Directory Structure

The repository is organized as a monorepo consisting of the client application, api service, and a lightweight uptime pinger.

### Backend (`api/`)
*   `cmd/server/main.go`: Application entry point. Boots the HTTP router, configures CORS, registers background cron jobs, and starts the server.
*   `internal/config/config.go`: Single source of truth for configuration. Loads environment variables once on startup.
*   `internal/database/postgres.go`: Establishes connections, configures connection pooling limits, and executes declarative `AutoMigrate` schema routines.
*   `internal/middleware/auth.go`: Intercepts API requests to validate JWT tokens, setting `userID` and `user` models in the Gin context.
*   `internal/models/`: Encapsulates the GORM database schemas, constraints, and relationships.
*   `internal/controllers/`: Core domain handlers (e.g., `subscription.go`, `team.go`, `auth.go`) wrapping HTTP requests and GORM interactions.
*   `internal/services/`: Pure business logic, email generation using **Resend**, and background workers (such as the alert cron engine).
*   `internal/cache/`: In-memory TTL cache (`AppCache`) used to avoid duplicate database queries on hot paths.

### Frontend (`client/`)
*   `src/App.tsx`: Centralized React Router configuration and protected route shells.
*   `src/context/AuthContext.tsx`: Tracks authentications, loads JWTs from local storage, and handles logging in and out.
*   `src/screens/`: Co-located modules following a strict **4-file Screen Pattern**:
    1.  `<Screen>.tsx`: Thin UI presentation entry point. Creates a context provider and renders screen layout.
    2.  `use<Screen>.tsx`: Custom hook containing all states, parameters, lifecycle hooks, and API interactions.
    3.  `context.ts`: Declares the Context container shared within the screen.
    4.  `components/`: Nested, screen-specific micro-components that call `useContext(ScreenContext)` directly (eliminating prop drilling).
*   `src/utils/api_request/`: Domain API libraries (e.g., `subscriptions.ts`) wrapping a central Axios client (`utils.ts`) that appends JWT headers and handles `401 Unauthorized` logouts.

---

## 3. Database Schema Design

The following tables define the relational database structure:

### 1. `users`
Tracks user credentials, SSO IDs, and active state.
*   `id` (uint, PK)
*   `email` (string, uniqueIndex, not null)
*   `name` (string)
*   `avatar_url` (string)
*   `google_id` (string, uniqueIndex)
*   `org_id` (uint, index) — links to the organization tenancy.
*   `default_team_id` (uint)
*   `is_onboarded` (boolean, default false)
*   `created_at`, `updated_at`, `deleted_at`

### 2. `organizations`
Roots the tenant barrier.
*   `id` (uint, PK)
*   `name` (string)
*   `created_at`, `updated_at`, `deleted_at`

### 3. `teams`
Represents working groups inside the organization.
*   `id` (uint, PK)
*   `name` (string, not null)
*   `owner_id` (uint) — user who owns the team.
*   `org_id` (uint, index)
*   `allow_member_invites` (boolean, default true)
*   `created_at`, `updated_at`, `deleted_at`

### 4. `team_members`
A junction table establishing team membership and roles.
*   `id` (uint, PK)
*   `team_id` (uint, index, not null)
*   `user_id` (uint, index, not null)
*   `role` (string, default "member") — "owner" (admin permissions) or "member".
*   `designation` (string) — functional title (e.g., "design", "frontend").
*   `created_at`, `updated_at`

### 5. `subscriptions`
Stores metadata and configurations of tracked software.
*   `id` (uint, PK)
*   `user_id` (uint, index) — user who created the record.
*   `org_id` (uint, index) — tenant identifier.
*   `owner_id` (uint, index) — person financially responsible for the bill.
*   `name` (string, not null)
*   `category` (string) — department classification (e.g., "Engineering", "Marketing").
*   `plan_type` (string) — "Individual" or "Team".
*   `billing_cycle` (string) — "Monthly", "Yearly", or "One Time".
*   `cost` (float64) — price of the plan.
*   `seat_count` (int, default 1) — total available user licenses.
*   `is_auto_pay` (boolean)
*   `start_date` (datetime)
*   `next_billing_date` (datetime)
*   `status` (string, default "active") — "active" | "archived" | "deleted".
*   `archived_by` (uint)
*   `last_alerted_at` (datetime)
*   `created_at`, `updated_at`, `deleted_at`

### 6. `subscription_teams`
Junction table declaring which teams have access to a subscription (Policy Layer).
*   `id` (uint, PK)
*   `subscription_id` (uint, uniqueIndex with team_id)
*   `team_id` (uint, uniqueIndex with subscription_id)
*   `granted_at` (datetime)
*   `granted_by` (uint)

### 7. `subscription_assignments`
Junction table tracking which users occupy a physical seat on a subscription (Materialization Layer).
*   `id` (uint, PK)
*   `subscription_id` (uint, uniqueIndex with user_id)
*   `user_id` (uint, uniqueIndex with subscription_id)
*   `source` (string) — "team" (granted via team member policy) or "individual" (assigned manually).
*   `source_team_id` (uint, nullable) — references the team grant that created this row.
*   `assigned_at` (datetime)

### 8. `alerts`
Configured triggers for notifying users before renewals.
*   `id` (uint, PK)
*   `user_id` (uint, index)
*   `org_id` (uint, index)
*   `subscription_id` (uint, index, nullable) — linked subscription, null for custom/standalone reminders.
*   `alert_type` (string) — "renewal" | "expiration" | "custom".
*   `trigger_offsets` (JSON text) — array of offsets in days, e.g. `[7, 2, 1]`.
*   `triggered_offsets` (JSON text) — array of offsets that have already fired, e.g., `[7]`.
*   `custom_date` (datetime, nullable) — specific due date for custom alerts.
*   `custom_title` (string) — title of the custom reminder.
*   `recipients` (JSON text) — array of target email addresses (up to 5).
*   `status` (string, default "active") — "active" | "triggered" | "dismissed".
*   `created_at`, `updated_at`, `deleted_at`

---

## 4. End-to-End System Flows

### Flow A: Authentication & Onboarding
1.  **Initiation:** The user clicks "Login with Google" on the client interface.
2.  **ID Token Exchange:** The client receives a Google ID Token and POSTs it to `/api/auth/google`.
3.  **Backend Verification:**
    *   The backend verifies the token using the Google Auth Library.
    *   Checks if the user exists in `users`.
    *   *If new:* Creates a new `Organization` and a default `Team`, inserts the `User`, and sets the user's `default_team_id` and `org_id`.
4.  **JWT Issuance:** The backend signs an HMAC-256 JWT containing the `userID` and returns it.
5.  **Local Storage Cache:** The client stores the JWT in `localStorage` under `LOCAL_STORAGE.TOKEN`.
6.  **Redirection:** If `is_onboarded` is false, the application intercepts the route and forces a redirect to the `/onboarding` screen. On submission of onboarding information (Name, Role, Designation), `is_onboarded` is set to true.

---

### Flow B: Subscription Creation & Seat Allocation
```
┌──────────────┐     Select Scope &     ┌──────────────────┐    Verify Seat     ┌─────────────────┐
│ AddSub Form  ├───────────────────────>│ useAddSub Hook   ├───────────────────>│ Submit Payload  │
│  (Frontend)  │       Configure        │   (Validation)   │     Availability  │   to Backend    │
└──────────────┘                        └──────────────────┘                    └────────┬────────┘
                                                                                         │
                                                                                         ▼
┌──────────────┐     Insert Policy      ┌──────────────────┐    SELECT FOR      ┌─────────────────┐
│ Materialize  │<───────────────────────┤ DB Transaction   │<───────────────────┤ acquireSeats    │
│ Assignments  │     & Lock Rows        │   (Postgres)     │     UPDATE Lock    │   (org.go)      │
└──────────────┘                        └──────────────────┘                    └─────────────────┘
```
1.  **Input Configuration:** An admin configures a subscription in the frontend form:
    *   Defines Scope ("individual", "team", "organization").
    *   Enters pricing model ("per_seat" or "site_license") and total `seat_count`.
    *   Sets Access Type: "All Members" or "Selected Members".
2.  **Client-Side Check:** If "All Members" is chosen, the hook compares the team's membership count with the `seat_count`. If members exceed seats, it throws an error toast and forces the user to switch to "Selected Members" mode.
3.  **API Submission:** The payload containing `assigned_user_ids` and `team_ids` is submitted to `/api/subscriptions`.
4.  **Backend Transaction:**
    *   Starts a database transaction `database.DB.Transaction(...)`.
    *   Saves the `Subscription` metadata.
    *   Loops through `team_ids` and inserts policy rules into `subscription_teams`.
    *   Invokes `acquireSeats(...)` to lock the subscription row and assign seats.
    *   Creates `SubscriptionAssignment` records for users who fit the seat quota. If seats run out, it returns skipped user IDs with a warning.

---

### Flow C: Subscription Request & Approval
1.  **Request Submission:** A member with no admin permissions submits a request to add a tool. This writes a record to `subscription_requests` with `status = "pending"`.
2.  **Dashboard Display:** Admins view pending items under the `/requests` route.
3.  **Approval Execution:**
    *   The admin clicks "Approve", launching the "Add Subscription" form pre-populated with the request details.
    *   On submission, the backend triggers an atomic transaction block:
        *   Inserts the new `Subscription` record.
        *   Atomically updates the original `subscription_requests` row setting `status = "approved"` and `reviewed_by = admin_id`.
        *   Runs seat assignments.

---

### Flow D: Analytics & Historical Spend Run-Rate
1.  **Dashboard Load:** The `/home` screen fetches historical runs over a specific month range (e.g., `?months=6`) from `/api/analytics/historical`.
2.  **Date Window Interpolation:**
    *   The backend normalizes the start and end dates to month boundaries.
    *   Fetches all active and archived subscriptions for the user's organization.
3.  **Active Window Algorithm:**
    *   Iterates chronologically month-by-month.
    *   For each subscription, calculates if it was active during that month:
        *   *Skip* if the monthly query window is before the subscription's `StartDate`.
        *   *Skip* if the subscription is "archived" and its `UpdatedAt` is before the monthly query window.
    *   Accumulates costs: If billing cycle is "Yearly", cost is applied only in its start anniversary month. If "Monthly", the run-rate is added to every month.
4.  **Aggregated Result:** Returns a JSON list containing `Month` and `Spend` pairs used by the client charts.

---

### Flow E: Proactive Multi-Offset Alerting
1.  **Trigger Event:** A background cron job runs daily at midnight (`services/cron.go`).
2.  **Alert Discovery:** Queries all alerts in `alerts` where `status = "active"`.
3.  **Offset Processing Loop:**
    For each alert:
    *   If `alert_type = "custom"`, checks if today's date matches `custom_date`. If so, fires a notification.
    *   If `alert_type = "renewal"` or `"expiration"`:
        *   Fetches the next billing date of the associated subscription.
        *   Computes target dates based on `trigger_offsets` (e.g., `next_billing_date - 7 days`).
        *   If the target date is today, and the offset is not present in `triggered_offsets`:
            1.  Calls `SendAlertEmail` via **Resend** to send emails to the alert's `recipients`.
            2.  Writes a new in-app `notification` row.
            3.  Appends the offset to `triggered_offsets` in the DB to prevent duplicate alerts.

---

## 5. Advanced System Design & Key Solutions

### 1. Pessimistic Locking (`SELECT FOR UPDATE`)
To guarantee that seats cannot be over-allocated during concurrent requests, the system implements row locking:
```go
// Lock the subscription row — concurrent callers block here
var sub models.Subscription
if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&sub, subID).Error; err != nil {
    return nil, nil, err
}
```
While the transaction holds this lock, any concurrent attempts to count assignments or create new seat allocations for this specific subscription ID will block, guaranteeing transaction isolation.

### 2. Decoupled Access Policy and Materialization
The system separates the access policy (who is *allowed* to use a tool) from the materialization (who *currently* occupies a seat):
*   **Policy:** Stored in `subscription_teams` (M:N).
*   **Materialization:** Stored in `subscription_assignments`.
*   **Revocation Cascading:** If a team is removed, the system drops only the materialized assignments linked to that team (`source_team_id`), preserving individual seat assignments for users who hold separate individual rights.

### 3. N+1 Query Avoidance
To keep database performance constant ($O(1)$ query count), the backend implements in-memory batch mapping:
```go
// 1. Collect all unique user IDs from the subscription list
userIDs := collectUniqueIDs(subs)

// 2. Fetch all users in a single bulk query
database.DB.Where("id IN ?", userIDs).Find(&users)

// 3. Perform a single grouped database count query for assignments
database.DB.Model(&Assignment{}).
    Select("subscription_id, count(*) as count").
    Where("subscription_id IN ?", subIDs).
    Group("subscription_id").Find(&counts)
```
This maps relational details onto GORM's virtual structs in $O(N)$ CPU time rather than executing slow nested SQL queries inside loops.

### 4. Custom JSON Serializers
Since Postgres does not natively support array slices as flat text fields without complex dialect extensions, Go custom types were defined to marshal and unmarshal arrays as raw JSON strings on Postgres:
```go
type IntArray []int

func (s IntArray) Value() (driver.Value, error) {
    b, err := json.Marshal(s)
    return string(b), err
}

func (s *IntArray) Scan(value interface{}) error {
    bytes := value.([]byte)
    return json.Unmarshal(bytes, s)
}
```
This allows the backend to store complex tracking structures (like offset limits `[7, 2, 1]`) in single columns while maintaining standard database migrations.
