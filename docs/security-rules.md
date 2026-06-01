# Security Rules Guide

This document describes the security policies enforced in **FireSaaS** at the database, storage, and server layers.

---

## 1. Multi-Tenant Isolation in Firestore

We enforce strict data boundaries using `firestore.rules`. The rules inspect user auth tokens and query workspace member rosters before allowing read/write operations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Checks if the client has a valid session
    function isAuthenticated() {
      return request.auth != null;
    }

    // Checks if the user is a member of the organization
    function isOrgMember(orgId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid));
    }

    // Gets the membership data
    function getOrgMember(orgId) {
      return get(/databases/$(database)/documents/organizations/$(orgId)/members/$(request.auth.uid)).data;
    }

    // Checks if the member has specific roles
    function hasRole(orgId, roles) {
      return isOrgMember(orgId) && getOrgMember(orgId).role in roles;
    }

    // ...
  }
}
```

### Core Security Rules

- **Users (`/users/{userId}`)**:
  - `allow read`: Authenticated users can read other profiles (enables members search).
  - `allow write`: Only the user themselves (`request.auth.uid == userId`) can modify their profile.
- **Private User Metadata (`/privateUsers/{userId}`)**:
  - `allow read`: Only the user themselves can read.
  - `allow write`: **Denied entirely** on the client (`allow write: if false;`). Managed strictly by Server Actions / Admin SDK.
- **Organizations (`/organizations/{orgId}`)**:
  - `allow read`: Allowed only if the user is a verified organization member.
  - `allow create`: Allowed if the creator sets themselves as `ownerId`.
  - `allow update`: Allowed only for `owner` and `admin` roles.
  - `allow delete`: Restrict to `owner` role.
- **Members List (`/organizations/{orgId}/members/{userId}`)**:
  - `allow read`: Workspace members can view their roster.
  - `allow create`: Allowed during organization setup, or for `owner`/`admin` roles inviting team members.
  - `allow update`: Allowed for `owner` and `admin`. Members cannot update roles.
- **Files Metadata (`/organizations/{orgId}/files/{fileId}`)**:
  - `allow read`: Workspace members can read metadata.
  - `allow create`: Allowed for `owner`, `admin`, and `member` (viewers cannot upload).
  - `allow delete`: Restricted to `owner`, `admin`, or the uploader.
- **AI Logs and Audit Trails**:
  - `allow read`: Workspace members can read logs.
  - `allow write`: **Blocked entirely** on the client (`allow write: if false;`). Logs are appended exclusively by secure Server Actions.

---

## 2. Cross-Service Storage Security Rules

We use Firebase Storage rules to restrict file access to workspace boundaries. Firebase Storage rules query Firestore to verify organization membership:

```javascript
service firebase.storage {
  match /b/{bucket}/o {

    function isOrgMember(orgId) {
      return request.auth != null &&
        firestore.exists(/databases/(default)/documents/organizations/$(orgId)/members/$(request.auth.uid));
    }

    // Organization files path
    match /organizations/{orgId}/files/{fileId}/{fileName} {
      allow read: if isOrgMember(orgId);
      allow write: if isOrgMember(orgId)
                    && request.resource.size < 20 * 1024 * 1024; // 20MB limit
    }
  }
}
```

- **Avatars (`/users/{userId}/avatars/{fileName}`)**:
  - `allow read`: Authenticated users can view avatars.
  - `allow write`: Only the user themselves (`userId == request.auth.uid`), restricted to images under 5MB.
- **Organization Assets (`/organizations/{orgId}/files/{fileId}/{fileName}`)**:
  - `allow read/write`: Requires verified workspace membership in Firestore.
  - File size restricted to **20MB** limit.

---

## 3. Server-Side Guard Rails

Security rules do **NOT** run when operations are performed using the Firebase Admin SDK. Therefore, all Next.js Server Actions and Route Handlers must validate permissions manually:

1. **Verify Session**:
   ```ts
   const claims = await requireAuth(); // Throws if __session cookie is missing/invalid
   const userId = claims.uid;
   ```
2. **Validate Input Schemas**:
   ```ts
   const validated = createOrgSchema.parse(inputData); // Throws if data shape is wrong
   ```
3. **Verify Role Permissions**:
   ```ts
   const actorRole = await getMemberRole(orgId, userId);
   if (!canManageWorkspace(actorRole)) {
     throw new Error("Unauthorized");
   }
   ```
