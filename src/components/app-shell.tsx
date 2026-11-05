import { createClient } from "@/lib/supabase/server";
import { NavClient } from "./nav-client";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";

// Top bar for everyone; a left sidebar only for logged-in members (the
// logged-out experience stays the simple top-bar site).
export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role, name").eq("id", user.id).single()
    : { data: null };

  const isAdmin = profile?.role === "admin";

  return (
    <>
      <NavClient
        userEmail={user?.email ?? null}
        displayName={profile?.name ?? null}
        isAdmin={isAdmin}
      />
      <div className="flex flex-1">
        {user && <Sidebar isAdmin={isAdmin} />}
        <div className="flex min-w-0 flex-1 flex-col">
          {children}
          <Footer />
        </div>
      </div>
    </>
  );
}
