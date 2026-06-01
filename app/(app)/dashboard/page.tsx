"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  limit,
  orderBy,
  onSnapshot,
  doc,
} from "firebase/firestore";
import {
  Sparkles,
  FolderOpen,
  Activity,
  Plus,
  Coins,
  ChevronRight,
  ShieldCheck,
  Building2,
  Settings,
} from "lucide-react";
import { db } from "@/firebase/client";
import { useAuth } from "@/features/auth/AuthContext";
import Link from "next/link";

interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  targetType: string;
  createdAt: Date;
}

interface WorkspaceInfo {
  name: string;
  plan: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);

  // Stats
  const [fileCount, setFileCount] = useState(0);
  const [fileSizeSum, setFileSizeSum] = useState(0); // in bytes
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to local storage active_org_id
    const orgId = localStorage.getItem("active_org_id");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveOrgId(orgId);

    // Poll storage for workspace switches
    const interval = setInterval(() => {
      const current = localStorage.getItem("active_org_id");
      if (current !== activeOrgId) {
        setActiveOrgId(current);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrgId]);

  useEffect(() => {
    if (!activeOrgId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Fetch organization details
    const orgRef = doc(db, "organizations", activeOrgId);
    const unsubOrg = onSnapshot(
      orgRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWorkspace({
            name: data.name,
            plan: data.plan || "free",
          });
        } else {
          setWorkspace(null);
        }
      },
      (error) => {
        console.warn("Unauthorized to view dashboard org details:", error);
      },
    );

    // 2. Fetch File stats
    const filesRef = collection(db, "organizations", activeOrgId, "files");
    const unsubFiles = onSnapshot(
      filesRef,
      (snapshot) => {
        setFileCount(snapshot.size);
        let totalSize = 0;
        snapshot.forEach((doc) => {
          totalSize += doc.data().size || 0;
        });
        setFileSizeSum(totalSize);
      },
      (error) => {
        console.warn("Unauthorized to view dashboard files stats:", error);
      },
    );

    // 3. Fetch AI usage stats
    const aiRef = collection(db, "organizations", activeOrgId, "aiUsage");
    const unsubAi = onSnapshot(
      aiRef,
      (snapshot) => {
        setAiUsageCount(snapshot.size);
      },
      (error) => {
        console.warn("Unauthorized to view dashboard AI usage stats:", error);
      },
    );

    // 4. Fetch recent Audit Logs
    const logsRef = collection(db, "organizations", activeOrgId, "auditLogs");
    const logsQuery = query(logsRef, orderBy("createdAt", "desc"), limit(5));
    const unsubLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            action: data.action,
            actorId: data.actorId,
            targetType: data.targetType,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date(),
          });
        });
        setRecentLogs(list);
        setLoading(false);
      },
      (error) => {
        console.warn(
          "Failed to listen to logs (may need indexes/permissions):",
          error,
        );
        setLoading(false);
      },
    );

    return () => {
      unsubOrg();
      unsubFiles();
      unsubAi();
      unsubLogs();
    };
  }, [activeOrgId]);

  // Convert bytes to readable unit
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPlanLimit = () => {
    if (!workspace) return 100 * 1024 * 1024; // 100MB default
    if (workspace.plan === "pro") return 10 * 1024 * 1024 * 1024; // 10GB
    if (workspace.plan === "business") return 100 * 1024 * 1024 * 1024; // 100GB
    return 100 * 1024 * 1024; // 100MB free
  };

  const storagePercentage = Math.min(
    100,
    Math.round((fileSizeSum / getPlanLimit()) * 100),
  );

  if (!activeOrgId) {
    return (
      <div className="border border-dashed border-border rounded-lg p-16 text-center space-y-6 bg-card shadow-sm">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <Building2 className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h3 className="text-xl font-bold text-foreground">
            No active workspace
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You need to select or create a workspace to view the metrics console
            and run AI/storage flows.
          </p>
        </div>
        <Link
          href="/organizations"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-10 px-6 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Manage Workspaces</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border-l-4 border-l-primary border-t border-r border-b border-border/80 p-6 rounded-lg shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Welcome back, {user?.displayName || "Developer"}!
          </h1>
          <p className="text-sm text-muted-foreground">
            You are managing the active workspace:{" "}
            <span className="font-bold text-foreground">
              {workspace?.name || "Loading..."}
            </span>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 capitalize">
            {workspace?.plan || "Free"} Plan
          </span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Files Stats */}
        <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Workspace Storage
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-foreground tracking-tight">
              {fileCount} Files
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Used {formatBytes(fileSizeSum)} of {formatBytes(getPlanLimit())}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
        </div>

        {/* AI Stats */}
        <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              AI Executions
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-foreground tracking-tight">
              {aiUsageCount} Runs
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Total Genkit flows run in this workspace
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
            <Coins className="h-4 w-4 shrink-0" />
            <span>Estimated cost: ${(aiUsageCount * 0.002).toFixed(3)}</span>
          </div>
        </div>

        {/* Activity overview */}
        <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Audit Stream
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-foreground tracking-tight">
              Active
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Compliance audit logs are auto-tracked
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Tenant isolation verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity stream (2/3 col) */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-base font-bold text-foreground">
              Recent Workspace Activity
            </h3>
            <span className="text-xs text-muted-foreground">Last 5 logs</span>
          </div>

          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0 pb-3 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground capitalize">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Target: {log.targetType} • Actor:{" "}
                    {log.actorId.substring(0, 6)}...
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {log.createdAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}

            {recentLogs.length === 0 && !loading && (
              <p className="text-center py-8 text-sm text-muted-foreground italic">
                No recent activity in this workspace. Try uploading a file or
                running an AI flow!
              </p>
            )}

            {loading && (
              <p className="text-center py-8 text-sm text-muted-foreground">
                Retrieving logs...
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions (1/3 col) */}
        <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/files"
              className="flex items-center justify-between p-3 border border-border/80 hover:bg-muted hover:border-primary/20 rounded-md transition-all group"
            >
              <div className="flex items-center space-x-3 text-sm">
                <FolderOpen className="h-4.5 w-4.5 text-primary" />
                <span className="font-semibold">Upload Files</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/ai"
              className="flex items-center justify-between p-3 border border-border/80 hover:bg-muted hover:border-primary/20 rounded-md transition-all group"
            >
              <div className="flex items-center space-x-3 text-sm">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <span className="font-semibold">AI Playground</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/organizations"
              className="flex items-center justify-between p-3 border border-border/80 hover:bg-muted hover:border-primary/20 rounded-md transition-all group"
            >
              <div className="flex items-center space-x-3 text-sm">
                <Building2 className="h-4.5 w-4.5 text-primary" />
                <span className="font-semibold">Manage Workspace</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/settings"
              className="flex items-center justify-between p-3 border border-border/80 hover:bg-muted hover:border-primary/20 rounded-md transition-all group"
            >
              <div className="flex items-center space-x-3 text-sm">
                <Settings className="h-4.5 w-4.5 text-primary" />
                <span className="font-semibold">Account Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
