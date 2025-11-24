"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/hooks/useAuthStore";
import { Shield, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ModerationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ModerationGuard - Protects moderation routes for MODERATOR and ADMIN roles only
 * 
 * Usage:
 * ```tsx
 * <ModerationGuard>
 *   <ModerationPage />
 * </ModerationGuard>
 * ```
 */
export function ModerationGuard({ children, fallback }: ModerationGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const hasModerationAccess =
    isAuthenticated &&
    user &&
    (user.role === "admin" || user.role === "moderator");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (isAuthenticated && !hasModerationAccess) {
      // User is authenticated but doesn't have moderation access
      // Redirect to dashboard
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, hasModerationAccess, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasModerationAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You don&apos;t have permission to access moderation features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-medium mb-1">Moderation Access Required</p>
                <p>
                  This page requires MODERATOR or ADMIN role. Your current role:{" "}
                  <span className="font-semibold">{user?.role || "Unknown"}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

