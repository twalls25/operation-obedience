import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-panel bg-panel px-6 py-4 text-center text-sm text-muted">
      <Link href="/guidelines" className="text-ember hover:underline">
        Community Guidelines
      </Link>
      <p className="mt-2 text-xs text-muted">
        © {year} Operation Obedience. All rights reserved.
      </p>
    </footer>
  );
}
