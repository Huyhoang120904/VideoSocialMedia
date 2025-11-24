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
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { likeService, LikeResponse } from "@/services/admin/likeService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function LikesPage() {
  const [likes, setLikes] = useState<LikeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const fetchLikes = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await likeService.getLikes(page, pageSize);

      if (response.code === 1000 && response.result) {
        setLikes(response.result.content);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch likes:", error);
      toast.error("Failed to fetch likes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes(currentPage);
  }, [currentPage]);

  return (
    <ErrorBoundary context="Likes Page">
      <div className="space-y-6">
        <PageHeader
          title="Likes"
          description="Track content likes and engagement"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Likes"
            value={totalElements}
            description="All content likes"
            icon={Heart}
          />
          <StatsCard
            title="Active Likes"
            value={likes.filter((l) => l.isLiked).length}
            description="Currently liked"
            icon={Heart}
          />
          <StatsCard
            title="Total Like Count"
            value={likes.reduce((acc, l) => acc + l.likeCount, 0)}
            description="Cumulative likes"
            icon={Heart}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Likes List</CardTitle>
            <CardDescription>View all content likes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading likes...</div>
              </div>
            ) : likes.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No likes found"
                description="There are no likes to display"
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feed Item</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Like Count</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {likes.map((like) => (
                      <TableRow key={like.id}>
                        <TableCell className="font-mono text-xs">
                          {like.feedItemId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {like.userId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={like.isLiked ? "default" : "secondary"}>
                            {like.isLiked ? "Liked" : "Not Liked"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{like.likeCount}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(like.createdAt).toLocaleString()}
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

