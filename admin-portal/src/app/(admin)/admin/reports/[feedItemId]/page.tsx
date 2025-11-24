"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  Video,
  Ban,
  ArrowLeft,
  User,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { ReportTicketResponse } from "@/services/admin/reportTicketService";
import { feedItemService } from "@/services/admin/feedItemService";
import type { FeedItemResponse } from "@/types";
import Image from "next/image";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ModerationGuard } from "@/components/admin/ModerationGuard";
import { FeedItemType } from "@/types";

export default function FeedItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const feedItemId = params.feedItemId as string;

  const [feedItem, setFeedItem] = useState<FeedItemResponse | null>(null);
  const [reportTickets, setReportTickets] = useState<ReportTicketResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState(false);

  const topCategoryStats = useMemo(() => {
    const counts = new Map<string, number>();

    reportTickets.forEach((ticket) => {
      const category = ticket.reportCategory || "UNKNOWN";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    });

    const total = reportTickets.length || 1;
    const categories = Array.from(counts.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: reportTickets.length,
      categories,
    };
  }, [reportTickets]);

  useEffect(() => {
    if (feedItemId) {
      fetchFeedItemDetails();
    }
  }, [feedItemId]);

  const fetchFeedItemDetails = async () => {
    try {
      setLoading(true);

      // Fetch feed item details and all its report tickets
      const [feedItemResponse, ticketsResponse] = await Promise.all([
        feedItemService.getFeedItemById(feedItemId),
        feedItemService.getReportsByFeedItemId(feedItemId),
      ]);

      if (feedItemResponse.code === 1000 && feedItemResponse.result) {
        setFeedItem(feedItemResponse.result);
      }

      if (ticketsResponse.code === 1000 && ticketsResponse.result) {
        setReportTickets(ticketsResponse.result.reports ?? []);
      } else {
        setReportTickets([]);
      }
    } catch (error) {
      console.error("Failed to fetch feed item details:", error);
      toast.error("Failed to load feed item details");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableFeedItem = async () => {
    if (!feedItemId) return;

    if (
      !window.confirm(
        "Are you sure you want to disable this feed item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDisabling(true);
      await feedItemService.disableFeedItem(feedItemId);
      toast.success("Feed item disabled successfully");
      router.push("/admin/reports");
    } catch (error) {
      console.error("Failed to disable feed item:", error);
      toast.error("Failed to disable feed item");
    } finally {
      setDisabling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
        icon: React.ReactNode;
      }
    > = {
      PENDING: {
        variant: "secondary",
        label: "Pending",
        icon: <Clock className="h-3 w-3" />,
      },
      RESOLVED: {
        variant: "default",
        label: "Resolved",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      REJECTED: {
        variant: "destructive",
        label: "Rejected",
        icon: <XCircle className="h-3 w-3" />,
      },
      IN_PROGRESS: {
        variant: "outline",
        label: "In Progress",
        icon: <Clock className="h-3 w-3" />,
      },
    };
    const statusInfo = statusMap[status] || {
      variant: "secondary" as const,
      label: status,
      icon: <AlertCircle className="h-3 w-3" />,
    };
    return (
      <Badge variant={statusInfo.variant} className="gap-1">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    return (
      <Badge variant="outline" className="font-medium">
        {category}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ModerationGuard>
      <ErrorBoundary context="Feed Item Detail Page">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/reports")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Reports
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Feed Item Reports
                </h1>
                <p className="text-muted-foreground">
                  Review all reports for this feed item and the content itself
                </p>
              </div>
            </div>
            {!loading && feedItem && (
              <Button
                variant="destructive"
                onClick={handleDisableFeedItem}
                disabled={disabling}
                className="gap-2"
              >
                <Ban className="h-4 w-4" />
                {disabling ? "Disabling..." : "Disable Feed Item"}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <div className="text-muted-foreground">Loading details...</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Content Preview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Content Preview Card */}
                {feedItem && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {feedItem.feedItemType === FeedItemType.VIDEO ? (
                            <Video className="h-5 w-5 text-primary" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-primary" />
                          )}
                          <CardTitle>Content Preview</CardTitle>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {feedItem.feedItemType.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Video/Image Display */}
                      {feedItem.feedItemType === FeedItemType.VIDEO &&
                        feedItem.video && (
                          <div className="space-y-4">
                            <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
                              <video
                                src={feedItem.video.url}
                                controls
                                className="w-full h-full"
                              />
                            </div>
                            <Separator />
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">
                                  {feedItem.title || "Untitled"}
                                </h3>
                                {feedItem.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {feedItem.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {feedItem.feedItemType === FeedItemType.IMAGE_SLIDE &&
                        feedItem.imageSlide && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {feedItem.imageSlide.images.map(
                                (image: { url: string }, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                                  >
                                    <Image
                                      src={image.url}
                                      alt={`Slide ${idx + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                            <Separator />
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">
                                  {feedItem.title || "Untitled"}
                                </h3>
                                {feedItem.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {feedItem.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Metadata */}
                      <Separator />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Views
                            </p>
                            <p className="font-semibold">
                              {feedItem.viewCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Likes
                            </p>
                            <p className="font-semibold">
                              {feedItem.likeCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Comments
                            </p>
                            <p className="font-semibold">
                              {feedItem.commentCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Created
                            </p>
                            <p className="font-semibold text-xs">
                              {formatDate(feedItem.createdAt).split(",")[0]}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Uploader Info */}
                      {feedItem.uploader && (
                        <>
                          <Separator />
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Uploaded by
                              </p>
                              <p className="font-medium">
                                {feedItem.uploader.username}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Reports */}
              <div className="space-y-6">
                {/* Top Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5" />
                      Top Report Categories
                    </CardTitle>
                    <CardDescription>
                      Highest volume categories for this feed item
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topCategoryStats.categories.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center">
                        No report categories available yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {topCategoryStats.categories.map((category) => (
                          <div key={category.category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  {category.category}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {category.count} report
                                  {category.count !== 1 ? "s" : ""} (
                                  {category.percentage}%)
                                </p>
                              </div>
                              <Badge variant="outline">
                                {category.percentage}%
                              </Badge>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary transition-all"
                                style={{
                                  width: `${Math.max(
                                    category.percentage,
                                    4
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <p className="text-xs text-muted-foreground text-right">
                          Total reports: {topCategoryStats.total}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Report Tickets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      All Reports
                    </CardTitle>
                    <CardDescription>
                      {reportTickets.length} report ticket
                      {reportTickets.length !== 1 ? "s" : ""} for this feed item
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reportTickets.length === 0 ? (
                      <EmptyState
                        icon={Ticket}
                        title="No reports"
                        description="No report tickets found for this feed item"
                      />
                    ) : (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {reportTickets.map((ticket) => (
                          <Card
                            key={ticket.id}
                            className="border-l-4 border-l-primary/50"
                          >
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {getStatusBadge(ticket.status)}
                                    {getCategoryBadge(ticket.reportCategory)}
                                  </div>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDate(ticket.createdAt)}
                                  </span>
                                </div>
                                {ticket.reason && (
                                  <>
                                    <Separator />
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground mb-1">
                                        Reason
                                      </p>
                                      <p className="text-sm">{ticket.reason}</p>
                                    </div>
                                  </>
                                )}
                                <Separator />
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>
                                    Reporter: {ticket.reporterId.substring(0, 8)}
                                    ...
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </ModerationGuard>
  );
}
