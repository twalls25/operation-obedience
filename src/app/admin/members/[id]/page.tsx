import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateMemberStatus, sendMemberEmail, deleteMemberAccount } from "../actions";

type MemberRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};

export default async function AdminMemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; emailed?: string }>;
}) {
  const { id } = await params;
  const { error, saved, emailed } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (viewerProfile?.role !== "admin") {
    redirect("/");
  }

  const { data: member } = await supabase
    .rpc("admin_get_profiles")
    .eq("id", id)
    .maybeSingle<MemberRow>();

  if (!member) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">
        {member.name ?? "A brother"}
      </h1>
      <p className="mt-1 text-sm text-muted">{member.email}</p>
      <p className="mt-1 text-sm text-muted">
        Role: <span className="text-ember">{member.role}</span>
      </p>
      <p className="mt-1 text-sm text-muted">
        {member.last_sign_in_at
          ? `Last sign-in ${new Date(member.last_sign_in_at).toLocaleDateString()}`
          : "Never signed in"}
        {!member.email_confirmed_at && " · email not confirmed"}
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-4 rounded-md border-l-2 border-ember bg-panel px-3 py-2 text-sm text-offwhite">
          Status updated.
        </p>
      )}
      {emailed && (
        <p className="mt-4 rounded-md border-l-2 border-ember bg-panel px-3 py-2 text-sm text-offwhite">
          Email sent.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-offwhite">Status</h2>
        {member.role === "admin" ? (
          <p className="mt-3 text-sm text-muted">
            This member is an admin — admin status can only be changed by
            Tyler directly at the database level, not through this page.
          </p>
        ) : (
          <>
            <form
              action={updateMemberStatus.bind(null, member.id)}
              className="mt-3 flex items-center gap-3"
            >
              <select
                name="status"
                defaultValue={member.status}
                className="rounded-md border border-panel bg-charcoal px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="restricted">Restricted</option>
                <option value="banned">Banned</option>
              </select>
              <button
                type="submit"
                className="rounded-md bg-ember px-4 py-2 text-sm font-medium text-charcoal hover:bg-ember/90"
              >
                Update status
              </button>
            </form>
            <p className="mt-2 text-xs text-muted">
              Restricted members can log in and view content but can&apos;t
              post or comment. Banned members are signed out and blocked from
              logging in.
            </p>
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-offwhite">Send an email</h2>
        <form
          action={sendMemberEmail.bind(null, member.id)}
          className="mt-3 flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-sm text-offwhite">
            Subject
            <input
              name="subject"
              type="text"
              required
              className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-offwhite">
            Message
            <textarea
              name="message"
              required
              rows={5}
              className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-md bg-ember px-4 py-2 text-sm font-medium text-charcoal hover:bg-ember/90"
          >
            Send email
          </button>
        </form>
      </section>

      {member.role !== "admin" && member.id !== user.id && (
        <section className="mt-10 rounded-md border border-red-900 p-4">
          <h2 className="text-lg font-semibold text-red-300">Delete account</h2>
          <p className="mt-2 text-sm text-muted">
            Permanently deletes this account and everything they&apos;ve
            posted: prayer requests (and the prayers and comments on them),
            check-ins, comments, and reactions. This can&apos;t be undone. To
            block someone without erasing their history, use Restricted or
            Banned above instead.
          </p>
          <form
            action={deleteMemberAccount.bind(null, member.id)}
            className="mt-3 flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1 text-sm text-offwhite">
              Type <span className="break-all text-ember">{member.email}</span> to
              confirm
              <input
                name="confirm"
                type="text"
                required
                autoComplete="off"
                className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-red-900 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="self-start rounded-md border border-red-900 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-950/60"
            >
              Delete account permanently
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
