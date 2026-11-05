import { memberGroups } from "@/lib/nav-links";
import { NavGroups } from "./nav-groups";

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-panel bg-panel/40 md:block">
      <div className="sticky top-0 max-h-screen overflow-y-auto px-2 py-4">
        <NavGroups groups={memberGroups(isAdmin)} />
      </div>
    </aside>
  );
}
