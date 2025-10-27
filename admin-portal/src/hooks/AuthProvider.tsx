"use client";
import useAuthStore from "@/hooks/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { clearAuth, setUser, user } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        setIsValidating(true);

        // Check authentication status via API route
        const response = await fetch("/api/auth/validate", {
          method: "GET",
          credentials: "include", // Include cookies
        });

        if (response.ok) {
          const data = await response.json();

          if (data.isValid && data.userId) {
            // User is authenticated, fetch user details
            // Note: This would need to be implemented based on your user service
            const userData = {
              id: data.userId,
              email: "", // Would be fetched from user service
              username: "", // Would be fetched from user service
              role: "admin" as const, // Would be determined from user roles
            };

            setUser(userData);

            // Redirect from login page if authenticated
            if (pathname === "/login") {
              router.replace("/admin/dashboard");
            }
          } else {
            // Invalid token, clear auth and redirect to login if on admin routes
            clearAuth();
            if (pathname.startsWith("/admin")) {
              router.replace("/login");
            }
          }
        } else {
          // Authentication failed, redirect to login if on admin routes
          clearAuth();
          if (pathname.startsWith("/admin")) {
            router.replace("/login");
          }
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        clearAuth();
        if (pathname.startsWith("/admin")) {
          router.replace("/login");
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, [pathname, router, clearAuth, setUser]);

  // Show loading state while validating authentication
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
