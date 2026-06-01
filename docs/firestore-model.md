# Firestore Data Model Guide

This document describes the Cloud Firestore collection structures, document schemas, subcollection scopes, and index strategies in **FireSaaS**.

---

## 1. Directory of Collections

```txt
users/{userId}                    (Public profile details)
privateUsers/{userId}              (Private metadata claims)

organizations/{organizationId}    (Tenant-level workspace details)
    ├── members/{userId}          (Workspace team membership & roles)
    ├── files/{fileId}            (Workspace uploaded file metadata)
    ├── aiUsage/{usageId}          (Genkit execution records)
    └── auditLogs/{logId}         (Workspace audit trails)
```

---

## 2. Document Schemas

### Users Profile (`users/{userId}`)

App-facing user profile visible to other members.

```ts
interface UserProfile {
  id: string; // Firebase Auth UID
  email: string; // User email address
  displayName: string | null;
  photoURL: string | null;
  defaultOrganizationId?: string; // Active org shortcut
  timezone?: string; // User timezone (e.g. Asia/Kolkata)
  locale?: string; // Preferred language (e.g. en)
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Private Users Metadata (`privateUsers/{userId}`)

Restricted user metrics, visible _only_ to the user themselves and the Admin SDK.

```ts
interface PrivateUserMetadata {
  id: string; // Firebase Auth UID
  email: string;
  role: "user" | "admin"; // Global system role
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Organizations (`organizations/{organizationId}`)

Tenant workspace records containing membership quotas.

```ts
interface Organization {
  id: string; // Organization UID
  name: string; // Workspace display name
  slug: string; // URL slug identifier (lowercase and dashes)
  ownerId: string; // Workspace owner UID
  plan: "free" | "pro" | "business"; // Stripe subscription level
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Workspace Members (`organizations/{orgId}/members/{userId}`)

Determines access rights to organization files, logs, and billing.

```ts
interface Member {
  userId: string; // User Auth UID
  email: string; // User email address
  role: "owner" | "admin" | "member" | "viewer"; // Role level
  joinedAt: Timestamp;
}
```

### Workspace Files (`organizations/{orgId}/files/{fileId}`)

Metadata describing assets stored in Firebase Storage.

```ts
interface FileMetadata {
  id: string; // File doc UID
  organizationId: string;
  ownerId: string; // Uploader UID
  name: string; // Original file name (e.g. report.pdf)
  path: string; // Physical storage path
  contentType: string; // Mime-type
  size: number; // Size in bytes
  status: "uploaded" | "processing" | "ready" | "failed";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### AI Usage Logs (`organizations/{orgId}/aiUsage/{usageId}`)

Appends telemetry metrics describing Genkit flow invocations.

```ts
interface AiUsageLog {
  id: string;
  organizationId: string;
  userId: string; // Operator UID
  flowName: "summarize" | "generateJson" | "chat";
  model: string; // Model name used (e.g. gemini-2.5-flash)
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number; // Cost in USD
  status: "success" | "error";
  errorMessage?: string;
  createdAt: Timestamp;
}
```

### Audit Logs (`organizations/{orgId}/auditLogs/{logId}`)

Multi-tenant security compliance trail tracking operations.

```ts
interface AuditLog {
  id: string;
  organizationId: string;
  actorId: string; // Creator UID
  action: string; // Operation (e.g. file_uploaded, role_changed)
  targetType: string; // target collection type
  targetId?: string; // Target document UID
  metadata?: Record<string, any>;
  createdAt: Timestamp;
}
```

---

## 3. Composite Indexes Strategy

When performing compound queries containing filtering and sorting (like listing a workspace's audit logs or AI usage details sorted by creation date), Firestore requires composite indexes.

We pre-configure these composite indexes inside `firestore.indexes.json`:

- **Audit Logs sorted search**: `organizationId` ASCENDING + `createdAt` DESCENDING.
- **AI Usage logs sorted search**: `organizationId` ASCENDING + `createdAt` DESCENDING.

### Deploying Indexes

Deploy index settings to Firebase using:

```bash
npx -y firebase-tools@latest deploy --only firestore:indexes
```
