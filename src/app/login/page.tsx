import Link from "next/link";
import { login } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Welcome back, brother.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>

        <button
          formAction={login}
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
