import { describe, it, expect } from "vitest";
import { FirestorePaths } from "@/firebase/firestore";
import { StoragePaths } from "@/firebase/storage";

describe("Path Helper Utilities", () => {
  describe("FirestorePaths", () => {
    it("should return the correct path for user docs", () => {
      expect(FirestorePaths.user("user123")).toBe("users/user123");
      expect(FirestorePaths.privateUser("user123")).toBe(
        "privateUsers/user123",
      );
    });

    it("should return correct nested paths for org subcollections", () => {
      expect(FirestorePaths.member("orgA", "userB")).toBe(
        "organizations/orgA/members/userB",
      );
      expect(FirestorePaths.file("orgA", "fileC")).toBe(
        "organizations/orgA/files/fileC",
      );
      expect(FirestorePaths.auditLog("orgA", "logD")).toBe(
        "organizations/orgA/auditLogs/logD",
      );
    });
  });

  describe("StoragePaths", () => {
    it("should clean and generate correct storage upload paths", () => {
      const sanitizedFile = StoragePaths.organizationFile(
        "orgA",
        "fileB",
        "my file (1).pdf",
      );
      expect(sanitizedFile).toBe(
        "organizations/orgA/files/fileB/my_file__1_.pdf",
      );
    });

    it("should sanitize and generate correct avatar paths", () => {
      const sanitizedAvatar = StoragePaths.userAvatar(
        "userA",
        "profile picture.png",
      );
      expect(sanitizedAvatar).toBe("users/userA/avatars/profile_picture.png");
    });
  });
});
