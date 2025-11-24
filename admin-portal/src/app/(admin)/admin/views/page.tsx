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
import { Eye } from "lucide-react";
import { viewService, ViewResponse } from "@/services/admin/viewService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function ViewsPage() {
  const [views, setViews] = useState<ViewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const fetchViews = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await viewService.getViews(page, pageSize);

      if (response.code === 1000 && response.result) {
        setViews(response.result.content);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch views:", error);
      toast.error("Failed to fetch views");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViews(currentPage);
  }, [currentPage]);

  return (
    <ErrorBoundary context="Views Page">
      <div className="space-y-6">
        <PageHeader
          title="Views"
          description="Track content views and engagement"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Views"
            value={totalElements}
            description="All content views"
            icon={Eye}
          />
          <StatsCard
            title="Total View Count"
            value={views.reduce((acc, v) => acc + v.viewCount, 0)}
            description="Cumulative views"
            icon={Eye}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Views List</CardTitle>
            <CardDescription>View all content views</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading views...</div>
              </div>
            ) : views.length === 0 ? (
              <EmptyState
                icon={Eye}
                title="No views found"
                description="There are no views to display"
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feed Item</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>View Count</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {views.map((view) => (
                      <TableRow key={view.id}>
                        <TableCell className="font-mono text-xs">
                          {view.feedItemId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {view.userId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">{view.viewCount}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(view.createdAt).toLocaleString()}
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

