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
import { MessageSquare, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { commentService, CommentResponse } from "@/services/admin/commentService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const fetchComments = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await commentService.getComments(page, pageSize);

      if (response.code === 1000 && response.result) {
        setComments(response.result.content);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(currentPage);
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await commentService.deleteComment(id);
        toast.success("Comment deleted successfully");
        fetchComments(currentPage);
      } catch (error) {
        console.error("Failed to delete comment:", error);
        toast.error("Failed to delete comment");
      }
    }
  };

  return (
    <ErrorBoundary context="Comments Page">
      <div className="space-y-6">
        <PageHeader
          title="Comments"
          description="Manage and moderate user comments"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Comments"
            value={totalElements}
            description="All comments"
            icon={MessageSquare}
          />
          <StatsCard
            title="Total Likes"
            value={comments.reduce((acc, c) => acc + c.likeCount, 0)}
            description="Comment likes"
            icon={ThumbsUp}
          />
          <StatsCard
            title="Total Dislikes"
            value={comments.reduce((acc, c) => acc + c.dislikeCount, 0)}
            description="Comment dislikes"
            icon={ThumbsDown}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comments List</CardTitle>
            <CardDescription>View and manage all comments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading comments...</div>
              </div>
            ) : comments.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No comments found"
                description="There are no comments to display"
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Feed Item</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Dislikes</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell className="font-medium">
                          {comment.username || comment.userId.substring(0, 8)}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {comment.content}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {comment.feedItemId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            <span>{comment.likeCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                            <span>{comment.dislikeCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

