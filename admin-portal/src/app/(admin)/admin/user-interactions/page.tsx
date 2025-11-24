"use client";
import React, { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, Users } from "lucide-react";
import { UserInteractionResponse } from "@/services/admin/userInteractionService";
import {
  PageHeader,
  StatsCard,
  EmptyState,
  LoadingSpinner,
} from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useUserInteractions } from "@/hooks/queries";

export default function UserInteractionsPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [userIdQuery, setUserIdQuery] = useState("");
  const [activeUserFilter, setActiveUserFilter] = useState<string | undefined>();
  const pageSize = 20;

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useUserInteractions({
    page: currentPage,
    size: pageSize,
    userDetailId: activeUserFilter,
  });

  const pagedResult = data?.result;
  const interactions = pagedResult?.content ?? [];
  const totalPages = pagedResult?.totalPages ?? 0;
  const totalElements = pagedResult?.totalElements ?? 0;

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    const parts = [];
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(" ");
  };

  const formatInteractionType = (type?: string) => {
    if (!type) return "Unknown";
    return type
      .toLowerCase()
      .split("_")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  };

  const uniqueUsers = useMemo(() => {
    return new Set(
      interactions.map((interaction: UserInteractionResponse) => interaction.userId)
    ).size;
  }, [interactions]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 0) return [];
    if (totalPages === 1) return [0];
    const maxPagesToShow = 5;
    const start = Math.max(
      0,
      Math.min(
        currentPage - Math.floor(maxPagesToShow / 2),
        totalPages - maxPagesToShow
      )
    );
    const end = Math.min(totalPages, start + maxPagesToShow);
    return Array.from({ length: end - start }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = userIdQuery.trim();
    setActiveUserFilter(trimmed || undefined);
    setCurrentPage(0);
  };

  const clearFilter = () => {
    setUserIdQuery("");
    setActiveUserFilter(undefined);
    setCurrentPage(0);
  };

  if (error) {
    throw error;
  }

  return (
    <ErrorBoundary context="User Interactions Page">
      <div className="space-y-6">
        <PageHeader
          title="User Interactions"
          description="Track user engagement and interactions"
          action={
            <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
              <Input
                placeholder="Filter by User Detail ID"
                value={userIdQuery}
                onChange={(event) => setUserIdQuery(event.target.value)}
                className="w-64"
              />
              <Button type="submit">Search</Button>
              {activeUserFilter && (
                <Button type="button" variant="ghost" onClick={clearFilter}>
                  Reset
                </Button>
              )}
            </form>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Interactions"
            value={totalElements.toLocaleString()}
            description="All user interactions"
            icon={Activity}
          />
          <StatsCard
            title="Unique Users"
            value={uniqueUsers.toLocaleString()}
            description="Users with interactions"
            icon={Users}
          />
        </div>

        {activeUserFilter && (
          <div className="flex items-center justify-between rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground">
            <span>
              Showing interactions for user detail ID{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                {activeUserFilter}
              </code>
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilter}>
              Clear filter
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Interactions List</CardTitle>
            <CardDescription>View all user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner text="Loading interactions..." className="py-8" />
            ) : interactions.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No interactions found"
                description={
                  activeUserFilter
                    ? "No interactions found for the selected user detail ID."
                    : "There are no user interactions to display."
                }
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
                      <TableHead>Watch %</TableHead>
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
                        <TableCell>{formatInteractionType(interaction.interactionType)}</TableCell>
                        <TableCell>{formatDuration(interaction.duration)}</TableCell>
                        <TableCell>
                          {typeof interaction.watchPercentage === "number"
                            ? `${Math.round(interaction.watchPercentage)}%`
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {isFetching && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Refreshing data…
                  </p>
                )}

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

                        {visiblePages.map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

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

