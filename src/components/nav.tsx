import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const isAdmin = profile?.role === "admin";

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-panel bg-panel px-6 py-3">
      <div className="flex flex-wrap items-center gap-5">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Operation Obedience" className="h-14 w-auto" />
        </Link>
        <Link href="/testimonies" className="text-sm text-ember hover:underline">
          Testimonies
        </Link>
        <Link href="/prayers" className="text-sm text-ember hover:underline">
          Prayer Requests
        </Link>
        <Link href="/checkins" className="text-sm text-ember hover:underline">
          Check-Ins
        </Link>
        <Link href="/resources" className="text-sm text-ember hover:underline">
          Content Library
        </Link>
        {isAdmin && (
          <Link href="/testimonies/new" className="text-sm text-ember hover:underline">
            Post testimony
          </Link>
        )}
      </div>

      {user ? (
        <div className="flex items-center gap-4 text-sm">
          <Link href="/profile" className="text-offwhite hover:underline">
            {user.email}
          </Link>
          <form action={logout}>
            <button type="submit" className="text-muted hover:text-offwhite">
              Log out
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-offwhite hover:underline">
            Log in
          </Link>
          <Link href="/signup" className="text-ember hover:underline">
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
}
