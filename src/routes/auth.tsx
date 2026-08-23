import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Store Sign In — REX Thrift Store" },
      {
        name: "description",
        content: "Sign in to the REX Thrift Store admin panel to add and manage sneaker listings.",
      },
      { property: "og:title", content: "Store Sign In — REX Thrift Store" },
      { property: "og:description", content: "Admin access for REX Thrift Store staff." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. Ask the owner to grant admin access.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-black uppercase">
        {mode === "signin" ? "Store sign in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Admin access only. Customers order straight over WhatsApp.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="label-caps text-muted-foreground" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div>
          <label className="label-caps text-muted-foreground" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="label-caps w-full bg-foreground px-6 py-4 text-background disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="label-caps mt-6 text-muted-foreground underline"
      >
        {mode === "signin" ? "Need an account?" : "Already have an account?"}
      </button>
    </div>
  );
}
