import { describe, it, expect } from "vitest";
import {
  canManageWorkspace,
  canUploadFiles,
  canRunAiFlows,
  canDeleteWorkspace,
} from "@/features/organizations/permissions";

describe("Organization Role Permissions", () => {
  describe("canManageWorkspace", () => {
    it("should allow owners and admins", () => {
      expect(canManageWorkspace("owner")).toBe(true);
      expect(canManageWorkspace("admin")).toBe(true);
    });

    it("should deny members and viewers", () => {
      expect(canManageWorkspace("member")).toBe(false);
      expect(canManageWorkspace("viewer")).toBe(false);
    });
  });

  describe("canUploadFiles", () => {
    it("should allow owners, admins, and members", () => {
      expect(canUploadFiles("owner")).toBe(true);
      expect(canUploadFiles("admin")).toBe(true);
      expect(canUploadFiles("member")).toBe(true);
    });

    it("should deny viewers", () => {
      expect(canUploadFiles("viewer")).toBe(false);
    });
  });

  describe("canRunAiFlows", () => {
    it("should allow owners, admins, and members", () => {
      expect(canRunAiFlows("owner")).toBe(true);
      expect(canRunAiFlows("admin")).toBe(true);
      expect(canRunAiFlows("member")).toBe(true);
    });

    it("should deny viewers", () => {
      expect(canRunAiFlows("viewer")).toBe(false);
    });
  });

  describe("canDeleteWorkspace", () => {
    it("should only allow owners", () => {
      expect(canDeleteWorkspace("owner")).toBe(true);
      expect(canDeleteWorkspace("admin")).toBe(false);
      expect(canDeleteWorkspace("member")).toBe(false);
      expect(canDeleteWorkspace("viewer")).toBe(false);
    });
  });
});
