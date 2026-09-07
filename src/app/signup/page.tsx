import Link from "next/link";
import { signup } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; "check-email"?: string }>;
}) {
  const { error, "check-email": checkEmail } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-offwhite">Join the brotherhood</h1>
      <p className="mt-1 text-sm text-muted">
        Create an account to start checking in.
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {checkEmail ? (
        <p className="mt-6 rounded-md border-l-2 border-ember bg-panel px-3 py-2 text-sm text-offwhite">
          Almost there — check your email for a confirmation link.
        </p>
      ) : (
        <form className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-offwhite">
            Email
            <input
              name="email"
              type="email"
              required
              className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-offwhite">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
            />
          </label>

          <button
            formAction={signup}
            className="mt-2 rounded-md bg-ember px-4 py-2 font-medium text-charcoal hover:bg-ember/90"
          >
            Sign up
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-ember hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
