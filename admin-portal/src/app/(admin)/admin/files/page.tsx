"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpDown,
  Download,
  Eye,
  FileImage,
  FileVideo,
  Filter,
  Flag,
  FlagOff,
  HardDrive,
  ImageIcon,
  RefreshCcw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FileActionRequest,
  FileResponse,
  FileStatus,
  FileSearchRequest,
} from "@/types";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useFileMetrics, useFileSearch } from "@/hooks/queries";
import { fileManagementService } from "@/services/admin/fileManagementService";

type FileTypeFilter = "ALL" | "video" | "image" | "other";
type StatusFilter = "ALL" | FileStatus;
type SortField = "createdAt" | "size" | "fileName";
type SortDirection = "ASC" | "DESC";
type ActionType = "delete" | "restore" | "flag" | "unflag";

interface FilterFormState {
  keyword: string;
  fileType: FileTypeFilter;
  status: StatusFilter;
  uploaderId: string;
  uploaderUsername: string;
  minSizeMB: string;
  maxSizeMB: string;
  createdFrom: string;
  createdTo: string;
}

const defaultFilterForm: FilterFormState = {
  keyword: "",
  fileType: "ALL",
  status: "ALL",
  uploaderId: "",
  uploaderUsername: "",
  minSizeMB: "",
  maxSizeMB: "",
  createdFrom: "",
  createdTo: "",
};

export default function FilesPage() {
  const [filters, setFilters] = useState<FilterFormState>(defaultFilterForm);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESC");
  const [actionDialog, setActionDialog] = useState<{
    file: FileResponse;
    action: ActionType;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [filters, pageSize, sortBy, sortDirection]);

  const minSizeValue = filters.minSizeMB
    ? Number(filters.minSizeMB)
    : undefined;
  const maxSizeValue = filters.maxSizeMB
    ? Number(filters.maxSizeMB)
    : undefined;
  const hasInvalidSizeRange =
    minSizeValue !== undefined &&
    maxSizeValue !== undefined &&
    minSizeValue > maxSizeValue;

  const hasInvalidDateRange =
    filters.createdFrom &&
    filters.createdTo &&
    filters.createdFrom > filters.createdTo;

  const searchRequest: FileSearchRequest = useMemo(() => {
    const payload: FileSearchRequest = {
      keyword: filters.keyword.trim() || undefined,
      fileType: filters.fileType !== "ALL" ? filters.fileType : undefined,
      status: filters.status !== "ALL" ? filters.status : undefined,
      uploaderId: filters.uploaderId.trim() || undefined,
      uploaderUsername: filters.uploaderUsername.trim() || undefined,
      minSize:
        hasInvalidSizeRange || minSizeValue === undefined
          ? undefined
          : Math.max(minSizeValue, 0) * 1024 * 1024,
      maxSize:
        hasInvalidSizeRange || maxSizeValue === undefined
          ? undefined
          : Math.max(maxSizeValue, 0) * 1024 * 1024,
      createdFrom:
        hasInvalidDateRange || !filters.createdFrom
          ? undefined
          : `${filters.createdFrom}T00:00:00Z`,
      createdTo:
        hasInvalidDateRange || !filters.createdTo
          ? undefined
          : `${filters.createdTo}T23:59:59Z`,
      page,
      size: pageSize,
      sortBy,
      sortDirection,
    };
    return payload;
  }, [
    filters,
    page,
    pageSize,
    sortBy,
    sortDirection,
    minSizeValue,
    maxSizeValue,
    hasInvalidSizeRange,
    hasInvalidDateRange,
  ]);

  const {
    data: fileSearchResponse,
    isLoading: isFilesLoading,
    refetch: refetchFiles,
  } = useFileSearch(searchRequest);

  const {
    data: metricsResponse,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useFileMetrics();

  const fileList =
    fileSearchResponse?.result?.files?.content?.filter(Boolean) ?? [];
  const totalPages = fileSearchResponse?.result?.totalPages ?? 0;
  const totalElements = fileSearchResponse?.result?.totalElements ?? 0;

  const metrics = metricsResponse?.result;

  const handleFilterChange = <K extends keyof FilterFormState>(
    key: K,
    value: FilterFormState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilterForm);
    setSortBy("createdAt");
    setSortDirection("DESC");
    setPageSize(20);
    setPage(0);
  };

  const paginationWindow = useMemo(() => {
    const visiblePages = Math.min(5, totalPages);
    const startPage = Math.max(
      0,
      Math.min(
        page - Math.floor(visiblePages / 2),
        Math.max(0, totalPages - visiblePages)
      )
    );
    return { visiblePages, startPage };
  }, [page, totalPages]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const getStatusBadge = (status?: FileStatus) => {
    switch (status) {
      case FileStatus.FLAGGED:
        return (
          <Badge variant="destructive" className="gap-1">
            <Flag className="h-3 w-3" />
            Flagged
          </Badge>
        );
      case FileStatus.DELETED:
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Trash2 className="h-3 w-3" />
            Deleted
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            Active
          </Badge>
        );
    }
  };

  const requiresReason = (action: ActionType) =>
    action === "delete" || action === "flag";

  const handleAction = (file: FileResponse, action: ActionType) => {
    setActionDialog({ file, action });
    setActionReason("");
  };

  const performAction = async () => {
    if (!actionDialog) return;
    const { file, action } = actionDialog;
    const trimmedReason = actionReason.trim();

    if (requiresReason(action) && !trimmedReason) {
      toast.error("Please provide a reason for this action.");
      return;
    }

    const payload: FileActionRequest | undefined = trimmedReason
      ? { actionReason: trimmedReason }
      : undefined;

    setIsActionLoading(true);
    try {
      switch (action) {
        case "delete":
          await fileManagementService.deleteFile(file.id, payload!);
          toast.success("File deleted successfully.");
          break;
        case "restore":
          await fileManagementService.restoreFile(file.id, payload);
          toast.success("File restored successfully.");
          break;
        case "flag":
          await fileManagementService.flagFile(file.id, payload!);
          toast.success("File flagged for review.");
          break;
        case "unflag":
          await fileManagementService.unflagFile(file.id, payload);
          toast.success("File unflagged.");
          break;
      }
      await Promise.all([refetchFiles(), refetchMetrics()]);
      setActionDialog(null);
    } catch (error) {
      console.error("File action failed", error);
      toast.error("Failed to perform action. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderPreview = (file: FileResponse) => {
    if (file.thumbnailUrl) {
      return (
        <div className="relative h-16 w-28 overflow-hidden rounded-md bg-muted">
          <Image
            src={file.thumbnailUrl}
            alt={file.fileName ?? "file preview"}
            fill
            className="object-cover"
          />
        </div>
      );
    }

    if (file.resourceType === "video") {
      return (
        <div className="flex h-16 w-28 items-center justify-center rounded-md bg-muted">
          <FileVideo className="h-6 w-6 text-muted-foreground" />
        </div>
      );
    }

    if (file.resourceType === "image") {
      return (
        <div className="flex h-16 w-28 items-center justify-center rounded-md bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="flex h-16 w-28 items-center justify-center rounded-md bg-muted">
        <FileImage className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  };

  const statusOptions: { label: string; value: StatusFilter }[] = [
    { label: "All statuses", value: "ALL" },
    { label: "Active", value: FileStatus.ACTIVE },
    { label: "Flagged", value: FileStatus.FLAGGED },
    { label: "Deleted", value: FileStatus.DELETED },
  ];

  const reasonTitleMap: Record<ActionType, string> = {
    delete: "Delete File",
    restore: "Restore File",
    flag: "Flag File for Review",
    unflag: "Unflag File",
  };

  const reasonDescriptionMap: Record<ActionType, string> = {
    delete:
      "Provide a reason for deleting this file. This will be stored in the audit log.",
    flag: "Provide a reason for flagging this file. This will be visible to other moderators.",
    restore:
      "Optionally provide context for restoring this file. This will be stored in the audit log.",
    unflag:
      "Optionally provide context for unflagging this file. This will be stored in the audit log.",
  };

  const sortOptions: { label: string; value: SortField }[] = [
    { label: "Created Date", value: "createdAt" },
    { label: "File Size", value: "size" },
    { label: "File Name", value: "fileName" },
  ];

  return (
    <ErrorBoundary context="Files Page">
      <div className="space-y-6">
        <PageHeader
          title="File Management"
          description="Browse, filter, and moderate uploaded media."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Files"
            value={
              isMetricsLoading
                ? "…"
                : metrics?.totalFiles?.toLocaleString() ?? "0"
            }
            description="All uploaded files"
            icon={FileImage}
          />
          <StatsCard
            title="Total Storage Used"
            value={
              isMetricsLoading ? "…" : metrics?.formattedStorageUsed ?? "0 B"
            }
            description="Across all content"
            icon={HardDrive}
          />
          <StatsCard
            title="Flagged Files"
            value={
              isMetricsLoading
                ? "…"
                : metrics?.flaggedFiles?.toLocaleString() ?? "0"
            }
            description="Awaiting review"
            icon={Flag}
          />
          <StatsCard
            title="Deleted Files"
            value={
              isMetricsLoading
                ? "…"
                : metrics?.deletedFiles?.toLocaleString() ?? "0"
            }
            description="Soft-deleted items"
            icon={Trash2}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filters persist automatically. Adjust any field to refresh
              results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="keyword">
                  Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="keyword"
                    placeholder="File name or description"
                    value={filters.keyword}
                    onChange={(event) =>
                      handleFilterChange("keyword", event.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">File Type</label>
                <Select
                  value={filters.fileType}
                  onValueChange={(value) =>
                    handleFilterChange("fileType", value as FileTypeFilter)
                  }
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All types</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    handleFilterChange("status", value as StatusFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Uploader ID</label>
                <Input
                  value={filters.uploaderId}
                  onChange={(event) =>
                    handleFilterChange("uploaderId", event.target.value)
                  }
                  placeholder="User detail ID"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Uploader Username</label>
                <Input
                  value={filters.uploaderUsername}
                  onChange={(event) =>
                    handleFilterChange("uploaderUsername", event.target.value)
                  }
                  placeholder="Username"
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Min Size (MB)</label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.minSizeMB}
                    onChange={(event) =>
                      handleFilterChange("minSizeMB", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Max Size (MB)</label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.maxSizeMB}
                    onChange={(event) =>
                      handleFilterChange("maxSizeMB", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Created From</label>
                  <Input
                    type="date"
                    value={filters.createdFrom}
                    onChange={(event) =>
                      handleFilterChange("createdFrom", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Created To</label>
                  <Input
                    type="date"
                    value={filters.createdTo}
                    onChange={(event) =>
                      handleFilterChange("createdTo", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortField)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setSortDirection((prev) => (prev === "DESC" ? "ASC" : "DESC"))
                }
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                {sortDirection === "DESC" ? "Newest first" : "Oldest first"}
              </Button>

              <Select
                value={String(pageSize)}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50].map((sizeOption) => (
                    <SelectItem key={sizeOption} value={String(sizeOption)}>
                      {sizeOption} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={handleResetFilters}
              >
                <RotateCcw className="h-4 w-4" />
                Reset filters
              </Button>
            </div>

            {hasInvalidSizeRange && (
              <p className="text-sm text-destructive">
                Minimum size must be less than maximum size.
              </p>
            )}

            {hasInvalidDateRange && (
              <p className="text-sm text-destructive">
                Start date must be before end date.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Files</CardTitle>
              <CardDescription>
                Results: {totalElements.toLocaleString()} files found.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileVideo className="h-4 w-4" />
                Videos: {metrics?.totalVideos ?? "0"}
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Images: {metrics?.totalImages ?? "0"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFilesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Loading files…
                </div>
              </div>
            ) : fileList.length === 0 ? (
              <EmptyState
                icon={FileImage}
                title="No files found"
                description="Try adjusting your filters or keyword."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Uploader</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fileList.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>{renderPreview(file)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{file.fileName}</p>
                              {/* <p className="text-xs text-muted-foreground">
                                {file.resourceType ?? "Unknown"} •{" "}
                                {file.format?.toUpperCase() ?? "N/A"}
                              </p> */}
                            </div>
                          </TableCell>
                          <TableCell>
                            {file.uploader ? (
                              <div>
                                <p className="text-sm font-medium">
                                  {file.uploader.displayName ||
                                    file.uploader?.user?.username ||
                                    "Unknown"}
                                </p>
                                {file.uploader.user?.username && (
                                  <p className="text-xs text-muted-foreground">
                                    @{file.uploader.user.username}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Unknown
                              </p>
                            )}
                          </TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>
                            <p className="text-sm">
                              {file.createdAt
                                ? new Date(file.createdAt).toLocaleString()
                                : "Unknown"}
                            </p>
                          </TableCell>
                          <TableCell>{getStatusBadge(file.status)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap justify-end gap-2">
                              {file.url && (
                                <Button asChild variant="outline" size="sm">
                                  <Link href={file.url} target="_blank">
                                    <Eye className="mr-2 h-3 w-3" />
                                    View
                                  </Link>
                                </Button>
                              )}
                              {file.url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(file.url, "_blank")
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              {file.status !== FileStatus.FLAGGED &&
                                file.status !== FileStatus.DELETED && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAction(file, "flag")}
                                  >
                                    <Flag className="h-4 w-4 text-amber-500" />
                                  </Button>
                                )}
                              {file.status === FileStatus.FLAGGED && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(file, "unflag")}
                                >
                                  <FlagOff className="h-4 w-4" />
                                </Button>
                              )}
                              {file.status !== FileStatus.DELETED ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAction(file, "delete")}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleAction(file, "restore")}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Restore
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setPage((prev) => Math.max(prev - 1, 0))
                          }
                          className={
                            page === 0
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: paginationWindow.visiblePages },
                        (_, index) => paginationWindow.startPage + index
                      ).map((pageIndex) => (
                        <PaginationItem key={pageIndex}>
                          <PaginationLink
                            isActive={pageIndex === page}
                            onClick={() => setPage(pageIndex)}
                            className="cursor-pointer"
                          >
                            {pageIndex + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPage((prev) =>
                              Math.min(prev + 1, totalPages - 1)
                            )
                          }
                          className={
                            page >= totalPages - 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={!!actionDialog}
          onOpenChange={(open) => {
            if (!open) {
              setActionDialog(null);
              setActionReason("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog ? reasonTitleMap[actionDialog.action] : ""}
              </DialogTitle>
              <DialogDescription>
                {actionDialog ? reasonDescriptionMap[actionDialog.action] : ""}
              </DialogDescription>
            </DialogHeader>
            {actionDialog?.file && (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium">{actionDialog.file.fileName}</p>
                  <p className="text-muted-foreground">
                    {actionDialog.file.resourceType?.toUpperCase()} •{" "}
                    {formatFileSize(actionDialog.file.size)}
                  </p>
                </div>
                <Textarea
                  placeholder="Provide a reason (required for delete/flag)"
                  value={actionReason}
                  onChange={(event) => setActionReason(event.target.value)}
                  maxLength={500}
                />
                {requiresReason(actionDialog.action) && (
                  <p className="text-xs text-muted-foreground">
                    Reason is required and will be stored in the audit log.
                  </p>
                )}
              </div>
            )}
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setActionDialog(null);
                  setActionReason("");
                }}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
              <Button
                variant={
                  actionDialog?.action === "delete" ? "destructive" : "default"
                }
                onClick={performAction}
                disabled={
                  isActionLoading ||
                  (actionDialog
                    ? requiresReason(actionDialog.action) &&
                      actionReason.trim().length === 0
                    : false)
                }
              >
                {isActionLoading ? "Processing…" : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}
