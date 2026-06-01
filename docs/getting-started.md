# Getting Started Guide

Follow this guide to set up, run, and explore the **FireSaaS Starter Kit** locally on your workstation.

---

## Prerequisites

Before starting, ensure you have the following tools installed:

- **Node.js**: Version 18.x or 20.x+
- **pnpm**: Version 9.x or 10.x+ (`npm i -g pnpm`)
- **Java Runtime Environment (JRE)**: Required by the Firebase Emulator Suite to run the Firestore and Auth emulators locally.
- **Firebase CLI**: Not strictly required to be installed globally, as we invoke it via `npx` in our scripts.

---

## Step 1: Install Dependencies

Clone the codebase and run `pnpm install` in the project root:

```bash
pnpm install
```

---

## Step 2: Configure Environment Variables

Create your local `.env` file from the provided example template:

```bash
cp .env.example .env
```

### offline Emulator Setup

For local development, the default values in `.env` are configured to point to local emulators:

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID="demo-fire-saas"`
- `FIREBASE_PROJECT_ID="demo-fire-saas"`

You do not need real Firebase credentials to run locally! The client and admin SDKs will detect the emulator hostnames and connect without hitting the internet.

---

## Step 3: Run the Firebase Emulator Suite

Spin up the Auth, Firestore, and Storage emulators. In a dedicated terminal, run:

```bash
pnpm run dev:emulators
```

This starts:

- **Auth Emulator**: `localhost:9099` (simulates client sign-ins)
- **Firestore Emulator**: `localhost:8080` (holds document structures)
- **Storage Emulator**: `localhost:9199` (stores uploaded files)
- **Emulator UI Panel**: `localhost:4000` (web dashboard to inspect data)

Open `http://localhost:4000` in your browser to inspect the local databases.

---

## Step 4: Run the Next.js Server

In a separate terminal window, launch the Next.js development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public marketing landing page.

---

## Step 5: Create Your First User & Workspace

1. On the landing page, click **Get Started** or navigate to `/sign-up`.
2. Fill out the registration form.
3. Upon registration, a Firestore profile is automatically synchronized under `users/{uid}`.
4. You will be redirected to the dashboard.
5. Since there is no active workspace initially, click **Manage Workspaces** or **Create Workspace**.
6. Create an organization workspace (e.g. name: "Launchpad", slug: "launchpad").
7. Select "Launchpad" in the workspace switcher in the header.
8. The dashboard stats, file upload tables, and AI playgrounds are now active!
