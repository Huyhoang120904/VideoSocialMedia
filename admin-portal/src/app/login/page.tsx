"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useAuthStore from "@/hooks/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Video, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📝 Login form submitted", {
      username,
      passwordLength: password.length,
      timestamp: new Date().toISOString(),
    });

    if (!username || !password) {
      console.log("❌ Login form validation failed", {
        hasUsername: !!username,
        hasPassword: !!password,
        timestamp: new Date().toISOString(),
      });
      toast.error("Please fill in all fields");
      return;
    }

    const success = await login(username, password);
    if (success) {
      // AuthProvider will handle the redirect
      console.log(
        "✅ Login successful, waiting for AuthProvider to redirect...",
        {
          currentPath: window.location.pathname,
          timestamp: new Date().toISOString(),
        }
      );

      // Fallback: If AuthProvider doesn't redirect within 2 seconds, do it manually
      setTimeout(() => {
        if (window.location.pathname === "/login") {
          console.log(
            "⚠️ AuthProvider didn't redirect, doing manual redirect",
            {
              currentPath: window.location.pathname,
              timestamp: new Date().toISOString(),
            }
          );
          router.replace("/admin/dashboard");
        }
      }, 2000);
    } else {
      console.log("❌ Login failed in handleSubmit", {
        username,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Video className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">TikTok Clone Admin</CardTitle>
          <CardDescription>Sign in to your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Credentials:</strong>
              <br />
              Username: admin
              <br />
              Password: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
