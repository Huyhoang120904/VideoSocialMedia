"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Video, TrendingUp, HardDrive } from "lucide-react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useAnalytics } from "@/hooks/queries";

function DashboardContent() {
  const { data: analytics, isLoading, error } = useAnalytics();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the TikTok Clone admin portal. Manage your platform from
          here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.result?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.result?.activeUsersToday || 0} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.result?.totalVideos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.result?.videosUploadedToday || 0} uploaded today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(analytics?.result?.totalStorageUsed || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total platform storage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Users by Role</h4>
                  {analytics?.result?.usersByRole?.map((role) => (
                    <div
                      key={role.role}
                      className="flex justify-between text-sm"
                    >
                      <span>{role.role}</span>
                      <span className="font-medium">{role.count}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Videos by Type</h4>
                  {analytics?.result?.videosByType?.map((type) => (
                    <div
                      key={type.type}
                      className="flex justify-between text-sm"
                    >
                      <span>{type.type}</span>
                      <span className="font-medium">{type.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent">
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-muted-foreground">
                View and manage user accounts
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent">
              <div className="font-medium">Content Moderation</div>
              <div className="text-sm text-muted-foreground">
                Review flagged content
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent">
              <div className="font-medium">Analytics</div>
              <div className="text-sm text-muted-foreground">
                View platform statistics
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent">
              <div className="font-medium">Settings</div>
              <div className="text-sm text-muted-foreground">
                Configure platform settings
              </div>
            </button>
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
