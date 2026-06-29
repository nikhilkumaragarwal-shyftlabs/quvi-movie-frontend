"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api";

export function SiteHeader() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-2xl font-black tracking-tight text-foreground">
          Quvi
        </Link>

        <form onSubmit={onSearch} className="hidden flex-1 md:block">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies and TV shows…"
            className="w-full max-w-xl rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
          />
        </form>

        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/search" className="text-muted transition hover:text-foreground md:hidden">
            Search
          </Link>
          {!loading && user ? (
            <>
              <Link href="/watchlist" className="text-muted transition hover:text-foreground">
                Watchlist
              </Link>
              <Link href="/friends" className="text-muted transition hover:text-foreground">
                Friends
              </Link>
              <span className="hidden text-muted sm:inline">
                {user.firstName}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-border px-3 py-1.5 text-muted transition hover:border-accent hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login" className="text-muted transition hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent px-3 py-1.5 font-medium text-white transition hover:bg-accent-hover"
              >
                Join
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function AuthForm({
  mode,
}: {
  mode: "login" | "register";
}) {
  const { login, register, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ firstName, lastName, email, password });
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4">
      {mode === "register" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" value={firstName} onChange={setFirstName} required />
          <Field label="Last name" value={lastName} onChange={setLastName} required />
        </div>
      )}
      <Field label="Email" type="email" value={email} onChange={setEmail} required />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        minLength={mode === "register" ? 8 : 1}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent py-3 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-accent"
      />
    </label>
  );
}
