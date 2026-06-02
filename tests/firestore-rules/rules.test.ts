import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  collectionGroup,
  query,
  where,
} from "firebase/firestore";
import * as fs from "fs";

describe("Firestore Security Rules Tests", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    // Initialize test environment pointing to the running emulator (port 8080)
    testEnv = await initializeTestEnvironment({
      projectId: "demo-firestore-rules",
      firestore: {
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
    // Clear Firestore emulator database state before each test
    await testEnv.clearFirestore();
  });

  it("allows a user to read and write their own public profile", async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const aliceDb = aliceContext.firestore();
    const aliceProfileRef = doc(aliceDb, "users/alice");

    // Alice should be allowed to set and read her own profile document
    await assertSucceeds(
      setDoc(aliceProfileRef, {
        email: "alice@example.com",
        displayName: "Alice",
      }),
    );
    await assertSucceeds(getDoc(aliceProfileRef));
  });

  it("prevents an unauthenticated visitor from writing user profiles", async () => {
    const anonContext = testEnv.unauthenticatedContext();
    const anonDb = anonContext.firestore();
    const aliceProfileRef = doc(anonDb, "users/alice");

    // Anon user cannot write Alice's profile
    await assertFails(
      setDoc(aliceProfileRef, {
        email: "hacker@example.com",
      }),
    );
  });

  it("prevents users from reading other users' private profiles", async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const aliceDb = aliceContext.firestore();

    const bobContext = testEnv.authenticatedContext("bob");
    const bobDb = bobContext.firestore();

    // Alice sets up her private profile (bypass rules using testEnv.withSecurityRulesDisabled)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "privateUsers/alice"), { secretClaim: "admin" });
    });

    // Bob tries to read Alice's private profile (should fail)
    const bobReadRef = doc(bobDb, "privateUsers/alice");
    await assertFails(getDoc(bobReadRef));

    // Alice can read her own private profile (should succeed)
    const aliceReadRef = doc(aliceDb, "privateUsers/alice");
    await assertSucceeds(getDoc(aliceReadRef));
  });

  it("allows organization members to read workspace info, but blocks non-members", async () => {
    const orgId = "acme-corp";

    // Seed organization and member record bypassing rules
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `organizations/${orgId}`), {
        name: "Acme Corp",
        ownerId: "alice",
      });
      await setDoc(doc(db, `organizations/${orgId}/members/alice`), {
        userId: "alice",
        role: "owner",
      });
    });

    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const bobDb = testEnv.authenticatedContext("bob").firestore();

    // Alice is a member, she can read organization details
    await assertSucceeds(getDoc(doc(aliceDb, `organizations/${orgId}`)));

    // Bob is not a member, he should be blocked
    await assertFails(getDoc(doc(bobDb, `organizations/${orgId}`)));
  });

  it("prevents authenticated users from globally listing organizations, but permits membership collectionGroup listing", async () => {
    const bobContext = testEnv.authenticatedContext("bob");
    const bobDb = bobContext.firestore();

    // Bob tries to list all organizations (should fail due to list: if false)
    const orgsCollection = collection(bobDb, "organizations");
    await assertFails(getDocs(orgsCollection));

    // Bob tries to query his own memberships via collectionGroup (should succeed)
    const membersGroup = query(
      collectionGroup(bobDb, "members"),
      where("userId", "==", "bob"),
    );
    await assertSucceeds(getDocs(membersGroup));
  });

  it("prevents an authenticated user from adding themselves as a member of an existing organization directly", async () => {
    const orgId = "acme-corp";

    // Seed organization bypassing rules
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, `organizations/${orgId}`), {
        name: "Acme Corp",
        ownerId: "alice",
      });
      await setDoc(doc(db, `organizations/${orgId}/members/alice`), {
        userId: "alice",
        role: "owner",
      });
    });

    const bobDb = testEnv.authenticatedContext("bob").firestore();

    // Bob tries to add himself as owner of Acme Corp directly (should fail)
    const bobMemberRef = doc(bobDb, `organizations/${orgId}/members/bob`);
    await assertFails(
      setDoc(bobMemberRef, {
        userId: "bob",
        role: "owner",
      }),
    );
  });
});
