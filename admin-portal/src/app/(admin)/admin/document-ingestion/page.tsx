"use client";

import React, { useState, useCallback } from "react";
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
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/molecules";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { documentIngestionService } from "@/services/admin/documentIngestionService";
import { toast } from "sonner";
import { DocumentIngestionResponse, BatchIngestionResponse } from "@/types";

function DocumentIngestionPageContent() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [lastResult, setLastResult] = useState<
    DocumentIngestionResponse | BatchIngestionResponse | null
  >(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setLastResult(null);
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMetadata(e.target.value);
  };

  const parseMetadata = useCallback((): Record<string, unknown> | undefined => {
    if (!metadata.trim()) return undefined;
    try {
      return JSON.parse(metadata);
    } catch {
      toast.error("Invalid JSON metadata. Please check your input.");
      return undefined;
    }
  }, [metadata]);

  const handleSingleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a file to upload");
      return;
    }

    if (selectedFiles.length > 1) {
      toast.error("Please select only one file for single upload");
      return;
    }

    setIsUploading(true);
    setLastResult(null);

    try {
      const file = selectedFiles[0];
      const metadataObj = parseMetadata();
      if (metadata && !metadataObj) return; // Error already shown

      const response = await documentIngestionService.ingestDocument(
        file,
        metadataObj
      );

      if (response.result) {
        setLastResult(response.result);
        toast.success(
          `Document ingested successfully! ${response.result.chunksCreated} chunks created.`
        );
        setSelectedFiles([]);
        setMetadata("");
      }
    } catch (error: unknown) {
      console.error("Error ingesting document:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(
        errorMessage || "Failed to ingest document. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    setLastResult(null);

    try {
      const metadataObj = parseMetadata();
      if (metadata && !metadataObj) return; // Error already shown

      const response = await documentIngestionService.ingestBatchDocuments(
        selectedFiles,
        metadataObj
      );

      if (response.result) {
        setLastResult(response.result);
        toast.success(
          `Batch ingestion completed! ${response.result.successCount} successful, ${response.result.totalChunksCreated} total chunks created.`
        );
        setSelectedFiles([]);
        setMetadata("");
      }
    } catch (error: unknown) {
      console.error("Error ingesting batch documents:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(
        errorMessage || "Failed to ingest documents. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Ingestion"
        description="Upload and ingest documents into the vector store for RAG"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload PDF, Word, or text documents to be ingested into the vector
              store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select Files</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span className="text-xs">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (Optional JSON)</Label>
              <Textarea
                id="metadata"
                placeholder='{"category": "documentation", "author": "John Doe"}'
                value={metadata}
                onChange={handleMetadataChange}
                disabled={isUploading}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Optional JSON metadata to attach to the document
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSingleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Single Document
                  </>
                )}
              </Button>
              <Button
                onClick={handleBatchUpload}
                disabled={isUploading || selectedFiles.length === 0}
                variant="outline"
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Multiple Documents
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress and Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ingestion Results</CardTitle>
            <CardDescription>View ingestion results and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Results */}
            {lastResult && (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Ingestion Complete</span>
                </div>
                {"chunksCreated" in lastResult && (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Chunks Created:</span>{" "}
                      {lastResult.chunksCreated}
                    </p>
                    {lastResult.filename && (
                      <p>
                        <span className="font-medium">File:</span>{" "}
                        {lastResult.filename}
                      </p>
                    )}
                    {lastResult.fileSize && (
                      <p>
                        <span className="font-medium">Size:</span>{" "}
                        {(lastResult.fileSize / 1024).toFixed(2)} KB
                      </p>
                    )}
                  </div>
                )}
                {"totalFiles" in lastResult && (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Total Files:</span>{" "}
                      {lastResult.totalFiles}
                    </p>
                    <p>
                      <span className="font-medium">Successful:</span>{" "}
                      {lastResult.successCount}
                    </p>
                    <p>
                      <span className="font-medium">Failed:</span>{" "}
                      {lastResult.failureCount}
                    </p>
                    <p>
                      <span className="font-medium">Total Chunks:</span>{" "}
                      {lastResult.totalChunksCreated}
                    </p>
                    {lastResult.failures &&
                      Object.keys(lastResult.failures).length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="font-medium">Failed Files:</p>
                          {Object.entries(lastResult.failures).map(
                            ([fileName, error], index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-xs"
                              >
                                <XCircle className="h-3 w-3 text-red-500" />
                                <span>{fileName}</span>
                                <span className="text-red-500">- {error}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {!lastResult && (
              <div className="text-center text-sm text-muted-foreground">
                No upload in progress. Select files and click upload to start.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DocumentIngestionPage() {
  return (
    <ErrorBoundary context="Document Ingestion Page">
      <DocumentIngestionPageContent />
    </ErrorBoundary>
  );
}
