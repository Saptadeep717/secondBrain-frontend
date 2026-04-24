import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Brain } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAccessToken, setUsername: setStoredUsername } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<{ data: { accessToken: string } }>(
        "/api/v1/login",
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
        },
      );
      setAccessToken(res.data.accessToken);
      setStoredUsername(username);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="relative z-10 text-center px-12">
          <Brain className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Second Brain
          </h1>
          <p className="text-muted-foreground text-lg">
            Your knowledge, connected by AI
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center mb-8">
            <Brain className="w-10 h-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-semibold">Second Brain</h1>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="text-muted-foreground mt-1">
              Enter your credentials to continue
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-secondary border-border"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
