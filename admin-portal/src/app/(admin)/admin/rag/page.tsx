"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import {
  aiChatService,
  ConversationParticipantResponse,
} from "@/services/admin/aiChatService";
import {
  chatMessageService,
  ChatMessageResponse,
} from "@/services/admin/chatMessageService";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AI_ASSISTANT_USER_KEY = "ai-system";

function RagPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConversationLoading, setIsConversationLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [aiUserDetailId, setAiUserDetailId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mapChatMessageToDisplay = useCallback(
    (
      message: ChatMessageResponse,
      assistantIdOverride?: string | null
    ): Message => {
      const createdAt = message.createdAt
        ? new Date(message.createdAt)
        : new Date();
      const senderName = message.sender?.toLowerCase() || "";
      const assistantCandidate =
        assistantIdOverride ?? aiUserDetailId ?? null;
      const isAssistant =
        (assistantCandidate && message.senderId === assistantCandidate) ||
        senderName.includes("assistant") ||
        senderName.startsWith("ai");

      return {
        id: message.id,
        role: isAssistant ? "assistant" : "user",
        content: message.message || "",
        timestamp: createdAt,
      };
    },
    [aiUserDetailId]
  );

  const loadMessages = useCallback(
    async (
      targetConversationId: string | null,
      assistantIdOverride?: string | null
    ) => {
      if (!targetConversationId) {
        return;
      }
      setIsHistoryLoading(true);
      try {
        const response =
          await chatMessageService.getChatMessagesByConversation(
            targetConversationId,
            0,
            50
          );

        if (response.code === 1000 && response.result) {
          const sortedMessages = [...(response.result.content || [])].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          setMessages(
            sortedMessages.map((chatMessage) =>
              mapChatMessageToDisplay(chatMessage, assistantIdOverride)
            )
          );
        }
      } catch (error) {
        console.error("Failed to load AI chat history:", error);
        toast.error("Failed to load chat history. Please try again.");
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [mapChatMessageToDisplay]
  );

  const resolveAiParticipantId = (
    participants?: ConversationParticipantResponse[]
  ): string | null => {
    if (!participants) {
      return null;
    }

    const aiParticipant = participants.find((participant) => {
      const displayName = participant.displayName?.toLowerCase() || "";
      const shownName = participant.shownName?.toLowerCase() || "";
      const username =
        participant.username?.toLowerCase() ||
        participant.user?.username?.toLowerCase() ||
        "";

      return (
        participant.user?.id === AI_ASSISTANT_USER_KEY ||
        username.includes("assistant") ||
        username.startsWith("ai") ||
        displayName.includes("assistant") ||
        displayName.startsWith("ai") ||
        shownName.includes("assistant") ||
        shownName.startsWith("ai")
      );
    });

    return aiParticipant?.id || null;
  };

  const loadConversation = useCallback(async () => {
    setIsConversationLoading(true);
    try {
      const response = await aiChatService.getConversation();
      if (response.code === 1000 && response.result) {
        const newConversationId =
          response.result.conversationId ||
          // Backward compatibility if API returns id field
          (response.result as Record<string, string>).id;

        const aiParticipantId = resolveAiParticipantId(
          response.result.userDetails
        );

        setAiUserDetailId(aiParticipantId);

        if (newConversationId) {
          setConversationId(newConversationId);
          await loadMessages(newConversationId, aiParticipantId);
        } else {
          toast.error("AI conversation is missing an identifier.");
        }
      } else {
        toast.error("Unable to start AI conversation.");
      }
    } catch (error) {
      console.error("Failed to initialize conversation:", error);
      toast.error("Failed to initialize AI chat.");
    } finally {
      setIsConversationLoading(false);
    }
  }, [loadMessages]);

  // Initialize conversation on mount
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (!conversationId) {
      toast.error("Conversation is not ready yet. Please wait a moment.");
      return;
    }

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");
    setIsSending(true);

    try {
      const response = await aiChatService.sendMessage({
        message: currentQuery,
      });

      if (response.code === 1000 && response.result) {
        const assistantMessage = mapChatMessageToDisplay(
          response.result,
          aiUserDetailId
        );
        setMessages((prev) => [...prev, assistantMessage]);

        const nextConversationId =
          response.result.conversationId || conversationId;

        if (!conversationId && nextConversationId) {
          setConversationId(nextConversationId);
        }

        await loadMessages(nextConversationId, aiUserDetailId);
      } else {
        throw new Error(response.message || "Failed to process query");
      }
    } catch (error: any) {
      console.error("Error sending AI chat message:", error);
      setMessages((prev) =>
        prev.filter((message) => !message.id.startsWith("temp-"))
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process query. Please try again.";

      toast.error(errorMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSending && !isConversationLoading) {
        handleQuery();
      }
    }
  };

  const isInitialLoading = isConversationLoading && messages.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Chat Assistant"
        description="Chat with AI assistant powered by your knowledge base"
      />

      <div className="grid gap-6">
        {/* Main Chat Interface */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Chat</CardTitle>
                  <CardDescription>
                    Chat with AI assistant - ask questions and get intelligent responses
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
                  {isInitialLoading ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading conversation...</span>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
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
                        <p className="mt-1 text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                  {isHistoryLoading && (
                    <div className="flex justify-center">
                      <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        Syncing latest messages...
                      </div>
                    </div>
                  )}
                  {isSending && (
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
                  placeholder="Type your message..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending || isConversationLoading}
                  rows={3}
                />
                <div className="flex items-center justify-end">
                  <Button
                    onClick={handleQuery}
                    disabled={
                      isSending || !query.trim() || isConversationLoading
                    }
                  >
                    {isSending ? (
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

