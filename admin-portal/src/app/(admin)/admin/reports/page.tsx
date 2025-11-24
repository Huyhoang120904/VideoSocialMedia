"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Ticket,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Eye,
} from "lucide-react";
import {
  reportTicketService,
  ReportTicketResponse,
} from "@/services/admin/reportTicketService";
import { feedItemService } from "@/services/admin/feedItemService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ModerationGuard } from "@/components/admin/ModerationGuard";

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
  const router = useRouter();
  const [reportTickets, setReportTickets] = useState<ReportTicketResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [violatedFeedItemIds, setViolatedFeedItemIds] = useState<Set<string>>(
    new Set()
  );

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

    return Array.from(grouped.values())
      .filter((group) => !violatedFeedItemIds.has(group.feedItemId))
      .sort((a, b) => b.reportCount - a.reportCount);
  }, [reportTickets, violatedFeedItemIds]);

  const fetchViolatedFeedItemIds = async (): Promise<Set<string>> => {
    const ids = new Set<string>();
    const pageSize = 50;
    let page = 0;
    let totalPages = 1;

    try {
      do {
        const response = await feedItemService.getViolatedFeedItems(
          page,
          pageSize
        );

        if (response.code !== 1000 || !response.result) {
          break;
        }

        const feedItemsPage = response.result.feedItems;
        feedItemsPage.content?.forEach((item) => {
          ids.add(item.feedItemId);
        });

        totalPages = feedItemsPage.totalPages;
        page += 1;
      } while (page < totalPages);
    } catch (error) {
      console.error("Failed to fetch violated feed items:", error);
    }

    return ids;
  };

  useEffect(() => {
    const fetchReportsAndViolated = async () => {
      try {
        setLoading(true);
        const [reportsResponse, violatedIds] = await Promise.all([
          reportTicketService.getReportTickets(0, 100),
          fetchViolatedFeedItemIds(),
        ]);

        if (reportsResponse.code === 1000 && reportsResponse.result) {
          const tickets = reportsResponse.result.content;
          setReportTickets(tickets);
          setPendingCount(tickets.filter((t) => t.status === "PENDING").length);
          setResolvedCount(
            tickets.filter((t) => t.status === "RESOLVED").length
          );
          setRejectedCount(
            tickets.filter((t) => t.status === "REJECTED").length
          );
        }

        setViolatedFeedItemIds(violatedIds);
      } catch (error) {
        console.error("Failed to fetch report tickets:", error);
        toast.error("Failed to fetch reports data");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsAndViolated();
  }, []);

  const handleFeedItemClick = (feedItemId: string) => {
    router.push(`/admin/reports/${feedItemId}`);
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
                  Violated Feed Items
                </CardTitle>
                <CardDescription>
                  View all feed items that have been disabled due to violations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/violated-feed-items">
                  <Button className="w-full" variant="outline">
                    View Violated Items
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
        </div>
      </ErrorBoundary>
    </ModerationGuard>
  );
}
