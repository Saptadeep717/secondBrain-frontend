import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Brain } from "lucide-react";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await apiFetch("/api/v1/signup", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
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
            <h1 className="text-2xl font-semibold">Alzheimer</h1>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Create account</h2>
            <p className="text-muted-foreground mt-1">
              Start building your second brain
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
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
