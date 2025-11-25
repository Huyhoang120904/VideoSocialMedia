"use client";
import React, { useState, useEffect } from "react";
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
  Shield,
  Ticket,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  MessageSquare,
  Ban,
  Eye,
} from "lucide-react";
import {
  reportTicketService,
  ReportTicketResponse,
} from "@/services/admin/reportTicketService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ModerationGuard } from "@/components/admin/ModerationGuard";
import useAuthStore from "@/hooks/useAuthStore";
import { useViolatedFeedItems } from "@/hooks/queries";
import { FeedItemUploadResponse } from "@/types";

export default function ModerationPage() {
  const { user } = useAuthStore();
  const [reportTickets, setReportTickets] = useState<ReportTicketResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [violatedPage, setViolatedPage] = useState(0);

  // Check if user has moderation access
  const hasModerationAccess =
    user?.role === "admin" || user?.role === "moderator";

  // Fetch violated feed items
  const {
    data: violatedFeedItemsData,
    isLoading: isLoadingViolated,
    error: violatedError,
  } = useViolatedFeedItems(violatedPage, 10);

  useEffect(() => {
    if (!hasModerationAccess) {
      toast.error("You don't have permission to access this page");
      return;
    }

    fetchRecentReports();
  }, [hasModerationAccess]);

  const fetchRecentReports = async () => {
    try {
      setLoading(true);
      const response = await reportTicketService.getReportTickets(0, 10);

      if (response.code === 1000 && response.result) {
        const tickets = response.result.content;
        setReportTickets(tickets);
        setPendingCount(tickets.filter((t) => t.status === "PENDING").length);
        setResolvedCount(tickets.filter((t) => t.status === "RESOLVED").length);
        setRejectedCount(tickets.filter((t) => t.status === "REJECTED").length);
      }
    } catch (error) {
      console.error("Failed to fetch report tickets:", error);
      toast.error("Failed to fetch moderation data");
    } finally {
      setLoading(false);
    }
  };

  if (!hasModerationAccess) {
    return (
      <ErrorBoundary context="Moderation Page">
        <div className="space-y-6">
          <PageHeader
            title="Moderation Dashboard"
            description="Access denied. You need moderator or admin privileges."
          />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                You don&apos;t have the required permissions to access the
                moderation dashboard. Please contact an administrator if you
                believe this is an error.
              </p>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ModerationGuard>
      <ErrorBoundary context="Moderation Page">
        <div className="space-y-6">
          <PageHeader
            title="Moderation Dashboard"
            description="Review and manage content reports and flagged items"
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
              title="Total Reports"
              value={reportTickets.length}
              description="All report tickets"
              icon={Ticket}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments
                </CardTitle>
                <CardDescription>Moderate user comments</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/comments">
                  <Button className="w-full" variant="outline">
                    Manage Comments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Violated Feed Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                Violated Feed Items
              </CardTitle>
              <CardDescription>
                Feed items that have been flagged and disabled due to violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingViolated ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Loading violated feed items...
                  </div>
                </div>
              ) : violatedError ? (
                <EmptyState
                  icon={Ban}
                  title="Error loading violated items"
                  description="Failed to fetch violated feed items. Please try again."
                />
              ) : !violatedFeedItemsData?.result ||
                violatedFeedItemsData.result.feedItems.content.length === 0 ? (
                <EmptyState
                  icon={Ban}
                  title="No violated feed items"
                  description="There are no feed items that have been flagged as violated"
                />
              ) : (
                <div className="space-y-4">
                  {violatedFeedItemsData.result.feedItems.content.map(
                    (feedItem: FeedItemUploadResponse) => (
                      <div
                        key={feedItem.feedItemId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {feedItem.feedItemType}
                            </span>
                            <Badge variant="destructive">Violated</Badge>
                            {feedItem.title && (
                              <Badge variant="outline">{feedItem.title}</Badge>
                            )}
                          </div>
                          {feedItem.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {feedItem.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-muted-foreground">
                              ID: {feedItem.feedItemId.substring(0, 8)}...
                            </p>
                            {feedItem.likeCount !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Likes: {feedItem.likeCount}
                              </p>
                            )}
                            {feedItem.viewCount !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Views: {feedItem.viewCount}
                              </p>
                            )}
                          </div>
                        </div>
                        <Link href={`/admin/reports/${feedItem.feedItemId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    )
                  )}
                  {violatedFeedItemsData.result.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Page {violatedPage + 1} of{" "}
                        {violatedFeedItemsData.result.totalPages} (
                        {violatedFeedItemsData.result.totalElements} total items)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViolatedPage((p) => Math.max(0, p - 1))}
                          disabled={violatedPage === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setViolatedPage((p) =>
                              p < violatedFeedItemsData.result.totalPages - 1
                                ? p + 1
                                : p
                            )
                          }
                          disabled={
                            violatedPage >=
                            violatedFeedItemsData.result.totalPages - 1
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Report Tickets</CardTitle>
              <CardDescription>
                Latest reports requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Loading reports...
                  </div>
                </div>
              ) : reportTickets.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="No reports found"
                  description="There are no report tickets to display"
                />
              ) : (
                <div className="space-y-4">
                  {reportTickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {ticket.feedItemType}
                          </span>
                          <Badge
                            variant={
                              ticket.status === "PENDING"
                                ? "secondary"
                                : ticket.status === "RESOLVED"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {ticket.status}
                          </Badge>
                          <Badge variant="outline">
                            {ticket.reportCategory}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {ticket.reason || "No reason provided"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Link href={`/admin/report-tickets`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {reportTickets.length > 5 && (
                    <div className="pt-2">
                      <Link href="/admin/report-tickets">
                        <Button variant="outline" className="w-full">
                          View All Reports
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    </ModerationGuard>
  );
}
