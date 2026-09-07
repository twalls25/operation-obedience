import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-neutral-500">
        That confirmation link is invalid or has expired. Try signing up again,
        or log in if your account is already confirmed.
      </p>
      <div className="flex gap-4">
        <Link href="/signup" className="underline">
          Sign up
        </Link>
        <Link href="/login" className="underline">
          Log in
        </Link>
      </div>
    </main>
  );
}
