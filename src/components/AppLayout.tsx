import { useState, useEffect, useCallback } from "react";
import {
  NavLink as RouterNavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Brain,
  Search,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Share2,
  Settings,
  LogOut,
  Plus,
  Bell,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useSSEStore } from "@/stores/sseStore";
import { useContentStore } from "@/stores/contentStore";
import { apiFetch, BASE_URL } from "@/lib/api";
import { SaveContentModal } from "@/components/SaveContentModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Brain, label: "My Brain", path: "/dashboard" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: MessageSquare, label: "Ask Brain", path: "/chat" },
  { icon: BarChart3, label: "Digest", path: "/digest" },
  { icon: Lightbulb, label: "Suggestions", path: "/suggestions" },
  { icon: Share2, label: "Shared Brain", path: "/shared" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "My Brain",
  "/search": "Search",
  "/chat": "Ask Brain",
  "/digest": "Digest",
  "/suggestions": "Suggestions",
  "/shared": "Shared Brain",
  "/settings": "Settings",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { username, clearAuth } = useAuthStore();
  const { isConnected, setConnected, pendingCount, setPendingCount } =
    useSSEStore();
  const { updateItem, items } = useContentStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  const initials = username
    ? username
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  useEffect(() => {
    const pending = items.filter(
      (i) => i.status === "pending" || i.status === "scraping",
    ).length;
    setPendingCount(pending);
  }, [items, setPendingCount]);

  // SSE connection
  useEffect(() => {
    if (!accessToken) return;
    let abortController: AbortController | null = null;

    const connectSSE = async () => {
      abortController = new AbortController();
      try {
        const response = await fetch(`${BASE_URL}/api/v1/events`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
          signal: abortController.signal,
        });
        if (!response.ok) {
          setConnected(false);
          return;
        }
        setConnected(true);
        const reader = response.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (currentEvent && data) {
                try {
                  const parsed = JSON.parse(data);
                  if (currentEvent === "content:scraped") {
                    updateItem(parsed.contentId || parsed._id, {
                      status: "scraped",
                    });
                    toast.info("Scraping complete, enriching with AI...");
                  } else if (currentEvent === "content:enriched") {
                    updateItem(parsed.contentId || parsed._id, {
                      title: parsed.title,
                      status: "enriched",
                      summary: parsed.summary,
                      tags:
                        parsed.tags?.map((t: any) =>
                          typeof t === "string" ? { name: t } : t,
                        ) || [],
                      suggestedTopics: parsed.suggestedTopics,
                      scrapeBlocked: parsed.scrapeBlocked,
                    });
                    toast.success("✨ Content enriched by AI");
                  } else if (currentEvent === "content:failed") {
                    updateItem(parsed.contentId || parsed._id, {
                      status: "failed",
                    });
                    toast.error("Processing failed — click to retry");
                  }
                  // ignore ping and connected
                } catch (e) {
                  // ignore parse errors
                }
              }
            }
          }
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          setConnected(false);
        }
      }
    };

    connectSSE();
    return () => {
      abortController?.abort();
    };
  }, [accessToken, setConnected, updateItem]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSaveOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        navigate("/search");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/v1/logout", { method: "POST" });
    } catch {}
    clearAuth();
    navigate("/login");
  };

  const pageTitle = pageTitles[location.pathname] || "Second Brain";

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen border-r border-border bg-background flex flex-col transition-all duration-250 z-30",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 h-14 border-b border-border shrink-0",
            collapsed && "justify-center px-0",
          )}
        >
          <Brain className="w-6 h-6 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-sm tracking-tight">
              Second Brain
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <RouterNavLink
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm transition-colors relative",
                  isActive
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  collapsed && "justify-center px-0 mx-1",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </RouterNavLink>
            );
          })}
        </nav>

        {/* User */}
        <div
          className={cn(
            "border-t border-border p-3 shrink-0",
            collapsed && "flex flex-col items-center",
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary"
                title={username || "User"}
              >
                {initials}
              </div>
              <span className="text-sm truncate" title={username || "User"}>
                {username || "User"}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-250",
          collapsed ? "ml-[60px]" : "ml-[240px]",
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {collapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <div
                className="w-2 h-2 rounded-full bg-status-enriched"
                title="Live"
              />
            )}
            {!isConnected && (
              <span className="text-xs text-muted-foreground">
                Reconnecting...
              </span>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button size="sm" onClick={() => setSaveOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Save URL
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>

      <SaveContentModal open={saveOpen} onClose={() => setSaveOpen(false)} />

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around z-30 lg:hidden">
        {navItems.slice(0, 5).map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <RouterNavLink
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 text-xs",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </RouterNavLink>
          );
        })}
      </nav>
    </div>
  );
}
