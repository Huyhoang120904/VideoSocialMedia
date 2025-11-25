"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { MessageSquare, Search, Trash2 } from "lucide-react";
import { chatMessageService, ChatMessageResponse } from "@/services/admin/chatMessageService";
import { toast } from "sonner";
import { PageHeader, StatsCard, EmptyState } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function ChatMessagesPage() {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [conversationId, setConversationId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 20;

  const fetchMessages = async (page: number = 0) => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await chatMessageService.getChatMessagesByConversation(
        conversationId,
        page,
        pageSize
      );

      if (response.code === 1000 && response.result) {
        setMessages(response.result.content);
        setTotalPages(response.result.totalPages);
        setTotalElements(response.result.totalElements);
      }
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      toast.error("Failed to fetch chat messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(currentPage);
  }, [currentPage, conversationId]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await chatMessageService.deleteMessage(id);
        toast.success("Message deleted successfully");
        fetchMessages(currentPage);
      } catch (error) {
        console.error("Failed to delete message:", error);
        toast.error("Failed to delete message");
      }
    }
  };

  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ErrorBoundary context="Chat Messages Page">
      <div className="space-y-6">
        <PageHeader
          title="Chat Messages"
          description="View and manage chat messages"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Messages"
            value={totalElements}
            description="All chat messages"
            icon={MessageSquare}
          />
          <StatsCard
            title="Unread Messages"
            value={messages.filter((m) => !m.isRead).length}
            description="Messages not yet read"
            icon={MessageSquare}
          />
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Enter Conversation ID"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            className="max-w-sm"
          />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chat Messages</CardTitle>
            <CardDescription>
              {conversationId
                ? `Messages for conversation: ${conversationId.substring(0, 8)}...`
                : "Enter a conversation ID to view messages"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!conversationId ? (
              <EmptyState
                icon={MessageSquare}
                title="No conversation selected"
                description="Enter a conversation ID to view messages"
              />
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading messages...</div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No messages found"
                description={
                  searchTerm
                    ? "No messages match your search"
                    : "There are no messages in this conversation"
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sender</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">
                          {message.senderName || message.senderId.substring(0, 8)}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {message.content}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{message.messageType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={message.isRead ? "default" : "secondary"}>
                            {message.isRead ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(message.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

