import Link from "next/link";
import { AuthForm } from "@/components/site-header";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-center text-3xl font-black">Join Quvi</h1>
      <p className="mt-2 text-center text-muted">Create an account to track what you want to watch.</p>
      <div className="mt-10">
        <AuthForm mode="register" />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
