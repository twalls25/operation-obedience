import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold">
          Operation Obedience
        </Link>
        <Link href="/testimonies" className="text-sm underline">
          Testimonies
        </Link>
        <Link href="/prayers" className="text-sm underline">
          Prayer Requests
        </Link>
        <Link href="/checkins" className="text-sm underline">
          Check-Ins
        </Link>
        {profile?.is_admin && (
          <Link href="/testimonies/new" className="text-sm underline">
            Post testimony
          </Link>
        )}
      </div>

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
