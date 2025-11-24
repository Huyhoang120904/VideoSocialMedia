"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Ticket,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Video,
  Ban,
  Eye,
} from "lucide-react";
import {
  reportTicketService,
  ReportTicketResponse,
} from "@/services/admin/reportTicketService";
import { feedItemService } from "@/services/admin/feedItemService";
import type { FeedItemResponse } from "@/types";
import Image from "next/image";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ModerationGuard } from "@/components/admin/ModerationGuard";
import { FeedItemType } from "@/types";

interface GroupedFeedItem {
  feedItemId: string;
  feedItemType: string;
  reportCount: number;
  tickets: ReportTicketResponse[];
  pendingCount: number;
  resolvedCount: number;
  rejectedCount: number;
}

export default function ReportsPage() {
  const [reportTickets, setReportTickets] = useState<ReportTicketResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [selectedFeedItemId, setSelectedFeedItemId] = useState<string | null>(
    null
  );
  const [selectedFeedItem, setSelectedFeedItem] =
    useState<FeedItemResponse | null>(null);
  const [selectedFeedItemTickets, setSelectedFeedItemTickets] = useState<
    ReportTicketResponse[]
  >([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Group report tickets by feedItemId
  const groupedFeedItems = useMemo(() => {
    const grouped = new Map<string, GroupedFeedItem>();

    reportTickets.forEach((ticket) => {
      const feedItemId = ticket.feedItemId;
      if (!grouped.has(feedItemId)) {
        grouped.set(feedItemId, {
          feedItemId,
          feedItemType: ticket.feedItemType,
          reportCount: 0,
          tickets: [],
          pendingCount: 0,
          resolvedCount: 0,
          rejectedCount: 0,
        });
      }

      const group = grouped.get(feedItemId)!;
      group.tickets.push(ticket);
      group.reportCount++;
      if (ticket.status === "PENDING") group.pendingCount++;
      if (ticket.status === "RESOLVED") group.resolvedCount++;
      if (ticket.status === "REJECTED") group.rejectedCount++;
    });

    return Array.from(grouped.values()).sort(
      (a, b) => b.reportCount - a.reportCount
    );
  }, [reportTickets]);

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      setLoading(true);
      // Fetch a larger number to get all reports for grouping
      const response = await reportTicketService.getReportTickets(0, 100);

      if (response.code === 1000 && response.result) {
        const tickets = response.result.content;
        setReportTickets(tickets);
        setPendingCount(tickets.filter((t) => t.status === "PENDING").length);
        setResolvedCount(tickets.filter((t) => t.status === "RESOLVED").length);
        setRejectedCount(tickets.filter((t) => t.status === "REJECTED").length);
      }
    } catch (error) {
      console.error("Failed to fetch report tickets:", error);
      toast.error("Failed to fetch reports data");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedItemClick = async (feedItemId: string) => {
    try {
      setDetailLoading(true);
      setSelectedFeedItemId(feedItemId);

      // Fetch feed item details and all its report tickets
      const [feedItemResponse, ticketsResponse] = await Promise.all([
        feedItemService.getFeedItemById(feedItemId),
        reportTicketService.getReportTicketsByFeedItemId(feedItemId),
      ]);

      if (feedItemResponse.code === 1000 && feedItemResponse.result) {
        setSelectedFeedItem(feedItemResponse.result);
      }

      if (ticketsResponse.code === 1000 && ticketsResponse.result) {
        setSelectedFeedItemTickets(ticketsResponse.result);
      }

      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch feed item details:", error);
      toast.error("Failed to load feed item details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDisableFeedItem = async () => {
    if (!selectedFeedItemId) return;

    if (
      !window.confirm(
        "Are you sure you want to disable this feed item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await feedItemService.disableFeedItem(selectedFeedItemId);
      toast.success("Feed item disabled successfully");
      setIsDetailDialogOpen(false);
      fetchRecentReports(); // Refresh the list
    } catch (error) {
      console.error("Failed to disable feed item:", error);
      toast.error("Failed to disable feed item");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      PENDING: { variant: "secondary", label: "Pending" },
      RESOLVED: { variant: "default", label: "Resolved" },
      REJECTED: { variant: "destructive", label: "Rejected" },
      IN_PROGRESS: { variant: "outline", label: "In Progress" },
    };
    const statusInfo = statusMap[status] || {
      variant: "secondary" as const,
      label: status,
    };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    return <Badge variant="outline">{category}</Badge>;
  };

  return (
    <ModerationGuard>
      <ErrorBoundary context="Reports Page">
        <div className="space-y-6">
          <PageHeader
            title="Reports Dashboard"
            description="Manage content reports and flagged items"
          />

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Pending Reports"
              value={pendingCount}
              description="Awaiting review"
              icon={AlertTriangle}
            />
            <StatsCard
              title="Resolved"
              value={resolvedCount}
              description="Completed reports"
              icon={CheckCircle}
            />
            <StatsCard
              title="Rejected"
              value={rejectedCount}
              description="Rejected reports"
              icon={XCircle}
            />
            <StatsCard
              title="Reported Feed Items"
              value={groupedFeedItems.length}
              description="Unique items with reports"
              icon={Flag}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Report Tickets
                </CardTitle>
                <CardDescription>
                  Review and manage content reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/report-tickets">
                  <Button className="w-full" variant="outline">
                    View All Reports
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Flagged Content
                </CardTitle>
                <CardDescription>
                  Review content that has been flagged
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/videos/flagged">
                  <Button className="w-full" variant="outline">
                    View Flagged Content
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Report Feed Items */}
          <Card>
            <CardHeader>
              <CardTitle>Reported Feed Items</CardTitle>
              <CardDescription>
                Click on any feed item to view all reports and the content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Loading reports...
                  </div>
                </div>
              ) : groupedFeedItems.length === 0 ? (
                <EmptyState
                  icon={Flag}
                  title="No reported feed items"
                  description="There are no feed items with reports to display"
                />
              ) : (
                <div className="space-y-4">
                  {groupedFeedItems.map((group) => (
                    <div
                      key={group.feedItemId}
                      onClick={() => handleFeedItemClick(group.feedItemId)}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {group.feedItemType}
                          </span>
                          <Badge variant="outline">
                            {group.reportCount} report
                            {group.reportCount !== 1 ? "s" : ""}
                          </Badge>
                          {group.pendingCount > 0 && (
                            <Badge variant="secondary">
                              {group.pendingCount} Pending
                            </Badge>
                          )}
                          {group.resolvedCount > 0 && (
                            <Badge variant="default">
                              {group.resolvedCount} Resolved
                            </Badge>
                          )}
                          {group.rejectedCount > 0 && (
                            <Badge variant="destructive">
                              {group.rejectedCount} Rejected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Feed Item ID: {group.feedItemId.substring(0, 8)}...
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detail Dialog */}
          <Dialog
            open={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Feed Item Reports</DialogTitle>
                <DialogDescription>
                  Review all reports for this feed item and the content itself
                </DialogDescription>
              </DialogHeader>

              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Loading details...
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Video/Content Preview */}
                  {selectedFeedItem && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="h-5 w-5" />
                          Content Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedFeedItem.feedItemType === FeedItemType.VIDEO &&
                          selectedFeedItem.video && (
                            <div className="space-y-2">
                              <video
                                src={selectedFeedItem.video.url}
                                controls
                                className="w-full rounded-lg"
                                style={{ maxHeight: "400px" }}
                              />
                              <div className="text-sm text-muted-foreground">
                                <p>
                                  <strong>Title:</strong>{" "}
                                  {selectedFeedItem.title || "No title"}
                                </p>
                                <p>
                                  <strong>Description:</strong>{" "}
                                  {selectedFeedItem.description ||
                                    "No description"}
                                </p>
                                {selectedFeedItem.uploader && (
                                  <p>
                                    <strong>Uploader:</strong>{" "}
                                    {selectedFeedItem.uploader.username}
                                  </p>
                                )}
                                <p>
                                  <strong>Views:</strong>{" "}
                                  {selectedFeedItem.viewCount} |{" "}
                                  <strong>Likes:</strong>{" "}
                                  {selectedFeedItem.likeCount} |{" "}
                                  <strong>Comments:</strong>{" "}
                                  {selectedFeedItem.commentCount}
                                </p>
                              </div>
                            </div>
                          )}

                        {selectedFeedItem.feedItemType ===
                          FeedItemType.IMAGE_SLIDE &&
                          selectedFeedItem.imageSlide && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                {selectedFeedItem.imageSlide.images.map(
                                  (image: { url: string }, idx: number) => (
                                    <Image
                                      key={idx}
                                      src={image.url}
                                      alt={`Slide ${idx + 1}`}
                                      width={400}
                                      height={300}
                                      className="w-full rounded-lg object-cover"
                                    />
                                  )
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <p>
                                  <strong>Title:</strong>{" "}
                                  {selectedFeedItem.title || "No title"}
                                </p>
                                <p>
                                  <strong>Description:</strong>{" "}
                                  {selectedFeedItem.description ||
                                    "No description"}
                                </p>
                                {selectedFeedItem.uploader && (
                                  <p>
                                    <strong>Uploader:</strong>{" "}
                                    {selectedFeedItem.uploader.username}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Report Tickets */}
                  <Card>
                    <CardHeader>
                      <CardTitle>All Report Tickets</CardTitle>
                      <CardDescription>
                        {selectedFeedItemTickets.length} report ticket
                        {selectedFeedItemTickets.length !== 1 ? "s" : ""} for
                        this feed item
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedFeedItemTickets.length === 0 ? (
                        <EmptyState
                          icon={Ticket}
                          title="No reports"
                          description="No report tickets found for this feed item"
                        />
                      ) : (
                        <div className="space-y-4">
                          {selectedFeedItemTickets.map((ticket) => (
                            <div
                              key={ticket.id}
                              className="p-4 border rounded-lg space-y-2"
                            >
                              <div className="flex items-center gap-2">
                                {getStatusBadge(ticket.status)}
                                {getCategoryBadge(ticket.reportCategory)}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(ticket.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">
                                <strong>Reason:</strong>{" "}
                                {ticket.reason || "No reason provided"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Reporter ID: {ticket.reporterId}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleDisableFeedItem}
                      disabled={!selectedFeedItemId}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Disable Feed Item
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </ErrorBoundary>
    </ModerationGuard>
  );
}
