"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  FileText,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ragService } from "@/services/admin/ragService";
import { toast } from "sonner";
import { RagQueryResponse, DocumentResponse } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  retrievedDocuments?: DocumentResponse[];
}

function RagPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topK, setTopK] = useState(5);
  const [includeContext, setIncludeContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DocumentResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await ragService.queryWithRag({
        question: query,
        topK,
        includeContext,
      });

      if (response.result) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.result.answer,
          timestamp: new Date(),
          retrievedDocuments: response.result.retrievedDocuments,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error("Error querying RAG:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to process query. Please try again."
      );

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error.response?.data?.message || "Failed to process query"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const response = await ragService.searchDocuments(searchQuery, topK);
      if (response.result) {
        setSearchResults(response.result);
        toast.success(`Found ${response.result.length} similar documents`);
      }
    } catch (error: any) {
      console.error("Error searching documents:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to search documents. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="RAG Query Interface"
        description="Query your knowledge base using Retrieval-Augmented Generation"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chat with RAG</CardTitle>
                  <CardDescription>
                    Ask questions and get AI-powered answers based on your
                    ingested documents
                  </CardDescription>
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearChat}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto space-y-4 rounded-lg border p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                    <div>
                      <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Start a conversation by asking a question</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.retrievedDocuments &&
                          message.retrievedDocuments.length > 0 && (
                            <div className="mt-2 space-y-1 border-t pt-2">
                              <p className="text-xs font-semibold">
                                Retrieved Documents:
                              </p>
                              {message.retrievedDocuments.map((doc, index) => (
                                <div
                                  key={index}
                                  className="text-xs opacity-75"
                                >
                                  <FileText className="inline h-3 w-3 mr-1" />
                                  {doc.documentId}
                                  {doc.similarityScore !== undefined && (
                                    <span className="ml-1">
                                      ({(doc.similarityScore * 100).toFixed(1)}%)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        <p className="mt-1 text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-muted p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Query Input */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Ask a question about your documents..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="topK" className="text-sm">
                        Top K:
                      </Label>
                      <Input
                        id="topK"
                        type="number"
                        min="1"
                        max="20"
                        value={topK}
                        onChange={(e) =>
                          setTopK(parseInt(e.target.value) || 5)
                        }
                        className="w-16"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeContext"
                        checked={includeContext}
                        onChange={(e) => setIncludeContext(e.target.checked)}
                        disabled={isLoading}
                        className="rounded"
                      />
                      <Label htmlFor="includeContext" className="text-sm">
                        Include Context
                      </Label>
                    </div>
                  </div>
                  <Button
                    onClick={handleQuery}
                    disabled={isLoading || !query.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Search</CardTitle>
              <CardDescription>
                Search for similar documents in the vector store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  disabled={isSearching}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="w-full"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Search Results:</p>
                  <div className="max-h-[400px] space-y-2 overflow-y-auto">
                    {searchResults.map((doc, index) => (
                      <div
                        key={index}
                        className="rounded-lg border p-3 text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{doc.documentId}</p>
                            {doc.similarityScore !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Similarity: {(doc.similarityScore * 100).toFixed(1)}%
                              </p>
                            )}
                            {doc.content && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {doc.content.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function RagPage() {
  return (
    <ErrorBoundary context="RAG Page">
      <RagPageContent />
    </ErrorBoundary>
  );
}

