"use client";

import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/client";
import { StoragePaths } from "@/firebase/storage";
import { registerFileMetadata, deleteFile } from "@/features/files/actions";
import { toast } from "sonner";
import {
  FolderOpen,
  Upload,
  Trash2,
  Download,
  Loader2,
  File,
  FileImage,
  FileText,
  FileCode,
  Building2,
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  contentType: string;
  size: number;
  createdAt: Date;
  ownerId: string;
  path: string;
}

export default function FilesPage() {
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveOrgId(localStorage.getItem("active_org_id"));

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
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const filesRef = collection(db, "organizations", activeOrgId, "files");
    const unsubscribe = onSnapshot(
      filesRef,
      (snapshot) => {
        const list: FileItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            name: data.name,
            contentType: data.contentType,
            size: data.size,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date(),
            ownerId: data.ownerId,
            path: data.path,
          });
        });
        setFiles(
          list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        );
        setLoading(false);
      },
      (error) => {
        console.warn(
          "Unauthorized to view files (may not belong to org):",
          error,
        );
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [activeOrgId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !activeOrgId) return;

    const file = fileList[0];

    // 1. Validation (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File exceeds the 20MB limit.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 2. Pre-generate document ID
      const fileId = doc(
        collection(db, "organizations", activeOrgId, "files"),
      ).id;

      // 3. Storage upload path
      const storagePath = StoragePaths.organizationFile(
        activeOrgId,
        fileId,
        file.name,
      );
      const storageRef = ref(storage, storagePath);

      // 4. Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error(error);
          toast.error("Storage upload failed: " + error.message);
          setUploading(false);
        },
        async () => {
          // 5. Success: Sync metadata to Firestore
          try {
            await registerFileMetadata({
              id: fileId,
              organizationId: activeOrgId,
              name: file.name,
              path: storagePath,
              contentType: file.type || "application/octet-stream",
              size: file.size,
              status: "ready",
            });
            toast.success("File uploaded and metadata registered!");
          } catch (err: unknown) {
            console.error(err);
            toast.error(
              "Firestore metadata sync failed: " +
                (err instanceof Error ? err.message : String(err)),
            );
          } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        },
      );
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to start upload.",
      );
      setUploading(false);
    }
  };

  const handleDownload = async (fileItem: FileItem) => {
    try {
      const storageRef = ref(storage, fileItem.path);
      const url = await getDownloadURL(storageRef);
      // Open in a new tab to download
      window.open(url, "_blank");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        "Failed to generate download URL: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!activeOrgId) return;
    try {
      await deleteFile(activeOrgId, fileId);
      toast.success("File deleted successfully");
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Deletion failed");
    }
  };

  // Convert bytes to readable unit
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <FileImage className="h-5 w-5 text-indigo-500" />;
    }
    if (
      contentType.includes("pdf") ||
      contentType.includes("word") ||
      contentType.includes("document")
    ) {
      return <FileText className="h-5 w-5 text-amber-500" />;
    }
    if (
      contentType.includes("javascript") ||
      contentType.includes("json") ||
      contentType.includes("typescript") ||
      contentType.includes("html") ||
      contentType.includes("css")
    ) {
      return <FileCode className="h-5 w-5 text-emerald-500" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  if (!activeOrgId) {
    return (
      <div className="border border-dashed border-border rounded-lg p-16 text-center space-y-4 bg-card shadow-sm">
        <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground italic">
          Select or create a workspace to view and upload files.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Files Console</h1>
          <p className="text-sm text-muted-foreground">
            Securely upload and manage documents isolated within this workspace.
          </p>
        </div>

        {/* Upload Trigger Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            id="file-selector"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-10 px-5 text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                <span>Uploading ({uploadProgress}%)</span>
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4.5 w-4.5" />
                <span>Upload File</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Progress block if active */}
        {uploading && (
          <div className="bg-card border border-primary/20 rounded-lg p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">
                Uploading file...
              </span>
              <span className="font-mono text-muted-foreground">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Files Roster */}
        <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-foreground">
            Workspace Files
          </h3>

          {loading ? (
            <div className="flex justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Fetching file inventory...</span>
            </div>
          ) : files.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/60 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">File Name</th>
                    <th className="pb-3 px-4">Size</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4">Uploaded At</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      {/* Name & Icon */}
                      <td className="py-3 pr-4 flex items-center space-x-3 max-w-[240px]">
                        <div className="shrink-0">
                          {getFileIcon(file.contentType)}
                        </div>
                        <span className="font-semibold text-foreground truncate block">
                          {file.name}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatBytes(file.size)}
                      </td>

                      {/* Content-Type Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-block max-w-[120px] truncate text-xxs font-mono bg-muted border border-border px-2 py-0.5 rounded-md text-muted-foreground">
                          {file.contentType}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-muted-foreground">
                        {file.createdAt.toLocaleDateString()}{" "}
                        {file.createdAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-4 text-right space-x-2 shrink-0">
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1.5 rounded-md transition-all"
                          aria-label="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-all"
                          aria-label="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-dashed border-border/80 rounded-lg py-16 text-center space-y-4">
              <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  No files in this workspace
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop files here, or click the button to upload.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
