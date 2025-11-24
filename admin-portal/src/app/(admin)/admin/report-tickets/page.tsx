"use client";
import React, { useState, useEffect } from "react";
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
import { Ticket, Filter, CheckCircle, XCircle } from "lucide-react";
import {
  reportTicketService,
  ReportTicketResponse,
} from "@/services/admin/reportTicketService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ModerationGuard } from "@/components/admin/ModerationGuard";

export default function ReportTicketsPage() {
  const [reportTickets, setReportTickets] = useState<ReportTicketResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const pageSize = 10;

  const fetchReportTickets = async (page: number = 0, category?: string) => {
    try {
      setLoading(true);
      let response;

      if (category && category !== "ALL") {
        response = await reportTicketService.getReportTicketsByCategory(
          category,
          page,
          pageSize
        );
      } else {
        response = await reportTicketService.getReportTickets(page, pageSize);
      }

      if (response.code === 1000 && response.result) {
        setReportTickets(response.result.content);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch report tickets:", error);
      toast.error("Failed to fetch report tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const category = filterCategory === "ALL" ? undefined : filterCategory;
    fetchReportTickets(currentPage, category);
  }, [currentPage, filterCategory]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await reportTicketService.updateReportTicket(id, { status });
      toast.success("Report ticket updated successfully");
      fetchReportTickets(
        currentPage,
        filterCategory === "ALL" ? undefined : filterCategory
      );
    } catch (error) {
      console.error("Failed to update report ticket:", error);
      toast.error("Failed to update report ticket");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report ticket?")) {
      try {
        await reportTicketService.deleteReportTicket(id);
        toast.success("Report ticket deleted successfully");
        fetchReportTickets(
          currentPage,
          filterCategory === "ALL" ? undefined : filterCategory
        );
      } catch (error) {
        console.error("Failed to delete report ticket:", error);
        toast.error("Failed to delete report ticket");
      }
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
      <ErrorBoundary context="Report Tickets Page">
        <div className="space-y-6">
          <PageHeader
            title="Report Tickets"
            description="Manage and review content reports from users"
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Reports"
              value={totalElements}
              description="All report tickets"
              icon={Ticket}
            />
            <StatsCard
              title="Pending"
              value={reportTickets.filter((t) => t.status === "PENDING").length}
              description="Awaiting review"
              icon={Ticket}
            />
            <StatsCard
              title="Resolved"
              value={
                reportTickets.filter((t) => t.status === "RESOLVED").length
              }
              description="Completed reports"
              icon={CheckCircle}
            />
            <StatsCard
              title="Rejected"
              value={
                reportTickets.filter((t) => t.status === "REJECTED").length
              }
              description="Rejected reports"
              icon={XCircle}
            />
          </div>

          <div className="flex gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="SPAM">Spam</SelectItem>
                <SelectItem value="INAPPROPRIATE">Inappropriate</SelectItem>
                <SelectItem value="COPYRIGHT">Copyright</SelectItem>
                <SelectItem value="HARASSMENT">Harassment</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Tickets</CardTitle>
              <CardDescription>
                Review and manage content reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Loading report tickets...
                  </div>
                </div>
              ) : reportTickets.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="No report tickets found"
                  description="There are no report tickets to display"
                />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Feed Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-mono text-xs">
                            {ticket.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {ticket.feedItemType}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {ticket.feedItemId.substring(0, 8)}...
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getCategoryBadge(ticket.reportCategory)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {ticket.reason || "No reason provided"}
                          </TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(ticket.id, "RESOLVED")
                                }
                                disabled={ticket.status === "RESOLVED"}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(ticket.id, "REJECTED")
                                }
                                disabled={ticket.status === "REJECTED"}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(ticket.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
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
        </div>
      </ErrorBoundary>
    </ModerationGuard>
  );
}
