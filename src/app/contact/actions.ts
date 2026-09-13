"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";

const NOTIFY_EMAIL = "tyler@ironshepherdsystems.com";

export async function submitContactMessage(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const turnstileToken = formData.get("cf-turnstile-response") as string;

  if (!name || !email || !message) {
    redirect(`/contact?error=${encodeURIComponent("Please fill in all fields.")}`);
  }

  const verified = await verifyTurnstileToken(turnstileToken);
  if (!verified) {
    redirect(
      `/contact?error=${encodeURIComponent(
        "Verification failed. Please try again."
      )}`
    );
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    redirect(`/contact?error=${encodeURIComponent(error.message)}`);
  }

  try {
    await sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
  } catch (e) {
    // Message is already stored above; don't fail the user's submission
    // over a best-effort notification email.
    console.error("Failed to send contact notification email", e);
  }

  redirect("/contact?sent=1");
}
