"use client";
import useAuthStore from "@/hooks/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService, userService } from "@/services/api";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { clearAuth, setAccessToken, setUser, user, setRefreshToken } =
    useAuthStore();
  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessTokenFromLocal = localStorage.getItem("accessToken") || "";
      const refreshTokenFromLocal = localStorage.getItem("refreshToken") || "";

      console.log("🔄 AuthProvider: Loading tokens from localStorage", {
        accessToken: accessTokenFromLocal
          ? `${accessTokenFromLocal.substring(0, 20)}...`
          : null,
        refreshToken: refreshTokenFromLocal
          ? `${refreshTokenFromLocal.substring(0, 20)}...`
          : null,
        timestamp: new Date().toISOString(),
      });

      setAccessToken(accessTokenFromLocal);
      setRefreshToken(refreshTokenFromLocal);
      setTokens({
        accessToken: accessTokenFromLocal,
        refreshToken: refreshTokenFromLocal,
      });
    }
  }, [setAccessToken, setRefreshToken]);

  // Listen for token updates from login store
  useEffect(() => {
    const handleTokenUpdate = (e: CustomEvent) => {
      const newToken = e.detail?.token;
      if (newToken) {
        console.log("🔄 AuthProvider: Token updated via custom event", {
          newToken: newToken ? `${newToken.substring(0, 20)}...` : null,
          timestamp: new Date().toISOString(),
        });

        setAccessToken(newToken);
        setTokens((prev) => ({
          accessToken: newToken,
          refreshToken: prev?.refreshToken || "",
        }));
      }
    };

    window.addEventListener("tokenUpdated", handleTokenUpdate as EventListener);

    return () => {
      window.removeEventListener(
        "tokenUpdated",
        handleTokenUpdate as EventListener
      );
    };
  }, [setAccessToken]);

  useEffect(() => {
    console.log("🔐 AuthProvider useEffect triggered", {
      hasToken: !!tokens?.accessToken,
      tokenLength: tokens?.accessToken?.length || 0,
      currentUser: user,
      pathname,
      tokens: tokens
        ? {
            accessToken: tokens.accessToken
              ? `${tokens.accessToken.substring(0, 20)}...`
              : null,
            refreshToken: tokens.refreshToken
              ? `${tokens.refreshToken.substring(0, 20)}...`
              : null,
          }
        : null,
      localStorage: {
        accessToken: localStorage.getItem("accessToken")
          ? `${localStorage.getItem("accessToken")?.substring(0, 20)}...`
          : null,
        refreshToken: localStorage.getItem("refreshToken")
          ? `${localStorage.getItem("refreshToken")?.substring(0, 20)}...`
          : null,
      },
    });

    const fetchUser = async () => {
      // Don't fetch if user is already loaded or no token
      if (user !== null || !tokens?.accessToken) {
        console.log("⏭️ AuthProvider: Skipping fetchUser", {
          user: user
            ? {
                id: user.id,
                username: user.username,
                role: user.role,
              }
            : null,
          hasToken: !!tokens?.accessToken,
          reason: user !== null ? "User already loaded" : "No access token",
        });
        return;
      }

      console.log("🔍 AuthProvider: Starting token validation", {
        hasToken: !!tokens?.accessToken,
        tokenPreview: tokens?.accessToken
          ? `${tokens.accessToken.substring(0, 20)}...`
          : null,
        currentUser: user,
        pathname,
        timestamp: new Date().toISOString(),
      });

      try {
        // Validate token
        const introspectResponse = await authService.introspectToken({
          token: tokens.accessToken,
        });

        console.log("✅ AuthProvider: Token introspection result", {
          code: introspectResponse.code,
          isValid: introspectResponse.result?.isValid,
          userId: introspectResponse.result?.userId,
          fullResponse: introspectResponse,
          resultType: typeof introspectResponse.result?.isValid,
          resultValue: introspectResponse.result?.isValid,
        });

        if (
          introspectResponse.code === 1000 &&
          (introspectResponse.result?.isValid === true ||
            introspectResponse.result?.userId)
        ) {
          // Get user details using userId from token introspection
          const userId = introspectResponse.result.userId;
          if (!userId) {
            console.log("AuthProvider: No userId in token, clearing auth");
            localStorage.setItem("accessToken", "");
            localStorage.setItem("refreshToken", "");
            clearAuth();
            if (pathname.startsWith("/admin")) {
              router.replace("/login");
            }
            return;
          }

          const userResponse = await userService.getUserById(userId);

          console.log("👤 AuthProvider: User fetch result", {
            code: userResponse.code,
            hasUser: !!userResponse.result,
            userData: userResponse.result
              ? {
                  id: userResponse.result.id,
                  username: userResponse.result.username,
                  mail: userResponse.result.mail,
                  roles: userResponse.result.roles?.map((r) => r.name),
                }
              : null,
            fullResponse: userResponse,
          });

          if (userResponse.code === 1000 && userResponse.result) {
            const userData = userResponse.result;

            // Check if user account is enabled
            if (userData.enable === false) {
              console.log(
                "🚫 AuthProvider: User account is disabled, clearing auth",
                {
                  userId: userData.id,
                  username: userData.username,
                  enable: userData.enable,
                  timestamp: new Date().toISOString(),
                }
              );
              localStorage.setItem("accessToken", "");
              localStorage.setItem("refreshToken", "");
              clearAuth();
              if (pathname.startsWith("/admin")) {
                router.replace("/login");
              }
              return;
            }

            const user = {
              id: userData.id,
              email: userData.mail,
              username: userData.username,
              role: userData.roles?.some((role) => role.name === "ADMIN")
                ? ("admin" as const)
                : ("moderator" as const),
              avatar: undefined,
            };
            setUser(user);

            console.log("🎉 AuthProvider: User set successfully", {
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
              },
              timestamp: new Date().toISOString(),
            });

            // If on login page and successfully authenticated, redirect to dashboard
            if (pathname === "/login") {
              console.log(
                "🚀 AuthProvider: Redirecting from login to dashboard",
                {
                  from: pathname,
                  to: "/admin/dashboard",
                  timestamp: new Date().toISOString(),
                }
              );
              router.replace("/admin/dashboard");
            }
          } else {
            // User fetch failed, clear auth
            console.log("❌ AuthProvider: User fetch failed, clearing auth", {
              code: userResponse.code,
              message: userResponse.message,
              timestamp: new Date().toISOString(),
            });
            localStorage.setItem("accessToken", "");
            localStorage.setItem("refreshToken", "");
            clearAuth();
            if (pathname.startsWith("/admin")) {
              router.replace("/login");
            }
          }
        } else {
          // Invalid token, clear auth
          console.log("🚫 AuthProvider: Invalid token, clearing auth", {
            code: introspectResponse.code,
            isValid: introspectResponse.result?.isValid,
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem("accessToken", "");
          localStorage.setItem("refreshToken", "");
          clearAuth();
          if (pathname.startsWith("/admin")) {
            router.replace("/login");
            return;
          }
        }
      } catch (error: unknown) {
        const errorObj = error as {
          message?: string;
          response?: {
            data?: unknown;
            status?: number;
          };
          config?: {
            url?: string;
          };
          stack?: string;
        };
        console.error("💥 AuthProvider: Auth validation error:", {
          message: errorObj.message,
          response: errorObj.response?.data,
          status: errorObj.response?.status,
          url: errorObj.config?.url,
          timestamp: new Date().toISOString(),
          stack: errorObj.stack,
        });

        // Only clear auth and redirect if we're not on the login page
        // This prevents the redirect loop when login is successful
        if (pathname !== "/login") {
          localStorage.setItem("accessToken", "");
          localStorage.setItem("refreshToken", "");
          clearAuth();
          if (pathname.startsWith("/admin")) {
            router.replace("/login");
            return;
          }
        }
      }
    };

    // Check if we need to redirect from login page when user is already set
    if (user !== null && pathname === "/login") {
      console.log(
        "🔄 AuthProvider: User already set, redirecting from login to dashboard",
        {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
          from: pathname,
          to: "/admin/dashboard",
          timestamp: new Date().toISOString(),
        }
      );
      router.replace("/admin/dashboard");
      return;
    }

    // If user is authenticated and trying to access admin routes, allow it
    if (user !== null && pathname.startsWith("/admin")) {
      console.log(
        "✅ AuthProvider: User authenticated, allowing access to admin routes",
        {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
          pathname,
          timestamp: new Date().toISOString(),
        }
      );
      return;
    }

    // Only run validation if we have a token and no user yet
    if (tokens?.accessToken && user === null) {
      console.log("🔄 AuthProvider: Running fetchUser", {
        hasToken: !!tokens?.accessToken,
        user: user,
        pathname,
        timestamp: new Date().toISOString(),
      });
      fetchUser();
    } else if (!tokens?.accessToken && pathname.startsWith("/admin")) {
      // No token and trying to access admin routes
      console.log("🚫 AuthProvider: No token, redirecting to login", {
        hasToken: !!tokens?.accessToken,
        pathname,
        timestamp: new Date().toISOString(),
      });
      router.replace("/login");
    }
  }, [
    router,
    pathname,
    clearAuth,
    setAccessToken,
    setUser,
    user,
    tokens,
    setRefreshToken,
  ]);

  return <>{children}</>;
}
