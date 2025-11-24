"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Ban,
  Video,
  Image as ImageIcon,
  Eye,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import { feedItemService } from "@/services/admin/feedItemService";
import { FeedItemUploadResponse, FeedItemType } from "@/types";
import Image from "next/image";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ModerationGuard } from "@/components/admin/ModerationGuard";

export default function ViolatedFeedItemsPage() {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState<FeedItemUploadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    fetchViolatedFeedItems();
  }, [currentPage]);

  const fetchViolatedFeedItems = async () => {
    try {
      setLoading(true);
      const response = await feedItemService.getViolatedFeedItems(
        currentPage,
        pageSize
      );

      if (response.code === 1000 && response.result) {
        setFeedItems(response.result.feedItems.content);
        setTotalPages(response.result.feedItems.totalPages);
        setTotalElements(response.result.feedItems.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch violated feed items:", error);
      toast.error("Failed to fetch violated feed items");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (feedItemId: string) => {
    router.push(`/admin/reports/${feedItemId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ModerationGuard>
      <ErrorBoundary context="Violated Feed Items Page">
        <div className="space-y-6">
          <PageHeader
            title="Violated Feed Items"
            description="View all feed items that have been disabled due to violations"
          />

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Violated Items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalElements}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Current Page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentPage + 1} / {totalPages || 1}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Items Per Page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pageSize}</div>
              </CardContent>
            </Card>
          </div>

          {/* Feed Items Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <div className="text-muted-foreground">Loading violated feed items...</div>
              </div>
            </div>
          ) : feedItems.length === 0 ? (
            <EmptyState
              icon={Ban}
              title="No violated feed items"
              description="There are no feed items that have been flagged as violated"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedItems.map((item) => (
                  <Card
                    key={item.feedItemId}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.feedItemType === FeedItemType.VIDEO ? (
                            <Video className="h-4 w-4 text-primary" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-primary" />
                          )}
                          <CardTitle className="text-base">
                            {item.feedItemType.replace("_", " ")}
                          </CardTitle>
                        </div>
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Violated
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Thumbnail/Preview */}
                      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                        {item.feedItemType === FeedItemType.VIDEO &&
                          item.video && (
                            <div className="relative w-full h-full">
                              {item.thumbnailUrl ? (
                                <Image
                                  src={item.thumbnailUrl}
                                  alt={item.title || "Video thumbnail"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Video className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Video className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          )}
                        {item.feedItemType === FeedItemType.IMAGE_SLIDE &&
                          item.images &&
                          item.images.length > 0 && (
                            <Image
                              src={item.images[0].url}
                              alt={item.title || "Image slide"}
                              fill
                              className="object-cover"
                            />
                          )}
                        {!item.video &&
                          (!item.images || item.images.length === 0) && (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                      </div>

                      {/* Content Info */}
                      <div className="space-y-2">
                        {item.title && (
                          <h3 className="font-semibold line-clamp-2">
                            {item.title}
                          </h3>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {item.video?.createdAt
                              ? formatDate(item.video.createdAt)
                              : "Unknown"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDetails(item.feedItemId)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details & Reports
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
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

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i;
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
                      })}

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
        </div>
      </ErrorBoundary>
    </ModerationGuard>
  );
}

