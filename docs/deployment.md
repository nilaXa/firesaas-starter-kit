# Deployment Guide

This guide explains how to deploy the **FireSaaS Starter Kit** to production using **Firebase App Hosting** or **Vercel**.

---

## 1. Firebase App Hosting (Recommended)

Firebase App Hosting is a serverless hosting solution built to automatically compile and serve Next.js App Router applications with Server-Side Rendering (SSR).

### step-by-step Setup

1. **Initialize Backend**: In the Firebase Console, go to **Build > App Hosting**.
2. Click **Get Started** and connect your GitHub repository containing the FireSaaS codebase.
3. Select your deployment branch (e.g. `main`).
4. Select a region closest to your Firestore database.
5. In **App settings**, keep the default configuration. Firebase will automatically detect Next.js.
6. Click **Finish**. Firebase will start the first build.

### App Hosting Configuration (`apphosting.yaml`)

To customize our Next.js node runtime environment, create a file named `apphosting.yaml` in the root directory:

```yaml
# apphosting.yaml
headers:
  - glob: "**/*"
    headers:
      - key: X-Frame-Options
        value: DENY
      - key: X-Content-Type-Options
        value: nosniff

env:
  - variable: NEXT_PUBLIC_APP_NAME
    value: "FireSaaS"
  - variable: NEXT_PUBLIC_APP_URL
    value: "https://your-domain.web.app"
  - variable: AI_TEXT_MODEL
    value: "gemini-3.5-flash"
```

---

## 2. Vercel Deployment

Vercel is a global cloud platform specialized in Next.js applications.

### Setup

1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Connect your GitHub repository and import the FireSaaS codebase.
3. Select **Next.js** as the Framework Preset.
4. Expand **Environment Variables** and add all production variables listed in the checklist below.
5. Click **Deploy**.

---

## 3. Production Environment Variables Checklist

Ensure you add the following variables to your hosting dashboard settings (Vercel Project Settings > Environment Variables, or Firebase App Hosting Console):

| Variable Name                     | Description                        | Source                                           |
| :-------------------------------- | :--------------------------------- | :----------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`            | Display name of the SaaS           | `"FireSaaS"`                                     |
| `NEXT_PUBLIC_APP_URL`             | Production website URL             | `https://your-domain.com`                        |
| `NEXT_PUBLIC_FIREBASE_API_KEY`    | Client API key                     | Firebase Console                                 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client Project ID                  | Firebase Console                                 |
| `FIREBASE_PROJECT_ID`             | Admin Project ID                   | Firebase Console                                 |
| `FIREBASE_CLIENT_EMAIL`           | Admin service account email        | Service account key JSON                         |
| `FIREBASE_PRIVATE_KEY`            | Admin private key (include quotes) | Service account key JSON                         |
| `ADMIN_EMAILS`                    | Comma-separated admin roster       | `admin@yourdomain.com`                           |
| `GOOGLE_GENAI_API_KEY`            | Gemini API key (Studio)            | [Google AI Studio](https://aistudio.google.com/) |

---

## 4. Deploying Database & Storage Security Rules

Before opening the site to public users, deploy your security rules to ensure tenant isolation is locked down:

1. **Deploy Firestore Rules**:
   ```bash
   npx -y firebase-tools@latest deploy --only firestore:rules
   ```
2. **Deploy Storage Rules**:
   ```bash
   npx -y firebase-tools@latest deploy --only storage:rules
   ```
3. **Deploy Firestore Indexes**:
   ```bash
   npx -y firebase-tools@latest deploy --only firestore:indexes
   ```
