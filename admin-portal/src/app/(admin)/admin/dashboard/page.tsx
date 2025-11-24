"use client";
import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Video,
  TrendingUp,
  HardDrive,
  MessageSquare,
  AlertTriangle,
  Activity,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useAnalytics } from "@/hooks/queries";
import { Badge } from "@/components/ui/badge";

function DashboardContent() {
  const { data: analytics, isLoading, error } = useAnalytics();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatPercentage = (value: number) => {
    const formatted = Math.abs(value).toFixed(1);
    const sign = value >= 0 ? "+" : "-";
    return `${sign}${formatted}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    throw error; // Let ErrorBoundary handle it
  }

  const result = analytics?.result;

  const isMockData = result?.totalUsers === 0 && result?.totalVideos === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the TikTok Clone admin portal. Manage your platform from
          here.
        </p>
        {isMockData && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  Using Mock Data
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Unable to connect to the backend server. Make sure the Spring
                  Boot backend is running on{" "}
                  <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded text-xs">
                    http://localhost:8082
                  </code>
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                  Run:{" "}
                  <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded">
                    cd backend && mvnw spring-boot:run
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.totalUsers?.toLocaleString() || 0}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {result?.activeUsersToday || 0} active today
              </p>
              {result?.userGrowthRate !== undefined && (
                <div
                  className={`flex items-center text-xs ${
                    result.userGrowthRate >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {result.userGrowthRate >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {formatPercentage(result.userGrowthRate)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feed Items
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.totalVideos?.toLocaleString() || 0}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {result?.videosUploadedToday || 0} uploaded today
              </p>
              {result?.videoGrowthRate !== undefined && (
                <div
                  className={`flex items-center text-xs ${
                    result.videoGrowthRate >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {result.videoGrowthRate >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {formatPercentage(result.videoGrowthRate)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.formattedStorageUsed ||
                formatFileSize(result?.totalStorageUsed || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(result?.storageUsedThisMonth || 0)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.engagementRate?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Interactions per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interactions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.totalInteractions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {result?.interactionsToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.totalComments?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total comments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.totalReports?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {result?.pendingReports || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result?.newUsersThisWeek?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
            <CardDescription>
              Overview of platform usage and content
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Users by Role</h4>
                  {result?.usersByRole && result.usersByRole.length > 0 ? (
                    result.usersByRole.map(
                      (role: { role: string; count: number }) => (
                        <div
                          key={role.role}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-muted-foreground">
                            {role.role}
                          </span>
                          <Badge variant="secondary">
                            {role.count?.toLocaleString()}
                          </Badge>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No data available
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Feed Items by Type</h4>
                  {result?.videosByType && result.videosByType.length > 0 ? (
                    result.videosByType.map(
                      (type: {
                        type: string;
                        count: number;
                        totalSize: number;
                      }) => (
                        <div
                          key={type.type}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-muted-foreground">
                            {type.type}
                          </span>
                          <Badge variant="secondary">
                            {type.count?.toLocaleString()}
                          </Badge>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No data available
                    </p>
                  )}
                </div>
              </div>

              {result?.interactionsByType &&
                result.interactionsByType.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium">
                      Interactions by Type
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {result.interactionsByType.map(
                        (interaction: { type: string; count: number }) => (
                          <div
                            key={interaction.type}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-muted-foreground">
                              {interaction.type}
                            </span>
                            <Badge variant="outline">
                              {interaction.count?.toLocaleString()}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <div className="font-medium">Manage Users</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  View and manage user accounts
                </div>
              </button>
            </Link>
            <Link href="/admin/feed-items">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <div className="font-medium">Content Moderation</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Review and manage feed items
                </div>
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ErrorBoundary context="Admin Dashboard">
      <DashboardContent />
    </ErrorBoundary>
  );
}
