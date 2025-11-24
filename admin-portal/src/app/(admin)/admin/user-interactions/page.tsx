"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Activity } from "lucide-react";
import { userInteractionService, UserInteractionResponse } from "@/services/admin/userInteractionService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function UserInteractionsPage() {
  const [interactions, setInteractions] = useState<UserInteractionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const fetchInteractions = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await userInteractionService.getUserInteractions(page, pageSize);

      if (response.code === 1000 && response.result) {
        setInteractions(response.result.content);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch user interactions:", error);
      toast.error("Failed to fetch user interactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions(currentPage);
  }, [currentPage]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <ErrorBoundary context="User Interactions Page">
      <div className="space-y-6">
        <PageHeader
          title="User Interactions"
          description="Track user engagement and interactions"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Interactions"
            value={totalElements}
            description="All user interactions"
            icon={Activity}
          />
          <StatsCard
            title="Unique Users"
            value={new Set(interactions.map((i) => i.userId)).size}
            description="Users with interactions"
            icon={Activity}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interactions List</CardTitle>
            <CardDescription>View all user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading interactions...</div>
              </div>
            ) : interactions.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No interactions found"
                description="There are no user interactions to display"
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Feed Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interactions.map((interaction) => (
                      <TableRow key={interaction.id}>
                        <TableCell className="font-mono text-xs">
                          {interaction.userId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {interaction.feedItemId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{interaction.interactionType}</TableCell>
                        <TableCell>{formatDuration(interaction.duration)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(interaction.timestamp).toLocaleString()}
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
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
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
                              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
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
  );
}

