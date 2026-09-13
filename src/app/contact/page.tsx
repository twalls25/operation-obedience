import { TurnstileWidget } from "@/components/turnstile-widget";
import { submitContactMessage } from "./actions";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-offwhite">Contact Us</h1>
      <p className="mt-1 text-sm text-muted">
        Questions, feedback, or just want to reach out? Send us a message.
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {sent ? (
        <p className="mt-6 rounded-md border-l-2 border-ember bg-panel px-3 py-2 text-sm text-offwhite">
          Thanks for reaching out — we&apos;ll get back to you soon.
        </p>
      ) : (
        <form className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-offwhite">
            Name
            <input
              name="name"
              type="text"
              required
              className="rounded-md border border-panel bg-transparent px-3 py-2 text-offwhite focus:border-ember focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-offwhite">
            Email
            <input
              name="email"
              type="email"
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

          <TurnstileWidget />

          <button
            formAction={submitContactMessage}
            className="mt-2 rounded-md bg-ember px-4 py-2 font-medium text-charcoal hover:bg-ember/90"
          >
            Send message
          </button>
        </form>
      )}
    </main>
  );
}
