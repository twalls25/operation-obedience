import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const { error } = await resend.emails.send({ from: FROM, to, subject, text });
  if (error) {
    throw new Error(error.message);
  }
}
