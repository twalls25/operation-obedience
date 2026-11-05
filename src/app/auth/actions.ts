"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const CAPTCHA_PENDING_MESSAGE =
  "The security check hasn't finished yet. Wait a few seconds and try again, or refresh the page.";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const captchaToken = formData.get("cf-turnstile-response") as string;

  if (!captchaToken) {
    redirect(`/login?error=${encodeURIComponent(CAPTCHA_PENDING_MESSAGE)}`);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const origin = (await headers()).get("origin");
  const captchaToken = formData.get("cf-turnstile-response") as string;

  if (!captchaToken) {
    redirect(`/signup?error=${encodeURIComponent(CAPTCHA_PENDING_MESSAGE)}`);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      captchaToken,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/signup?check-email=1");
}

export async function logout() {
  const supabase = await createClient();
  // signOut() defaults to scope "global", which ends the account's sessions
  // on every device — logging out on a phone was silently logging the laptop
  // out too. "local" ends only this device's session.
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/");
}
