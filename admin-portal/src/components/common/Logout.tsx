"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/hooks/useAuthStore";
import { useRouter } from "next/navigation";

export default function Logout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return <Button onClick={() => handleLogout()}>Log out</Button>;
}
