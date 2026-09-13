import { Resend } from "resend";

const FROM = "Operation Obedience <noreply@operationobedience.org>";

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  // Constructed lazily, at call time, not module load — Resend's
  // constructor throws immediately if the API key is missing, and
  // Next.js evaluates this module during build-time page-data collection
  // (which doesn't have runtime secrets the same way request handling
  // does), not just when a route actually runs.
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, to, subject, text });
  if (error) {
    throw new Error(error.message);
  }
}
