import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login | Admin — The Aiman's School" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (session) navigate({ to: "/admin" });
  }, [session, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        setInfo("Account created. If email confirmation is enabled, please check your inbox.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-secondary px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-lg bg-gold text-gold-foreground grid place-items-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-primary">The Aiman's School</div>
            <div className="text-[10px] tracking-[0.2em] text-gold uppercase">Admin Panel</div>
          </div>
        </Link>

        <div className="rounded-2xl bg-card border shadow-elegant p-7">
          <h1 className="font-display text-2xl font-bold text-primary">
            {mode === "login" ? "Sign in to admin" : "Create admin account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Enter your credentials to continue." : "First account becomes the admin automatically."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            {mode === "signup" && (
              <div>
                <label className="text-sm font-medium text-primary">Full Name</label>
                <input
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  required maxLength={100}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-primary">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2.5 text-sm"
              />
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>}
            {info && <div className="text-sm text-primary bg-gold/15 rounded-md px-3 py-2">{info}</div>}

            <button
              type="submit" disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <button onClick={() => { setMode("signup"); setError(null); setInfo(null); }} className="text-gold font-semibold hover:underline">
                Need an account? Sign up
              </button>
            ) : (
              <button onClick={() => { setMode("login"); setError(null); setInfo(null); }} className="text-gold font-semibold hover:underline">
                Already have an account? Sign in
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
