import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/checkins/streak";

function Badge({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
          : "border-neutral-300 text-neutral-400 dark:border-neutral-700 dark:text-neutral-600"
      }`}
    >
      {children}
    </span>
  );
}

export default async function CheckinsPage() {
  const supabase = await createClient();

  const [{ data: checkins }, { data: { user } }] = await Promise.all([
    supabase
      .from("checkins")
      .select("id, date, trained, prayed, scripture, profiles(name)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  let streak = 0;
  if (user) {
    const { data: myCheckins } = await supabase
      .from("checkins")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    streak = computeStreak(myCheckins?.map((c) => c.date) ?? []);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Check-Ins</h1>
          {user && (
            <p className="mt-1 text-sm text-neutral-500">
              Your streak: {streak} {streak === 1 ? "day" : "days"}
            </p>
          )}
        </div>
        {user && (
          <Link
            href="/checkins/new"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Check in today
          </Link>
        )}
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {checkins?.length ? (
          checkins.map((checkin) => (
            <li key={checkin.id}>
              <Link
                href={`/checkins/${checkin.id}`}
                className="block rounded-md border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <p className="text-sm text-neutral-500">
                  {checkin.date} · {checkin.profiles?.name ?? "A brother"}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge active={checkin.trained}>Trained</Badge>
                  <Badge active={checkin.prayed}>Prayed</Badge>
                  <Badge active={checkin.scripture}>Scripture</Badge>
                </div>
              </Link>
            </li>
          ))
        ) : (
          <p className="text-sm text-neutral-500">No check-ins yet.</p>
        )}
      </ul>
    </main>
  );
}
