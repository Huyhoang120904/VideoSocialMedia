"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  Video,
  Upload,
  Eye,
  Search,
  Filter,
  Play,
  Download,
  Trash2,
  Image,
  FileVideo,
  User,
} from "lucide-react";
import { feedItemService } from "@/services/api";
import {
  FeedItemUploadResponse,
  FeedItemType,
  FeedItemSearchRequest,
} from "@/types";
import { toast } from "sonner";
import UploadFeedItemModal from "@/components/admin/upload-feed-item-modal";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type ViolationFilter = "ALL" | "VIOLATED" | "CLEAR";

interface FilterFormState {
  keyword: string;
  type: FeedItemType | "ALL";
  status: StatusFilter;
  violation: ViolationFilter;
  createdFrom: string;
  createdTo: string;
}

const defaultFilterForm: FilterFormState = {
  keyword: "",
  type: "ALL",
  status: "ALL",
  violation: "ALL",
  createdFrom: "",
  createdTo: "",
};

export default function FeedItemsPage() {
  const [feedItems, setFeedItems] = useState<FeedItemUploadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filterForm, setFilterForm] = useState<FilterFormState>(
    defaultFilterForm
  );
  const [appliedFilters, setAppliedFilters] =
    useState<FeedItemSearchRequest>({});
  const pageSize = 10;
  const paginationWindow = useMemo(() => {
    const visiblePages = Math.min(5, totalPages);
    const startPage = Math.max(
      0,
      Math.min(
        currentPage - Math.floor(visiblePages / 2),
        Math.max(0, totalPages - visiblePages)
      )
    );

    return { visiblePages, startPage };
  }, [currentPage, totalPages]);

  const fetchFeedItems = async (
    page: number = 0,
    filters: FeedItemSearchRequest = appliedFilters
  ) => {
    try {
      setLoading(true);
      const response = await feedItemService.searchFeedItems(
        filters ?? {},
        page,
        pageSize
      );

      if (response.code === 1000 && response.result) {
        const feedItemsPage = response.result.feedItems;
        setFeedItems(feedItemsPage.content);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch feed items:", error);
      toast.error("Failed to fetch feed items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedItems(currentPage, appliedFilters);
  }, [currentPage, appliedFilters]);

  const handleDeleteFeedItem = async (feedItemId: string) => {
    if (window.confirm("Are you sure you want to delete this feed item?")) {
      try {
        await feedItemService.deleteFeedItem(feedItemId);
        toast.success("Feed item deleted successfully");
        fetchFeedItems(currentPage, appliedFilters);
      } catch (error) {
        console.error("Failed to delete feed item:", error);
        toast.error("Failed to delete feed item");
      }
    }
  };

  const handleFeedItemUploaded = () => {
    fetchFeedItems(currentPage, appliedFilters);
  };

  const handleFilterChange = <K extends keyof FilterFormState>(
    key: K,
    value: FilterFormState[K]
  ) => {
    setFilterForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const buildSearchRequest = (
    form: FilterFormState
  ): FeedItemSearchRequest => {
    const request: FeedItemSearchRequest = {};
    const trimmedKeyword = form.keyword.trim();

    if (trimmedKeyword) {
      request.keyword = trimmedKeyword;
    }

    if (form.type !== "ALL") {
      request.feedItemType = form.type;
    }

    if (form.status === "ACTIVE") {
      request.active = true;
    } else if (form.status === "INACTIVE") {
      request.active = false;
    }

    if (form.violation === "VIOLATED") {
      request.violated = true;
    } else if (form.violation === "CLEAR") {
      request.violated = false;
    }

    if (form.createdFrom) {
      request.createdFrom = new Date(
        `${form.createdFrom}T00:00:00`
      ).toISOString();
    }

    if (form.createdTo) {
      request.createdTo = new Date(
        `${form.createdTo}T23:59:59`
      ).toISOString();
    }

    return request;
  };

  const handleApplyFilters = () => {
    if (
      filterForm.createdFrom &&
      filterForm.createdTo &&
      filterForm.createdFrom > filterForm.createdTo
    ) {
      toast.error("Start date must be before end date");
      return;
    }

    setCurrentPage(0);
    setAppliedFilters(buildSearchRequest(filterForm));
  };

  const handleResetFilters = () => {
    setFilterForm(defaultFilterForm);
    setCurrentPage(0);
    setAppliedFilters({});
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFeedItemIcon = (type: FeedItemType) => {
    switch (type) {
      case FeedItemType.VIDEO:
        return <FileVideo className="h-4 w-4 text-muted-foreground" />;
      case FeedItemType.IMAGE_SLIDE:
        return <Image className="h-4 w-4 text-muted-foreground" />;
      case FeedItemType.USER_DETAIL:
        return <User className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Video className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getFeedItemTypeColor = (type: FeedItemType) => {
    switch (type) {
      case FeedItemType.VIDEO:
        return "default";
      case FeedItemType.IMAGE_SLIDE:
        return "secondary";
      case FeedItemType.USER_DETAIL:
        return "outline";
      default:
        return "default";
    }
  };

  const getDisplayUrl = (item: FeedItemUploadResponse) => {
    if (item.feedItemType === FeedItemType.VIDEO && item.video) {
      return item.video.url;
    }
    if (item.feedItemType === FeedItemType.IMAGE_SLIDE && item.images && item.images.length > 0) {
      return item.images[0].url;
    }
    return item.thumbnailUrl || null;
  };

  const getFileSize = (item: FeedItemUploadResponse) => {
    if (item.feedItemType === FeedItemType.VIDEO && item.video) {
      return item.video.size || 0;
    }
    if (item.feedItemType === FeedItemType.IMAGE_SLIDE && item.images) {
      return item.images.reduce((total, img) => total + (img.size || 0), 0);
    }
    return 0;
  };

  const videoCount = useMemo(
    () =>
      feedItems.filter((item) => item.feedItemType === FeedItemType.VIDEO)
        .length,
    [feedItems]
  );

  const imageSlideCount = useMemo(
    () =>
      feedItems.filter(
        (item) => item.feedItemType === FeedItemType.IMAGE_SLIDE
      ).length,
    [feedItems]
  );

  const totalStorageUsed = useMemo(
    () => feedItems.reduce((total, item) => total + getFileSize(item), 0),
    [feedItems]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Feed Items Management
          </h1>
          <p className="text-muted-foreground">
            Manage all feed items on the platform (videos, image slides, etc.)
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Feed Item
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="keyword">Keyword</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="keyword"
                  type="text"
                  placeholder="Search by title, description, or ID"
                  value={filterForm.keyword}
                  onChange={(e) => handleFilterChange("keyword", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={filterForm.type}
                onValueChange={(value) =>
                  handleFilterChange("type", value as FilterFormState["type"])
                }
              >
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value={FeedItemType.VIDEO}>Videos</SelectItem>
                  <SelectItem value={FeedItemType.IMAGE_SLIDE}>
                    Image Slides
                  </SelectItem>
                  <SelectItem value={FeedItemType.USER_DETAIL}>
                    User Details
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={filterForm.status}
                onValueChange={(value) =>
                  handleFilterChange("status", value as StatusFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Violation</Label>
              <Select
                value={filterForm.violation}
                onValueChange={(value) =>
                  handleFilterChange("violation", value as ViolationFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Violation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="CLEAR">No Violations</SelectItem>
                  <SelectItem value="VIOLATED">Violated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="createdFrom">Created From</Label>
              <Input
                id="createdFrom"
                type="date"
                value={filterForm.createdFrom}
                onChange={(e) => handleFilterChange("createdFrom", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="createdTo">Created To</Label>
              <Input
                id="createdTo"
                type="date"
                value={filterForm.createdTo}
                onChange={(e) => handleFilterChange("createdTo", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleApplyFilters} disabled={loading}>
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={loading}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feed Items</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
            <p className="text-xs text-muted-foreground">All uploaded content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videoCount}</div>
            <p className="text-xs text-muted-foreground">Video type items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Image Slides</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imageSlideCount}</div>
            <p className="text-xs text-muted-foreground">Image slide items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(totalStorageUsed)}
            </div>
            <p className="text-xs text-muted-foreground">Total storage used</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feed Items List</CardTitle>
          <CardDescription>Latest feed items and activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading feed items...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No feed items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedItems.map((item) => (
                      <TableRow key={item.feedItemId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getFeedItemIcon(item.feedItemType)}
                            {item.title || "Untitled"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getFeedItemTypeColor(item.feedItemType) as any}>
                            {item.feedItemType}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.description || "No description"}
                        </TableCell>
                        <TableCell>{formatFileSize(getFileSize(item))}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {getDisplayUrl(item) && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={getDisplayUrl(item)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {getDisplayUrl(item) && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={getDisplayUrl(item)!}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFeedItem(item.feedItemId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage(Math.max(0, currentPage - 1))
                          }
                          className={
                            currentPage === 0
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: paginationWindow.visiblePages },
                        (_, i) => {
                          const page = paginationWindow.startPage + i;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages - 1, currentPage + 1)
                            )
                          }
                          className={
                            currentPage === totalPages - 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UploadFeedItemModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onFeedItemUploaded={handleFeedItemUploaded}
      />
    </div>
  );
}

