import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
      <Link href="/" className="font-bold">
        Operation Obedience
      </Link>

      {user ? (
        <div className="flex items-center gap-4 text-sm">
          <Link href="/profile" className="underline">
            {user.email}
          </Link>
          <form action={logout}>
            <button type="submit" className="underline">
              Log out
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="underline">
            Log in
          </Link>
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
