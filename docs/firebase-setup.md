# Firebase Setup Guide

Follow this guide to provision and configure a production-grade Firebase project in the Google Cloud Console.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** (or select an existing Google Cloud project).
3. Enter a project name (e.g. `firesaas-prod`).
4. Choose whether to enable Google Analytics (recommended for monitoring conversion paths).
5. Click **Create Project** and wait for provisioning.

---

## 2. Enable Authentication Providers

1. In the left navigation, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable the following providers:
   - **Email/Password**: Toggle on, and click save.
   - **Google**: Click enable, select a support email, configure redirect domains, and click save.
4. (Optional) Under **Settings > Authorized domains**, add your custom production domain (e.g. `app.firesaas.dev`).

---

## 3. Provision Cloud Firestore

1. In the left navigation, click **Build > Firestore Database**.
2. Click **Create Database**.
3. Select a database location closest to your users (e.g. `nam5` for US Central, `europe-west3` for Europe).
4. Start in **Production Mode** (this ensures all reads and writes are blocked by default until we deploy our rules).
5. Click **Create**.

---

## 4. Enable Firebase Storage

1. Click **Build > Storage**.
2. Click **Get Started**.
3. Start in **Production Mode**.
4. Choose the default storage bucket location (matching your Firestore location is recommended).
5. Click **Done**.

---

## 5. Register Web App & Client Credentials

1. Go to **Project Settings** (gear icon in the top left) > **General**.
2. Scroll to the bottom to **Your apps**, and click the Web icon (`</>`).
3. Enter an app nickname (e.g. `FireSaaS Web`).
4. Click **Register app**.
5. Copy the configuration block variables. They map directly to your client environment variables:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## 6. Generate Firebase Admin SDK Service Account Credentials

To verify auth tokens and write logs on the server side:

1. Go to **Project Settings > Service Accounts**.
2. Select the **Firebase Admin SDK** node.
3. Click **Generate new private key** (this downloads a secure JSON key file).
4. Open the JSON file and extract the keys:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
5. **CRITICAL**: Set the `FIREBASE_PRIVATE_KEY` env variable exactly as it is written in the JSON file, including quotes, and replace literal newlines (`\n`) with the string escape sequence `\n` to prevent parsing failures in Node.js.
