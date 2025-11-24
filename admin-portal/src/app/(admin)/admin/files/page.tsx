"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileImage, HardDrive } from "lucide-react";
import { fileAdminService } from "@/services/admin/fileAdminService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function FilesPage() {
  const [loading, setLoading] = useState(true);
  const [fileStats, setFileStats] = useState<any>(null);

  const fetchFileStats = async () => {
    try {
      setLoading(true);
      const response = await fileAdminService.getFileStats();

      if (response.code === 1000 && response.result) {
        setFileStats(response.result);
      }
    } catch (error) {
      console.error("Failed to fetch file stats:", error);
      toast.error("Failed to fetch file statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileStats();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <ErrorBoundary context="Files Page">
      <div className="space-y-6">
        <PageHeader
          title="File Management"
          description="View file statistics and manage storage"
        />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading file statistics...</div>
          </div>
        ) : fileStats ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatsCard
                title="Total Files"
                value={fileStats.totalFiles || 0}
                description="All uploaded files"
                icon={FileImage}
              />
              <StatsCard
                title="Total Storage"
                value={formatFileSize(fileStats.totalSize || 0)}
                description="Total storage used"
                icon={HardDrive}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>File Statistics</CardTitle>
                <CardDescription>Overview of file storage and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Files by Type</h3>
                    <div className="space-y-2">
                      {fileStats.filesByType &&
                        Object.entries(fileStats.filesByType).map(([type, count]: [string, any]) => (
                          <div key={type} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{type}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <EmptyState
            icon={FileImage}
            title="No file statistics available"
            description="Unable to load file statistics"
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

