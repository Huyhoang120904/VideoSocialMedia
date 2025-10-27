"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Video,
  BarChart3,
  Settings,
  ChevronDown,
  UserCog,
  Shield,
  TrendingUp,
  MessageSquare,
  Flag,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    icon: Users,
    submenu: [
      { title: "All Users", href: "/admin/users", icon: Users },
      {
        title: "Content Creators",
        href: "/admin/users/creators",
        icon: UserCog,
      },
      { title: "Moderators", href: "/admin/users/moderators", icon: Shield },
    ],
  },
  {
    title: "Content",
    icon: Video,
    submenu: [
      { title: "All Videos", href: "/admin/videos", icon: Video },
      { title: "Flagged Content", href: "/admin/videos/flagged", icon: Flag },
      { title: "Comments", href: "/admin/comments", icon: MessageSquare },
    ],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    const activeParent = menuItems.find(
      (item) =>
        item.submenu &&
        item.submenu.some((sub) => pathname.startsWith(sub.href))
    );

    if (activeParent && !openMenus.includes(activeParent.title)) {
      setOpenMenus((prev) => [...prev, activeParent.title]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        <div className="flex items-center gap-3">
          <Video className="h-6 w-6 text-sidebar-foreground" />
          <h1 className="text-xl font-semibold text-sidebar-foreground">
            TikTok Clone Admin
          </h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          if (item.submenu) {
            const isOpen = openMenus.includes(item.title);
            const isActive = item.submenu.some((sub) =>
              pathname.startsWith(sub.href)
            );

            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={() => toggleMenu(item.title)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1 pl-8">
                  {item.submenu.map((subItem) => {
                    const { title, href, icon: SubIcon } = subItem;

                    const isSubActive = pathname.startsWith(href);

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isSubActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground"
                        )}
                      >
                        {SubIcon && <SubIcon className="h-4 w-4" />}
                        <span>{title}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          const isSingleActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isSingleActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
