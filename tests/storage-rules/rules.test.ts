// @vitest-environment node
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { ref, uploadBytes } from "firebase/storage";
import * as fs from "fs";
import { doc, setDoc } from "firebase/firestore";

describe("Firebase Storage Security Rules Tests", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "demo-fire-saas",
      storage: {
        rules: fs.readFileSync("storage.rules", "utf8"),
        host: "127.0.0.1",
        port: 9199,
      },
      firestore: {
        // Required because Storage rules reference firestore.exists()
        rules: fs.readFileSync("firestore.rules", "utf8"),
        host: "127.0.0.1",
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    // Storage emulator doesn't support clearStorage programmatically in RulesTestEnvironment,
    // but the test isolation is handled via unique names/uids.
  });

  it("allows a user to upload their own avatar (JPEG/PNG only)", async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const aliceStorage = aliceContext.storage();
    const avatarRef = ref(aliceStorage, "users/alice/avatars/avatar.jpg");

    const dummyBlob = new Blob(["dummy-image-data"], { type: "image/jpeg" });

    // Alice should succeed in uploading to her own directory
    await assertSucceeds(uploadBytes(avatarRef, dummyBlob));
  });

  it("prevents a user from uploading an avatar to another user's directory", async () => {
    const bobContext = testEnv.authenticatedContext("bob");
    const bobStorage = bobContext.storage();
    const aliceAvatarRef = ref(bobStorage, "users/alice/avatars/hacked.jpg");

    const dummyBlob = new Blob(["dummy-image-data"], { type: "image/jpeg" });

    // Bob should be blocked from writing to Alice's path
    await assertFails(uploadBytes(aliceAvatarRef, dummyBlob));
  });

  it("allows organization members to upload organization files, but blocks non-members", async () => {
    const orgId = "acme-corp";

    // 1. Seed Firestore organization membership first, as Storage rules check this
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `organizations/${orgId}`), { name: "Acme Corp" });
      await setDoc(doc(db, `organizations/${orgId}/members/alice`), {
        userId: "alice",
        role: "member",
      });
    });

    const aliceStorage = testEnv.authenticatedContext("alice").storage();
    const bobStorage = testEnv.authenticatedContext("bob").storage();

    const aliceFileRef = ref(
      aliceStorage,
      `organizations/${orgId}/files/file1/doc.pdf`,
    );
    const bobFileRef = ref(
      bobStorage,
      `organizations/${orgId}/files/file2/doc.pdf`,
    );

    const dummyBlob = new Blob(["dummy-doc-data"], { type: "application/pdf" });

    // Alice is a member, she can upload
    await assertSucceeds(uploadBytes(aliceFileRef, dummyBlob));

    // Bob is not a member, he should be blocked
    await assertFails(uploadBytes(bobFileRef, dummyBlob));
  });
});
