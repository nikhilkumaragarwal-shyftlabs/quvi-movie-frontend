import Link from "next/link";
import { AuthForm } from "@/components/site-header";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-center text-3xl font-black">Welcome back</h1>
      <p className="mt-2 text-center text-muted">Sign in to save your watchlist.</p>
      <div className="mt-10">
        <AuthForm mode="login" />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        No account?{" "}
        <Link href="/register" className="text-gold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
